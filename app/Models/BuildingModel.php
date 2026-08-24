<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BuildingModel extends Model
{
    use SoftDeletes;
    protected $table = 'core.buildings';

    public $timestamps = false;

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'is_active',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function spareparts()
    {
        return $this->hasMany(
            \App\Models\Sparepart\SparepartModel::class,
            'building_id'
        );
    }
}
