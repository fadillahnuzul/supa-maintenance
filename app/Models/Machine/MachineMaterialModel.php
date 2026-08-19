<?php

namespace App\Models\Machine;

use App\Models\MaterialModel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MachineMaterialModel extends Model
{
    use SoftDeletes;

    protected $table = 'core.machine_materials';

    protected $primaryKey = 'id';

    protected $fillable = [
        'machine_id',
        'material_id',
        'target_kg',
        'capacity_kg',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function machine()
    {
        return $this->belongsTo(
            MachineModel::class,
            'machine_id'
        );
    }

    public function material()
    {
        return $this->belongsTo(
            MaterialModel::class,
            'material_id'
        );
    }
}
