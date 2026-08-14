<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SparepartController extends Controller
{
    // public function index()
    // {
    // return Inertia::render('spareparts/index', [
    //     'sparepart' => [
    //         'id' => $sparepart->id,
    //         'code' => $sparepart->code,
    //         'name' => $sparepart->name,
    //         'producer' => $sparepart->producer,
    //         'image' => $sparepart->image
    //             ? asset('storage/' . $sparepart->image)
    //             : null,

    //         'location' => $sparepart->location,
    //         'building' => $sparepart->building,
    //         'floor' => $sparepart->floor,
    //         'area' => $sparepart->area,

    //         'minimum_stock' => $sparepart->minimum_stock,
    //         'stock' => $sparepart->stock,
    //         'unit' => $sparepart->unit,
    //         'status' => $sparepart->status,

    //         'description' => $sparepart->description,
    //         'created_at' => $sparepart->created_at,
    //         'updated_at' => $sparepart->updated_at,
    //     ],

    //     'histories' => $sparepart->stockHistories
    //         ->map(fn($history) => [
    //             'id' => $history->id,
    //             'date' => $history->created_at,
    //             'type' => $history->type,
    //             'change' => $history->change,
    //             'new_stock' => $history->new_stock,
    //             'officer' => $history->officer?->name,
    //             'note' => $history->note,
    //         ]),

    //     'editUrl' => route('spareparts.edit', $sparepart),
    //     'deleteUrl' => route('spareparts.destroy', $sparepart),
    //     'stockUpdateUrl' => route('spareparts.stock.update', $sparepart),
    // ]);
    // }

    public function create()
    {
        return Inertia::render('spareparts/show');
    }

    public function edit($id)
    {
        $sparepart = [
            'id' => $id,
            'code' => 'SP-0001',
            'name' => 'Wire Mesh #30',
            'producer' => 'Unbranded',
            'location' => 'Gedung B',
            'building' => 'Gedung B',
            'floor' => 'Lantai 1',
            'area' => 'Packing Sachet',
            'minimum_stock' => 5,
            'stock' => 10,
            'unit' => 'pcs',
            'status' => 'Stok Cukup',
            'description' => 'Wire Mesh untuk mesin packing.',
            'image' => null,
        ];

        return Inertia::render('spareparts/show', [
            'sparepart' => $sparepart,
        ]);
    }
}
