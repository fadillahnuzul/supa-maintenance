<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserRoleModel extends Model
{
    use SoftDeletes;

    public const ROLE_SUPERVISOR = 'Supervisor';

    public const ROLE_OPERATIONAL = 'Operational';

    public const ROLE_TEKNISI = 'Teknisi';

    public const ROLE_ADMIN_SISTEM = 'Admin Sistem';

    protected $table = 'maintenance.user_role';

    protected $fillable = [
        'employee_id',
        'role',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'employee_id'
        );
    }
}
