import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Plus,
    Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type TicketPriority = 'Darurat' | 'Standar';
type TicketStatus =
    | 'Pending Approval'
    | 'Assigned'
    | 'In Progress'
    | 'Waiting Sparepart'
    | 'Completed'
    | 'Rejected';

type Ticket = {
    id: number;
    code: string;
    category: string;
    description: string;
    technician: string;
    priority: TicketPriority;
    status: TicketStatus;
    created_at: string;
    estimated_cost?: number;
};

const statusColors = {
    'Pending Approval': 'bg-[#fef3c7] text-[#b45309]',
    Rejected: 'bg-[#fee2e2] text-[#b91c1c]',
    Assigned: 'bg-[#e0f2fe] text-[#0369a1]',
    'In Progress': 'bg-[#fef3c7] text-[#a16207]',
    'Waiting Sparepart': 'bg-[#fef3c7] text-[#a16207]',
    Completed: 'bg-[#dcfce7] text-[#166534]',
} as const;

type Machine = {
    id: number;
    name: string;
    status: 'Baik' | 'Maintenance' | 'Rusak/Tidak Aktif';
    created_at: string;
};

type Sparepart = {
    id: number;
    name: string;
    stock: number;
    minimum: number;
    unit: string;
    created_at: string;
};

const dummyTickets: Ticket[] = [
    {
        id: 1,
        code: 'TKT-260803-4054',
        category: 'Mesin',
        description: 'Mesin rusak',
        technician: 'Budi',
        priority: 'Darurat',
        status: 'Assigned',
        created_at: '2026-08-03',
        estimated_cost: 1450000,
    },
    {
        id: 2,
        code: 'TKT-260803-4055',
        category: 'Mesin',
        description: 'Bearing panas',
        technician: 'Budi',
        priority: 'Standar',
        status: 'Assigned',
        created_at: '2026-08-03',
        estimated_cost: 750000,
    },
    {
        id: 3,
        code: 'TKT-260804-4056',
        category: 'Kelistrikan',
        description: 'Panel tidak menyala',
        technician: 'Rina',
        priority: 'Darurat',
        status: 'In Progress',
        created_at: '2026-08-04',
        estimated_cost: 1250000,
    },
    {
        id: 4,
        code: 'TKT-260804-4057',
        category: 'Pemeliharaan',
        description: 'Pengecekan rutin mesin',
        technician: 'Budi',
        priority: 'Standar',
        status: 'Completed',
        created_at: '2026-08-04',
        estimated_cost: 350000,
    },
    {
        id: 5,
        code: 'TKT-260805-4058',
        category: 'Preventif',
        description: 'Preventive maintenance',
        technician: 'Rina',
        priority: 'Darurat',
        status: 'In Progress',
        created_at: '2026-08-05',
        estimated_cost: 980000,
    },
    {
        id: 6,
        code: 'TKT-260805-4059',
        category: 'Lainnya',
        description: 'Perbaikan pintu',
        technician: 'Budi',
        priority: 'Standar',
        status: 'Pending Approval',
        created_at: '2026-08-05',
        estimated_cost: 250000,
    },
    {
        id: 7,
        code: 'TKT-260806-4060',
        category: 'Mesin',
        description: 'Conveyor macet',
        technician: 'Rina',
        priority: 'Darurat',
        status: 'Waiting Sparepart',
        created_at: '2026-08-06',
        estimated_cost: 1150000,
    },
    {
        id: 8,
        code: 'TKT-260806-4061',
        category: 'Kelistrikan',
        description: 'Lampu area mati',
        technician: 'Budi',
        priority: 'Standar',
        status: 'Completed',
        created_at: '2026-08-06',
        estimated_cost: 175000,
    },
    {
        id: 9,
        code: 'TKT-260807-4062',
        category: 'Mesin',
        description: 'Motor berisik',
        technician: 'Budi',
        priority: 'Darurat',
        status: 'Assigned',
        created_at: '2026-08-07',
        estimated_cost: 1400000,
    },
    {
        id: 10,
        code: 'TKT-260807-4063',
        category: 'Preventif',
        description: 'Cek belt conveyor',
        technician: 'Rina',
        priority: 'Standar',
        status: 'Completed',
        created_at: '2026-08-07',
        estimated_cost: 550000,
    },
    {
        id: 11,
        code: 'TKT-260808-4064',
        category: 'Mesin',
        description: 'Screw feeder macet',
        technician: 'Budi',
        priority: 'Darurat',
        status: 'In Progress',
        created_at: '2026-08-08',
        estimated_cost: 850000,
    },
    {
        id: 12,
        code: 'TKT-260808-4065',
        category: 'Lainnya',
        description: 'Perbaikan rak',
        technician: 'Rina',
        priority: 'Standar',
        status: 'Completed',
        created_at: '2026-08-08',
        estimated_cost: 340000,
    },
];

