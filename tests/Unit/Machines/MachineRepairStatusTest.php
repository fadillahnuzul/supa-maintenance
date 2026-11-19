<?php

use App\Http\Controllers\MachineController;
use App\Models\Machine\MachineModel;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    DB::statement('ATTACH DATABASE ":memory:" AS core');
    DB::statement('ATTACH DATABASE ":memory:" AS maintenance');

    Schema::create('core.machines', function (Blueprint $table) {
        $table->increments('id');
        $table->string('code');
        $table->string('name');
        $table->unsignedInteger('location_id')->nullable();
        $table->string('status');
        $table->timestamp('created_at')->nullable();
        $table->timestamp('updated_at')->nullable();
        $table->timestamp('deleted_at')->nullable();
    });

    Schema::create('core.buildings', function (Blueprint $table) {
        $table->increments('id');
        $table->string('name');
        $table->timestamp('deleted_at')->nullable();
    });

    Schema::create('maintenance.ticket_statuses', function (Blueprint $table) {
        $table->increments('id');
        $table->string('code');
        $table->string('name')->nullable();
    });

    Schema::create('maintenance.tiket', function (Blueprint $table) {
        $table->increments('id');
        $table->string('code')->nullable();
        $table->unsignedInteger('machine_id')->nullable();
        $table->string('category');
        $table->unsignedInteger('status_id');
        $table->text('description')->nullable();
        $table->timestamp('created_at')->nullable();
        $table->timestamp('completed_at')->nullable();
        $table->timestamp('deleted_at')->nullable();
    });

    Schema::create('maintenance.ticket_technicians', function (Blueprint $table) {
        $table->increments('id');
        $table->unsignedInteger('ticket_id');
        $table->unsignedInteger('employee_id');
        $table->string('role')->nullable();
    });

    Schema::create('maintenance.ticket_spareparts', function (Blueprint $table) {
        $table->increments('id');
        $table->unsignedInteger('ticket_id');
        $table->unsignedInteger('sparepart_id');
        $table->decimal('quantity')->nullable();
    });

    Schema::create('maintenance.spareparts', function (Blueprint $table) {
        $table->increments('id');
        $table->string('code')->nullable();
        $table->string('name')->nullable();
        $table->string('unit')->nullable();
        $table->timestamp('deleted_at')->nullable();
    });
});

function createMachineForRepairStatusTest(string $status = 'Active'): MachineModel
{
    $machineId = DB::table('core.machines')->insertGetId([
        'code' => 'M-001',
        'name' => 'Test machine',
        'status' => $status,
    ]);

    return MachineModel::query()->findOrFail($machineId);
}

function createTicketStatusForRepairStatusTest(string $code): int
{
    return DB::table('maintenance.ticket_statuses')->insertGetId([
        'code' => $code,
    ]);
}

function createRepairTicketForStatusTest(
    MachineModel $machine,
    int $statusId,
    string $category = 'machine',
    ?string $createdAt = null,
): void {
    DB::table('maintenance.tiket')->insert([
        'machine_id' => $machine->id,
        'category' => $category,
        'status_id' => $statusId,
        'created_at' => $createdAt ?? now()->toDateTimeString(),
    ]);
}

it('marks a machine as under maintenance for each active repair ticket status', function () {
    $machine = createMachineForRepairStatusTest();
    $pendingStatusId = createTicketStatusForRepairStatusTest('pending_approval');
    createRepairTicketForStatusTest($machine, $pendingStatusId);
    foreach (['assigned', 'in_progress', 'waiting_sparepart'] as $status) {
        $statusId = createTicketStatusForRepairStatusTest($status);
        createRepairTicketForStatusTest($machine, $statusId);
    }

    $machine->syncStatusWithRepairTickets();

    expect($machine->fresh()->status)->toBe('Maintenance');
});

it('returns a machine to active when its repair tickets are waiting for verification', function () {
    $machine = createMachineForRepairStatusTest('Maintenance');
    $verificationStatusId = createTicketStatusForRepairStatusTest('waiting_verification');
    createRepairTicketForStatusTest($machine, $verificationStatusId);

    $machine->syncStatusWithRepairTickets();

    expect($machine->fresh()->status)->toBe('Active');
});

it('returns a machine to active when its last repair ticket is completed', function () {
    $machine = createMachineForRepairStatusTest('Maintenance');
    $completedStatusId = createTicketStatusForRepairStatusTest('completed');
    createRepairTicketForStatusTest($machine, $completedStatusId);

    $machine->syncStatusWithRepairTickets();

    expect($machine->fresh()->status)->toBe('Active');
});

it('keeps a machine under maintenance while another repair ticket remains open', function () {
    $machine = createMachineForRepairStatusTest('Maintenance');
    $completedStatusId = createTicketStatusForRepairStatusTest('completed');
    $inProgressStatusId = createTicketStatusForRepairStatusTest('in_progress');
    createRepairTicketForStatusTest($machine, $completedStatusId);
    createRepairTicketForStatusTest($machine, $inProgressStatusId);

    $machine->syncStatusWithRepairTickets();

    expect($machine->fresh()->status)->toBe('Maintenance');
});

