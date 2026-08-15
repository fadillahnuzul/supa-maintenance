import { Head, router, useForm } from '@inertiajs/react';
import {
    Building2,
    Grid2X2,
    List,
    MapPin,
    Pencil,
    Plus,
    Printer,
    Search,
    Trash2,
    Upload,
    Wrench,
    X,
} from 'lucide-react';
import { FormEvent, useMemo, useRef, useState } from 'react';

type MachineStatus = 'Aktif' | 'Tidak Aktif';

type Machine = {
    id: number;
    code: string;
    name: string;
    model?: string;
    brand?: string;
    location: string;
    department: string;
    status: MachineStatus;
    voltage?: string;
    purchase_price?: string;
    start_date?: string;
    image?: string | null;
    specifications?: string[];
};

type Props = {
    machines?: Machine[];
    storeUrl?: string;
    updateBaseUrl?: string;
    deleteBaseUrl?: string;
};

const dummyMachines: Machine[] = [
    {
        id: 1,
        code: 'GR.M.001.4',
        name: 'Mesin Giling 4',
        model: 'WLF-400 Turbine Crusher',
        brand: 'WLF',
        location: 'Gedung B, Lantai 1 (Area Packing Sachet)',
        department: 'Produksi Bubuk',
        status: 'Aktif',
        voltage: '380V',
        purchase_price: '125000000',
        start_date: '2026-08-05',
        image: '/images/machines/machine-1.jpg',
        specifications: ['Tegangan: 380V', 'Ukuran: 120x90x180 cm'],
    },
    {
        id: 2,
        code: 'GR.M.001.5',
        name: 'Mesin Giling 5',
        model: 'WLF-400 Turbine Crusher',
        brand: 'WLF',
        location: 'Gedung B, Lantai 1 (Area Packing Sachet)',
        department: 'Produksi Bubuk',
        status: 'Aktif',
        voltage: '380V',
        purchase_price: '125000000',
        start_date: '2026-08-05',
        image: '/images/machines/machine-2.jpg',
        specifications: ['Tegangan: 380V'],
    },
    {
        id: 3,
        code: 'GR.M.001.6',
        name: 'Mesin Giling 6',
        model: 'WLF-400 Turbine Crusher',
        brand: 'WLF',
        location: 'Gedung B, Lantai 1 (Area Packing Sachet)',
        department: 'Produksi Bubuk',
        status: 'Aktif',
        voltage: '380V',
        purchase_price: '125000000',
        start_date: '2026-08-05',
        image: '/images/machines/machine-3.jpg',
        specifications: ['Tegangan: 380V'],
    },
    {
        id: 4,
        code: 'GR.M.001.7',
        name: 'Mesin Giling 7',
        model: 'WLF-400 Turbine Crusher',
        brand: 'WLF',
        location: 'Gedung B, Lantai 1 (Area Packing Sachet)',
        department: 'Produksi Bubuk',
        status: 'Aktif',
        voltage: '380V',
        purchase_price: '125000000',
        start_date: '2026-08-05',
        image: '/images/machines/machine-4.jpg',
        specifications: ['Tegangan: 380V'],
    },
];

const locations = [
    'Gedung B, Lantai 1 (Area Packing Sachet)',
    'Gedung B, Lantai 2 (Area Mixing Utama)',
    'Gudang A2',
    'Gudang A3',
];

const departments = [
    'Produksi Bubuk',
    'Blending & Mixing',
    'Quality Control',
    'Packaging & Sachet',
];

