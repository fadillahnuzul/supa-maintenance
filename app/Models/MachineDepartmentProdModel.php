<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MachineDepartmentProdModel extends Model
{
    use SoftDeletes;

    protected $table = 'core.machine_department_prods';

    protected $fillable = [
        'machine_id',
        'department_prod_id',
    ];
}