<?php

namespace App\Http\Controllers;

use App\Events\Notification\TicketAssigned;
use App\Events\Notification\TicketCompleted;
use App\Events\Notification\TicketCreated;
use App\Events\Notification\TicketVerified;
use App\Models\BuildingModel;
use App\Models\Machine\MachineModel;
use App\Models\Sparepart\SparepartModel;
use App\Models\Ticket\TicketDocumentationModel;
use App\Models\Ticket\TicketLogModel;
use App\Models\Ticket\TicketModel;
use App\Models\Ticket\TicketSparepartModel;
use App\Models\Ticket\TicketStatusModel;
use App\Models\Ticket\TicketTechnicianModel;
use App\Models\User;
use App\Models\UserRoleModel;
use App\Services\UpdateSparepartLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | INDEX
    |--------------------------------------------------------------------------
    */

    public function index(Request $request): Response
    {
        $userId = Auth::user()->id;
        $tickets = TicketModel::query()
            ->with([
                'reporter:id,first_name,last_name',
                'location:id,name',
                'machine:id,name,code',
                'status:id,code,name',
                'technicians.employee:id,first_name,last_name',
            ])

            ->when(
                $this->currentEmployeeHasRole('maintenance_technician') && (! $this->currentEmployeeHasRole('maintenance_approver') && ! $this->currentEmployeeHasRole('maintenance_verifier') && ! $this->currentEmployeeHasRole('maintenance_admin') && ! $this->currentEmployeeHasRole('maintenance_admin_system')),
                fn ($query) => $query->whereHas(
                    'technicians',
                    fn ($technician) => $technician->where(
                        'employee_id',
                        $userId
                    )
                )
            )

            ->when(
                $request->filled('status'),
                fn ($query) => $query->whereHas(
                    'status',
                    fn ($status) => $status->where(
                        'code',
                        $request->string('status')
                    )
                )
            )

            ->when(
                $request->filled('priority'),
                fn ($query) => $query->where(
                    'priority',
                    $request->string('priority')
                )
            )

            ->when(
                $request->filled('technician_id'),
                fn ($query) => $query->whereHas(
                    'technicians',
                    fn ($q) => $q->where(
                        'employee_id',
                        $request->integer('technician_id')
                    )
                )
            )

            ->when(
                $request->filled('search'),
                function ($query) use ($request) {

                    $search = trim(
                        $request->string('search')->toString()
                    );

                    $query->where(function ($q) use ($search) {

                        $q->where(
                            'code',
                            'ilike',
                            "%{$search}%"
                        )

                            ->orWhere(
                                'description',
                                'ilike',
                                "%{$search}%"
                            )

                            ->orWhereHas(
                                'reporter',
                                function ($employee) use ($search) {
                                    $employee
                                        ->where(
                                            'first_name',
                                            'ilike',
                                            "%{$search}%"
                                        )
                                        ->orWhere(
                                            'last_name',
                                            'ilike',
                                            "%{$search}%"
                                        );
                                }
                            )

                            ->orWhereHas(
                                'location',
                                fn ($location) => $location->where(
                                    'name',
                                    'ilike',
                                    "%{$search}%"
                                )
                            )

                            ->orWhereHas(
                                'machine',
                                function ($machine) use ($search) {
                                    $machine
                                        ->where(
                                            'name',
                                            'ilike',
                                            "%{$search}%"
                                        )
                                        ->orWhere(
                                            'code',
                                            'ilike',
                                            "%{$search}%"
                                        );
                                }
                            );
                    });
                }
            )

            ->orderBy(
                TicketStatusModel::query()
                    ->select('sort_order')
                    ->whereColumn(
                        'maintenance.ticket_statuses.id',
                        'maintenance.tiket.status_id'
                    )
            )

            ->latest('created_at')

            ->paginate(20)

            ->withQueryString();

        $tickets->through(
            fn (TicketModel $ticket) => $this->ticketIndexResource($ticket)
        );

        $technicians = $this->maintenanceTechnicians();

        return Inertia::render(
            'tickets/index',
            [
                'tickets' => $tickets,

                'technicians' => $technicians,

                'filters' => [
                    'status' => $request->input('status'),

                    'priority' => $request->input('priority'),

                    'technician_id' => $request->input('technician_id'),

                    'search' => $request->input('search'),
                ],

                'can' => [
                    'approve' => $this->currentEmployeeHasRole(
                        'maintenance_approver'
                    ),

                    'verify' => $this->currentEmployeeHasRole(
                        'maintenance_verifier'
                    ),
                ],

                'userId' => $userId,
            ]
        );
    }

    private function statusId(
        string $code
    ): int {
        return (int) TicketStatusModel::query()
            ->where('code', $code)
            ->firstOrFail()
            ->id;
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    public function create(): Response
    {
        $location = BuildingModel::query()
            ->select([
                'id',
                'name',
            ])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $machines = MachineModel::query()
            ->select([
                'id',
                'name',
                'code',
                'location_id',
            ])
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->get();

        return Inertia::render(
            'tickets/create',
            [
                'ticketCode' => $this->generateTicketCode(),

                'reporter' => $this->currentEmployeeResource(),

                'divisions' => $location,

                'machines' => $machines,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | STORE
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => [
                'required',
                Rule::in([
                    'machine',
                    'electrical',
                    'maintenance',
                    'preventive_maintenance',
                    'other',
                ]),
            ],

            'priority' => [
                'required',
                Rule::in([
                    'standard',
                    'urgent',
                ]),
            ],

            'division_id' => [
                'required',
                'integer',
                Rule::exists(
                    BuildingModel::class,
                    'id'
                ),
            ],

            'machine_id' => [
                Rule::requiredIf(
                    $request->category === 'machine'
                ),
                'nullable',
                'integer',
                Rule::exists(
                    MachineModel::class,
                    'id'
                ),
            ],

            'description' => [
                'required',
                'string',
                'max:5000',
            ],

            'damage_photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $employeeId = $this->currentEmployeeId();

        DB::transaction(
            function () use (
                $request,
                $validated,
                $employeeId,
                &$ticket
            ) {

                $photoPath = null;

                if ($request->hasFile('damage_photo')) {
                    $photoPath =
                        $request
                            ->file('damage_photo')
                            ->store(
                                'maintenance/tickets',
                                'public'
                            );
                }

                $ticket = TicketModel::create([
                    'code' => $this->generateTicketCode(),

                    'reporter_id' => $employeeId,

                    'category' => $validated['category'],

                    'priority' => $validated['priority'],

                    'division_id' => $validated['division_id'],

                    'machine_id' => $validated['category'] === 'machine'
                        ? $validated['machine_id']
                        : null,

                    'description' => $validated['description'],

                    'damage_photo_url' => $photoPath,

                    'status_id' => $this->statusId(
                        'pending_approval'
                    ),
                ]);

                $this->createLog(
                    ticket: $ticket,
                    action: 'created',
                    fromStatus: null,
                    toStatus: 'pending_approval',
                    description: 'Tiket perbaikan diajukan.',
                    employeeId: $employeeId,
                );

                DB::afterCommit(function () use ($ticket) {
                    event(new TicketCreated($ticket));
                });
            }
        );

        return redirect()
            ->route(
                'tickets.show',
                $ticket->id
            )
            ->with(
                'success',
                'Tiket berhasil dibuat.'
            );
    }

    public function edit(TicketModel $ticket): Response
    {
        $ticket->load('technicians');

        $divisions = BuildingModel::query()
            ->select(['id', 'name'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $machines = MachineModel::query()
            ->select(['id', 'name', 'code', 'location_id'])
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->get();

        return Inertia::render('tickets/edit', [
            'ticket' => [
                'id' => $ticket->id,
                'code' => $ticket->code,
                'category' => $ticket->category,
                'priority' => $ticket->priority,
                'division_id' => (string) $ticket->division_id,
                'machine_id' => (string) ($ticket->machine_id ?? ''),
                'description' => $ticket->description,
                'image' => $ticket->damage_photo_url
                    ? '/storage/'.ltrim($ticket->damage_photo_url, '/')
                    : null,
                'deadline' => $ticket->deadline?->format('Y-m-d') ?? '',
                'pic_technician_id' => (string) (
                    $ticket->technicians->firstWhere('role', 'pic')?->employee_id ?? ''
                ),
                'additional_technician_ids' => $ticket->technicians
                    ->where('role', 'member')
                    ->pluck('employee_id')
                    ->values(),
            ],
            'divisions' => $divisions,
            'machines' => $machines,
            'technicians' => $this->maintenanceTechnicians(),
        ]);
    }

    public function update(Request $request, TicketModel $ticket)
    {
        $validated = $request->validate([
            'category' => [
                'required',
                Rule::in([
                    'machine',
                    'electrical',
                    'maintenance',
                    'preventive_maintenance',
                    'other',
                ]),
            ],

            'priority' => [
                'required',
                Rule::in([
                    'standard',
                    'urgent',
                ]),
            ],

            'division_id' => [
                'required',
                'integer',
                Rule::exists(BuildingModel::class, 'id'),
            ],

            'machine_id' => [
                Rule::requiredIf($request->category === 'machine'),
                'nullable',
                'integer',
                Rule::exists(MachineModel::class, 'id'),
            ],

            'description' => [
                'required',
                'string',
                'max:5000',
            ],

            'damage_photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'pic_technician_id' => [
                'nullable',
                Rule::requiredIf(
                    fn () => is_array($request->input('additional_technician_ids'))
                        && $request->input('additional_technician_ids') !== []
                ),
                'integer',
                Rule::exists(User::class, 'id'),
            ],

            'additional_technician_ids' => [
                'nullable',
                'array',
            ],

            'additional_technician_ids.*' => [
                'integer',
                'distinct',
                Rule::exists(User::class, 'id'),
            ],

            'deadline' => [
                Rule::requiredIf(
                    fn () => $request->filled('pic_technician_id')
                        || (
                            is_array($request->input('additional_technician_ids'))
                            && $request->input('additional_technician_ids') !== []
                        )
                ),
                'nullable',
                'date',
            ],
        ]);

        $previousPhotoPath = $ticket->damage_photo_url;
        $photoPath = $previousPhotoPath;

        if ($request->hasFile('damage_photo')) {
            $photoPath = $request->file('damage_photo')->store(
                'maintenance/tickets',
                'public'
            );

            if (! $photoPath) {
                throw new \RuntimeException('Foto tiket gagal disimpan.');
            }
        }

        $picTechnicianId = isset($validated['pic_technician_id'])
            ? (int) $validated['pic_technician_id']
            : null;

        $technicianAssignments = [];

        if ($picTechnicianId !== null) {
            $technicianAssignments[$picTechnicianId] = 'pic';
        }

        foreach ($validated['additional_technician_ids'] ?? [] as $technicianId) {
            $technicianId = (int) $technicianId;

            if ($technicianId !== $picTechnicianId) {
                $technicianAssignments[$technicianId] = 'member';
            }
        }

        $techniciansChanged = DB::transaction(function () use (
            $ticket,
            $validated,
            $photoPath,
            $technicianAssignments
        ): bool {
            $ticket->update([
                'category' => $validated['category'],
                'priority' => $validated['priority'],
                'division_id' => $validated['division_id'],
                'machine_id' => $validated['category'] === 'machine'
                    ? $validated['machine_id']
                    : null,
                'description' => $validated['description'],
                'damage_photo_url' => $photoPath,
                'deadline' => $validated['deadline'] ?? null,
            ]);

            return $this->syncTicketTechnicians(
                $ticket,
                $technicianAssignments
            );
        });

        if ($techniciansChanged && $technicianAssignments !== []) {
            event(new TicketAssigned(
                $ticket,
                array_map('intval', array_keys($technicianAssignments))
            ));
        }

        if ($photoPath !== $previousPhotoPath && $previousPhotoPath) {
            Storage::disk('public')->delete($previousPhotoPath);
        }

        return redirect()
            ->route('tickets.show', $ticket->id)
            ->with('success', 'Tiket berhasil diperbarui.');
    }

    /*
    |--------------------------------------------------------------------------
    | APPROVAL PAGE
    |--------------------------------------------------------------------------
    */

    public function approval(
        TicketModel $ticket
    ): Response {

        abort_unless(
            $ticket->status?->code === 'pending_approval',
            422,
            'Tiket ini sudah diproses.'
        );

        $ticket->load([
            'reporter:id,first_name,last_name',
            'location:id,name',
            'machine:id,name,code',

            'status:id,code,name',
        ]);

        return Inertia::render(
            'tickets/approval',
            [
                'ticket' => $this->ticketDetailResource($ticket),

                'technicians' => $this->maintenanceTechnicians(),

                'spareparts' => SparepartModel::query()
                    ->select([
                        'id',
                        'code',
                        'name',
                        'stock',
                        'unit',
                    ])
                    ->orderBy('name')
                    ->get(),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | APPROVE
    |--------------------------------------------------------------------------
    */

    public function approve(
        Request $request,
        TicketModel $ticket
    ) {
        $validated = $request->validate([
            'pic_technician_id' => [
                'required',
                'integer',
                Rule::exists(
                    User::class,
                    'id'
                ),
            ],

            'additional_technician_ids' => [
                'nullable',
                'array',
            ],

            'additional_technician_ids.*' => [
                'integer',
                'distinct',
                Rule::exists(
                    User::class,
                    'id'
                ),
            ],

            'deadline' => [
                'required',
                'date',
            ],
        ]);

        $technicianIds = collect([
            $validated['pic_technician_id'],
            ...($validated['additional_technician_ids'] ?? []),
        ])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        $technicianAssignments = [
            (int) $validated['pic_technician_id'] => 'pic',
        ];

        foreach ($validated['additional_technician_ids'] ?? [] as $technicianId) {
            $technicianId = (int) $technicianId;

            if ($technicianId !== (int) $validated['pic_technician_id']) {
                $technicianAssignments[$technicianId] = 'member';
            }
        }

        $approverId =
            $this->currentEmployeeId();

        DB::transaction(
            function () use (
                $ticket,
                $validated,
                $approverId,
                $technicianIds,
                $technicianAssignments
            ) {

                /*
                 * Lock supaya tidak bisa dua orang
                 * approve tiket bersamaan.
                 */

                $ticket = TicketModel::query()
                    ->lockForUpdate()
                    ->findOrFail($ticket->id);

                abort_unless(
                    $ticket->status?->code ===
                        'pending_approval',
                    422,
                    'Tiket sudah diproses.'
                );

                $oldStatus =
                    $ticket->status?->code;

                $ticket->update([
                    'status_id' => $this->statusId(
                        'assigned'
                    ),

                    'approved_by' => $approverId,

                    'approved_at' => now(),

                    'deadline' => $validated['deadline'],

                    'rejected_by' => null,

                    'rejected_at' => null,

                    'rejection_reason' => null,
                ]);

                $this->syncTicketTechnicians(
                    $ticket,
                    $technicianAssignments
                );

                $this->createLog(
                    ticket: $ticket,
                    action: 'approved',
                    fromStatus: $oldStatus,
                    toStatus: 'assigned',
                    description: 'Tiket disetujui dan teknisi ditugaskan.',
                    employeeId: $approverId,
                );

                DB::afterCommit(
                    function () use (
                        $ticket,
                        $technicianIds
                    ) {
                        event(
                            new TicketAssigned(
                                $ticket,
                                $technicianIds
                            )
                        );
                    }
                );
            }
        );

        return redirect()
            ->route(
                'tickets.show',
                $ticket->id
            )
            ->with(
                'success',
                'Tiket berhasil disetujui.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | REJECT
    |--------------------------------------------------------------------------
    */

    public function reject(
        Request $request,
        TicketModel $ticket
    ) {
        $validated = $request->validate([
            'reason' => [
                'required',
                'string',
                'max:3000',
            ],
        ]);

        $employeeId =
            $this->currentEmployeeId();

        DB::transaction(
            function () use (
                $ticket,
                $validated,
                $employeeId
            ) {

                $ticket = TicketModel::query()
                    ->lockForUpdate()
                    ->findOrFail($ticket->id);

                abort_unless(
                    $ticket->status?->code ===
                        'pending_approval',
                    422,
                    'Tiket sudah diproses.'
                );

                $oldStatus =
                    $ticket->status?->code;

                $ticket->update([
                    'status_id' => $this->statusId(
                        'rejected'
                    ),

                    'rejected_by' => $employeeId,

                    'rejected_at' => now(),

                    'rejection_reason' => $validated['reason'],
                ]);

                $this->createLog(
                    ticket: $ticket,
                    action: 'rejected',
                    fromStatus: $oldStatus,
                    toStatus: 'rejected',
                    description: $validated['reason'],
                    employeeId: $employeeId,
                );
            }
        );

        return redirect()
            ->route('tickets.index')
            ->with(
                'success',
                'Tiket berhasil ditolak.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | SHOW
    |--------------------------------------------------------------------------
    */

    public function show(
        TicketModel $ticket
    ): Response {

        $ticket->load([
            'reporter:id,first_name,last_name',

            'location:id,name',

            'machine:id,name,code',

            'approvedBy:id,first_name,last_name',

            'rejectedBy:id,first_name,last_name',

            'verifiedBy:id,first_name,last_name',

            'technicians.employee:id,first_name,last_name',

            'logs' => fn ($query) => $query->orderBy(
                'created_at'
            ),

            'logs.createdBy:id,first_name,last_name',

            'logs.fromStatus:id,code,name',

            'logs.toStatus:id,code,name',

            'documentations',

            'spareparts',
        ]);

        $spareparts =
            SparepartModel::query()
                ->select([
                    'id',
                    'code',
                    'name',
                    'stock',
                    'unit',
                ])
                ->orderBy('name')
                ->get();

        return Inertia::render(
            'tickets/show',
            [
                'ticket' => $this->ticketDetailResource(
                    $ticket
                ),

                'spareparts' => $spareparts,

                'can' => [
                    'edit' => $this->currentEmployeeHasRole(
                        'maintenance_approver'
                    ) || $this->currentEmployeeHasRole(
                        'maintenance_admin'
                    ),

                    'update_progress' => $this->canUpdateTicket(
                        $ticket
                    ),

                    'verify' => $ticket->status?->code ===
                        'waiting_verification'
                        &&
                        $this->currentEmployeeHasRole(
                            'maintenance_verifier'
                        ),
                ],
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE PROGRESS
    |--------------------------------------------------------------------------
    */

    /**
     * @param  array<int, array{id: int|string, quantity: int|float|string}>  $spareparts
     */
    private function recordUsedSpareparts(
        TicketModel $ticket,
        TicketLogModel $log,
        array $spareparts,
        int $employeeId,
    ): void {
        foreach ($spareparts as $item) {
            $sparepartId = (int) $item['id'];
            $quantity = (float) $item['quantity'];

            TicketSparepartModel::create([
                'ticket_id' => $ticket->id,
                'ticket_log_id' => $log->id,
                'sparepart_id' => $sparepartId,
                'quantity' => $quantity,
                'created_by' => $employeeId,
                'created_at' => now(),
            ]);

            UpdateSparepartLogService::reduce(
                $sparepartId,
                $quantity,
                'Pengurangan stok dari tiket '.$ticket->code,
                $employeeId,
            );
        }
    }

    public function updateProgress(
        Request $request,
        TicketModel $ticket
    ) {
        /*
         * Perhatikan:
         *
         * completed TIDAK ADA di sini.
         */

        $validated = $request->validate([
            'progress_status' => [
                'required',
                Rule::in([
                    'in_progress',
                    'waiting_sparepart',
                    'waiting_verification',
                ]),
            ],

            'description' => [
                'required',
                'string',
                'max:5000',
            ],

            'evidence' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'spareparts_used' => [
                'nullable',
                'array',
            ],

            'spareparts_used.*.id' => [
                'required',
                'integer',
            ],

            'spareparts_used.*.quantity' => [
                'required',
                'numeric',
                'gt:0',
            ],
        ]);

        $employeeId =
            $this->currentEmployeeId();

        DB::transaction(
            function () use (
                $request,
                $ticket,
                $validated,
                $employeeId
            ) {

                $ticket = TicketModel::query()
                    ->lockForUpdate()
                    ->findOrFail($ticket->id);

                abort_unless(
                    in_array(
                        $ticket->status?->code,
                        [
                            'assigned',
                            'in_progress',
                            'waiting_sparepart',
                        ],
                        true
                    ),
                    422,
                    'Status tiket tidak dapat diperbarui.'
                );

                $oldStatus =
                    $ticket->status?->code;

                $newStatus =
                    $validated['progress_status'];

                $ticket->update([
                    'status_id' => $this->statusId(
                        $newStatus
                    ),
                ]);

                $log = $this->createLog(
                    ticket: $ticket,
                    action: $this->progressAction(
                        $oldStatus,
                        $newStatus
                    ),
                    fromStatus: $oldStatus,
                    toStatus: $newStatus,
                    description: $validated['description'],
                    employeeId: $employeeId,
                );

                /*
                 * Dokumentasi progress.
                 */

                if (
                    $request->hasFile(
                        'evidence'
                    )
                ) {

                    $path =
                        $request
                            ->file('evidence')
                            ->store(
                                'maintenance/tickets/progress',
                                'public'
                            );

                    TicketDocumentationModel::create([
                        'ticket_id' => $ticket->id,

                        'ticket_log_id' => $log->id,

                        'image_url' => $path,

                        'uploaded_by' => $employeeId,

                        'created_at' => now(),
                    ]);
                }

                /*
                 * Sparepart aktual yang digunakan.
                 */

                $this->recordUsedSpareparts(
                    $ticket,
                    $log,
                    $validated['spareparts_used'] ?? [],
                    $employeeId,
                );

                if ($newStatus === 'waiting_verification') {
                    DB::afterCommit(
                        function () use ($ticket) {
                            event(
                                new TicketCompleted(
                                    $ticket
                                )
                            );
                        }
                    );
                }
            }
        );

        return back()->with(
            'success',
            $validated['progress_status']
                === 'waiting_verification'

                ? 'Pekerjaan telah dikirim untuk verifikasi.'

                : 'Progress berhasil diperbarui.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFY
    |--------------------------------------------------------------------------
    */

    public function verify(
        Request $request,
        TicketModel $ticket
    ) {
        $validated =
            $request->validate([
                'note' => [
                    'nullable',
                    'string',
                    'max:3000',
                ],
            ]);

        abort_unless(
            $this->currentEmployeeHasRole(
                'maintenance_verifier'
            ),
            403,
            'Anda tidak memiliki akses sebagai Maintenance Verifier.'
        );

        $employeeId =
            $this->currentEmployeeId();

        DB::transaction(
            function () use (
                $ticket,
                $validated,
                $employeeId
            ) {

                $ticket = TicketModel::query()
                    ->lockForUpdate()
                    ->findOrFail($ticket->id);

                abort_unless(
                    $ticket->status?->code ===
                        'waiting_verification',
                    422,
                    'Tiket tidak sedang menunggu verifikasi.'
                );

                $oldStatus =
                    $ticket->status?->code;

                $ticket->update([
                    'status_id' => $this->statusId(
                        'completed'
                    ),

                    'verified_by' => $employeeId,

                    'verified_at' => now(),

                    'verification_note' => $validated['note']
                        ?? null,

                    'completed_at' => now(),
                ]);

                $this->createLog(
                    ticket: $ticket,
                    action: 'verified',
                    fromStatus: $oldStatus,
                    toStatus: 'completed',
                    description: $validated['note']
                        ?: 'Pekerjaan telah diverifikasi dan dinyatakan selesai.',
                    employeeId: $employeeId,
                );

                DB::afterCommit(
                    function () use ($ticket) {
                        event(
                            new TicketVerified(
                                $ticket
                            )
                        );
                    }
                );
            }
        );

        return back()->with(
            'success',
            'Pekerjaan berhasil diverifikasi.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | REJECT VERIFICATION
    |--------------------------------------------------------------------------
    */

    public function rejectVerification(
        Request $request,
        TicketModel $ticket
    ) {
        $validated =
            $request->validate([
                'reason' => [
                    'required',
                    'string',
                    'max:3000',
                ],
            ]);

        abort_unless(
            $this->currentEmployeeHasRole(
                'maintenance_verifier'
            ),
            403,
            'Anda tidak memiliki akses sebagai Maintenance Verifier.'
        );

        $employeeId =
            $this->currentEmployeeId();

        DB::transaction(
            function () use (
                $ticket,
                $validated,
                $employeeId
            ) {

                $ticket = TicketModel::query()
                    ->lockForUpdate()
                    ->findOrFail($ticket->id);

                abort_unless(
                    $ticket->status?->code ===
                        'waiting_verification',
                    422,
                    'Tiket tidak sedang menunggu verifikasi.'
                );

                $oldStatus =
                    $ticket->status?->code;

                $ticket->update([
                    'status_id' => $this->statusId(
                        'in_progress'
                    ),

                    'verified_by' => null,

                    'verified_at' => null,

                    'verification_note' => null,

                    'completed_at' => null,
                ]);

                $this->createLog(
                    ticket: $ticket,
                    action: 'verification_rejected',
                    fromStatus: $oldStatus,
                    toStatus: 'in_progress',
                    description: $validated['reason'],
                    employeeId: $employeeId,
                );
            }
        );

        return back()->with(
            'success',
            'Verifikasi ditolak. Tiket dikembalikan ke In Progress.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    private function createLog(
        TicketModel $ticket,
        string $action,
        ?string $fromStatus,
        string $toStatus,
        ?string $description,
        int $employeeId,
    ): TicketLogModel {

        return TicketLogModel::create([
            'ticket_id' => $ticket->id,

            'action' => $action,

            'from_status_id' => $fromStatus
                ? $this->statusId($fromStatus)
                : null,

            'to_status_id' => $this->statusId($toStatus),

            'description' => $description,

            'created_by' => $employeeId,

            'created_at' => now(),
        ]);
    }

    /**
     * @param  array<int, 'pic'|'member'>  $technicianAssignments
     */
    private function syncTicketTechnicians(
        TicketModel $ticket,
        array $technicianAssignments
    ): bool {
        $existingTechnicians = $ticket->technicians()
            ->get()
            ->keyBy('employee_id');

        $existingAssignments = $existingTechnicians
            ->mapWithKeys(
                fn (TicketTechnicianModel $technician): array => [
                    (int) $technician->employee_id => $technician->role,
                ]
            )
            ->all();

        $desiredAssignments = [];

        foreach ($technicianAssignments as $employeeId => $role) {
            $desiredAssignments[(int) $employeeId] = $role;
        }

        ksort($existingAssignments);
        ksort($desiredAssignments);

        if ($existingAssignments === $desiredAssignments) {
            return false;
        }

        if ($desiredAssignments === []) {
            $ticket->technicians()->delete();
        } else {
            $ticket->technicians()
                ->whereNotIn('employee_id', array_keys($desiredAssignments))
                ->delete();
        }

        foreach ($desiredAssignments as $employeeId => $role) {
            $existingTechnician = $existingTechnicians->get($employeeId);

            if ($existingTechnician) {
                $existingTechnician->update(['role' => $role]);

                continue;
            }

            $ticket->technicians()->create([
                'employee_id' => $employeeId,
                'role' => $role,
                'assigned_at' => now(),
                'created_at' => now(),
            ]);
        }

        return true;
    }

    private function progressAction(
        string $oldStatus,
        string $newStatus
    ): string {

        if (
            $newStatus ===
            'waiting_verification'
        ) {
            return 'submitted_verification';
        }

        if (
            $newStatus ===
            'waiting_sparepart'
        ) {
            return 'waiting_sparepart';
        }

        if (
            $oldStatus ===
            'waiting_sparepart'
            &&
            $newStatus ===
            'in_progress'
        ) {
            return 'resumed_work';
        }

        return 'progress_updated';
    }

    private function currentEmployeeId(): int
    {
        $employeeId =
            Auth::id();

        abort_if(
            ! $employeeId,
            401,
            'Employee belum login.'
        );

        return (int) $employeeId;
    }

    private function currentEmployeeResource(): ?array
    {
        $employeeId =
            Auth::id();

        if (! $employeeId) {
            return null;
        }

        $employee =
            User::query()
                ->select([
                    'id',
                    'id_karyawan',
                    'first_name',
                    'last_name',
                    'username',
                ])
                ->find($employeeId);

        if (! $employee) {
            return null;
        }

        return [
            'id' => $employee->id,

            'employee_code' => $employee->id_karyawan,

            'name' => trim(
                $employee->first_name
                    .' '
                    .$employee->last_name
            ),
        ];
    }

    private function currentEmployeeHasRole(
        string $roleCode
    ): bool {

        $employeeId = Auth::id();

        if (! $employeeId) {
            return false;
        }

        return UserRoleModel::query()
            ->where(
                'employee_id',
                $employeeId
            )
            ->whereHas(
                'role',
                function ($query) use ($roleCode) {
                    $query
                        ->where(
                            'code',
                            $roleCode
                        )
                        ->where(
                            'is_active',
                            true
                        );
                }
            )
            ->exists();
    }

    private function maintenanceTechnicians()
    {
        return User::query()
            ->select([
                'core.employees.id',
                'core.employees.first_name',
                'core.employees.last_name',
            ])

            ->join(
                'maintenance.user_role',
                'maintenance.user_role.employee_id',
                '=',
                'core.employees.id'
            )

            ->join(
                'maintenance.roles',
                'maintenance.roles.id',
                '=',
                'maintenance.user_role.role_id'
            )

            ->where(
                'maintenance.roles.code',
                'maintenance_technician'
            )

            ->where(
                'maintenance.roles.is_active',
                true
            )

            ->where(
                'core.employees.is_active',
                true
            )

            ->whereNull(
                'core.employees.deleted_at'
            )

            ->orderBy(
                'core.employees.first_name'
            )

            ->get()

            ->map(
                fn ($employee) => [
                    'id' => $employee->id,

                    'name' => trim(
                        $employee->first_name
                            .' '
                            .$employee->last_name
                    ),
                ]
            );
    }

    private function canUpdateTicket(
        TicketModel $ticket
    ): bool {

        $employeeId =
            Auth::id();

        if (! $employeeId) {
            return false;
        }

        if (
            ! in_array(
                $ticket->status?->code,
                [
                    'assigned',
                    'in_progress',
                    'waiting_sparepart',
                ],
                true
            )
        ) {
            return false;
        }

        return TicketTechnicianModel::query()
            ->where(
                'ticket_id',
                $ticket->id
            )
            ->where(
                'employee_id',
                $employeeId
            )
            ->exists();
    }

    private function generateTicketCode(): string
    {
        $date =
            now()->format('Ymd');

        $prefix =
            "TKT-{$date}-";

        $lastTicket =
            TicketModel::query()
                ->where(
                    'code',
                    'like',
                    "{$prefix}%"
                )
                ->orderByDesc('id')
                ->first();

        $lastSequence = 0;

        if ($lastTicket) {
            $lastSequence =
                (int) substr(
                    $lastTicket->code,
                    -4
                );
        }

        return $prefix
            .str_pad(
                $lastSequence + 1,
                4,
                '0',
                STR_PAD_LEFT
            );
    }

    private function ticketIndexResource(
        TicketModel $ticket
    ): array {

        $pic =
            $ticket
                ->technicians
                ->firstWhere(
                    'role',
                    'pic'
                );

        return [
            'id' => $ticket->id,

            'code' => $ticket->code,

            'category' => $ticket->category,

            'category_label' => $this->categoryLabel(
                $ticket->category
            ),

            'detail' => $ticket->description,

            'location' => $ticket->location?->name,

            'priority' => $ticket->priority,

            'priority_label' => $ticket->priority ===
                'urgent'
                ? 'Urgent'
                : 'Standar',

            'reporter' => $this->employeeName(
                $ticket->reporter
            ),

            'technician' => $pic
                ? $this->employeeName(
                    $pic->employee
                ) : null,

            'technician_ids' => $ticket
                ->technicians
                ->pluck(
                    'employee_id'
                )
                ->map(
                    fn ($id) => (int) $id
                )
                ->values(),

            'status' => $ticket->status?->code,

            'status_label' => $this->statusLabel(
                $ticket->status?->code
            ),

            'created_at' => optional(
                $ticket->created_at
            )->format(
                'd-m-Y H:i'
            ),
        ];
    }

    private function ticketDetailResource(
        TicketModel $ticket
    ): array {

        $pic =
            $ticket
                ->technicians
                ->firstWhere(
                    'role',
                    'pic'
                );

        $members =
            $ticket
                ->technicians
                ->where(
                    'role',
                    'member'
                )
                ->map(
                    fn ($item) => $this->employeeName(
                        $item->employee
                    )
                )
                ->values();

        $technicians =
            $ticket
                ->technicians
                ->map(
                    fn ($technician) => [
                        'id' => $technician->id,

                        'name' => $this->employeeName(
                            $technician->employee
                        ),

                        'is_pic' => $technician->role === 'pic',
                    ]
                )
                ->values();

        $histories = $ticket->relationLoaded(
            'logs'
        )
            ? $ticket
                ->logs
                ->map(
                    fn ($log) => [
                        'id' => $log->id,

                        'action' => $log->action,

                        'action_label' => $log->toStatus?->name ??
                            $log->action,

                        'description' => $log->description,

                        'actor' => $this->employeeName(
                            $log->createdBy
                        ),

                        'created_at' => optional(
                            $log->created_at
                        )->format(
                            'd-m-Y H:i'
                        ),
                    ]
                )
            : collect();

        $documentations = $ticket->relationLoaded(
            'documentations'
        )
            ? $ticket
                ->documentations
                ->map(
                    fn ($documentation) => [
                        'id' => $documentation->id,

                        'image' => '/storage/'.ltrim($documentation->image_url, '/'),

                        'created_at' => optional(
                            $documentation->created_at
                        )->format(
                            'd-m-Y H:i'
                        ),
                    ]
                )
            : collect();

        return [
            'id' => $ticket->id,

            'code' => $ticket->code,

            'category' => $ticket->category,

            'category_label' => $this->categoryLabel(
                $ticket->category
            ),

            'detail' => $ticket->description,

            'location' => $ticket->location?->name,

            'priority' => $ticket->priority,

            'priority_label' => $ticket->priority ===
                'urgent'
                ? 'Urgent'
                : 'Standar',

            'deadline' => optional(
                $ticket->deadline
            )->format(
                'd-m-Y'
            ),

            'reporter' => $this->employeeName(
                $ticket->reporter
            ),

            'authorized_by' => $this->employeeName(
                $ticket->approvedBy
            ),

            'technician' => $pic
                ? $this->employeeName(
                    $pic->employee
                )
                : null,

            'member' => $members->join(', '),

            'members' => $members,

            'technicians' => $technicians,

            'histories' => $histories,

            'documentations' => $documentations,

            'status' => $ticket->status?->code,

            'status_label' => $this->statusLabel(
                $ticket->status?->code
            ),

            'machine_code' => $ticket->machine?->code,

            'machine_name' => $ticket->machine?->name,

            'image' => $ticket->damage_photo_url
                ? '/storage/'.ltrim($ticket->damage_photo_url, '/')
                : null,

            'created_at' => optional(
                $ticket->created_at
            )->format(
                'd-m-Y H:i'
            ),

            'approved_at' => optional(
                $ticket->approved_at
            )->format(
                'd-m-Y H:i'
            ),

            'verified_by' => $this->employeeName(
                $ticket->verifiedBy
            ),

            'verified_at' => optional(
                $ticket->verified_at
            )->format(
                'd-m-Y H:i'
            ),

            'completed_at' => optional(
                $ticket->completed_at
            )->format(
                'd-m-Y H:i'
            ),

            'repair_logs' => $ticket->relationLoaded(
                'logs'
            )
                ? $ticket
                    ->logs
                    ->map(
                        fn ($log) => [
                            'id' => $log->id,

                            'action' => $log->action,

                            'from_status' => $log->fromStatus?->code,

                            'status' => $log->toStatus?->code,

                            'status_label' => $this->statusLabel(
                                $log->toStatus?->code
                            ),

                            'description' => $log->description,

                            'created_at' => optional(
                                $log->created_at
                            )->format(
                                'd-m-Y H:i'
                            ),

                            'created_by' => $this->employeeName(
                                $log->createdBy
                            ),
                        ]
                    )
                : [],
        ];
    }

    private function employeeName(
        $employee
    ): ?string {

        if (! $employee) {
            return null;
        }

        return trim(
            $employee->first_name
                .' '
                .$employee->last_name
        );
    }

    private function categoryLabel(
        string $category
    ): string {

        return match ($category) {
            'machine' => 'Mesin',

            'electrical' => 'Kelistrikan',

            'maintenance' => 'Pemeliharaan',

            'preventive_maintenance' => 'Preventif Maintenance',

            'other' => 'Pekerjaan Lainnya',

            default => $category,
        };
    }

    private function statusLabel(
        string $status
    ): string {

        return match ($status) {
            'pending_approval' => 'Pending Approval',

            'rejected' => 'Rejected',

            'assigned' => 'Assigned',

            'in_progress' => 'In Progress',

            'waiting_sparepart' => 'Waiting Sparepart',

            'waiting_verification' => 'Waiting Verification',

            'completed' => 'Completed',

            default => $status,
        };
    }
}
