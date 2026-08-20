<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $id_karyawan
 * @property string|null $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'id_karyawan', 'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $table = 'core.employees';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getAuthIdentifierName(): string
    {
        return 'id';
    }

    public function getTable(): string
    {
        return app()->environment('testing') ? 'users' : 'core.employees';
    }

    public function roles(): HasMany
    {
        return $this->hasMany(UserRoleModel::class, 'employee_id');
    }

    public function hasRole(string $role): bool
    {
        return $this->roles()
            ->whereHas('role', function ($query) use ($role) {
                $query
                    ->where(function ($query) use ($role) {
                        $query->where('code', $role)
                            ->orWhere('name', $role);
                    })
                    ->where('is_active', true);
            })
            ->exists();
    }

    /**
     * @param  array<int, string>  $roles
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()
            ->whereHas('role', function ($query) use ($roles) {
                $query
                    ->where(function ($query) use ($roles) {
                        $query->whereIn('code', $roles)
                            ->orWhereIn('name', $roles);
                    })
                    ->where('is_active', true);
            })
            ->exists();
    }

    protected function name(): Attribute
    {
        return Attribute::make(
            get: fn () => trim("{$this->first_name} {$this->last_name}"),
        );
    }
}
