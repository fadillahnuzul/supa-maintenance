import { Head, Link, router } from '@inertiajs/react';
import {
    Grid2X2,
    List,
    MapPin,
    Pencil,
    Plus,
    Printer,
    Search,
    Trash2,
    Wrench,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type Location = {
    id: number;
    name: string;
    is_active: boolean;
};

type Specification = {
    id: number;
    machine_id: number;
    spec_name: string;
    spec_value: string;
};

type Material = {
    id: number;
    name: string;
    name_indonesian: string;
};

type MachineStatus =
    | 'Active'
    | 'Maintenance'
    | 'Inactive';

const machineStatuses: {
    value: MachineStatus;
    label: string;
}[] = [
    {
        value: 'Active',
        label: 'Aktif',
    },
    {
        value: 'Maintenance',
        label: 'Maintenance',
    },
    {
        value: 'Inactive',
        label: 'Rusak / Tidak Aktif',
    },
];

type Machine = {
    id: number;
    code: string;
    name: string;

    location_id?: number | null;
    location?: Location | null;

    specifications?: Specification[];
    materials?: Material[];

    status: MachineStatus;

    purchase_price?: string | null;
    start_date?: string | null;

    photo_url?: string | null;
    nameplate_url?: string | null;
};

type Props = {
    machines: Machine[];
    locations: Location[];
};

export default function MachineIndex({
    machines,
    locations,
}: Props) {
    const [viewMode, setViewMode] =
        useState<'list' | 'card'>('list');

    const [locationFilter, setLocationFilter] =
        useState('');

    const [statusFilter, setStatusFilter] =
        useState<MachineStatus | ''>('');

    const [search, setSearch] =
        useState('');

    const filteredMachines = useMemo(() => {
        return machines.filter((machine) => {
            const matchesLocation =
                !locationFilter ||
                machine.location?.name ===
                    locationFilter;

            const matchesStatus =
                !statusFilter ||
                machine.status === statusFilter;

            const term =
                search.trim().toLowerCase();

            const matchesSearch =
                !term ||
                [
                    machine.code,
                    machine.name,
                    machine.location?.name,
                    machine.status,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()
                    .includes(term);

            return (
                matchesLocation &&
                matchesStatus &&
                matchesSearch
            );
        });
    }, [
        machines,
        locationFilter,
        statusFilter,
        search,
    ]);

    const deleteMachine = (
        machine: Machine,
    ) => {
        const confirmed =
            window.confirm(
                `Hapus mesin "${machine.name}"?`,
            );

        if (!confirmed) {
            return;
        }

        router.delete(
            `/machines/${machine.id}`,
            {
                preserveScroll: true,
            },
        );
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
                                    setViewMode(
                                        (
                                            current,
                                        ) =>
                                            current ===
                                            'list'
                                                ? 'card'
                                                : 'list',
                                    )
                                }
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#8b8b8b] bg-white text-gray-600 transition hover:bg-gray-50"
                                title={
                                    viewMode ===
                                    'list'
                                        ? 'Tampilkan mode card'
                                        : 'Tampilkan mode list'
                                }
                            >
                                {viewMode ===
                                'list' ? (
                                    <Grid2X2
                                        size={
                                            22
                                        }
                                    />
                                ) : (
                                    <List
                                        size={
                                            22
                                        }
                                    />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    window.print()
                                }
                                className="flex h-11 items-center gap-2 rounded-xl bg-[#4f86f7] px-4 font-semibold text-white transition hover:bg-blue-600"
                            >
                                <Printer
                                    size={
                                        18
                                    }
                                />

                                <span>
                                    Print Laporan
                                </span>
                            </button>

                            <Link
                                href="/machines/create"
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2faa32] px-4 font-semibold text-white transition hover:bg-[#249428]"
                            >
                                <Plus
                                    size={
                                        18
                                    }
                                />

                                <span>
                                    Tambah Mesin
                                </span>
                            </Link>
                        </div>
                    </div>

                    <div className="mb-2 flex flex-wrap justify-end gap-2">
                        <select
                            value={
                                locationFilter
                            }
                            onChange={(
                                event,
                            ) =>
                                setLocationFilter(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            className="h-11 min-w-[200px] rounded-xl border border-[#8b8b8b] bg-white px-4 text-sm text-gray-700 outline-none"
                        >
                            <option value="">
                                == Semua
                                Lokasi ==
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
                                            location.name
                                        }
                                    >
                                        {
                                            location.name
                                        }
                                    </option>
                                ),
                            )}
                        </select>

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(
                                event,
                            ) =>
                                setStatusFilter(
                                    event
                                        .target
                                        .value as
                                        | MachineStatus
                                        | '',
                                )
                            }
                            className="h-11 min-w-[165px] rounded-xl border border-[#8b8b8b] bg-white px-4 text-sm text-gray-700 outline-none"
                        >
                            <option value="">
                                == Semua
                                Status ==
                            </option>

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

                        <label className="flex h-11 min-w-[250px] items-center gap-2 rounded-xl border border-[#8b8b8b] bg-white px-3">
                            <Search
                                size={18}
                                className="text-gray-500"
                            />

                            <input
                                value={
                                    search
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Search..."
                                className="w-full bg-transparent text-sm text-gray-600 outline-none placeholder:text-gray-400"
                            />
                        </label>
                    </div>
                </section>

                {viewMode ===
                'list' ? (
                    <MachineListView
                        machines={
                            filteredMachines
                        }
                        onDelete={
                            deleteMachine
                        }
                    />
                ) : (
                    <MachineCardView
                        machines={
                            filteredMachines
                        }
                        onDelete={
                            deleteMachine
                        }
                    />
                )}
            </div>
        </>
    );
}

