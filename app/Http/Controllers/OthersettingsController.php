<?php

namespace App\Http\Controllers;

use App\Models\BuildingModel;
use App\Models\DepartmentProductionModel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OthersettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('ownsettings/other-settings', [
            'departments' => DepartmentProductionModel::query()
                ->select('id', 'name')
                ->orderBy('name')
                ->get(),

            'locations' => BuildingModel::query()
                ->select('id', 'name')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),

            // Department Production
            'departmentStoreUrl' =>
                route('other-settings.departments.store'),

            'departmentUpdateBaseUrl' =>
                url('/other-settings/departments'),

            'departmentDeleteBaseUrl' =>
                url('/other-settings/departments'),

            // Building
            'locationStoreUrl' =>
                route('other-settings.locations.store'),

            'locationUpdateBaseUrl' =>
                url('/other-settings/locations'),

            'locationDeleteBaseUrl' =>
                url('/other-settings/locations'),
        ]);
    }

    /**
     * Tambah Departemen Produksi
     */
    public function storeDepartment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique(
                    DepartmentProductionModel::class,
                    'name'
                ),
            ],
        ]);

        DepartmentProductionModel::create([
            'name' => trim($validated['name']),
        ]);

        return back()->with(
            'success',
            'Departemen berhasil ditambahkan.'
        );
    }

    /**
     * Update Departemen Produksi
     */
    public function updateDepartment(
        Request $request,
        DepartmentProductionModel $department
    ): RedirectResponse {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',

                Rule::unique(
                    DepartmentProductionModel::class,
                    'name'
                )->ignore($department->id),
            ],
        ]);

        $department->update([
            'name' => trim($validated['name']),
        ]);

        return back()->with(
            'success',
            'Departemen berhasil diperbarui.'
        );
    }

    /**
     * Hapus Departemen Produksi
     */
    public function destroyDepartment(
        DepartmentProductionModel $department
    ): RedirectResponse {
        $department->delete();

        return back()->with(
            'success',
            'Departemen berhasil dihapus.'
        );
    }

    /**
     * Tambah Building / Lokasi
     */
    public function storeLocation(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',

                Rule::unique(
                    BuildingModel::class,
                    'name'
                ),
            ],
        ]);

        BuildingModel::create([
            'name' => trim($validated['name']),
            'is_active' => true,
        ]);

        return back()->with(
            'success',
            'Lokasi berhasil ditambahkan.'
        );
    }

    /**
     * Update Building / Lokasi
     */
    public function updateLocation(
        Request $request,
        BuildingModel $location
    ): RedirectResponse {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',

                Rule::unique(
                    BuildingModel::class,
                    'name'
                )->ignore($location->id),
            ],
        ]);

        $location->update([
            'name' => trim($validated['name']),
        ]);

        return back()->with(
            'success',
            'Lokasi berhasil diperbarui.'
        );
    }

    public function destroyLocation(
        BuildingModel $location
    ): RedirectResponse {
        $location->delete();

        return back()->with(
            'success',
            'Lokasi berhasil dihapus.'
        );
    }
}
