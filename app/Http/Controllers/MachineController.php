<?php

namespace App\Http\Controllers;

use App\Models\BuildingModel;
use App\Models\Machine\MachineModel;
use App\Models\Machine\MachineSpecModel;
use App\Models\MaterialModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MachineController extends Controller
{
    public function index()
    {
        $machines = MachineModel::with(['location', 'specifications', 'machineMaterials'])->get();
        $locations = BuildingModel::where('is_active', true)->get();

        // $spesifications = MachineSpecModel::all();
        // $materials = MaterialModel::all();
        return Inertia::render(
            'machines/index',
            [
                'machines' => $machines,
                'locations' => $locations,
                // 'specifications' => $spesifications,
                // 'materials' => $materials
            ]
        );
    }

    public function create()
    {
        return Inertia::render('machines/new', [
            'locations' => BuildingModel::where('is_active', true)->get(),
            'materials' => MaterialModel::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:100',
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'location_id' => [
                'required',
                Rule::exists(BuildingModel::class, 'id'),
            ],

            'status' => [
                'required',
                'in:Active,Maintenance,Inactive',
            ],

            'purchase_price' => [
                'nullable',
                'numeric',
            ],

            'start_date' => [
                'nullable',
                'date',
            ],

            'photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'nameplate' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'machine_materials' => [
                'nullable',
                'array',
            ],

            'machine_materials.*.material_id' => [
                'required',
                Rule::exists(MaterialModel::class, 'id'),
            ],

            'machine_materials.*.target_kg' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'machine_materials.*.capacity_kg' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'specifications' => [
                'nullable',
                'array',
            ],

            'specifications.*.spec_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'specifications.*.spec_value' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $imageUrls = [
            'photo_url' => $request->hasFile('photo')
                ? Storage::disk('public')->url(
                    $request->file('photo')->store('machines', 'public')
                )
                : null,
            'nameplate_url' => $request->hasFile('nameplate')
                ? Storage::disk('public')->url(
                    $request->file('nameplate')->store('machines', 'public')
                )
                : null,
        ];

        DB::transaction(function () use ($validated, $imageUrls) {

            $machine = MachineModel::create([
                'code' => $validated['code'],
                'name' => $validated['name'],
                'location_id' => $validated['location_id'],
                'status' => $validated['status'],

                'purchase_price' => $validated['purchase_price'] ?? null,

                'start_date' => $validated['start_date'] ?? null,

                'photo_url' => $imageUrls['photo_url'],
                'nameplate_url' => $imageUrls['nameplate_url'],
            ]);

            foreach (
                $validated['machine_materials'] ?? [] as $material
            ) {
                $machine
                    ->machineMaterials()
                    ->updateOrCreate([
                        'material_id' => $material['material_id'],
                        'machine_id' => $machine->id,
                    ], [
                        'target_kg' => $material['target_kg'] ?? null,

                        'capacity_kg' => $material['capacity_kg'] ?? null,
                    ]);
            }

            foreach (
                $validated['specifications'] ?? [] as $specification
            ) {
                $machine
                    ->specifications()
                    ->create([
                        'spec_name' => $specification['spec_name'] ?? null,

                        'spec_value' => $specification['spec_value'] ?? null,
                    ]);
            }
        });

        return redirect()
            ->route('machines.index')
            ->with(
                'success',
                'Mesin berhasil ditambahkan.'
            );
    }

    public function edit(MachineModel $machine)
    {
        $machine->load([
            'location',
            'specifications',
            'machineMaterials.material',
        ]);

        return Inertia::render(
            'machines/edit',
            [
                'machine' => $machine,

                'locations' => BuildingModel::where(
                    'is_active',
                    true
                )->get(),

                'materials' => MaterialModel::all(),
            ]
        );
    }

    public function update(
        Request $request,
        MachineModel $machine
    ) {
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:100',
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'location_id' => [
                'required',
                Rule::exists(BuildingModel::class, 'id'),
            ],

            'status' => [
                'required',
                'in:Active,Maintenance,Inactive',
            ],

            'purchase_price' => [
                'nullable',
                'numeric',
            ],

            'start_date' => [
                'nullable',
                'date',
            ],

            'photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'nameplate' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'machine_materials' => [
                'nullable',
                'array',
            ],

            'machine_materials.*.material_id' => [
                'required',
                Rule::exists(MaterialModel::class, 'id'),
            ],

            'machine_materials.*.target_kg' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'machine_materials.*.capacity_kg' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'specifications' => [
                'nullable',
                'array',
            ],

            'specifications.*.spec_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'specifications.*.spec_value' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $imageUrls = [];

        if ($request->hasFile('photo')) {
            $imageUrls['photo_url'] = Storage::disk('public')->url(
                $request->file('photo')->store('machines', 'public')
            );
        }

        if ($request->hasFile('nameplate')) {
            $imageUrls['nameplate_url'] = Storage::disk('public')->url(
                $request->file('nameplate')->store('machines', 'public')
            );
        }

        DB::transaction(function () use (
            $validated,
            $machine,
            $imageUrls
        ) {

            $machine->update([
                'code' => $validated['code'],
                'name' => $validated['name'],

                'location_id' => $validated['location_id'],

                'status' => $validated['status'],

                'purchase_price' => $validated['purchase_price']
                    ?? null,

                'start_date' => $validated['start_date']
                    ?? null,

                ...$imageUrls,
            ]);

            $machine
                ->machineMaterials()
                ->delete();

            foreach (
                $validated['machine_materials'] ?? [] as $material
            ) {
                $machine
                    ->machineMaterials()
                    ->updateOrCreate([
                        'material_id' => $material['material_id'],
                        'machine_id' => $machine->id,
                    ], [
                        'target_kg' => $material['target_kg'] ?? null,

                        'capacity_kg' => $material['capacity_kg'] ?? null,
                    ]);
            }

            $machine
                ->specifications()
                ->delete();

            foreach (
                $validated['specifications'] ?? [] as $specification
            ) {
                $machine
                    ->specifications()
                    ->create([
                        'spec_name' => $specification['spec_name'] ?? null,

                        'spec_value' => $specification['spec_value'] ?? null,
                    ]);
            }
        });

        return redirect()
            ->route('machines.index')
            ->with(
                'success',
                'Mesin berhasil diperbarui.'
            );
    }

    public function destroy(MachineModel $machine)
    {
        DB::transaction(function () use ($machine) {
            $machine->machineMaterials()->delete();
            $machine->specifications()->delete();
            $machine->delete();
        });

        return redirect()
            ->route('machines.index')
            ->with(
                'success',
                'Mesin berhasil dihapus.'
            );
    }
}
