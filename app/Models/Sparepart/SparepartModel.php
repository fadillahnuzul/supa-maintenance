<?php

namespace App\Models\Sparepart;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\BuildingModel;

class SparepartModel extends Model
{
    use SoftDeletes;

    protected $table = 'maintenance.spareparts';

    protected $fillable = [
        'code',
        'name',
        'producer',
        'building_id',
        'minimum_stock',
        'stock',
        'unit',
        'delivery_status',
        'description',
        'image',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'minimum_stock' => 'decimal:3',
        'stock' => 'decimal:3',
    ];

    protected $appends = [
        'status',
    ];

    public function building()
    {
        return $this->belongsTo(
            BuildingModel::class,
            'building_id'
        );
    }

    public function stockLogs()
    {
        return $this->hasMany(
            SparepartStockLogModel::class,
            'sparepart_id'
        );
    }

    public function getStatusAttribute(): string
    {
        if ($this->delivery_status === 'on_delivery') {
            return 'On Delivery';
        }

        return $this->stock < $this->minimum_stock
            ? 'Stok Kurang'
            : 'Stok Cukup';
    }
}
