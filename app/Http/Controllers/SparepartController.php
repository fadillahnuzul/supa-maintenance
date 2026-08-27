<?php

namespace App\Http\Controllers;

use App\Exports\SparepartsExport;
use App\Models\BuildingModel;
use App\Models\Sparepart\SparepartModel;
use App\Models\Sparepart\SparepartStockLogModel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Auth;

class SparepartController extends Controller
{
    public function index(Request $request)
    {
        $query = SparepartModel::query()
            ->with('building:id,name');

        $this->applyFilters($query, $request);

        $spareparts = $query
            ->orderBy('name')
            ->orderBy('code')
            ->paginate(15)
            ->withQueryString()
            ->through(
                fn(SparepartModel $sparepart) =>
                $this->sparepartResource($sparepart)
            );

        $histories = SparepartStockLogModel::query()
            ->with([
                'sparepart:id,name,producer,unit',
                'creator',
            ])
            ->latest('created_at')
            ->paginate(
                20,
                ['*'],
                'history_page'
            )
            ->withQueryString()
            ->through(
                fn(SparepartStockLogModel $log) =>
                $this->stockLogResource($log)
            );

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

    public function store(Request $request)
    {
        $validated = $this->validateSparepart(
            $request
        );

        $sparepart = DB::transaction(
            function () use ($request, $validated) {
                if ($request->hasFile('image')) {
                    $validated['image'] = $request
                        ->file('image')
                        ->store(
                            'spareparts',
                            'public'
                        );
                }

                $sparepart = SparepartModel::create(
                    $validated
                );

                if ((float) $sparepart->stock > 0) {
                    SparepartStockLogModel::create([
                        'sparepart_id' =>
                        $sparepart->id,

                        'transaction_type' =>
                        'initial',

                        'quantity_change' =>
                        $sparepart->stock,

                        'stock_before' =>
                        0,

                        'stock_after' =>
                        $sparepart->stock,

                        'reference_type' =>
                        null,

                        'reference_id' =>
                        null,

                        'reference_code' =>
                        null,

                        'note' =>
                        'Stok awal sparepart',

                        'created_by' =>
                        Auth::user()->id,
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

    public function show(
        SparepartModel $sparepart
    ) {
        $sparepart->load(
            'building:id,name'
        );

        $histories =
            SparepartStockLogModel::query()
            ->where(
                'sparepart_id',
                $sparepart->id
            )
            ->with('creator')
            ->latest('created_at')
            ->limit(100)
            ->get()
            ->map(
                fn(SparepartStockLogModel $log) =>
                $this->stockLogResource($log)
            );

        return Inertia::render(
            'spareparts/show',
            [
                'sparepart' =>
                $this->sparepartResource(
                    $sparepart
                ),

                'histories' =>
                $histories,
            ]
        );
    }

    public function edit(
        SparepartModel $sparepart
    ) {
        $sparepart->load(
            'building:id,name'
        );

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
                'sparepart' =>
                $this->sparepartResource(
                    $sparepart
                ),

                'buildings' =>
                $buildings,
            ]
        );
    }

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
                )->ignore(
                    $sparepart->id
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

        DB::transaction(
            function () use (
                $request,
                $validated,
                $sparepart
            ) {
                if ($request->hasFile('image')) {
                    if ($sparepart->image) {
                        Storage::disk('public')
                            ->delete(
                                $sparepart->image
                            );
                    }

                    $validated['image'] = $request
                        ->file('image')
                        ->store(
                            'spareparts',
                            'public'
                        );
                } else {
                    unset(
                        $validated['image']
                    );
                }

                $sparepart->update(
                    $validated
                );
            }
        );

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

    public function destroy(
        SparepartModel $sparepart
    ) {
        SparepartStockLogModel::create([
            'sparepart_id' => $sparepart->id,

            'transaction_type' => 'delete',

            'quantity_change' => $sparepart->stock,

            'stock_before' => $sparepart->stock,

            'stock_after' => 0,

            'reference_type' => null,

            'reference_id' => null,

            'reference_code' => null,

            'note' => 'Hapus sparepart ' . $sparepart->name,

            'created_by' =>
            Auth::user()->id,
        ]);
        $sparepart->delete();


        return redirect()
            ->route(
                'spareparts.index'
            )
            ->with(
                'success',
                'Sparepart berhasil dihapus.'
            );
    }

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
                $currentSparepart =
                    SparepartModel::query()
                    ->whereKey(
                        $sparepart->id
                    )
                    ->lockForUpdate()
                    ->firstOrFail();

                $stockBefore =
                    (float) $currentSparepart
                        ->stock;

                $quantity =
                    (float) $validated['quantity'];

                $quantityChange = match ($validated['type']) {
                    'reduction',
                    'ticket'
                    => -$quantity,

                    default
                    => $quantity,
                };

                $stockAfter =
                    $stockBefore +
                    $quantityChange;

                if ($stockAfter < 0) {
                    abort(
                        422,
                        'Stok sparepart tidak mencukupi.'
                    );
                }

                $currentSparepart->update([
                    'stock' =>
                    $stockAfter,
                ]);

                SparepartStockLogModel::create([
                    'sparepart_id' =>
                    $currentSparepart->id,

                    'transaction_type' =>
                    $validated['type'],

                    'quantity_change' =>
                    $quantityChange,

                    'stock_before' =>
                    $stockBefore,

                    'stock_after' =>
                    $stockAfter,

                    'reference_type' =>
                    $validated['reference_type'] ?? null,

                    'reference_id' =>
                    $validated['reference_id'] ?? null,

                    'reference_code' =>
                    $validated['reference_code'] ?? null,

                    'note' =>
                    $validated['note']
                        ?? null,

                    'created_by' =>
                    Auth::user()->id,
                ]);
            }
        );

        return back()->with(
            'success',
            'Stok sparepart berhasil diperbarui.'
        );
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

    public function export(
        Request $request
    ) {
        $query = SparepartModel::query()
            ->with(
                'building:id,name'
            );

        $this->applyFilters(
            $query,
            $request
        );

        $spareparts = $query
            ->orderBy('name')
            ->orderBy('code')
            ->get();

        $filename =
            'Laporan_Sparepart_' .
            now()->format(
                'Y-m-d_H-i'
            ) .
            '.xlsx';

        return Excel::download(
            new SparepartsExport(
                $spareparts
            ),
            $filename
        );
    }

    private function applyFilters(
        Builder $query,
        Request $request
    ): Builder {
        if ($request->filled('search')) {
            $search = trim(
                $request->input(
                    'search'
                )
            );

            $query->where(
                function ($q) use (
                    $search
                ) {
                    $q
                        ->where(
                            'code',
                            'ilike',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'name',
                            'ilike',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'producer',
                            'ilike',
                            "%{$search}%"
                        )
                        ->orWhereHas(
                            'building',
                            function (
                                $buildingQuery
                            ) use (
                                $search
                            ) {
                                $buildingQuery
                                    ->where(
                                        'name',
                                        'ilike',
                                        "%{$search}%"
                                    );
                            }
                        );
                }
            );
        }

        if (
            $request->filled(
                'building_id'
            )
        ) {
            $query->where(
                'building_id',
                $request->integer(
                    'building_id'
                )
            );
        }

        if ($request->filled('status')) {
            switch ($request->input(
                    'status'
                )) {
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

        return $query;
    }

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

    private function sparepartResource(
        SparepartModel $sparepart
    ): array {
        return [
            'id' =>
            $sparepart->id,

            'code' =>
            $sparepart->code,

            'name' =>
            $sparepart->name,

            'producer' =>
            $sparepart->producer,

            'building_id' =>
            $sparepart->building_id,

            'building' =>
            $sparepart->building
                ? [
                    'id' =>
                    $sparepart
                        ->building
                        ->id,

                    'name' =>
                    $sparepart
                        ->building
                        ->name,
                ]
                : null,

            'minimum_stock' =>
            (float)
            $sparepart->minimum_stock,

            'stock' =>
            (float)
            $sparepart->stock,

            'unit' =>
            $sparepart->unit,

            'delivery_status' =>
            $sparepart
                ->delivery_status,

            'status' =>
            $this->getStockStatus(
                $sparepart
            ),

            'description' =>
            $sparepart->description,

            'image' =>
            $sparepart->image,

            'image_url' =>
            $sparepart->image
                ? Storage::disk('public')
                ->url(
                    $sparepart->image
                )
                : null,

            'created_at' =>
            $sparepart->created_at
                ?->format(
                    'd/m/Y H:i'
                ),

            'updated_at' =>
            $sparepart->updated_at
                ?->format(
                    'd/m/Y H:i'
                ),
        ];
    }

    private function stockLogResource(
        SparepartStockLogModel $log
    ): array {
        return [
            'id' =>
            $log->id,

            'date' =>
            $log->created_at
                ?->format(
                    'd/m/Y H:i'
                ),

            'sparepart_id' =>
            $log->sparepart_id,

            'sparepart' =>
            $log->sparepart
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

            'type' =>
            $this->stockTypeLabel(
                $log->transaction_type
            ),

            'transaction_type' =>
            $log->transaction_type,

            'change' =>
            (float)
            $log->quantity_change,

            'stock_before' =>
            (float)
            $log->stock_before,

            'new_stock' =>
            (float)
            $log->stock_after,

            'created_by' =>
            $log->created_by,

            'officer' =>
            $log->creator?->name
                ?? '-',

            'note' =>
            $log->note,

            'reference_type' =>
            $log->reference_type,

            'reference_id' =>
            $log->reference_id,

            'reference_code' =>
            $log->reference_code,

            'unit' =>
            $log->sparepart?->unit
                ?? '',
        ];
    }

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
            (float) $sparepart->stock <
            (float) $sparepart->minimum_stock
            ? 'Stok Kurang'
            : 'Stok Cukup';
    }

    private function stockTypeLabel(
        string $type
    ): string {
        return match ($type) {
            'initial' =>
            'Awal',

            'addition' =>
            'Tambah',

            'reduction' =>
            'Kurang',  

            'ticket' =>
            'Tiket',

            'adjustment' =>
            'Penyesuaian',

            'delete' =>
            'Hapus',

            default =>
            ucfirst($type),
        };
    }
}
