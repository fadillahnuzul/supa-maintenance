import { Head, router, useForm } from '@inertiajs/react';
import {
    Building2,
    ChevronDown,
    MapPin,
    Pencil,
    Plus,
    Save,
    Settings2,
    Trash2,
    X,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type SettingMenu = 'Departemen' | 'Lokasi';

type Department = {
    id: number;
    name: string;
};

type Location = {
    id: number;
    name: string;
};

type Props = {
    departments?: Department[];
    locations?: Location[];

    departmentStoreUrl?: string;
    departmentUpdateBaseUrl?: string;
    departmentDeleteBaseUrl?: string;

    locationStoreUrl?: string;
    locationUpdateBaseUrl?: string;
    locationDeleteBaseUrl?: string;
};

const dummyDepartments: Department[] = [
    { id: 1, name: 'Produksi Bubuk' },
    { id: 2, name: 'Blending & Mixing' },
    { id: 3, name: 'Quality Control' },
    { id: 4, name: 'Packaging & Sachet' },
    { id: 5, name: 'Utility & Facility' },
];

const dummyLocations: Location[] = [
    { id: 1, name: 'Gedung A' },
    { id: 2, name: 'Gedung B' },
    { id: 3, name: 'Gudang A2' },
    { id: 4, name: 'Gudang A3' },
    { id: 5, name: 'Area Packing Sachet' },
];

export default function OtherSettings({
    departments = dummyDepartments,
    locations = dummyLocations,
    departmentStoreUrl,
    departmentUpdateBaseUrl,
    departmentDeleteBaseUrl,
    locationStoreUrl,
    locationUpdateBaseUrl,
    locationDeleteBaseUrl,
}: Props) {
    const [selectedMenu, setSelectedMenu] = useState<SettingMenu>('Departemen');
    const [localDepartments, setLocalDepartments] = useState<Department[]>(departments);
    const [localLocations, setLocalLocations] = useState<Location[]>(locations);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');

    const departmentForm = useForm({ name: '' });
    const locationForm = useForm({ name: '' });

    const isDepartment = selectedMenu === 'Departemen';

    const currentItems = useMemo(
        () => (isDepartment ? localDepartments : localLocations),
        [isDepartment, localDepartments, localLocations],
    );

    const currentForm = isDepartment ? departmentForm : locationForm;

    const resetEditing = () => {
        setEditingId(null);
        setEditingName('');
    };

    const handleMenuChange = (value: SettingMenu) => {
        setSelectedMenu(value);
        resetEditing();
        departmentForm.reset();
        departmentForm.clearErrors();
        locationForm.reset();
        locationForm.clearErrors();
    };

    const addItem = (event: FormEvent) => {
        event.preventDefault();

        const name = currentForm.data.name.trim();
        if (!name) return;

        const storeUrl = isDepartment ? departmentStoreUrl : locationStoreUrl;

        if (storeUrl) {
            currentForm.post(storeUrl, {
                preserveScroll: true,
                onSuccess: () => currentForm.reset(),
            });
            return;
        }

        if (isDepartment) {
            setLocalDepartments((current) => [
                ...current,
                { id: Date.now(), name },
            ]);
        } else {
            setLocalLocations((current) => [
                ...current,
                { id: Date.now(), name },
            ]);
        }

        currentForm.reset();
    };

    const startEdit = (id: number, name: string) => {
        setEditingId(id);
        setEditingName(name);
    };

    const cancelEdit = () => resetEditing();

    const saveEdit = (id: number) => {
        const name = editingName.trim();
        if (!name) return;

        const updateBaseUrl = isDepartment
            ? departmentUpdateBaseUrl
            : locationUpdateBaseUrl;

        if (updateBaseUrl) {
            router.put(`${updateBaseUrl}/${id}`, { name }, {
                preserveScroll: true,
                onSuccess: () => resetEditing(),
            });
            return;
        }

        if (isDepartment) {
            setLocalDepartments((current) =>
                current.map((item) =>
                    item.id === id ? { ...item, name } : item,
                ),
            );
        } else {
            setLocalLocations((current) =>
                current.map((item) =>
                    item.id === id ? { ...item, name } : item,
                ),
            );
        }

        resetEditing();
    };

    const deleteItem = (id: number) => {
        const item = currentItems.find((row) => row.id === id);

        if (!window.confirm(`Hapus ${selectedMenu.toLowerCase()} "${item?.name ?? ''}"?`)) {
            return;
        }

        const deleteBaseUrl = isDepartment
            ? departmentDeleteBaseUrl
            : locationDeleteBaseUrl;

        if (deleteBaseUrl) {
            router.delete(`${deleteBaseUrl}/${id}`, {
                preserveScroll: true,
            });
            return;
        }

        if (isDepartment) {
            setLocalDepartments((current) =>
                current.filter((row) => row.id !== id),
            );
        } else {
            setLocalLocations((current) =>
                current.filter((row) => row.id !== id),
            );
        }

        if (editingId === id) {
            resetEditing();
        }
    };

    return (
        <>
            <Head title="Pengaturan Lainnya" />

            <div className="mx-auto w-full px-3 pb-8">
                <section className="min-h-[540px] rounded-[22px] bg-white px-5 pt-4 pb-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Settings2 size={22} className="text-gray-700" />
                            <h1 className="text-[22px] font-extrabold text-[#111827]">
                                Pengaturan Lainnya
                            </h1>
                        </div>

                        <div className="relative">
                            <select
                                value={selectedMenu}
                                onChange={(event) =>
                                    handleMenuChange(event.target.value as SettingMenu)
                                }
                                className="h-[48px] min-w-[185px] appearance-none rounded-xl border border-[#8b8b8b] bg-white px-4 pr-12 text-base text-gray-700 outline-none transition focus:border-green-600"
                            >
                                <option value="Departemen">Departemen</option>
                                <option value="Lokasi">Lokasi</option>
                            </select>

                            <ChevronDown
                                size={22}
                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                            />
                        </div>
                    </div>

                    <div className="mx-auto mt-7 w-full max-w-[720px] overflow-hidden rounded-[18px] border border-gray-300 bg-white shadow-sm">
                        <div className="flex h-[46px] items-center gap-2 bg-black px-5 text-white">
                            {isDepartment ? <Building2 size={20} /> : <MapPin size={20} />}
                            <h2 className="text-lg font-semibold">
                                Daftar {selectedMenu}
                            </h2>
                        </div>

                        <div className="p-5">
                            <form
                                onSubmit={addItem}
                                className="flex gap-2 border-b border-gray-700 pb-3"
                            >
                                <input
                                    type="text"
                                    value={currentForm.data.name}
                                    onChange={(event) =>
                                        currentForm.setData('name', event.target.value)
                                    }
                                    placeholder={`Nama ${selectedMenu}..`}
                                    className="h-[52px] min-w-0 flex-1 rounded-xl border border-[#8b8b8b] bg-white px-4 text-base text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-600"
                                />

                                <button
                                    type="submit"
                                    disabled={currentForm.processing}
                                    className="flex h-[52px] min-w-[115px] items-center justify-center gap-2 rounded-xl bg-[#10b53b] px-5 font-semibold text-white transition hover:bg-[#0e9f35] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Plus size={18} />
                                    Tambah
                                </button>
                            </form>

                            {currentForm.errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {currentForm.errors.name}
                                </p>
                            )}

                            <div className="mt-2 space-y-2">
                                {currentItems.map((item) => {
                                    const editing = editingId === item.id;

                                    return (
                                        <div
                                            key={`${selectedMenu}-${item.id}`}
                                            className="flex min-h-[56px] items-center gap-3 rounded-xl border border-[#8b8b8b] bg-white px-4 py-2"
                                        >
                                            <div className="min-w-0 flex-1">
                                                {editing ? (
                                                    <input
                                                        type="text"
                                                        value={editingName}
                                                        onChange={(event) =>
                                                            setEditingName(event.target.value)
                                                        }
                                                        autoFocus
                                                        onKeyDown={(event) => {
                                                            if (event.key === 'Enter') {
                                                                event.preventDefault();
                                                                saveEdit(item.id);
                                                            }

                                                            if (event.key === 'Escape') {
                                                                cancelEdit();
                                                            }
                                                        }}
                                                        className="h-10 w-full rounded-lg border border-green-500 bg-[#f9fafb] px-3 text-base font-medium text-gray-900 outline-none ring-1 ring-green-100"
                                                    />
                                                ) : (
                                                    <span className="block truncate text-base font-medium text-gray-900">
                                                        {item.name}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex shrink-0 items-center gap-2">
                                                {editing ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => saveEdit(item.id)}
                                                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10b53b] text-white transition hover:bg-[#0e9f35]"
                                                            title="Simpan"
                                                        >
                                                            <Save size={19} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={cancelEdit}
                                                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-500 text-white transition hover:bg-gray-600"
                                                            title="Batal"
                                                        >
                                                            <X size={19} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => startEdit(item.id, item.name)}
                                                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4f86f7] text-white transition hover:bg-blue-600"
                                                            title={`Edit ${selectedMenu}`}
                                                        >
                                                            <Pencil size={19} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => deleteItem(item.id)}
                                                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dc2f2f] text-white transition hover:bg-red-700"
                                                            title={`Hapus ${selectedMenu}`}
                                                        >
                                                            <Trash2 size={19} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {currentItems.length === 0 && (
                                    <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-400">
                                        Belum ada data {selectedMenu.toLowerCase()}.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
