<?php

namespace App\Models\Sparepart;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class SparepartStockLogModel extends Model
{
    public $table = 'maintenance.sparepart_stock_logs';

    public $timestamps = false;

    protected $fillable = [
        'sparepart_id',
        'transaction_type',
        'quantity_change',
        'stock_before',
        'stock_after',
        'reference_type',
        'reference_id',
        'reference_code',
        'note',  
        'created_by',
        'created_at',
    ];

    protected $casts = [
        'quantity_change' => 'decimal:3',
        'stock_before' => 'decimal:3',
        'stock_after' => 'decimal:3',
        'created_at' => 'datetime',
    ];

    public function sparepart()
    {
        return $this->belongsTo(SparepartModel::class);
    }

    public function creator()
    {
        return $this->belongsTo(
            User::class,
            'created_by', 'id'
        );
    }
}
