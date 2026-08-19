<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BuildingModel extends Model
{
    use SoftDeletes;
    protected $table = 'core.buildings';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'is_active',
        'created_at',
        'updated_at',
        'deleted_at',
    ];
}
