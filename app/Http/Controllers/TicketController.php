<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Sparepart;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketController extends Controller
{
    // public function show(string $code)
    // {
    //     $ticket = Ticket::where('code', $code)
    //         ->with([
    //             'repairLogs',
    //             'documentations',
    //         ])
    //         ->firstOrFail();

    //     $spareparts = Sparepart::select([
    //             'id',
    //             'code',
    //             'name',
    //             'stock',
    //             'unit',
    //         ])
    //         ->orderBy('name')
    //         ->get();

    //     return Inertia::render('tickets/show', [
    //         'ticket' => [
    //             'id' => $ticket->id,
    //             'code' => $ticket->code,
    //             'category' => $ticket->category,
    //             'detail' => $ticket->detail,
    //             'location' => $ticket->location,
    //             'priority' => $ticket->priority,
    //             'deadline' => $ticket->deadline,

    //             'reporter' => $ticket->reporter,
    //             'authorized_by' => $ticket->authorized_by,
    //             'technician' => $ticket->technician,
    //             'member' => $ticket->member,

    //             'status' => $ticket->status,

    //             'machine_code' => $ticket->machine_code,
    //             'machine_name' => $ticket->machine_name,

    //             'image' => $ticket->image,

    //             'repair_logs' => $ticket->repairLogs,
    //             'documentations' => $ticket->documentations,
    //         ],

    //         'spareparts' => $spareparts,
    //     ]);
    // }
    public function show(string $code)
{
    $ticket = [
        'id' => 1,
        'code' => $code,
        'category' => 'Mesin',
        'detail' => 'Mesin macet',
        'location' => 'Gudang A3',
        'priority' => 'Darurat',
        'deadline' => '15 Agustus 2026',

        'reporter' => 'Budi Santoso',
        'authorized_by' => 'Supervisor Maintenance',
        'technician' => 'Rina',
        'member' => 'Budi',

        'status' => 'Assigned',

        'machine_code' => 'MC-001',
        'machine_name' => 'Mesin Packing',

        'image' => null,

        'repair_logs' => [
            [
                'id' => 1,
                'status' => 'Assigned',
                'description' => 'Tiket telah diberikan kepada teknisi.',
                'created_at' => '13 Agustus 2026 08:30',
                'created_by' => 'Supervisor',
            ],
        ],

        'documentations' => [],
    ];

    $spareparts = [
        [
            'id' => 1,
            'code' => 'SP-001',
            'name' => 'Bearing 6204',
            'stock' => 10,
            'unit' => 'Pcs',
        ],
        [
            'id' => 2,
            'code' => 'SP-002',
            'name' => 'V-Belt A42',
            'stock' => 5,
            'unit' => 'Pcs',
        ],
    ];

    return Inertia::render('tickets/show', [
        'ticket' => $ticket,
        'spareparts' => $spareparts,
    ]);
}
}