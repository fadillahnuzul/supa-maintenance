<?php

namespace App\Http\Controllers;

use App\Models\BuildingModel;
use App\Models\Sparepart\SparepartModel;
use App\Models\Sparepart\SparepartStockLogModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SparepartController extends Controller
{
    /**
     * ============================================================
     * INDEX
     * ============================================================
     */
    public function index(Request $request)
    {
        $query = SparepartModel::query()
            ->with([
                'building:id,name',
            ]);

        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */
        if ($request->filled('search')) {
            $search = trim($request->search);

            $query->where(function ($q) use ($search) {
                $q->where('code', 'ilike', "%{$search}%")
                    ->orWhere('name', 'ilike', "%{$search}%")
                    ->orWhere('producer', 'ilike', "%{$search}%")
                    ->orWhereHas('building', function ($buildingQuery) use ($search) {
                        $buildingQuery
                            ->where('code', 'ilike', "%{$search}%")
                            ->orWhere('name', 'ilike', "%{$search}%");
                    });
            });
        }

        /*
        |--------------------------------------------------------------------------
        | FILTER BUILDING
        |--------------------------------------------------------------------------
        */
        if ($request->filled('building_id')) {
            $query->where(
                'building_id',
                $request->integer('building_id')
            );
        }

        /*
        |--------------------------------------------------------------------------
        | FILTER STATUS
        |--------------------------------------------------------------------------
        |
        | Status tidak disimpan sebagai field "Stok Cukup / Stok Kurang".
        | Status dihitung berdasarkan:
        |
        | On Delivery:
        | delivery_status = on_delivery
        |
        | Stok Kurang:
        | stock < minimum_stock
        |
        | Stok Cukup:
        | stock >= minimum_stock
        |
        */
        if ($request->filled('status')) {
            switch ($request->status) {
                case 'On Delivery':
                    $query->where(
                        'delivery_status',
                        'on_delivery'
                    );
                    break;

                case 'Stok Kurang':
                    $query
                        ->where(
                            'delivery_status',
                            'none'
                        )
                        ->whereColumn(
                            'stock',
                            '<',
                            'minimum_stock'
                        );
                    break;

                case 'Stok Cukup':
                    $query
                        ->where(
                            'delivery_status',
                            'none'
                        )
                        ->whereColumn(
                            'stock',
                            '>=',
                            'minimum_stock'
                        );
                    break;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | SPAREPART PAGINATION
        |--------------------------------------------------------------------------
        */
        $spareparts = $query
            ->orderBy('name')
            ->orderBy('code')
            ->paginate(15)
            ->withQueryString()
            ->through(function (SparepartModel $sparepart) {
                return $this->sparepartResource($sparepart);
            });

        /*
        |--------------------------------------------------------------------------
        | STOCK HISTORY
        |--------------------------------------------------------------------------
        */
        $histories = SparepartStockLogModel::query()
            ->with([
                'sparepart:id,name,producer,unit',
                'creator',
            ])
            ->latest('created_at')
            ->paginate(20, ['*'], 'history_page')
            ->withQueryString()
            ->through(function (SparepartStockLogModel $log) {
                return $this->stockLogResource($log);
            });

        /*
        |--------------------------------------------------------------------------
        | BUILDING FILTER OPTIONS
        |--------------------------------------------------------------------------
        */
        $buildings = BuildingModel::query()
            ->select([
                'id',
                'name',
            ])
            ->orderBy('name')
            ->get();

        return Inertia::render(
            'spareparts/index',
            [
                'spareparts' => $spareparts,

                'histories' => $histories,

                'buildings' => $buildings,

                'filters' => [
                    'search' => $request->input(
                        'search',
                        ''
                    ),

                    'status' => $request->input(
                        'status',
                        ''
                    ),

                    'building_id' => $request->input(
                        'building_id',
                        ''
                    ),
                ],
            ]
        );
    }

    /**
     * ============================================================
     * CREATE
     * ============================================================
     */
    public function create()
    {
        $buildings = BuildingModel::query()
            ->select([
                'id',
                'name',
            ])
            ->orderBy('name')
            ->get();

        return Inertia::render(
            'spareparts/form',
            [
                'buildings' => $buildings,
            ]
        );
    }

    /**
     * ============================================================
     * STORE
     * ============================================================
     */
    public function store(Request $request)
    {
        $validated = $this->validateSparepart(
            $request
        );

        $sparepart = DB::transaction(
            function () use (
                $request,
                $validated
            ) {
                /*
            |--------------------------------------------------------------------------
            | IMAGE
            |--------------------------------------------------------------------------
            */
                if ($request->hasFile('image')) {
                    $validated['image'] = $request
                        ->file('image')
                        ->store(
                            'spareparts',
                            'public'
                        );
                }

                /*
            |--------------------------------------------------------------------------
            | CREATE SPAREPART
            |--------------------------------------------------------------------------
            */
                $sparepart = SparepartModel::create(
                    $validated
                );

                /*
            |--------------------------------------------------------------------------
            | INITIAL STOCK LOG
            |--------------------------------------------------------------------------
            */
                if ((float) $sparepart->stock > 0) {
                    SparepartStockLogModel::create([
                        'sparepart_id' => $sparepart->id,

                        'transaction_type' => 'initial',

                        'quantity_change' => $sparepart->stock,

                        'stock_before' => 0,

                        'stock_after' => $sparepart->stock,

                        'reference_type' => null,

                        'reference_id' => null,

                        'reference_code' => null,

                        'note' => 'Stok awal sparepart',

                        /*
                     * User yang membuat stok awal.
                     */
                        'created_by' =>
                        // auth()->id(),
                        44,
                    ]);
                }

                return $sparepart;
            }
        );

        return redirect()
            ->route(
                'spareparts.show',
                $sparepart
            )
            ->with(
                'success',
                'Sparepart berhasil ditambahkan.'
            );
    }

    /**
     * ============================================================
     * SHOW
     * ============================================================
     */
    public function show(
        SparepartModel $sparepart
    ) {
        $sparepart->load([
            'building:id,name',
        ]);

        $histories =
            SparepartStockLogModel::query()
            ->where(
                'sparepart_id',
                $sparepart->id
            )
            ->with([
                'creator',
            ])
            ->latest('created_at')
            ->limit(100)
            ->get()
            ->map(function (
                SparepartStockLogModel $log
            ) {
                return $this
                    ->stockLogResource(
                        $log
                    );
            });

        return Inertia::render(
            'spareparts/show',
            [
                'sparepart' => $this->sparepartResource(
                    $sparepart
                ),

                'histories' => $histories,
            ]
        );
    }

    /**
     * ============================================================
     * EDIT
     * ============================================================
     */
    public function edit(SparepartModel $sparepart)
    {
        $sparepart->load([
            'building:id,name',
        ]);

        $buildings = BuildingModel::query()
            ->select([
                'id',
                'name',
            ])
            ->orderBy('name')
            ->get();

        return Inertia::render(
            'spareparts/form',
            [
                'sparepart' => $this->sparepartResource(
                    $sparepart
                ),

                'buildings' => $buildings,
            ]
        );
    }

    /**
     * ============================================================
     * UPDATE
     * ============================================================
     */
    public function update(
        Request $request,
        SparepartModel $sparepart
    ) {
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',

                Rule::unique(
                    SparepartModel::class,
                    'code'
                )->ignore($sparepart->id),
            ],

            'name' => [
                'required',
                'string',
                'max:150',
            ],

            'producer' => [
                'nullable',
                'string',
                'max:150',
            ],

            'building_id' => [
                'required',
                'integer',

                Rule::exists(
                    BuildingModel::class,
                    'id'
                ),
            ],

            'minimum_stock' => [
                'required',
                'numeric',
                'min:0',
            ],

            'unit' => [
                'required',
                'string',
                'max:30',
            ],

            'delivery_status' => [
                'required',

                Rule::in([
                    'none',
                    'on_delivery',
                ]),
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'image' => [
                'nullable',
                'image',
                'max:5120',
            ],
        ]);

        DB::transaction(function () use (
            $request,
            $validated,
            $sparepart
        ) {
            /*
        |--------------------------------------------------------------------------
        | UPDATE IMAGE
        |--------------------------------------------------------------------------
        */
            if ($request->hasFile('image')) {
                if ($sparepart->image) {
                    Storage::disk('public')
                        ->delete($sparepart->image);
                }

                $validated['image'] = $request
                    ->file('image')
                    ->store(
                        'spareparts',
                        'public'
                    );
            } else {
                unset($validated['image']);
            }

            /*
        |--------------------------------------------------------------------------
        | UPDATE MASTER SPAREPART
        |--------------------------------------------------------------------------
        |
        | Stock tidak ikut di-update.
        |
        */
            $sparepart->update(
                $validated
            );
        });

        return redirect()
            ->route(
                'spareparts.show',
                $sparepart->id
            )
            ->with(
                'success',
                'Sparepart berhasil diperbarui.'
            );
    }

    /**
     * ============================================================
     * DELETE / SOFT DELETE
     * ============================================================
     */
    public function destroy(
        Request $request,
        SparepartModel $sparepart
    ) {
        DB::transaction(
            function () use (
                $request,
                $sparepart
            ) {
                $oldValues =
                    $this->auditPayload(
                        $sparepart
                    );

                /*
                |--------------------------------------------------------------------------
                | SOFT DELETE MASTER
                |--------------------------------------------------------------------------
                */
                $sparepart->delete();

                /*
                |--------------------------------------------------------------------------
                | AUDIT LOG TETAP DISIMPAN
                |--------------------------------------------------------------------------
                */
                $this->writeAudit(
                    request: $request,
                    sparepartId: $sparepart->id,
                    action: 'delete',
                    oldValues: $oldValues,
                    newValues: null
                );
            }
        );

        return redirect()
            ->route('spareparts.index')
            ->with(
                'success',
                'Sparepart berhasil dihapus.'
            );
    }

    /**
     * ============================================================
     * STOCK ADD / REDUCE
     * ============================================================
     */
    public function adjustStock(
        Request $request,
        SparepartModel $sparepart
    ) {
        $validated = $request->validate([
            'type' => [
                'required',

                Rule::in([
                    'addition',
                    'reduction',
                    'adjustment',
                    'ticket',
                ]),
            ],

            'quantity' => [
                'required',
                'numeric',
                'gt:0',
            ],

            'note' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'reference_type' => [
                'nullable',
                'string',
                'max:50',
            ],

            'reference_id' => [
                'nullable',
                'integer',
            ],

            'reference_code' => [
                'nullable',
                'string',
                'max:100',
            ],
        ]);

        DB::transaction(
            function () use (
                $validated,
                $sparepart
            ) {
                /*
            |--------------------------------------------------------------------------
            | LOCK ROW
            |--------------------------------------------------------------------------
            |
            | Mencegah dua user mengubah stok sparepart
            | yang sama pada waktu bersamaan.
            |
            */
                $lockedSparepart =
                    SparepartModel::query()
                    ->whereKey(
                        $sparepart->id
                    )
                    ->lockForUpdate()
                    ->firstOrFail();

                $stockBefore =
                    (float) $lockedSparepart->stock;

                $quantity =
                    (float) $validated['quantity'];

                /*
            |--------------------------------------------------------------------------
            | HITUNG PERUBAHAN
            |--------------------------------------------------------------------------
            */
                $quantityChange = match ($validated['type']) {
                    'reduction',
                    'ticket' => -$quantity,

                    default => $quantity,
                };

                $stockAfter =
                    $stockBefore
                    +
                    $quantityChange;

                /*
            |--------------------------------------------------------------------------
            | STOCK TIDAK BOLEH NEGATIF
            |--------------------------------------------------------------------------
            */
                if ($stockAfter < 0) {
                    abort(
                        422,
                        'Stok sparepart tidak mencukupi.'
                    );
                }

                /*
            |--------------------------------------------------------------------------
            | UPDATE CURRENT STOCK
            |--------------------------------------------------------------------------
            */
                $lockedSparepart->update([
                    'stock' => $stockAfter,
                ]);

                /*
            |--------------------------------------------------------------------------
            | SIMPAN STOCK LOG
            |--------------------------------------------------------------------------
            */
                SparepartStockLogModel::create([
                    'sparepart_id' => $lockedSparepart->id,

                    'transaction_type' => $validated['type'],

                    'quantity_change' => $quantityChange,

                    'stock_before' => $stockBefore,

                    'stock_after' => $stockAfter,

                    'reference_type' => $validated['reference_type'] ?? null,

                    'reference_id' => $validated['reference_id'] ?? null,

                    'reference_code' => $validated['reference_code'] ?? null,

                    'note' => $validated['note']
                        ?? null,

                    /*
                 * ID user yang melakukan
                 * perubahan stok.
                 */
                    'created_by' =>
                    // auth()->id(),
                    44,
                ]);
            }
        );

        return back()->with(
            'success',
            'Stok sparepart berhasil diperbarui.'
        );
    }

    /**
     * ============================================================
     * VALIDATION
     * ============================================================
     */
    private function validateSparepart(
        Request $request,
        ?SparepartModel $sparepart = null
    ): array {
        return $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',

                Rule::unique(
                    SparepartModel::class,
                    'code'
                )->ignore(
                    $sparepart?->id
                ),
            ],

            'name' => [
                'required',
                'string',
                'max:150',
            ],

            'producer' => [
                'nullable',
                'string',
                'max:150',
            ],

            /*
            |--------------------------------------------------------------------------
            | BUILDING
            |--------------------------------------------------------------------------
            |
            | Mengacu ke core.buildings.id.
            |
            */
            'building_id' => [
                'required',
                'integer',

                Rule::exists(
                    BuildingModel::class,
                    'id'
                ),
            ],

            'minimum_stock' => [
                'required',
                'numeric',
                'min:0',
            ],

            /*
            |--------------------------------------------------------------------------
            | STOCK
            |--------------------------------------------------------------------------
            |
            | Required saat create.
            | Saat edit nilainya akan di-ignore.
            |
            */
            'stock' => [
                $sparepart
                    ? 'nullable'
                    : 'required',

                'numeric',
                'min:0',
            ],

            'unit' => [
                'required',
                'string',
                'max:30',
            ],

            'delivery_status' => [
                'required',

                Rule::in([
                    'none',
                    'on_delivery',
                ]),
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'image' => [
                'nullable',
                'image',
                'max:5120',
            ],
        ]);
    }

    /**
     * ============================================================
     * SPAREPART RESPONSE
     * ============================================================
     */
    private function sparepartResource(
        SparepartModel $sparepart
    ): array {
        return [
            'id' => $sparepart->id,

            'code' => $sparepart->code,

            'name' => $sparepart->name,

            'producer' => $sparepart->producer,

            'building_id' => $sparepart->building_id,

            'building' => $sparepart->building
                ? [
                    'id' => $sparepart
                        ->building
                        ->id,

                    'name' => $sparepart
                        ->building
                        ->name,
                ]
                : null,

            'minimum_stock' => (float) $sparepart
                ->minimum_stock,

            'stock' => (float) $sparepart->stock,

            'unit' => $sparepart->unit,

            'delivery_status' => $sparepart
                ->delivery_status,

            'status' => $this->getStockStatus(
                $sparepart
            ),

            'description' => $sparepart->description,

            'image' => $sparepart->image,

            'image_url' => $sparepart->image
                ? Storage::disk('public')
                ->url(
                    $sparepart->image
                )
                : null,

            'created_at' => $sparepart->created_at
                ?->format(
                    'd/m/Y H:i'
                ),

            'updated_at' => $sparepart->updated_at
                ?->format(
                    'd/m/Y H:i'
                ),
        ];
    }

    /**
     * ============================================================
     * STOCK LOG RESPONSE
     * ============================================================
     */
    private function stockLogResource(
        SparepartStockLogModel $log
    ): array {
        return [
            'id' => $log->id,

            'date' => $log->created_at
                ?->format(
                    'd/m/Y H:i'
                ),

            'sparepart_id' => $log->sparepart_id,

            'sparepart' => $log->sparepart
                ? trim(
                    $log->sparepart->name .
                        (
                            $log->sparepart->producer
                            ? ' - ' .
                            $log->sparepart
                            ->producer
                            : ''
                        )
                )
                : '-',

            'type' => $this->stockTypeLabel(
                $log->transaction_type
            ),

            'transaction_type' => $log->transaction_type,

            'change' => (float) $log
                ->quantity_change,

            'stock_before' => (float) $log
                ->stock_before,

            'new_stock' => (float) $log
                ->stock_after,

            /*
        |--------------------------------------------------------------------------
        | USER / CREATOR
        |--------------------------------------------------------------------------
        */
            'created_by' => $log->created_by,

            'officer' => $log->creator?->name
                ?? '-',

            'note' => $log->note,

            'reference_type' => $log->reference_type,

            'reference_id' => $log->reference_id,

            'reference_code' => $log->reference_code,

            'unit' => $log->sparepart?->unit
                ?? '',
        ];
    }

    /**
     * ============================================================
     * STATUS CALCULATOR
     * ============================================================
     */
    private function getStockStatus(
        SparepartModel $sparepart
    ): string {
        if (
            $sparepart->delivery_status
            === 'on_delivery'
        ) {
            return 'On Delivery';
        }

        return
            (float) $sparepart->stock
            <
            (float) $sparepart
                ->minimum_stock
            ? 'Stok Kurang'
            : 'Stok Cukup';
    }

    /**
     * ============================================================
     * STOCK TYPE LABEL
     * ============================================================
     */
    private function stockTypeLabel(
        string $type
    ): string {
        return match ($type) {
            'initial' => 'Awal',

            'addition' => 'Tambah',

            'reduction' => 'Kurang',

            'ticket' => 'Tiket',

            'adjustment' => 'Penyesuaian',

            default => ucfirst($type),
        };
    }

    /**
     * ============================================================
     * AUDIT PAYLOAD
     * ============================================================
     */
    private function auditPayload(
        SparepartModel $sparepart
    ): array {
        return [
            'code' => $sparepart->code,

            'name' => $sparepart->name,

            'producer' => $sparepart->producer,

            'building_id' => $sparepart->building_id,

            'minimum_stock' => (float) $sparepart
                ->minimum_stock,

            'stock' => (float) $sparepart->stock,

            'unit' => $sparepart->unit,

            'delivery_status' => $sparepart
                ->delivery_status,

            'description' => $sparepart->description,

            'image' => $sparepart->image,
        ];
    }

    public function updateDeliveryStatus(
        Request $request,
        SparepartModel $sparepart
    ) {
        $validated = $request->validate([
            'delivery_status' => [
                'required',
                Rule::in([
                    'none',
                    'on_delivery',
                ]),
            ],
        ]);

        $sparepart->update([
            'delivery_status' =>
            $validated['delivery_status'],
        ]);

        return back();
    }

    /**
     * ============================================================
     * WRITE AUDIT
     * ============================================================
     */
    // private function writeAudit(
    //     Request $request,
    //     int $sparepartId,
    //     string $action,
    //     ?array $oldValues,
    //     ?array $newValues
    // ): void {
    //     SparepartAuditLogModel::create([
    //         'sparepart_id' =>
    //         $sparepartId,

    //         'action' =>
    //         $action,

    //         'old_values' =>
    //         $oldValues,

    //         'new_values' =>
    //         $newValues,

    //         'changed_by' =>
    //         auth()->id(),

    //         'ip_address' =>
    //         $request->ip(),

    //         'user_agent' =>
    //         $request->userAgent(),

    //         'created_at' =>
    //         now(),
    //     ]);
    // }
}