export default function MachineIndex({
    machines = dummyMachines,
    storeUrl,
    updateBaseUrl,
    deleteBaseUrl,
}: Props) {
    const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
    const [locationFilter, setLocationFilter] = useState('Semua Lokasi');
    const [departmentFilter, setDepartmentFilter] = useState('Semua Departemen');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [search, setSearch] = useState('');
    const [localMachines, setLocalMachines] = useState<Machine[]>(machines);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
    const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

    const filteredMachines = useMemo(() => {
        return localMachines.filter((machine) => {
            const matchesLocation =
                locationFilter === 'Semua Lokasi' ||
                machine.location === locationFilter;

            const matchesDepartment =
                departmentFilter === 'Semua Departemen' ||
                machine.department === departmentFilter;

            const matchesStatus =
                statusFilter === 'Semua Status' ||
                machine.status === statusFilter;

            const term = search.trim().toLowerCase();

            const matchesSearch =
                !term ||
                [
                    machine.code,
                    machine.name,
                    machine.model,
                    machine.brand,
                    machine.location,
                    machine.department,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()
                    .includes(term);

            return (
                matchesLocation &&
                matchesDepartment &&
                matchesStatus &&
                matchesSearch
            );
        });
    }, [
        localMachines,
        locationFilter,
        departmentFilter,
        statusFilter,
        search,
    ]);

    const openCreate = () => {
        setSelectedMachine(null);
        setModalMode('create');
    };

    const openEdit = (machine: Machine) => {
        setSelectedMachine(machine);
        setModalMode('edit');
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedMachine(null);
    };

    const deleteMachine = (machine: Machine) => {
        if (!window.confirm(`Hapus mesin "${machine.name}"?`)) return;

        if (deleteBaseUrl) {
            router.delete(`${deleteBaseUrl}/${machine.id}`, {
                preserveScroll: true,
            });
            return;
        }

        setLocalMachines((current) =>
            current.filter((item) => item.id !== machine.id),
        );
    };

    const upsertLocalMachine = (machine: Machine) => {
        setLocalMachines((current) => {
            const exists = current.some((item) => item.id === machine.id);

            return exists
                ? current.map((item) =>
                      item.id === machine.id ? machine : item,
                  )
                : [...current, machine];
        });
    };

    return (
        <>
            <Head title="Daftar Mesin" />

            <div className="mx-auto w-full px-3 pb-8">
                <section className="rounded-[22px] bg-white p-4 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-[24px] font-extrabold text-[#111827]">
                            Daftar Mesin
                        </h1>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setViewMode((current) =>
                                        current === 'list' ? 'card' : 'list',
                                    )
                                }
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#8b8b8b] bg-white text-gray-600 transition hover:bg-gray-50"
                                title={
                                    viewMode === 'list'
                                        ? 'Tampilkan mode card'
                                        : 'Tampilkan mode list'
                                }
                            >
                                {viewMode === 'list' ? (
                                    <Grid2X2 size={22} />
                                ) : (
                                    <List size={22} />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex h-11 items-center gap-2 rounded-xl bg-[#4f86f7] px-4 font-semibold text-white transition hover:bg-blue-600"
                            >
                                Print Laporan
                                <Printer size={18} />
                            </button>

                            <button
                                type="button"
                                onClick={openCreate}
                                className="flex h-11 items-center gap-2 rounded-xl bg-[#2faa32] px-4 font-semibold text-white transition hover:bg-[#249428]"
                            >
                                Tambah Mesin
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="mb-2 flex flex-wrap justify-end gap-2">
                        <select
                            value={locationFilter}
                            onChange={(event) =>
                                setLocationFilter(event.target.value)
                            }
                            className="h-11 min-w-[200px] rounded-xl border border-[#8b8b8b] bg-white px-4 text-sm text-gray-700 outline-none"
                        >
                            <option>Semua Lokasi</option>
                            {locations.map((location) => (
                                <option key={location}>{location}</option>
                            ))}
                        </select>

                        <select
                            value={departmentFilter}
                            onChange={(event) =>
                                setDepartmentFilter(event.target.value)
                            }
                            className="h-11 min-w-[200px] rounded-xl border border-[#8b8b8b] bg-white px-4 text-sm text-gray-700 outline-none"
                        >
                            <option className="text-gray-500">Semua Departemen</option>
                            {departments.map((department) => (
                                <option key={department}>{department}</option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            className="h-11 min-w-[165px] rounded-xl border border-[#8b8b8b] bg-white px-4 text-sm text-gray-700 outline-none"
                        >
                            <option>Semua Status</option>
                            <option>Aktif</option>
                            <option>Tidak Aktif</option>
                        </select>

                        <label className="flex h-11 min-w-[250px] items-center gap-2 rounded-xl border border-[#8b8b8b] bg-white px-3">
                            <Search size={18} className="text-gray-500" />
                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search.."
                                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                            />
                        </label>
                    </div>
                </section>

                {viewMode === 'list' ? (
                    <MachineListView
                        machines={filteredMachines}
                        onEdit={openEdit}
                        onDelete={deleteMachine}
                    />
                ) : (
                    <MachineCardView
                        machines={filteredMachines}
                        onEdit={openEdit}
                        onDelete={deleteMachine}
                    />
                )}
            </div>

            {modalMode && (
                <MachineModal
                    mode={modalMode}
                    machine={selectedMachine}
                    storeUrl={storeUrl}
                    updateBaseUrl={updateBaseUrl}
                    onClose={closeModal}
                    onLocalSave={upsertLocalMachine}
                />
            )}
        </>
    );
}

function MachineListView({
    machines,
    onEdit,
    onDelete,
}: {
    machines: Machine[];
    onEdit: (machine: Machine) => void;
    onDelete: (machine: Machine) => void;
}) {
    return (
        <section className="mt-4 rounded-[22px] bg-white p-3 shadow-sm">
            <div className="overflow-x-auto rounded-xl border border-gray-300">
                <table className="min-w-[1050px] w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="bg-black text-white">
                            <th className="w-[110px] px-3 py-3" />
                            <th className="px-3 py-3 font-bold">
                                Nama Item &amp; Kode Item
                            </th>
                            <th className="px-3 py-3 font-bold">Lokasi</th>
                            <th className="px-3 py-3 font-bold">Departemen</th>
                            <th className="px-3 py-3 font-bold">Status</th>
                            <th className="min-w-[130px] px-3 py-3 text-center font-bold">
                                Aksi
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {machines.map((machine) => (
                            <tr
                                key={machine.id}
                                className="border-b border-gray-300 bg-white last:border-b-0 hover:bg-gray-50"
                            >
                                <td className="px-3 py-2">
                                    <div className="h-[62px] w-[95px] overflow-hidden bg-gray-100">
                                        {machine.image ? (
                                            <img
                                                src={machine.image}
                                                alt={machine.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                <Wrench size={23} />
                                            </div>
                                        )}
                                    </div>
                                </td>

                                <td className="px-3 py-2 text-gray-900">
                                    <div className="font-bold">
                                        {machine.code}
                                    </div>
                                    <div>{machine.name}</div>
                                    <div>({machine.model || '-'})</div>
                                </td>

                                <td className="px-3 py-2 text-gray-900">
                                    {machine.location}
                                </td>

                                <td className="px-3 py-2 text-gray-900">
                                    {machine.department}
                                </td>

                                <td className="px-3 py-2">
                                    <span
                                        className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${
                                            machine.status === 'Aktif'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}
                                    >
                                        ● {machine.status}
                                    </span>
                                </td>

                                <td className="px-3 py-2">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(machine)}
                                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4f86f7] text-white transition hover:bg-blue-600"
                                        >
                                            <Pencil size={19} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                onDelete(machine)
                                            }
                                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dc2f2f] text-white transition hover:bg-red-700"
                                        >
                                            <Trash2 size={19} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {machines.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-10 text-center text-gray-400"
                                >
                                    Tidak ada mesin yang sesuai dengan filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function MachineCardView({
    machines,
    onEdit,
    onDelete,
}: {
    machines: Machine[];
    onEdit: (machine: Machine) => void;
    onDelete: (machine: Machine) => void;
}) {
    return (
        <section className="mt-4 rounded-[22px] bg-white p-4 shadow-sm">
            {machines.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {machines.map((machine) => (
                        <article
                            key={machine.id}
                            className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm"
                        >
                            <div className="h-[145px] bg-gray-100">
                                {machine.image ? (
                                    <img
                                        src={machine.image}
                                        alt={machine.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                        <Wrench size={34} />
                                    </div>
                                )}
                            </div>

                            <div className="p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="text-base font-extrabold text-gray-900">
                                            {machine.code}
                                        </div>
                                        <div className="text-base leading-tight text-gray-900">
                                            {machine.name}
                                        </div>
                                        <div className="text-base leading-tight text-gray-900">
                                            ({machine.model || '-'})
                                        </div>
                                    </div>

                                    <span
                                        className={`shrink-0 rounded-md px-2 py-1 text-xs ${
                                            machine.status === 'Aktif'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}
                                    >
                                        ●{' '}
                                        {machine.status === 'Aktif'
                                            ? 'Normal'
                                            : 'Tidak Aktif'}
                                    </span>
                                </div>

                                <div className="my-2 border-t border-gray-300" />

                                <div className="space-y-1 text-sm text-gray-900">
                                    <div className="flex items-start gap-2">
                                        <MapPin
                                            size={15}
                                            className="mt-0.5 shrink-0"
                                        />
                                        <span>{machine.location}</span>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <Building2
                                            size={15}
                                            className="mt-0.5 shrink-0"
                                        />
                                        <span>{machine.department}</span>
                                    </div>
                                </div>

                                <div className="my-2 border-t border-gray-300" />

                                <div className="flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onDelete(machine)
                                        }
                                        className="min-w-[90px] rounded-lg bg-[#dc2f2f] px-4 py-2 font-medium text-white hover:bg-red-700"
                                    >
                                        Delete
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onEdit(machine)}
                                        className="min-w-[90px] rounded-lg bg-[#4f86f7] px-4 py-2 font-medium text-white hover:bg-blue-600"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="py-10 text-center text-gray-400">
                    Tidak ada mesin yang sesuai dengan filter.
                </div>
            )}
        </section>
    );
}

type SpecRow = {
    key: string;
    value: string;
};

function MachineModal({
    mode,
    machine,
    storeUrl,
    updateBaseUrl,
    onClose,
    onLocalSave,
}: {
    mode: 'create' | 'edit';
    machine: Machine | null;
    storeUrl?: string;
    updateBaseUrl?: string;
    onClose: () => void;
    onLocalSave: (machine: Machine) => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(
        machine?.image ?? null,
    );

    const [specRows, setSpecRows] = useState<SpecRow[]>(() => {
        if (!machine?.specifications?.length) {
            return [{ key: '', value: '' }];
        }

        return machine.specifications.map((spec) => {
            const [key, ...rest] = spec.split(':');

            return {
                key: key?.trim() ?? '',
                value: rest.join(':').trim(),
            };
        });
    });

    const form = useForm({
        code: machine?.code ?? '',
        name: machine?.name ?? '',
        brand: machine?.brand ?? '',
        model: machine?.model ?? '',
        location: machine?.location ?? '',
        department: machine?.department ?? '',
        voltage: machine?.voltage ?? '',
        purchase_price: machine?.purchase_price ?? '',
        start_date: machine?.start_date ?? '',
        photo: null as File | null,
        specifications: machine?.specifications ?? [],
    });

    const addSpecRow = () => {
        setSpecRows((current) => [...current, { key: '', value: '' }]);
    };

    const removeSpecRow = (index: number) => {
        setSpecRows((current) => {
            if (current.length === 1) {
                return [{ key: '', value: '' }];
            }

            return current.filter((_, rowIndex) => rowIndex !== index);
        });
    };

    const updateSpecRow = (
        index: number,
        field: keyof SpecRow,
        value: string,
    ) => {
        setSpecRows((current) =>
            current.map((row, rowIndex) =>
                rowIndex === index
                    ? { ...row, [field]: value }
                    : row,
            ),
        );
    };

    const choosePhoto = (file?: File | null) => {
        if (!file) return;

        form.setData('photo', file);
        setPreview(URL.createObjectURL(file));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const specifications = specRows
            .map((row) =>
                row.key.trim()
                    ? `${row.key.trim()}${row.value.trim() ? `: ${row.value.trim()}` : ''}`
                    : '',
            )
            .filter(Boolean);

        if (mode === 'create' && storeUrl) {
            form.transform((data) => ({
                ...data,
                specifications,
            }));

            form.post(storeUrl, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: onClose,
            });
            return;
        }

        if (mode === 'edit' && machine && updateBaseUrl) {
            router.post(
                `${updateBaseUrl}/${machine.id}`,
                {
                    _method: 'put',
                    ...form.data,
                    specifications,
                },
                {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: onClose,
                },
            );
            return;
        }

        onLocalSave({
            id: machine?.id ?? Date.now(),
            code: form.data.code || 'AUTO',
            name: form.data.name || 'Mesin Baru',
            model: form.data.model,
            brand: form.data.brand,
            location: form.data.location || '-',
            department: form.data.department || '-',
            status: machine?.status ?? 'Aktif',
            voltage: form.data.voltage,
            purchase_price: form.data.purchase_price,
            start_date: form.data.start_date,
            image: preview,
            specifications,
        });

        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(event) => {
                if (event.currentTarget === event.target) onClose();
            }}
        >
            <form
                onSubmit={submit}
                className="max-h-[95vh] w-full max-w-[980px] overflow-y-auto rounded-[18px] bg-white shadow-2xl"
            >
                <div className="flex h-[50px] items-center justify-between bg-black px-5 text-white">
                    <div className="flex items-center gap-2">
                        <Wrench size={17} />
                        <span className="font-semibold">Detail Mesin</span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10"
                    >
                        <X size={17} />
                    </button>
                </div>

                <div className="p-5">
                    <div className="grid gap-3 md:grid-cols-2">
                        <Field label="Kode Mesin">
                            <input
                                value={form.data.code}
                                onChange={(event) =>
                                    form.setData('code', event.target.value)
                                }
                                placeholder="Auto Generated"
                                className="h-11 w-full rounded-lg border border-[#8b8b8b] bg-white px-3 text-sm outline-none focus:border-green-600 text-bold text-gray-800 placeholder:text-gray-400"
                            />
                        </Field>

                        <Field label="Produsen / Merk">
                            <input
                                value={form.data.brand}
                                onChange={(event) =>
                                    form.setData('brand', event.target.value)
                                }
                                placeholder="Produsen / Merk..."
                                className="h-11 w-full rounded-lg border border-[#8b8b8b] bg-white px-3 text-sm outline-none focus:border-green-600 text-bold text-gray-800 placeholder:text-gray-400"
                            />
                        </Field>

                        <Field label="Lokasi">
                            <select
                                value={form.data.location}
                                onChange={(event) =>
                                    form.setData(
                                        'location',
                                        event.target.value,
                                    )
                                }
                                className="h-11 w-full rounded-lg border border-[#8b8b8b] bg-white px-3 text-sm outline-none focus:border-green-600 text-bold text-gray-800 placeholder:text-gray-400"
                            >
                                <option value="" className="text-gray-500">
                                    -- Pilih Lokasi --
                                </option>
                                {locations.map((location) => (
                                    <option
                                        key={location}
                                        value={location}
                                    >
                                        {location}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Departemen">
                            <select
                                value={form.data.department}
                                onChange={(event) =>
                                    form.setData(
                                        'department',
                                        event.target.value,
                                    )
                                }
                                className="h-11 w-full rounded-lg border border-[#8b8b8b] bg-white px-3 text-sm outline-none focus:border-green-600 text-bold text-gray-800 placeholder:text-gray-400"
                            >
                                <option value="" className="text-gray-500">
                                    -- Pilih Departemen --
                                </option>
                                {departments.map((department) => (
                                    <option
                                        key={department}
                                        value={department}
                                        className="text-gray-800"
                                    >
                                        {department}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <Field label="Harga Beli">
                            <input
                                value={form.data.purchase_price}
                                onChange={(event) =>
                                    form.setData(
                                        'purchase_price',
                                        event.target.value,
                                    )
                                }
                                placeholder="Harga Beli..."
                                className="h-11 w-full rounded-lg border border-[#8b8b8b] bg-white px-3 text-sm outline-none focus:border-green-600 text-bold text-gray-800 placeholder:text-gray-400"
                            />
                        </Field>

                        <Field label="Mulai beroperasi">
                            <input
                                type="date"
                                value={form.data.start_date}
                                onChange={(event) =>
                                    form.setData(
                                        'start_date',
                                        event.target.value,
                                    )
                                }
                                className="h-11 w-full rounded-lg border border-[#8b8b8b] bg-white px-3 text-sm outline-none focus:border-green-600 text-bold text-gray-800 placeholder:text-gray-400"
                            />
                        </Field>
                    </div>

                    <div className="mt-3">
                        <label className="mb-1 block text-sm font-medium text-gray-800">
                            Spesifikasi Teknis
                        </label>

                        <div className="space-y-2">
                            {specRows.map((row, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col gap-2 md:flex-row md:items-center"
                                >
                                    <input
                                        value={row.key}
                                        onChange={(event) =>
                                            updateSpecRow(
                                                index,
                                                'key',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Parameter (Misal: Tegangan, Ukuran, dll)..."
                                        className="h-11 flex-1 rounded-lg border border-[#8b8b8b] px-3 text-sm outline-none focus:border-green-600 text-bold text-gray-800 placeholder:text-gray-400"
                                    />

                                    <input
                                        value={row.value}
                                        onChange={(event) =>
                                            updateSpecRow(
                                                index,
                                                'value',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Spesifikasi..."
                                        className="h-11 flex-1 rounded-lg border border-[#8b8b8b] px-3 text-sm outline-none focus:border-green-600 text-bold text-gray-800 placeholder:text-gray-400"
                                    />

                                    <button
                                        type="button"
                                        onClick={addSpecRow}
                                        className="h-11 rounded-lg bg-[#4f86f7] px-4 text-sm font-semibold text-white hover:bg-blue-600 md:w-[90px]"
                                    >
                                        Tambah
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => removeSpecRow(index)}
                                        className="ml-auto flex h-11 w-11 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100"
                                        aria-label="Hapus spesifikasi"
                                        title="Hapus"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-3">
                        <label className="mb-1 block text-sm font-medium text-gray-800">
                            Foto Mesin
                        </label>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) =>
                                choosePhoto(
                                    event.target.files?.[0] ?? null,
                                )
                            }
                        />

                        <button
                            type="button"
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                            className="flex min-h-[120px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-[#8b8b8b] bg-white px-3 py-3 text-center transition hover:bg-gray-50"
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview mesin"
                                    className="h-[160px] w-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center">
                                    <Upload
                                        size={38}
                                        strokeWidth={2.5}
                                        className="text-gray-500"
                                    />
                                    <span className="mt-2 text-sm text-gray-500">
                                        Klik untuk upload foto mesin
                                    </span>
                                </div>
                            )}
                        </button>
                    </div>

                    <div className="mt-5 flex justify-end">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="min-w-[120px] rounded-lg bg-[#2faa32] px-5 py-3 font-semibold text-white transition hover:bg-[#249428] disabled:opacity-50"
                        >
                            {form.processing
                                ? 'Menyimpan...'
                                : 'Simpan'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
                {label}
            </label>
            {children}
        </div>
    );
}