function MachineListView({
    machines,
    onDelete,
}: {
    machines: Machine[];
    onDelete: (
        machine: Machine,
    ) => void;
}) {
    return (
        <section className="mt-4 rounded-[22px] bg-white p-3 shadow-sm">
            <div className="overflow-x-auto rounded-xl border border-gray-300">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                    <thead>
                        <tr className="bg-black text-white">
                            <th className="w-[110px] px-3 py-3" />

                            <th className="px-3 py-3 font-bold">
                                Nama Item &amp;
                                Kode Item
                            </th>

                            <th className="px-3 py-3 font-bold">
                                Lokasi
                            </th>

                            <th className="px-3 py-3 font-bold">
                                Status
                            </th>

                            <th className="min-w-[130px] px-3 py-3 text-center font-bold">
                                Aksi
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {machines.map(
                            (
                                machine,
                            ) => (
                                <tr
                                    key={
                                        machine.id
                                    }
                                    className="border-b border-gray-300 bg-white last:border-b-0 hover:bg-gray-50"
                                >
                                    <td className="px-3 py-2">
                                        <MachineImage
                                            machine={
                                                machine
                                            }
                                            className="h-[62px] w-[95px]"
                                        />
                                    </td>

                                    <td className="px-3 py-2 text-gray-900">
                                        <div className="font-bold">
                                            {
                                                machine.code
                                            }
                                        </div>

                                        <div>
                                            {
                                                machine.name
                                            }
                                        </div>
                                    </td>

                                    <td className="px-3 py-2 text-gray-900">
                                        {machine
                                            .location
                                            ?.name ??
                                            '-'}
                                    </td>

                                    <td className="px-3 py-2">
                                        <StatusBadge
                                            status={
                                                machine.status
                                            }
                                        />
                                    </td>

                                    <td className="px-3 py-2">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link
                                                href={`/machines/${machine.id}/edit`}
                                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4f86f7] text-white transition hover:bg-blue-600"
                                                title="Edit Mesin"
                                            >
                                                <Pencil
                                                    size={
                                                        19
                                                    }
                                                />
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onDelete(
                                                        machine,
                                                    )
                                                }
                                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dc2f2f] text-white transition hover:bg-red-700"
                                                title="Hapus Mesin"
                                            >
                                                <Trash2
                                                    size={
                                                        19
                                                    }
                                                />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ),
                        )}

                        {machines.length ===
                            0 && (
                            <tr>
                                <td
                                    colSpan={
                                        5
                                    }
                                    className="px-4 py-6 text-center text-gray-400"
                                >
                                    Tidak
                                    ada
                                    mesin
                                    yang
                                    sesuai
                                    dengan
                                    filter.
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
    onDelete,
}: {
    machines: Machine[];
    onDelete: (
        machine: Machine,
    ) => void;
}) {
    return (
        <section className="mt-4 rounded-[22px] bg-white p-4 shadow-sm">
            {machines.length >
            0 ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {machines.map(
                        (
                            machine,
                        ) => (
                            <article
                                key={
                                    machine.id
                                }
                                className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm"
                            >
                                <MachineImage
                                    machine={
                                        machine
                                    }
                                    className="h-[145px] w-full"
                                />

                                <div className="p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="text-base font-extrabold text-gray-900">
                                                {
                                                    machine.code
                                                }
                                            </div>

                                            <div className="text-base leading-tight text-gray-900">
                                                {
                                                    machine.name
                                                }
                                            </div>
                                        </div>

                                        <StatusBadge
                                            status={
                                                machine.status
                                            }
                                        />
                                    </div>

                                    <div className="my-3 border-t border-gray-300" />

                                    <div className="flex items-start gap-2 text-sm text-gray-900">
                                        <MapPin
                                            size={
                                                15
                                            }
                                            className="mt-0.5 shrink-0"
                                        />

                                        <span>
                                            {machine
                                                .location
                                                ?.name ??
                                                '-'}
                                        </span>
                                    </div>

                                    <div className="my-3 border-t border-gray-300" />

                                    <div className="flex items-center justify-between gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onDelete(
                                                    machine,
                                                )
                                            }
                                            className="min-w-[90px] rounded-lg bg-[#dc2f2f] px-4 py-2 font-medium text-white hover:bg-red-700"
                                        >
                                            Delete
                                        </button>

                                        <Link
                                            href={`/machines/${machine.id}/edit`}
                                            className="min-w-[90px] rounded-lg bg-[#4f86f7] px-4 py-2 text-center font-medium text-white hover:bg-blue-600"
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ),
                    )}
                </div>
            ) : (
                <div className="py-6 text-center text-gray-400">
                    Tidak ada
                    mesin yang
                    sesuai dengan
                    filter.
                </div>
            )}
        </section>
    );
}

function MachineImage({
    machine,
    className,
}: {
    machine: Machine;
    className: string;
}) {
    return (
        <div
            className={`${className} overflow-hidden bg-gray-100`}
        >
            {machine.photo_url ? (
                <img
                    src={
                        machine.photo_url
                    }
                    alt={
                        machine.name
                    }
                    className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <Wrench
                        size={
                            26
                        }
                    />
                </div>
            )}
        </div>
    );
}

function StatusBadge({
    status,
}: {
    status: MachineStatus;
}) {
    const label =
        machineStatuses.find(
            (item) =>
                item.value ===
                status,
        )?.label ?? status;

    const className =
        status === 'Active'
            ? 'bg-green-100 text-green-700'
            : status ===
                'Maintenance'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700';

    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${className}`}
        >
            ● {label}
        </span>
    );
}