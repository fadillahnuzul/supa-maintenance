<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use App\Models\RoleModel;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * Halaman Role Management.
     */
    public function index(): Response
    {
        $users = User::query()
            ->with([
                'roles:id,code,name',
            ])
            ->whereHas('roles')
            ->orderBy('first_name')
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,

                    'name' => $employee->name,

                    'id_karyawan' => $employee->id_karyawan,

                    'status' => $this->getEmployeeStatus($employee),

                    'location' => $this->getEmployeeLocation($employee),

                    'avatar' => $employee->avatar ?? null,

                    'roles' => $employee->roles
                        ->map(fn ($role) => [
                            'id' => $role->id,
                            'code' => $role->code,
                            'name' => $role->name,
                        ])
                        ->values(),
                ];
            });

        $employees = User::query()
            ->orderBy('first_name')
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'email' => $employee->email,
                ];
            });

        $roles = RoleModel::query()
            ->select([
                'id',
                'code',
                'name',
            ])
            ->orderBy('name')
            ->get();

        return Inertia::render('ownsettings/role-settings', [
            'users' => $users,
            'employees' => $employees,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => [
                'required',
                'integer',
                Rule::exists(User::class, 'id'),
            ],

            'role_ids' => [
                'required',
                'array',
                'min:1',
            ],

            'role_ids.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists(RoleModel::class, 'id')
            ],
        ]);

        $employee = User::findOrFail(
            $validated['employee_id']
        );

        $employee->roles()->sync(
            $validated['role_ids']
        );

        return redirect()
            ->route('roles.index')
            ->with(
                'success',
                'Role pengguna berhasil disimpan.'
            );
    }

    public function update(
        Request $request,
        User $employee
    ): RedirectResponse {
        $validated = $request->validate([
            'role_ids' => [
                'required',
                'array',
                'min:1',
            ],

            'role_ids.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists(RoleModel::class, 'id')
            ],
        ]);

        $employee->roles()->sync(
            $validated['role_ids']
        );

        return redirect()
            ->route('roles.index')
            ->with(
                'success',
                'Role pengguna berhasil diperbarui.'
            );
    }

    public function destroy(
        User $employee
    ): RedirectResponse {
        $employee->roles()->detach();

        return redirect()
            ->route('roles.index')
            ->with(
                'success',
                'Seluruh role pengguna berhasil dihapus.'
            );
    }

    private function getEmployeeStatus(
        User $employee
    ): string {
        if (isset($employee->status)) {
            return match ($employee->status) {
                true => 'Aktif',

                default => 'Tidak Aktif',
            };
        }

        return 'Aktif';
    }

    /**
     * Ambil lokasi kerja employee.
     */
    private function getEmployeeLocation(
        User $employee
    ): string {
        return $employee->location
            ?? $employee->work_location
            ?? '-';
    }
}
