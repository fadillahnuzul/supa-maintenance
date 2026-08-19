<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sparepart\SparepartModel;
use App\Models\Sparepart\SparepartStockLogModel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class SparepartStockController extends Controller
{
    public function store(
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
                | LOCK CURRENT SPAREPART
                |--------------------------------------------------------------------------
                */
                $currentSparepart =
                    SparepartModel::query()
                        ->whereKey(
                            $sparepart->id
                        )
                        ->lockForUpdate()
                        ->firstOrFail();

                /*
                |--------------------------------------------------------------------------
                | CURRENT STOCK
                |--------------------------------------------------------------------------
                */
                $stockBefore =
                    (float) $currentSparepart
                        ->stock;

                $quantity =
                    (float) $validated[
                        'quantity'
                    ];

                /*
                |--------------------------------------------------------------------------
                | HITUNG +/- STOCK
                |--------------------------------------------------------------------------
                */
                $quantityChange = match (
                    $validated['type']
                ) {
                    'reduction',
                    'ticket'
                        => -$quantity,

                    'addition',
                    'adjustment'
                        => $quantity,
                };

                /*
                |--------------------------------------------------------------------------
                | NEW STOCK
                |--------------------------------------------------------------------------
                */
                $stockAfter =
                    $stockBefore
                    +
                    $quantityChange;

                /*
                |--------------------------------------------------------------------------
                | VALIDATE STOCK
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
                $currentSparepart
                    ->update([
                        'stock' =>
                            $stockAfter,
                    ]);

                /*
                |--------------------------------------------------------------------------
                | CREATE LOG
                |--------------------------------------------------------------------------
                */
                SparepartStockLogModel::create([
                    'sparepart_id' =>
                        $currentSparepart
                            ->id,

                    'transaction_type' =>
                        $validated['type'],

                    'quantity_change' =>
                        $quantityChange,

                    'stock_before' =>
                        $stockBefore,

                    'stock_after' =>
                        $stockAfter,

                    'reference_type' =>
                        $validated[
                            'reference_type'
                        ] ?? null,

                    'reference_id' =>
                        $validated[
                            'reference_id'
                        ] ?? null,

                    'reference_code' =>
                        $validated[
                            'reference_code'
                        ] ?? null,

                    'note' =>
                        $validated['note']
                        ?? null,

                    /*
                     * User yang melakukan
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
            'Stok berhasil diperbarui.'
        );
    }
}
