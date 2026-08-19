<?php

namespace App\Models\Machine;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MachineSpecModel extends Model
{
    use SoftDeletes;

    protected $table = 'core.machine_specifications';

    protected $primaryKey = 'id';

    protected $fillable = [
        'machine_id',
        'spec_name',
        'spec_value',
        'created_at',
        'updated_at',
        'deleted_at',
    ];
}
