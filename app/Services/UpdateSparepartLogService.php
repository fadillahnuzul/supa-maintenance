<?php

namespace App\Services;

use App\Models\Sparepart\SparepartModel;
use App\Models\Sparepart\SparepartStockLogModel;
use Illuminate\Validation\ValidationException;

class UpdateSparepartLogService
{
    public static function reduce(
        int $stockId,
        float $qty,
        ?string $note,
        int $employeeId
    ): void {
        $sparepart = SparepartModel::query()
            ->lockForUpdate()
            ->findOrFail($stockId);

        $stockBefore = (float) $sparepart->stock;

        if ($stockBefore < $qty) {
            throw ValidationException::withMessages([
                'spareparts_used' => 'Stok sparepart tidak mencukupi.',
            ]);
        }

        $stockAfter = $stockBefore - $qty;

        $sparepart->decrement('stock', $qty);

        SparepartStockLogModel::create([
            'sparepart_id' => $sparepart->id,
            'transaction_type' => 'reduction',
            'quantity_change' => -$qty,
            'stock_before' => $stockBefore,
            'stock_after' => $stockAfter,
            'note' => $note,
            'created_by' => $employeeId,
        ]);
    }
}