const dummyMachines: Machine[] = [
    ...Array.from({ length: 20 }).map((_, index) => ({
        id: index + 1,
        name: `Mesin ${index + 1}`,
        status: 'Baik' as const,
        created_at: '2026-08-03',
    })),
    {
        id: 21,
        name: 'Mesin 21',
        status: 'Maintenance',
        created_at: '2026-08-04',
    },
    {
        id: 22,
        name: 'Mesin 22',
        status: 'Maintenance',
        created_at: '2026-08-06',
    },
    {
        id: 23,
        name: 'Mesin 23',
        status: 'Rusak/Tidak Aktif',
        created_at: '2026-08-07',
    },
];

const dummySpareparts: Sparepart[] = [
    {
        id: 1,
        name: 'Bearing 6205',
        stock: 2,
        minimum: 3,
        unit: 'pcs',
        created_at: '2026-08-03',
    },
    {
        id: 2,
        name: 'Belt Conveyor',
        stock: 2,
        minimum: 5,
        unit: 'pcs',
        created_at: '2026-08-04',
    },
    {
        id: 3,
        name: 'Heater Element',
        stock: 1,
        minimum: 3,
        unit: 'pcs',
        created_at: '2026-08-04',
    },
    {
        id: 4,
        name: 'Thermocouple Type K',
        stock: 2,
        minimum: 3,
        unit: 'pcs',
        created_at: '2026-08-05',
    },
    {
        id: 5,
        name: 'V-Belt A-32',
        stock: 2,
        minimum: 3,
        unit: 'pcs',
        created_at: '2026-08-06',
    },
    {
        id: 6,
        name: 'Bearing 6205',
        stock: 2,
        minimum: 3,
        unit: 'pcs',
        created_at: '2026-08-07',
    },
    {
        id: 7,
        name: 'Belt Conveyor',
        stock: 2,
        minimum: 5,
        unit: 'pcs',
        created_at: '2026-08-08',
    },
];

const categoryColors: Record<string, string> = {
    Mesin: '#2f73ff',
    Kelistrikan: '#2ea768',
    Pemeliharaan: '#f58a17',
    Preventif: '#7c3db9',
    Lainnya: '#9ca3af',
};

