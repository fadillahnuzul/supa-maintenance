<?php

namespace App\Models;

use App\Models\Machine\MachineMaterialModel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaterialModel extends Model
{
    use SoftDeletes;

    protected $table = 'core.materials';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'name_indonesian',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function machineMaterials()
    {
        return $this->hasMany(
            MachineMaterialModel::class,
            'material_id'
        );
    }
}
