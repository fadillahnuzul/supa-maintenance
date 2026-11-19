<?php

use App\Models\Machine\MachineModel;
use Illuminate\Database\Schema\Blueprint;
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
        $table->string('status');
        $table->timestamp('created_at')->nullable();
        $table->timestamp('updated_at')->nullable();
        $table->timestamp('deleted_at')->nullable();
    });

    Schema::create('maintenance.ticket_statuses', function (Blueprint $table) {
        $table->increments('id');
        $table->string('code');
    });

    Schema::create('maintenance.tiket', function (Blueprint $table) {
        $table->increments('id');
        $table->unsignedInteger('machine_id')->nullable();
        $table->string('category');
        $table->unsignedInteger('status_id');
        $table->timestamp('created_at')->nullable();
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
