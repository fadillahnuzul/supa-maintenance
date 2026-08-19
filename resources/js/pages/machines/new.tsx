import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';

import MaterialCombobox from '@/components/material-combobox';
import {
    machineStatuses,
    type Location,
    type Material,
    type MachineStatus,
} from '@/types/machine';

type Props = {
    locations: Location[];
    materials: Material[];
};

type SpecRow = {
    spec_name: string;
    spec_value: string;
};

type MaterialRow = {
    material_id: number | '';
    target_kg: string;
    capacity_kg: string;
};

export default function MachineNew({
    locations,
    materials,
}: Props) {
    const photoInputRef = useRef<HTMLInputElement>(null);
    const nameplateInputRef = useRef<HTMLInputElement>(null);

    const [photoPreview, setPhotoPreview] =
        useState<string | null>(null);

    const [nameplatePreview, setNameplatePreview] =
        useState<string | null>(null);

    const [specifications, setSpecifications] =
        useState<SpecRow[]>([
            {
                spec_name: '',
                spec_value: '',
            },
        ]);

    const [machineMaterials, setMachineMaterials] =
        useState<MaterialRow[]>([
            {
                material_id: '',
                target_kg: '',
                capacity_kg: '',
            },
        ]);

    const form = useForm({
        code: '',
        name: '',
        location_id: '',
        status: 'Active' as MachineStatus,
        purchase_price: '',
        start_date: '',

        machine_materials: [] as MaterialRow[],

        specifications: [] as SpecRow[],

        photo: null as File | null,
        nameplate: null as File | null,
    });

    const addSpecification = () => {
        setSpecifications((current) => [
            ...current,
            {
                spec_name: '',
                spec_value: '',
            },
        ]);
    };

    const removeSpecification = (index: number) => {
        setSpecifications((current) =>
            current.filter((_, rowIndex) => rowIndex !== index),
        );
    };

    const updateSpecification = (
        index: number,
        field: keyof SpecRow,
        value: string,
    ) => {
        setSpecifications((current) =>
            current.map((row, rowIndex) =>
                rowIndex === index
                    ? {
                        ...row,
                        [field]: value,
                    }
                    : row,
            ),
        );
    };

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

    const removeMaterial = (index: number) => {
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
                (_, rowIndex) => rowIndex !== index,
            );
        });
    };

    const updateMaterial = (
        index: number,
        field: keyof MaterialRow,
        value: string,
    ) => {
        setMachineMaterials((current) =>
            current.map((row, rowIndex) =>
                rowIndex === index
                    ? {
                        ...row,
                        [field]:
                            field === 'material_id'
                                ? value === ''
                                    ? ''
                                    : Number(value)
                                : value,
                    }
                    : row,
            ),
        );
    };

    const choosePhoto = (file: File | null) => {
        if (!file) {
            return;
        }

        form.setData('photo', file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const chooseNameplate = (file: File | null) => {
        if (!file) {
            return;
        }

        form.setData('nameplate', file);
        setNameplatePreview(URL.createObjectURL(file));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const cleanedSpecifications =
            specifications.filter(
                (spec) =>
                    spec.spec_name.trim() !== '' ||
                    spec.spec_value.trim() !== '',
            );

        const cleanedMaterials =
            machineMaterials.filter(
                (row) => row.material_id !== '',
            );

        form.transform((data) => ({
            ...data,
            specifications: cleanedSpecifications,
            machine_materials: cleanedMaterials,
        }));

        form.post('/machines', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Tambah Mesin" />

            <div className="mx-auto max-w-5xl px-4 py-6">
                <div className="mb-4">
                    <Link
                        href="/machines"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
                    >
                        <ArrowLeft size={18} />
                        Kembali ke daftar mesin
                    </Link>
                </div>

                <form
                    onSubmit={submit}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                    <div className="bg-black px-6 py-4 text-white">
                        <h1 className="text-xl font-bold">
                            Tambah Mesin
                        </h1>
                    </div>

                    <div className="space-y-6 p-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field
                                label="Kode Mesin"
                                error={form.errors.code}
                            >
                                <input
                                    value={form.data.code}
                                    onChange={(event) =>
                                        form.setData(
                                            'code',
                                            event.target.value,
                                        )
                                    }
                                    className="h-11 w-full rounded-lg border px-3 text-gray-800"
                                    placeholder="Kode mesin..."
                                />
                            </Field>

                            <Field
                                label="Nama Mesin"
                                error={form.errors.name}
                            >
                                <input
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    className="h-11 w-full rounded-lg border px-3 text-gray-800"
                                    placeholder="Nama mesin..."
                                />
                            </Field>

                            <Field
                                label="Lokasi"
                                error={form.errors.location_id}
                            >
                                <select
                                    value={form.data.location_id}
                                    onChange={(event) =>
                                        form.setData(
                                            'location_id',
                                            event.target.value,
                                        )
                                    }
                                    className="h-11 w-full rounded-lg border bg-white px-3 text-gray-800"
                                >
                                    <option value="">
                                        -- Pilih Lokasi --
                                    </option>

                                    {locations.map((location) => (
                                        <option
                                            key={location.id}
                                            value={location.id}
                                        >
                                            {location.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label="Status"
                                error={form.errors.status}
                            >
                                <select
                                    value={form.data.status}
                                    onChange={(event) =>
                                        form.setData(
                                            'status',
                                            event.target
                                                .value as MachineStatus,
                                        )
                                    }
                                    className="h-11 w-full rounded-lg border bg-white px-3 text-gray-800"
                                >
                                    {machineStatuses.map(
                                        (status) => (
                                            <option
                                                key={status.value}
                                                value={status.value}
                                            >
                                                {status.label}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </Field>

                            <Field
                                label="Harga Beli"
                                error={
                                    form.errors.purchase_price
                                }
                            >
                                <input
                                    type="number"
                                    value={
                                        form.data.purchase_price
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            'purchase_price',
                                            event.target.value,
                                        )
                                    }
                                    className="h-11 w-full rounded-lg border px-3 text-gray-800"
                                    placeholder="Harga beli mesin..."
                                />
                            </Field>

                            <Field
                                label="Mulai Beroperasi"
                                error={form.errors.start_date}
                            >
                                <input
                                    type="date"
                                    value={form.data.start_date}
                                    onClick={(event) => {
                                        if (typeof event.currentTarget.showPicker === 'function') {
                                            event.currentTarget.showPicker();
                                        }
                                    }}
                                    onChange={(event) =>
                                        form.setData(
                                            'start_date',
                                            event.target.value,
                                        )
                                    }
                                    className="h-11 w-full rounded-lg border px-3 text-gray-800"
                                />
                            </Field>
                        </div>

                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="font-semibold text-gray-900">
                                    Material & Kapasitas
                                </h2>

                                <button
                                    type="button"
                                    onClick={addMaterial}
                                    className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                                >
                                    <Plus size={16} />
                                    Tambah Material
                                </button>
                            </div>

                            <div className="space-y-2">
                                {machineMaterials.map((row, index) => (
                                    <div
                                        key={index}
                                        className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_auto]"
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
                                        />

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={row.target_kg}
                                            onChange={(event) =>
                                                updateMaterial(
                                                    index,
                                                    'target_kg',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Target (Kg)"
                                            className="h-11 rounded-lg border px-3 text-gray-800"
                                        />

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={row.capacity_kg}
                                            onChange={(event) =>
                                                updateMaterial(
                                                    index,
                                                    'capacity_kg',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Kapasitas (Kg)"
                                            className="h-11 rounded-lg border px-3 text-gray-800"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => removeMaterial(index)}
                                            className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                                            title="Hapus Material"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="font-semibold text-gray-900">
                                    Spesifikasi Mesin
                                </h2>

                                <button
                                    type="button"
                                    onClick={addSpecification}
                                    className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-white"
                                >
                                    <Plus size={16} />
                                    Tambah Spesifikasi
                                </button>
                            </div>

                            <div className="space-y-2">
                                {specifications.map(
                                    (spec, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-2"
                                        >
                                            <input
                                                value={
                                                    spec.spec_name
                                                }
                                                onChange={(event) =>
                                                    updateSpecification(
                                                        index,
                                                        'spec_name',
                                                        event.target
                                                            .value,
                                                    )
                                                }
                                                placeholder="Contoh: Tegangan"
                                                className="h-11 flex-1 rounded-lg border px-3 text-gray-800"
                                            />

                                            <input
                                                value={
                                                    spec.spec_value
                                                }
                                                onChange={(event) =>
                                                    updateSpecification(
                                                        index,
                                                        'spec_value',
                                                        event.target
                                                            .value,
                                                    )
                                                }
                                                placeholder="Contoh: 380V"
                                                className="h-11 flex-1 rounded-lg border px-3 text-gray-800"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeSpecification(
                                                        index,
                                                    )
                                                }
                                                className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600"
                                            >
                                                <Trash2
                                                    size={18}
                                                />
                                            </button>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <ImageUpload
                                title="Foto Mesin"
                                preview={photoPreview}
                                inputRef={photoInputRef}
                                onChange={choosePhoto}
                            />

                            <ImageUpload
                                title="Foto Nameplate"
                                preview={nameplatePreview}
                                inputRef={
                                    nameplateInputRef
                                }
                                onChange={chooseNameplate}
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
                            >
                                {form.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Mesin'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

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

function ImageUpload({
    title,
    preview,
    inputRef,
    onChange,
}: {
    title: string;
    preview: string | null;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: (file: File | null) => void;
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
                    onChange(event.target.files?.[0] ?? null)
                }
            />

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex min-h-[150px] w-full items-center justify-center overflow-hidden rounded-lg border bg-white"
            >
                {preview ? (
                    <img
                        src={preview}
                        className="h-[180px] w-full object-cover"
                        alt={title}
                    />
                ) : (
                    <div className="text-center text-gray-500">
                        <Upload
                            size={34}
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