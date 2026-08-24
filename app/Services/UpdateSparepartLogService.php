<?php

namespace App\Services;

use App\Models\Sparepart\SparepartModel;
use App\Models\Sparepart\SparepartStockLogModel;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UpdateSparepartLogService
{
    public static function reduce(int $stockId, float $qty, string|null $note): void
    {
        DB::transaction(function () use ($stockId, $qty, $note) {
            $sparepart = SparepartModel::lockForUpdate()->findOrFail($stockId);

            if ($sparepart->stock < $qty) {
                throw new \Exception("Not enough stock available.");
            }

            $stockBefore = $sparepart->stock;
            $stockAfter = $stockBefore - $qty;

            $sparepart->decrement('stock', $qty);

            SparepartStockLogModel::create([
                    'sparepart_id' => $sparepart->id,
                    'transaction_type' => 'reduction',
                    'quantity_change' => $qty,
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'note' => $note ?? null,
                    'created_by' => Auth::user()->id
                ]);
        });
    }
}
