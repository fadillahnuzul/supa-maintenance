<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserRoleModel extends Model
{
    protected $table =
        'maintenance.user_role';

    public $timestamps = false;

    public $incrementing = false;

    protected $fillable = [
        'employee_id',
        'role_id',
    ];

    public function employee()
    {
        return $this->belongsTo(
            User::class,
            'employee_id'
        );
    }

    public function role()
    {
        return $this->belongsTo(
            RoleModel::class,
            'role_id'
        );
    }
}
