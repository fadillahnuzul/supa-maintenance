<?php

namespace App\Models\Machine;

use App\Models\BuildingModel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MachineModel extends Model
{
    use SoftDeletes;
    protected $table = 'core.machines';

    protected $primaryKey = 'id';

    protected $fillable = [
        'code',
        'name',
        'location_id',
        'status',
        'purchase_price',
        'start_date',
        'photo_url',
        'nameplate_url',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function specifications()
    {
        return $this->hasMany(MachineSpecModel::class, 'machine_id');
    }

    public function machineMaterials()
    {
        return $this->hasMany(MachineMaterialModel::class, 'machine_id')->with('material');
    }

    public function location()
    {
        return $this->belongsTo(BuildingModel::class, 'location_id');
    }
}