it('reconciles statuses for existing machines in a batch', function () {
    $machineWithOpenTicket = createMachineForRepairStatusTest();
    $pendingStatusId = createTicketStatusForRepairStatusTest('pending_approval');
    createRepairTicketForStatusTest($machineWithOpenTicket, $pendingStatusId);

    $machineWaitingForVerification = createMachineForRepairStatusTest('Maintenance');
    $verificationStatusId = createTicketStatusForRepairStatusTest('waiting_verification');
    createRepairTicketForStatusTest($machineWaitingForVerification, $verificationStatusId);

    MachineModel::syncAllStatusesWithRepairTickets();

    expect($machineWithOpenTicket->fresh()->status)->toBe('Maintenance')
        ->and($machineWaitingForVerification->fresh()->status)->toBe('Active');
});

it('counts non-rejected repairs overall and during the last thirty days', function () {
    $machine = createMachineForRepairStatusTest();
    $pendingStatusId = createTicketStatusForRepairStatusTest('pending_approval');
    $completedStatusId = createTicketStatusForRepairStatusTest('completed');
    $rejectedStatusId = createTicketStatusForRepairStatusTest('rejected');

    createRepairTicketForStatusTest(
        $machine,
        $pendingStatusId,
        createdAt: now()->subDays(5)->toDateTimeString(),
    );
    createRepairTicketForStatusTest(
        $machine,
        $completedStatusId,
        createdAt: now()->subDays(31)->toDateTimeString(),
    );
    createRepairTicketForStatusTest(
        $machine,
        $rejectedStatusId,
        createdAt: now()->subDays(2)->toDateTimeString(),
    );
    createRepairTicketForStatusTest(
        $machine,
        $pendingStatusId,
        category: 'other',
        createdAt: now()->subDays(1)->toDateTimeString(),
    );

    $machineWithFrequencies = MachineModel::query()
        ->withRepairFrequencies()
        ->findOrFail($machine->id);

    expect((int) $machineWithFrequencies->repair_frequency)->toBe(2)
        ->and((int) $machineWithFrequencies->monthly_repair_frequency)->toBe(1);
});

it('filters the repair report to the selected machine', function () {
    $selectedMachineId = DB::table('core.machines')->insertGetId([
        'code' => 'M-REPORT-1',
        'name' => 'Selected machine',
        'status' => 'Active',
    ]);
    $otherMachineId = DB::table('core.machines')->insertGetId([
        'code' => 'M-REPORT-2',
        'name' => 'Other machine',
        'status' => 'Active',
    ]);
    $statusId = DB::table('maintenance.ticket_statuses')->insertGetId([
        'code' => 'completed',
        'name' => 'Selesai',
    ]);
    $selectedTicketId = DB::table('maintenance.tiket')->insertGetId([
        'code' => 'T-REPORT-1',
        'machine_id' => $selectedMachineId,
        'category' => 'machine',
        'status_id' => $statusId,
        'description' => 'Selected repair',
        'created_at' => now()->subDay()->toDateTimeString(),
    ]);
    DB::table('maintenance.tiket')->insert([
        'code' => 'T-REPORT-2',
        'machine_id' => $otherMachineId,
        'category' => 'machine',
        'status_id' => $statusId,
        'description' => 'Other repair',
        'created_at' => now()->subDay()->toDateTimeString(),
    ]);

    $request = Request::create('/machines/repair-report', 'GET', [
        'machine_id' => (string) $selectedMachineId,
        'start_date' => now()->subDays(7)->toDateString(),
        'end_date' => now()->toDateString(),
    ]);
    $request->headers->set('X-Inertia', 'true');

    $response = (new MachineController)
        ->repairReport($request)
        ->toResponse($request);
    $page = json_decode(
        $response->getContent(),
        true,
        flags: JSON_THROW_ON_ERROR
    );

    expect(array_column($page['props']['tickets'], 'id'))
        ->toBe([$selectedTicketId])
        ->and($page['props']['machine']['id'])
        ->toBe($selectedMachineId)
        ->and($page['props']['machine']['code'])
        ->toBe('M-REPORT-1');
});

it('includes tickets from all machines when no machine is selected', function () {
    $machineIds = [
        DB::table('core.machines')->insertGetId([
            'code' => 'M-REPORT-1',
            'name' => 'First machine',
            'status' => 'Active',
        ]),
        DB::table('core.machines')->insertGetId([
            'code' => 'M-REPORT-2',
            'name' => 'Second machine',
            'status' => 'Active',
        ]),
    ];
    $statusId = DB::table('maintenance.ticket_statuses')->insertGetId([
        'code' => 'completed',
        'name' => 'Selesai',
    ]);

    foreach ($machineIds as $index => $machineId) {
        DB::table('maintenance.tiket')->insert([
            'code' => 'T-REPORT-'.($index + 1),
            'machine_id' => $machineId,
            'category' => 'machine',
            'status_id' => $statusId,
            'description' => 'Repair '.($index + 1),
            'created_at' => now()->subDay()->toDateTimeString(),
        ]);
    }

    $request = Request::create('/machines/repair-report', 'GET', [
        'start_date' => now()->subDays(7)->toDateString(),
        'end_date' => now()->toDateString(),
    ]);
    $request->headers->set('X-Inertia', 'true');

    $response = (new MachineController)
        ->repairReport($request)
        ->toResponse($request);
    $page = json_decode(
        $response->getContent(),
        true,
        flags: JSON_THROW_ON_ERROR
    );

    expect(count($page['props']['tickets']))->toBe(2)
        ->and($page['props']['machine'])->toBeNull();
});
