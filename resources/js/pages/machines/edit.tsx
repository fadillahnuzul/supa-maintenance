import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';

import MaterialCombobox from '@/components/material-combobox';
import {
    machineStatuses,
    type Location,
    type Machine,
    type MachineStatus,
    type Material,
} from '@/types/machine';

type Props = {
    machine: Machine;
    locations: Location[];
    materials: Material[];
};

type SpecRow = {
    id?: number;
    spec_name: string;
    spec_value: string;
};

type MaterialRow = {
    id?: number;
    material_id: number | '';
    target_kg: string;
    capacity_kg: string;
};

export default function MachineEdit({
    machine,
    locations,
    materials,
}: Props) {
    const photoInputRef =
        useRef<HTMLInputElement>(null);

    const nameplateInputRef =
        useRef<HTMLInputElement>(null);

    const [photoPreview, setPhotoPreview] =
        useState<string | null>(
            machine.photo_url ?? null,
        );

    const [
        nameplatePreview,
        setNameplatePreview,
    ] = useState<string | null>(
        machine.nameplate_url ?? null,
    );

    /*
     * ==============================
     * SPECIFICATIONS
     * ==============================
     *
     * Mengambil spesifikasi lama dari
     * machine.specifications.
     */
    const [
        specifications,
        setSpecifications,
    ] = useState<SpecRow[]>(
        machine.specifications?.length
            ? machine.specifications.map(
                  (spec) => ({
                      id: spec.id,
                      spec_name:
                          spec.spec_name,
                      spec_value:
                          spec.spec_value,
                  }),
              )
            : [
                  {
                      spec_name: '',
                      spec_value: '',
                  },
              ],
    );

    /*
     * ==============================
     * MACHINE MATERIALS
     * ==============================
     *
     * Mengambil relasi dari:
     *
     * machine.machine_materials
     *
     * bukan machine.materials.
     */
    const [
        machineMaterials,
        setMachineMaterials,
    ] = useState<MaterialRow[]>(
        machine.machine_materials?.length
            ? machine.machine_materials.map(
                  (item) => ({
                      id: item.id,

                      material_id:
                          item.material_id,

                      target_kg:
                          item.target_kg?.toString() ??
                          '',

                      capacity_kg:
                          item.capacity_kg?.toString() ??
                          '',
                  }),
              )
            : [
                  {
                      material_id: '',
                      target_kg: '',
                      capacity_kg: '',
                  },
              ],
    );

    /*
     * ==============================
     * FORM UTAMA
     * ==============================
     */
    const form = useForm({
        code: machine.code ?? '',

        name: machine.name ?? '',

        location_id:
            machine.location_id?.toString() ??
            '',

        status:
            machine.status as MachineStatus,

        purchase_price:
            machine.purchase_price?.toString() ??
            '',

        start_date:
            machine.start_date ?? '',

        /*
         * Nilai ini akan diisi ketika
         * submit melalui transform().
         */
        specifications: [] as SpecRow[],

        machine_materials:
            [] as MaterialRow[],

        photo: null as File | null,

        nameplate: null as File | null,
    });

    /*
     * ==============================
     * SPECIFICATION FUNCTIONS
     * ==============================
     */

    const addSpecification = () => {
        setSpecifications((current) => [
            ...current,
            {
                spec_name: '',
                spec_value: '',
            },
        ]);
    };

    const removeSpecification = (
        index: number,
    ) => {
        setSpecifications((current) => {
            if (current.length === 1) {
                return [
                    {
                        spec_name: '',
                        spec_value: '',
                    },
                ];
            }

            return current.filter(
                (_, rowIndex) =>
                    rowIndex !== index,
            );
        });
    };

    const updateSpecification = (
        index: number,
        field: keyof SpecRow,
        value: string,
    ) => {
        setSpecifications((current) =>
            current.map(
                (row, rowIndex) =>
                    rowIndex === index
                        ? {
                              ...row,
                              [field]:
                                  value,
                          }
                        : row,
            ),
        );
    };

    /*
     * ==============================
     * MATERIAL FUNCTIONS
     * ==============================
     */

    const addMaterial = () => {
        setMachineMaterials((current) => [
            ...current,
            {
                material_id: '',
                target_kg: '',
                capacity_kg: '',
            },
        ]);
    };

    const removeMaterial = (
        index: number,
    ) => {
        setMachineMaterials((current) => {
            if (current.length === 1) {
                return [
                    {
                        material_id: '',
                        target_kg: '',
                        capacity_kg: '',
                    },
                ];
            }

            return current.filter(
                (_, rowIndex) =>
                    rowIndex !== index,
            );
        });
    };

    const updateMaterial = (
        index: number,
        field: keyof MaterialRow,
        value: string,
    ) => {
        setMachineMaterials((current) =>
            current.map(
                (row, rowIndex) => {
                    if (
                        rowIndex !== index
                    ) {
                        return row;
                    }

                    if (
                        field ===
                        'material_id'
                    ) {
                        return {
                            ...row,

                            material_id:
                                value === ''
                                    ? ''
                                    : Number(
                                          value,
                                      ),
                        };
                    }

                    return {
                        ...row,
                        [field]: value,
                    };
                },
            ),
        );
    };

    /*
     * Mencegah material yang sama
     * dipilih dua kali.
     */
    const isMaterialSelected = (
        materialId: number,
        currentIndex: number,
    ) => {
        return machineMaterials.some(
            (row, index) =>
                index !== currentIndex &&
                row.material_id ===
                    materialId,
        );
    };

    /*
     * ==============================
     * IMAGE FUNCTIONS
     * ==============================
     */

    const choosePhoto = (
        file: File | null,
    ) => {
        if (!file) {
            return;
        }

        form.setData('photo', file);

        setPhotoPreview(
            URL.createObjectURL(file),
        );
    };

    const chooseNameplate = (
        file: File | null,
    ) => {
        if (!file) {
            return;
        }

        form.setData(
            'nameplate',
            file,
        );

        setNameplatePreview(
            URL.createObjectURL(file),
        );
    };

    /*
     * ==============================
     * SUBMIT
     * ==============================
     */

    const submit = (
        event: FormEvent,
    ) => {
        event.preventDefault();

        /*
         * Buang row specification kosong.
         */
        const cleanedSpecifications =
            specifications.filter(
                (row) =>
                    row.spec_name
                        .trim() !== '' ||
                    row.spec_value
                        .trim() !== '',
            );

        /*
         * Hanya kirim material yang
         * sudah dipilih.
         */
        const cleanedMaterials =
            machineMaterials.filter(
                (row) =>
                    row.material_id !== '',
            );

        /*
         * Karena ada file upload,
         * kita menggunakan POST +
         * _method PUT.
         */
        form.transform((data) => ({
            ...data,

            _method: 'put',

            specifications:
                cleanedSpecifications,

            machine_materials:
                cleanedMaterials,
        }));

        form.post(
            `/machines/${machine.id}`,
            {
                forceFormData: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head
                title={`Edit ${machine.name}`}
            />

            <div className="mx-auto max-w-5xl px-4 py-6">
                {/* BACK BUTTON */}
                <div className="mb-4">
                    <Link
                        href="/machines"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
                    >
                        <ArrowLeft
                            size={18}
                        />

                        Kembali ke daftar
                        mesin
                    </Link>
                </div>

                <form
                    onSubmit={submit}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                    {/* HEADER */}
                    <div className="bg-black px-6 py-4 text-white">
                        <h1 className="text-xl font-bold">
                            Edit Mesin
                        </h1>

                        <p className="mt-1 text-sm text-gray-300">
                            {machine.code} —{' '}
                            {machine.name}
                        </p>
                    </div>

                    <div className="space-y-7 p-6">
                        {/* =========================
                            BASIC INFORMATION
                        ========================== */}

                        <section>
                            <h2 className="mb-3 text-lg font-semibold text-gray-900">
                                Informasi Mesin
                            </h2>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field
                                    label="Kode Mesin"
                                    error={
                                        form.errors
                                            .code
                                    }
                                >
                                    <input
                                        value={
                                            form
                                                .data
                                                .code
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'code',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        className="h-11 w-full rounded-lg border border-gray-300 px-3 text-gray-800 outline-none focus:border-green-600"
                                        placeholder="Kode mesin..."
                                    />
                                </Field>

                                <Field
                                    label="Nama Mesin"
                                    error={
                                        form.errors
                                            .name
                                    }
                                >
                                    <input
                                        value={
                                            form
                                                .data
                                                .name
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'name',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        className="h-11 w-full rounded-lg border border-gray-300 px-3 text-gray-800 outline-none focus:border-green-600"
                                        placeholder="Nama mesin..."
                                    />
                                </Field>

                                <Field
                                    label="Lokasi"
                                    error={
                                        form.errors
                                            .location_id
                                    }
                                >
                                    <select
                                        value={
                                            form
                                                .data
                                                .location_id
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'location_id',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-800 outline-none focus:border-green-600"
                                    >
                                        <option value="">
                                            --
                                            Pilih
                                            Lokasi
                                            --
                                        </option>

                                        {locations.map(
                                            (
                                                location,
                                            ) => (
                                                <option
                                                    key={
                                                        location.id
                                                    }
                                                    value={
                                                        location.id
                                                    }
                                                >
                                                    {
                                                        location.name
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </Field>

                                <Field
                                    label="Status"
                                    error={
                                        form.errors
                                            .status
                                    }
                                >
                                    <select
                                        value={
                                            form
                                                .data
                                                .status
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'status',
                                                event
                                                    .target
                                                    .value as MachineStatus,
                                            )
                                        }
                                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-800 outline-none focus:border-green-600"
                                    >
                                        {machineStatuses.map(
                                            (
                                                status,
                                            ) => (
                                                <option
                                                    key={
                                                        status.value
                                                    }
                                                    value={
                                                        status.value
                                                    }
                                                >
                                                    {
                                                        status.label
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </Field>

                                <Field
                                    label="Harga Beli"
                                    error={
                                        form.errors
                                            .purchase_price
                                    }
                                >
                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            form
                                                .data
                                                .purchase_price
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'purchase_price',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        className="h-11 w-full rounded-lg border border-gray-300 px-3 text-gray-800 outline-none focus:border-green-600"
                                        placeholder="Harga beli..."
                                    />
                                </Field>

                                <Field
                                    label="Mulai Beroperasi"
                                    error={
                                        form.errors
                                            .start_date
                                    }
                                >
                                    <input
                                        type="date"
                                        value={
                                            form
                                                .data
                                                .start_date
                                        }
                                        onClick={(event) => {
                                            if (typeof event.currentTarget.showPicker === 'function') {
                                                event.currentTarget.showPicker();
                                            }
                                        }}
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'start_date',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        className="h-11 w-full rounded-lg border border-gray-300 px-3 text-gray-800 outline-none focus:border-green-600"
                                    />
                                </Field>
                            </div>
                        </section>

                        {/* =========================
                            MATERIAL
                        ========================== */}

                        <section>
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Material
                                        &amp;
                                        Kapasitas
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Pilih
                                        material,
                                        target,
                                        dan
                                        kapasitas
                                        mesin.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        addMaterial
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                                >
                                    <Plus
                                        size={
                                            16
                                        }
                                    />

                                    Tambah
                                    Material
                                </button>
                            </div>

                            {/* HEADER ROW */}
                            <div className="mb-2 hidden grid-cols-[2fr_1fr_1fr_44px] gap-2 px-1 text-sm font-semibold text-gray-600 md:grid">
                                <div>
                                    Material
                                </div>

                                <div>
                                    Target
                                    (Kg)
                                </div>

                                <div>
                                    Kapasitas
                                    (Kg)
                                </div>

                                <div />
                            </div>

                            <div className="space-y-2">
                                {machineMaterials.map(
                                    (
                                        row,
                                        index,
                                    ) => (
                                        <div
                                            key={
                                                row.id ??
                                                index
                                            }
                                            className="grid gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 md:grid-cols-[2fr_1fr_1fr_44px]"
                                        >
                                            <MaterialCombobox
                                                materials={materials}
                                                value={row.material_id}
                                                onChange={(value) =>
                                                    updateMaterial(
                                                        index,
                                                        'material_id',
                                                        value,
                                                    )
                                                }
                                                disabledMaterialIds={materials
                                                    .filter((material) =>
                                                        isMaterialSelected(
                                                            material.id,
                                                            index,
                                                        ),
                                                    )
                                                    .map((material) => material.id)}
                                            />

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    row.target_kg
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    updateMaterial(
                                                        index,
                                                        'target_kg',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="Target (Kg)"
                                                className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-gray-800 outline-none focus:border-green-600"
                                            />

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    row.capacity_kg
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    updateMaterial(
                                                        index,
                                                        'capacity_kg',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="Kapasitas (Kg)"
                                                className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-gray-800 outline-none focus:border-green-600"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeMaterial(
                                                        index,
                                                    )
                                                }
                                                className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                                                title="Hapus Material"
                                            >
                                                <Trash2
                                                    size={
                                                        18
                                                    }
                                                />
                                            </button>
                                        </div>
                                    ),
                                )}
                            </div>
                        </section>

                        {/* =========================
                            SPECIFICATION
                        ========================== */}

                        <section>
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Spesifikasi
                                        Mesin
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Tambahkan
                                        parameter
                                        teknis
                                        mesin.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        addSpecification
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                                >
                                    <Plus
                                        size={
                                            16
                                        }
                                    />

                                    Tambah
                                    Spesifikasi
                                </button>
                            </div>

                            <div className="space-y-2">
                                {specifications.map(
                                    (
                                        spec,
                                        index,
                                    ) => (
                                        <div
                                            key={
                                                spec.id ??
                                                index
                                            }
                                            className="grid gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 md:grid-cols-[1fr_1fr_44px]"
                                        >
                                            <input
                                                value={
                                                    spec.spec_name
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    updateSpecification(
                                                        index,
                                                        'spec_name',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="Parameter, contoh: Tegangan"
                                                className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-gray-800 outline-none focus:border-green-600"
                                            />

                                            <input
                                                value={
                                                    spec.spec_value
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    updateSpecification(
                                                        index,
                                                        'spec_value',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="Nilai, contoh: 380V"
                                                className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-gray-800 outline-none focus:border-green-600"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeSpecification(
                                                        index,
                                                    )
                                                }
                                                className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                                                title="Hapus Spesifikasi"
                                            >
                                                <Trash2
                                                    size={
                                                        18
                                                    }
                                                />
                                            </button>
                                        </div>
                                    ),
                                )}
                            </div>
                        </section>

                        {/* =========================
                            IMAGES
                        ========================== */}

                        <section>
                            <h2 className="mb-3 text-lg font-semibold text-gray-900">
                                Dokumentasi
                                Mesin
                            </h2>

                            <div className="grid gap-4 md:grid-cols-2">
                                <ImageUpload
                                    title="Foto Mesin"
                                    preview={
                                        photoPreview
                                    }
                                    inputRef={
                                        photoInputRef
                                    }
                                    onChange={
                                        choosePhoto
                                    }
                                />

                                <ImageUpload
                                    title="Foto Nameplate"
                                    preview={
                                        nameplatePreview
                                    }
                                    inputRef={
                                        nameplateInputRef
                                    }
                                    onChange={
                                        chooseNameplate
                                    }
                                />
                            </div>
                        </section>

                        {/* =========================
                            SUBMIT
                        ========================== */}

                        <div className="flex flex-wrap justify-end gap-2 border-t pt-5">
                            <Link
                                href="/machines"
                                className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                disabled={
                                    form.processing
                                }
                                className="min-w-[170px] rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {form.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

/*
 * ==============================
 * FIELD COMPONENT
 * ==============================
 */
function Field({
    label,
    children,
    error,
}: {
    label: string;
    children: React.ReactNode;
    error?: string;
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
                {label}
            </label>

            {children}

            {error && (
                <p className="mt-1 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

/*
 * ==============================
 * IMAGE UPLOAD COMPONENT
 * ==============================
 */
function ImageUpload({
    title,
    preview,
    inputRef,
    onChange,
}: {
    title: string;

    preview: string | null;

    inputRef: React.RefObject<
        HTMLInputElement | null
    >;

    onChange: (
        file: File | null,
    ) => void;
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
                {title}
            </label>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) =>
                    onChange(
                        event.target
                            .files?.[0] ??
                            null,
                    )
                }
            />

            <button
                type="button"
                onClick={() =>
                    inputRef.current?.click()
                }
                className="flex min-h-[170px] w-full items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-white transition hover:bg-gray-50"
            >
                {preview ? (
                    <img
                        src={preview}
                        alt={title}
                        className="h-[190px] w-full object-cover"
                    />
                ) : (
                    <div className="text-center text-gray-500">
                        <Upload
                            size={36}
                            className="mx-auto"
                        />

                        <div className="mt-2">
                            Upload {title}
                        </div>
                    </div>
                )}
            </button>
        </div>
    );
}