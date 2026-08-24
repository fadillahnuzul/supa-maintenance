<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DepartmentProductionModel extends Model
{
    use SoftDeletes;

    protected $table = 'core.department_productions';

    public $timestamps = false;

    protected $fillable = [
        'name',
    ];
}