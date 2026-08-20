<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserRoleModel extends Model
{
    use SoftDeletes;

    protected $table = 'maintenance.user_role';

    protected $fillable = [
        'employee_id',
        'role',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function employee()
    {
        return $this->belongsTo(
            User::class,
            'employee_id'
        );
    }
}