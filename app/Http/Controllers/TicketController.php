<?php

namespace App\Http\Controllers;

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
        $tickets = TicketModel::query()
            ->with([
                'reporter:id,first_name,last_name',
                'division:id,name',
                'machine:id,name,code',
                'status:id,code,name',
                'technicians.employee:id,first_name,last_name',
            ])

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
                                'division',
                                fn ($division) => $division->where(
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
        $divisions = BuildingModel::query()
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

                'divisions' => $divisions,

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
            }
        );

        return redirect()
            ->route(
                'tickets.show',
                $ticket->code
            )
            ->with(
                'success',
                'Tiket berhasil dibuat.'
            );
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
            'division:id,name',
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

        $approverId =
            $this->currentEmployeeId();

        DB::transaction(
            function () use (
                $ticket,
                $validated,
                $approverId
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
                        'waiting_verification'
                    ),

                    'approved_by' => $approverId,

                    'approved_at' => now(),

                    'deadline' => $validated['deadline'],

                    'rejected_by' => null,

                    'rejected_at' => null,

                    'rejection_reason' => null,
                ]);

                /*
                 * PIC.
                 */

                TicketTechnicianModel::create([
                    'ticket_id' => $ticket->id,

                    'employee_id' => $validated['pic_technician_id'],

                    'role' => 'pic',

                    'assigned_at' => now(),

                    'created_at' => now(),
                ]);

                /*
                 * Additional technicians.
                 */

                foreach (
                    $validated['additional_technician_ids'] ?? [] as $technicianId
                ) {

                    if (
                        (int) $technicianId ===
                        (int) $validated['pic_technician_id']
                    ) {
                        continue;
                    }

                    TicketTechnicianModel::create([
                        'ticket_id' => $ticket->id,

                        'employee_id' => $technicianId,

                        'role' => 'member',

                        'assigned_at' => now(),

                        'created_at' => now(),
                    ]);
                }

                $this->createLog(
                    ticket: $ticket,
                    action: 'approved',
                    fromStatus: $oldStatus,
                    toStatus: 'assigned',
                    description: 'Tiket disetujui dan teknisi ditugaskan.',
                    employeeId: $approverId,
                );
            }
        );

        return redirect()
            ->route(
                'tickets.show',
                $ticket->code
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

            'division:id,name',

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
                    'updateProgress' => $this->canUpdateTicket(
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
                            'rejected',
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

                foreach (
                    $validated['spareparts_used'] ?? [] as $item
                ) {

                    TicketSparepartModel::create([
                        'ticket_id' => $ticket->id,

                        'ticket_log_id' => $log->id,

                        'sparepart_id' => $item['id'],

                        'quantity' => $item['quantity'],

                        'created_by' => $employeeId,

                        'created_at' => now(),
                    ]);

                    /*
                     * Di sinilah stock sparepart
                     * nantinya dikurangi.
                     *
                     * Saya sarankan panggil service
                     * stock Anda di sini supaya
                     * sparepart_stock_logs juga
                     * otomatis tercatat.
                     */
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
        /*
         * Jika model login Anda langsung menggunakan
         * core.employees, Auth::id() sudah benar.
         *
         * Jika nanti users dan employees berbeda,
         * cukup ubah helper ini saja.
         */

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
                    'rejected',
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

            'location' => $ticket->division?->name,

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
                )
                : null,

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

        return [
            'id' => $ticket->id,

            'code' => $ticket->code,

            'category' => $ticket->category,

            'category_label' => $this->categoryLabel(
                $ticket->category
            ),

            'detail' => $ticket->description,

            'location' => $ticket->division?->name,

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

            'status' => $ticket->status?->code,

            'status_label' => $this->statusLabel(
                $ticket->status?->code
            ),

            'machine_code' => $ticket->machine?->code,

            'machine_name' => $ticket->machine?->name,

            'image' => $ticket->damage_photo_url
                ? Storage::disk('public')
                    ->url(
                        $ticket->damage_photo_url
                    )
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