function withinRange(date: string, startDate: string, endDate: string) {
    return date >= startDate && date <= endDate;
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

export default function Dashboard() {
    const [startDate, setStartDate] = useState('2026-08-03');
    const [endDate, setEndDate] = useState('2026-08-08');
    const { auth } = usePage().props;

    const filteredTickets = useMemo(
        () =>
            dummyTickets.filter((ticket) =>
                withinRange(ticket.created_at, startDate, endDate),
            ),
        [startDate, endDate],
    );

    const filteredMachines = useMemo(
        () =>
            dummyMachines.filter((machine) =>
                withinRange(machine.created_at, startDate, endDate),
            ),
        [startDate, endDate],
    );

    const filteredSpareparts = useMemo(
        () =>
            dummySpareparts.filter((sparepart) =>
                withinRange(sparepart.created_at, startDate, endDate),
            ),
        [startDate, endDate],
    );

    const totalTickets = filteredTickets.length;

    const openTickets = filteredTickets.filter(
        (ticket) =>
            ticket.status !== 'Completed' &&
            ticket.status !== 'Rejected',
    ).length;

    const inProgressTickets = filteredTickets.filter(
        (ticket) =>
            ticket.status === 'In Progress' ||
            ticket.status === 'Assigned' ||
            ticket.status === 'Waiting Sparepart',
    ).length;

    const closedTickets = filteredTickets.filter(
        (ticket) => ticket.status === 'Completed',
    ).length;

    const priorityCounts = useMemo(() => {
        const standard = filteredTickets.filter(
            (ticket) => ticket.priority === 'Standar',
        ).length;
        const urgent = filteredTickets.filter(
            (ticket) => ticket.priority === 'Darurat',
        ).length;

        return { standard, urgent };
    }, [filteredTickets]);

    const categoryCounts = useMemo(() => {
        const result: Record<string, number> = {
            Mesin: 0,
            Kelistrikan: 0,
            Pemeliharaan: 0,
            Preventif: 0,
            Lainnya: 0,
        };

        filteredTickets.forEach((ticket) => {
            if (result[ticket.category] !== undefined) {
                result[ticket.category] += 1;
            } else {
                result.Lainnya += 1;
            }
        });

        return result;
    }, [filteredTickets]);

    const machineCounts = useMemo(() => {
        return {
            good: filteredMachines.filter((item) => item.status === 'Baik').length,
            maintenance: filteredMachines.filter(
                (item) => item.status === 'Maintenance',
            ).length,
            broken: filteredMachines.filter(
                (item) => item.status === 'Rusak/Tidak Aktif',
            ).length,
        };
    }, [filteredMachines]);

    const latestTickets = [...filteredTickets]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 7);

    const lowStockSpareparts = filteredSpareparts.filter(
        (item) => item.stock <= item.minimum,
    );

    const totalEstimatedCost = filteredTickets.reduce(
        (sum, ticket) => sum + (ticket.estimated_cost ?? 0),
        0,
    );

    return (
        <>
            <Head title="Dashboard" />

            <div className="mx-auto w-full px-3 pb-8">
                {/* HEADER + DATE FILTER */}
                <section className="mb-3">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-lg leading-none text-gray-700">
                                Good Morning,
                            </p>
                            <h1 className="text-[24px] font-extrabold leading-tight text-[#111827]">
                                {auth.user?.name}
                            </h1>
                            <p className="text-sm text-gray-600">
                                Today is a new chance to create something amazing.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <DateInput
                                value={startDate}
                                onChange={setStartDate}
                            />

                            <span className="text-sm text-gray-500">s/d</span>

                            <DateInput
                                value={endDate}
                                onChange={setEndDate}
                            />

                            <Link
                                href="/tickets/create"
                                className="flex h-[56px] items-center gap-3 rounded-xl bg-[#2faa32] px-5 text-lg font-semibold text-white shadow-sm transition hover:bg-[#249428]"
                            >
                                Buat Tiket Perbaikan
                                <PencilSquareIcon />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* STAT CARDS */}
                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Tiket"
                        value={totalTickets}
                        note="+2 Dari minggu lalu"
                        icon={<ClipboardList size={44} />}
                        accent="text-[#2faa32]"
                    />

                    <StatCard
                        title="Tiket Open"
                        value={openTickets}
                        note="+2 Dari minggu lalu"
                        icon={<AlertTriangle size={44} />}
                        accent="text-[#e4443d]"
                    />

                    <StatCard
                        title="Tiket In Progress"
                        value={inProgressTickets}
                        note="+2 Dari minggu lalu"
                        icon={<Sparkles size={44} />}
                        accent="text-[#f2a000]"
                    />

                    <StatCard
                        title="Tiket Closed"
                        value={closedTickets}
                        note="+2 Dari minggu lalu"
                        icon={<CheckCircle2 size={44} />}
                        accent="text-[#4f86f7]"
                    />
                </section>

                {/* MAIN CONTENT */}
                <section className="mt-3 grid gap-3 xl:grid-cols-[1fr_380px]">
                    {/* LATEST TICKETS */}
                    <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white">
                        <div className="flex items-center justify-between border-b border-gray-300 px-4 py-3">
                            <h2 className="text-lg font-extrabold text-[#111827]">
                                Tiket Terbaru
                            </h2>

                            <Link
                                href="/tickets"
                                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-50"
                            >
                                Lihat semua
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-[780px] w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-300 bg-[#f8f8f8] text-gray-900">
                                        <th className="px-3 py-2 font-bold">No Tiket</th>
                                        <th className="px-3 py-2 font-bold">Kategori</th>
                                        <th className="px-3 py-2 font-bold">Deskripsi</th>
                                        <th className="px-3 py-2 font-bold">Teknisi</th>
                                        <th className="px-3 py-2 font-bold">Prioritas</th>
                                        <th className="px-3 py-2 font-bold">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {latestTickets.map((ticket) => (
                                        <tr
                                            key={ticket.id}
                                            className="border-b border-gray-200 last:border-b-0"
                                        >
                                            <td className="max-w-[110px] truncate px-3 py-2 font-medium text-[#2faa32]">
                                                {ticket.code}
                                            </td>
                                            <td className="px-3 py-2 font-medium text-gray-900">
                                                {ticket.category}
                                            </td>
                                            <td className="px-3 py-2 max-w-[300px] truncate text-gray-900">
                                                {ticket.description}
                                            </td>
                                            <td className="px-3 py-2 font-medium text-gray-900">
                                                {ticket.technician}
                                            </td>
                                            <td
                                                className={`px-3 py-2 font-bold ${
                                                    ticket.priority === 'Darurat'
                                                        ? 'text-red-600'
                                                        : 'text-gray-900'
                                                }`}
                                            >
                                                {ticket.priority}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={`rounded px-2 py-1 text-xs ${statusColors[ticket.status]}`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}

                                    {latestTickets.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-10 text-center text-gray-400"
                                            >
                                                Tidak ada tiket pada rentang tanggal ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* DONUTS */}
                    <div className="rounded-2xl border border-gray-300 bg-white p-4">
                        <h2 className="text-lg font-extrabold text-[#111827]">
                            Tiket Per Prioritas
                        </h2>

                        <div className="mt-2 grid grid-cols-[110px_1fr] items-center gap-3">
                            <DonutChart
                                total={totalTickets}
                                segments={[
                                    {
                                        value: priorityCounts.standard,
                                        color: '#f2ad00',
                                    },
                                    {
                                        value: priorityCounts.urgent,
                                        color: '#e5332f',
                                    },
                                ]}
                            />

                            <div className="space-y-2 text-sm">
                                <LegendRow
                                    color="#f2ad00"
                                    label="Standar"
                                    value={priorityCounts.standard}
                                    total={totalTickets}
                                />
                                <LegendRow
                                    color="#e5332f"
                                    label="Urgent"
                                    value={priorityCounts.urgent}
                                    total={totalTickets}
                                />
                            </div>
                        </div>

                        <h2 className="mt-6 text-lg font-extrabold text-[#111827]">
                            Tiket Per Kategori
                        </h2>

                        <div className="mt-2 grid grid-cols-[110px_1fr] items-center gap-3">
                            <DonutChart
                                total={totalTickets}
                                segments={Object.entries(categoryCounts).map(
                                    ([label, value]) => ({
                                        value,
                                        color: categoryColors[label],
                                    }),
                                )}
                            />

                            <div className="space-y-1 text-sm">
                                {Object.entries(categoryCounts).map(
                                    ([label, value]) => (
                                        <LegendRow
                                            key={label}
                                            color={categoryColors[label]}
                                            label={label}
                                            value={value}
                                            total={totalTickets}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* BOTTOM */}
                <section className="mt-3 grid gap-3 xl:grid-cols-[350px_1fr_350px]">
                    {/* MACHINE CONDITION */}
                    <div className="rounded-2xl border border-gray-300 bg-white p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-extrabold text-[#111827]">
                                Kondisi Mesin
                            </h2>

                            <Link
                                href="/machines"
                                className="text-xs text-gray-500 hover:text-green-600"
                            >
                                Lihat semua
                            </Link>
                        </div>

                        <div className="mt-4 flex justify-center">
                            <DonutChart
                                total={filteredMachines.length}
                                size={205}
                                thickness={42}
                                segments={[
                                    {
                                        value: machineCounts.good,
                                        color: '#2f8f18',
                                    },
                                    {
                                        value: machineCounts.maintenance,
                                        color: '#f2a000',
                                    },
                                    {
                                        value: machineCounts.broken,
                                        color: '#e5372d',
                                    },
                                ]}
                                centerLabel="Total Mesin"
                            />
                        </div>

                        <div className="mt-4 space-y-2 text-sm">
                            <LegendRow
                                color="#2f8f18"
                                label="Baik"
                                value={machineCounts.good}
                                total={filteredMachines.length}
                            />
                            <LegendRow
                                color="#f2a000"
                                label="Maintenance"
                                value={machineCounts.maintenance}
                                total={filteredMachines.length}
                            />
                            <LegendRow
                                color="#e5372d"
                                label="Rusak/Tidak Aktif"
                                value={machineCounts.broken}
                                total={filteredMachines.length}
                            />
                        </div>
                    </div>

                    {/* LOW STOCK */}
                    <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white">
                        <div className="flex items-center justify-between border-b border-gray-300 px-4 py-3">
                            <h2 className="text-lg font-extrabold text-[#111827]">
                                Stok Sparepart Rendah
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-gray-300 bg-[#f8f8f8] text-left">
                                        <th className="px-3 py-2 font-bold text-gray-900">
                                            Nama Sparepart
                                        </th>
                                        <th className="px-3 py-2 font-bold text-gray-900">
                                            Stok
                                        </th>
                                        <th className="px-3 py-2 font-bold text-gray-900">
                                            Minimum
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {lowStockSpareparts.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-gray-200"
                                        >
                                            <td className="px-3 py-2 font-medium text-gray-900">
                                                {item.name}
                                            </td>
                                            <td className="px-3 py-2 font-medium text-red-500">
                                                {item.stock} {item.unit}
                                            </td>
                                            <td className="px-3 py-2 font-medium text-gray-900">
                                                {item.minimum} {item.unit}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end p-3">
                            <Link
                                href="/spareparts"
                                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-50"
                            >
                                Lihat semua
                            </Link>
                        </div>
                    </div>

                    {/* SUMMARY */}
                    <div className="rounded-2xl border border-gray-300 bg-white p-4">
                        <h2 className="text-lg font-extrabold text-[#111827]">
                            Ringkasan
                        </h2>

                        <div className="mt-3 space-y-1 text-sm">
                            <SummaryRow
                                label="Total Mesin"
                                value={filteredMachines.length}
                            />
                            <SummaryRow
                                label="Mesin Aktif"
                                value={machineCounts.good}
                                valueClassName="text-green-600"
                            />
                            <SummaryRow
                                label="Mesin Maintenance"
                                value={machineCounts.maintenance}
                                valueClassName="text-amber-500"
                            />
                            <SummaryRow
                                label="Mesin Rusak / Tidak Aktif"
                                value={machineCounts.broken}
                                valueClassName="text-red-500"
                            />

                            <div className="my-2 border-t border-gray-400" />

                            <SummaryRow
                                label="Total Sparepart"
                                value={1248}
                            />
                            <SummaryRow
                                label="Total Jenis Sparepart"
                                value={126}
                            />
                            <SummaryRow
                                label="Total Transaksi Bulan Ini"
                                value={23}
                            />

                            <div className="my-2 border-t border-gray-400" />

                            {/* <SummaryRow
                                label="Estimasi Biaya"
                                value={formatCurrency(totalEstimatedCost)}
                                valueClassName="text-green-600"
                            /> */}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

function DateInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="flex h-11 items-center gap-2 rounded-lg border border-[#8b8b8b] bg-white px-3">
            <CalendarDays size={18} className="text-gray-500" />
            <input
                type="date"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="bg-transparent text-sm text-gray-700 outline-none"
            />
        </label>
    );
}

function StatCard({
    title,
    value,
    note,
    icon,
    accent,
}: {
    title: string;
    value: number;
    note: string;
    icon: React.ReactNode;
    accent: string;
}) {
    return (
        <div className="flex min-h-[115px] items-center rounded-2xl border border-gray-300 bg-white px-5 py-4 shadow-sm">
            <div className={`mr-5 shrink-0 ${accent}`}>{icon}</div>

            <div>
                <p className="text-lg text-gray-500">{title}</p>
                <div className={`text-[34px] font-extrabold leading-none ${accent}`}>
                    {value}
                </div>
                <p className="mt-1 text-sm text-gray-500">{note}</p>
            </div>
        </div>
    );
}

function PencilSquareIcon() {
    return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md border-2 border-white">
            <Plus size={18} />
        </div>
    );
}

function DonutChart({
    total,
    segments,
    size = 100,
    thickness = 22,
    centerLabel = 'Total Tiket',
}: {
    total: number;
    segments: { value: number; color: string }[];
    size?: number;
    thickness?: number;
    centerLabel?: string;
}) {
    const gradient = useMemo(() => {
        if (total <= 0) {
            return 'conic-gradient(#e5e7eb 0deg 360deg)';
        }

        let start = 0;

        const parts = segments.map((segment) => {
            const degrees = (segment.value / total) * 360;
            const end = start + degrees;
            const result = `${segment.color} ${start}deg ${end}deg`;
            start = end;
            return result;
        });

        if (start < 360) {
            parts.push(`#e5e7eb ${start}deg 360deg`);
        }

        return `conic-gradient(${parts.join(', ')})`;
    }, [segments, total]);

    return (
        <div
            className="relative flex shrink-0 items-center justify-center rounded-full"
            style={{
                width: size,
                height: size,
                background: gradient,
            }}
        >
            <div
                className="flex flex-col items-center justify-center rounded-full bg-white text-center"
                style={{
                    width: size - thickness * 2,
                    height: size - thickness * 2,
                }}
            >
                <div className="text-lg font-extrabold leading-none text-gray-900">
                    {total}
                </div>
                <div className="mt-1 max-w-[70px] text-[8px] leading-tight text-gray-500">
                    {centerLabel}
                </div>
            </div>
        </div>
    );
}

function LegendRow({
    color,
    label,
    value,
    total,
}: {
    color: string;
    label: string;
    value: number;
    total: number;
}) {
    const percentage = total > 0 ? (value / total) * 100 : 0;

    return (
        <div className="grid grid-cols-[12px_1fr_auto] items-center gap-2">
            <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
            />
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-900">
                {value} ({percentage.toLocaleString('id-ID', {
                    maximumFractionDigits: 1,
                })}
                %)
            </span>
        </div>
    );
}

function SummaryRow({
    label,
    value,
    valueClassName = 'text-gray-900',
}: {
    label: string;
    value: string | number;
    valueClassName?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 py-1 last:border-b-0">
            <span className="text-gray-900">{label}</span>
            <span className={`font-medium ${valueClassName}`}>{value}</span>
        </div>
    );
}
