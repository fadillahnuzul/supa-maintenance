<?php

namespace App\Http\Controllers;

use App\Models\Machine\MachineModel;
use App\Models\Sparepart\SparepartModel;
use App\Models\Sparepart\SparepartStockLogModel;
use App\Models\Ticket\TicketModel;
use App\Models\Ticket\TicketStatusModel;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{public function index(Request $request): Response
    {

        $validated = $request->validate([
            'start_date' => [
                'nullable',
                'date',
            ],

            'end_date' => [
                'nullable',
                'date',
                'after_or_equal:start_date',
            ],
        ]);

        $startDate = $validated['start_date']
            ?? now()->startOfMonth()->toDateString();

        $endDate = $validated['end_date']
            ?? now()->toDateString();



        $statuses = TicketStatusModel::query()
            ->get([
                'id',
                'code',
                'name',
            ]);

        $findStatusId = function (...$names) use ($statuses) {
            $names = collect($names)
                ->map(fn ($value) => strtolower(trim($value)));

            return $statuses
                ->first(function ($status) use ($names) {
                    return $names->contains(
                        strtolower(trim($status->code ?? ''))
                    ) || $names->contains(
                        strtolower(trim($status->name ?? ''))
                    );
                })
                ?->id;
        };

        /*
        |--------------------------------------------------------------------------
        | Mapping Status
        |--------------------------------------------------------------------------
        */

        $waitingApprovalId = $findStatusId(
            'waiting_approval',
            'waiting approval',
            'pending approval'
        );

        $assignedId = $findStatusId(
            'assigned'
        );

        $inProgressId = $findStatusId(
            'in_progress',
            'in progress'
        );

        $waitingSparepartId = $findStatusId(
            'waiting_sparepart',
            'waiting sparepart'
        );

        $completedId = $findStatusId(
            'completed'
        );

        $rejectedId = $findStatusId(
            'rejected'
        );


        /*
        |--------------------------------------------------------------------------
        | Base Ticket Query
        |--------------------------------------------------------------------------
        */

        $ticketQuery = TicketModel::query()
            ->whereDate(
                'created_at',
                '>=',
                $startDate
            )
            ->whereDate(
                'created_at',
                '<=',
                $endDate
            );


        /*
        |--------------------------------------------------------------------------
        | Statistik Tiket
        |--------------------------------------------------------------------------
        */

        $totalTickets = (clone $ticketQuery)
            ->count();


        $openStatusIds = collect([
            $waitingApprovalId,
            $assignedId,
            $inProgressId,
            $waitingSparepartId,
        ])
            ->filter()
            ->values()
            ->all();

        $openTickets = empty($openStatusIds)
            ? 0
            : (clone $ticketQuery)
                ->whereIn(
                    'status_id',
                    $openStatusIds
                )
                ->count();


        /*
        |--------------------------------------------------------------------------
        | In Progress
        |--------------------------------------------------------------------------
        |
        | Tidak memasukkan Waiting Approval.
        |--------------------------------------------------------------------------
        */

        $progressStatusIds = collect([
            $assignedId,
            $inProgressId,
            $waitingSparepartId,
        ])
            ->filter()
            ->values()
            ->all();

        $inProgressTickets = empty($progressStatusIds)
            ? 0
            : (clone $ticketQuery)
                ->whereIn(
                    'status_id',
                    $progressStatusIds
                )
                ->count();


        /*
        |--------------------------------------------------------------------------
        | Closed Ticket
        |--------------------------------------------------------------------------
        */

        $closedTickets = $completedId
            ? (clone $ticketQuery)
                ->where(
                    'status_id',
                    $completedId
                )
                ->count()
            : 0;


        /*
        |--------------------------------------------------------------------------
        | Rejected Ticket
        |--------------------------------------------------------------------------
        */

        $rejectedTickets = $rejectedId
            ? (clone $ticketQuery)
                ->where(
                    'status_id',
                    $rejectedId
                )
                ->count()
            : 0;


        /*
        |--------------------------------------------------------------------------
        | Statistik Prioritas
        |--------------------------------------------------------------------------
        */

        $standardTickets = (clone $ticketQuery)
            ->whereIn('priority', [
                'Standard',
                'Standar',
                'standard',
            ])
            ->count();

        $urgentTickets = (clone $ticketQuery)
            ->whereIn('priority', [
                'Urgent',
                'Darurat',
                'urgent',
            ])
            ->count();


        /*
        |--------------------------------------------------------------------------
        | Statistik Kategori
        |--------------------------------------------------------------------------
        */

        $machineCategory = (clone $ticketQuery)
            ->where('category', 'machine')
            ->count();

        $electricalCategory = (clone $ticketQuery)
            ->where('category', 'electrical')
            ->count();

        $maintenanceCategory = (clone $ticketQuery)
            ->where('category', 'maintenance')
            ->count();

        $preventiveCategory = (clone $ticketQuery)
            ->whereIn('category', [
                'preventive_maintenance',
            ])
            ->count();

        $otherCategory = (clone $ticketQuery)
            ->whereIn('category', [
                'other'
            ])
            ->count();


        /*
        |--------------------------------------------------------------------------
        | Tiket Terbaru
        |--------------------------------------------------------------------------
        */

        $latestTickets = TicketModel::query()
            ->with([
                'status',
                'technicians.employee',
            ])
            ->whereDate(
                'created_at',
                '>=',
                $startDate
            )
            ->whereDate(
                'created_at',
                '<=',
                $endDate
            )
            ->orderByDesc('created_at')
            ->limit(7)
            ->get()
            ->map(function ($ticket) {

                /*
                |--------------------------------------------------------------------------
                | Technician
                |--------------------------------------------------------------------------
                */

                $technicians = $ticket->technicians
                    ?->map(function ($technician) {
                        return $technician->employee?->name;
                    })
                    ->filter()
                    ->values()
                    ?? collect();


                /*
                |--------------------------------------------------------------------------
                | Status
                |--------------------------------------------------------------------------
                */

                $statusName =
                    $ticket->status?->name
                    ?? $ticket->status?->code
                    ?? '-';


                return [
                    'id' => $ticket->id,

                    'code' => $ticket->code,

                    'category' => $ticket->category,

                    'description' =>
                        $ticket->description,

                    'technician' =>
                        $technicians->isNotEmpty()
                            ? $technicians->join(', ')
                            : '-',

                    'priority' =>
                        $this->formatPriority(
                            $ticket->priority
                        ),

                    'status' =>
                        $this->formatStatus(
                            $statusName
                        ),

                    'created_at' =>
                        optional(
                            $ticket->created_at
                        )->format('Y-m-d'),
                ];
            });

        $totalMachines = MachineModel::query()
            ->count();

        $goodMachines = MachineModel::query()
            ->whereIn('status', [
                'Active'
            ])
            ->count();

        $maintenanceMachines = MachineModel::query()
            ->whereIn('status', [
                'Maintenance',
            ])
            ->count();

        $brokenMachines = MachineModel::query()
            ->whereIn('status', [
                'Inactive'
            ])
            ->count();


        /*
        |--------------------------------------------------------------------------
        | Sparepart stok rendah
        |--------------------------------------------------------------------------
        */

        $lowStockSpareparts = SparepartModel::query()
            ->whereColumn(
                'stock',
                '<=',
                'minimum_stock'
            )
            ->orderByRaw(
                '(stock - minimum_stock) ASC'
            )
            ->limit(7)
            ->get([
                'id',
                'code',
                'name',
                'stock',
                'minimum_stock',
                'unit',
            ])
            ->map(function ($sparepart) {
                return [
                    'id' => $sparepart->id,

                    'code' => $sparepart->code,

                    'name' => $sparepart->name,

                    'stock' => (float)
                        $sparepart->stock,

                    'minimum' => (float)
                        $sparepart->minimum_stock,

                    'unit' => $sparepart->unit,
                ];
            });


        /*
        |--------------------------------------------------------------------------
        | Ringkasan Sparepart
        |--------------------------------------------------------------------------
        */

        $totalSparepartStock =
            SparepartModel::query()
                ->sum('stock');

        $totalSparepartTypes =
            SparepartModel::query()
                ->count();


        /*
        |--------------------------------------------------------------------------
        | Transaksi Sparepart Bulan Ini
        |--------------------------------------------------------------------------
        */

        $stockTransactionsThisMonth =
            SparepartStockLogModel::query()
                ->whereYear(
                    'created_at',
                    now()->year
                )
                ->whereMonth(
                    'created_at',
                    now()->month
                )
                ->count();

        $start = Carbon::parse(
            $startDate
        )->startOfDay();

        $end = Carbon::parse(
            $endDate
        )->endOfDay();

        $periodDays =
            $start->diffInDays($end) + 1;

        $previousEnd = $start
            ->copy()
            ->subDay();

        $previousStart = $previousEnd
            ->copy()
            ->subDays(
                $periodDays - 1
            );


        /*
        |--------------------------------------------------------------------------
        | Previous Query
        |--------------------------------------------------------------------------
        */

        $previousTicketQuery =
            TicketModel::query()
                ->whereDate(
                    'created_at',
                    '>=',
                    $previousStart
                        ->toDateString()
                )
                ->whereDate(
                    'created_at',
                    '<=',
                    $previousEnd
                        ->toDateString()
                );


        /*
        |--------------------------------------------------------------------------
        | Previous Total
        |--------------------------------------------------------------------------
        */

        $previousTotalTickets =
            (clone $previousTicketQuery)
                ->count();


        /*
        |--------------------------------------------------------------------------
        | Previous Open
        |--------------------------------------------------------------------------
        */

        $previousOpenTickets =
            empty($openStatusIds)
                ? 0
                : (clone $previousTicketQuery)
                    ->whereIn(
                        'status_id',
                        $openStatusIds
                    )
                    ->count();


        /*
        |--------------------------------------------------------------------------
        | Previous Progress
        |--------------------------------------------------------------------------
        */

        $previousProgressTickets =
            empty($progressStatusIds)
                ? 0
                : (clone $previousTicketQuery)
                    ->whereIn(
                        'status_id',
                        $progressStatusIds
                    )
                    ->count();


        /*
        |--------------------------------------------------------------------------
        | Previous Closed
        |--------------------------------------------------------------------------
        */

        $previousClosedTickets =
            $completedId
                ? (clone $previousTicketQuery)
                    ->where(
                        'status_id',
                        $completedId
                    )
                    ->count()
                : 0;


        /*
        |--------------------------------------------------------------------------
        | Return Inertia
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'dashboard',
            [
                'filters' => [
                    'start_date' =>
                        $startDate,

                    'end_date' =>
                        $endDate,
                ],

                'ticketStats' => [
                    'total' =>
                        $totalTickets,

                    'open' =>
                        $openTickets,

                    'in_progress' =>
                        $inProgressTickets,

                    'closed' =>
                        $closedTickets,

                    'rejected' =>
                        $rejectedTickets,

                    'comparison' => [
                        'total' =>
                            $totalTickets
                            - $previousTotalTickets,

                        'open' =>
                            $openTickets
                            - $previousOpenTickets,

                        'in_progress' =>
                            $inProgressTickets
                            - $previousProgressTickets,

                        'closed' =>
                            $closedTickets
                            - $previousClosedTickets,
                    ],
                ],

                'priorityCounts' => [
                    'standard' =>
                        $standardTickets,

                    'urgent' =>
                        $urgentTickets,
                ],

                'categoryCounts' => [
                    'machine' =>
                        $machineCategory,

                    'electrical' =>
                        $electricalCategory,

                    'maintenance' =>
                        $maintenanceCategory,

                    'preventive_maintenance' =>
                        $preventiveCategory,

                    'other' =>
                        $otherCategory,
                ],

                'latestTickets' =>
                    $latestTickets,

                'machineStats' => [
                    'total' =>
                        $totalMachines,

                    'good' =>
                        $goodMachines,

                    'maintenance' =>
                        $maintenanceMachines,

                    'broken' =>
                        $brokenMachines,
                ],

                'lowStockSpareparts' =>
                    $lowStockSpareparts,

                'summary' => [
                    'total_sparepart_stock' =>
                        (float)
                        $totalSparepartStock,

                    'total_sparepart_types' =>
                        $totalSparepartTypes,

                    'stock_transactions_this_month' =>
                        $stockTransactionsThisMonth,
                ],
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Format Priority
    |--------------------------------------------------------------------------
    */

    private function formatPriority(
        ?string $priority
    ): string {
        return match (
            strtolower(
                trim(
                    $priority ?? ''
                )
            )
        ) {
            'urgent',
            'darurat'
                => 'Darurat',

            default
                => 'Standar',
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Format Status
    |--------------------------------------------------------------------------
    */

    private function formatStatus(
        ?string $status
    ): string {
        $value = strtolower(
            trim(
                str_replace(
                    '_',
                    ' ',
                    $status ?? ''
                )
            )
        );

        return match ($value) {
            'waiting approval',
            'pending approval'
                => 'Pending Approval',

            'assigned'
                => 'Assigned',

            'in progress'
                => 'In Progress',

            'waiting sparepart'
                => 'Waiting Sparepart',

            'completed'
                => 'Completed',

            'rejected'
                => 'Rejected',

            default
                => $status ?? '-',
        };
    }
    }
