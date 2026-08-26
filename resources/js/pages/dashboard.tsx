import { Head, Link, router, usePage } from '@inertiajs/react';
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
};

type Filters = {
    start_date: string;
    end_date: string;
};

type TicketComparison = {
    total: number;
    open: number;
    in_progress: number;
    closed: number;
};

type TicketStats = {
    total: number;
    open: number;
    in_progress: number;
    closed: number;
    rejected: number;
    comparison: TicketComparison;
};

type PriorityCounts = {
    standard: number;
    urgent: number;
};

type CategoryCounts = Record<
    'machine' | 'electrical' | 'maintenance' | 'preventive_maintenance' | 'other',
    number
>;

type MachineStats = {
    total: number;
    good: number;
    maintenance: number;
    broken: number;
};

type LowStockSparepart = {
    id: number;
    code: string;
    name: string;
    stock: number;
    minimum: number;
    unit: string;
};

type Summary = {
    total_sparepart_stock: number;
    total_sparepart_types: number;
    stock_transactions_this_month: number;
};

type DashboardProps = {
    auth: {
        user?: {
            name?: string;
        };
    };
    filters: Filters;
    ticketStats: TicketStats;
    priorityCounts: PriorityCounts;
    categoryCounts: CategoryCounts;
    latestTickets: Ticket[];
    machineStats: MachineStats;
    lowStockSpareparts: LowStockSparepart[];
    summary: Summary;
};

const statusColors: Record<TicketStatus, string> = {
    'Pending Approval': 'bg-[#fef3c7] text-[#b45309]',
    Rejected: 'bg-[#fee2e2] text-[#b91c1c]',
    Assigned: 'bg-[#e0f2fe] text-[#0369a1]',
    'In Progress': 'bg-[#fef3c7] text-[#a16207]',
    'Waiting Sparepart': 'bg-[#fef3c7] text-[#a16207]',
    Completed: 'bg-[#dcfce7] text-[#166534]',
};

const categoryColors: Record<string, string> = {
    machine: '#2f73ff',
    electrical: '#2ea768',
    maintenance: '#f58a17',
    preventive_maintenance: '#7c3db9',
    other: '#9ca3af',
};

const categoryLabels: Record<string, string> = {
    machine: 'Machine',
    electrical: 'Electrical',
    maintenance: 'Maintenance',
    preventive_maintenance: 'Preventive Maintenance',
    other: 'Lainnya',
};

function comparisonText(value: number) {
    if (value === 0) return 'Sama dengan periode sebelumnya';

    return `${value > 0 ? '+' : ''}${value} dari periode sebelumnya`;
}

export default function Dashboard() {
    const {
        auth,
        filters,
        ticketStats,
        priorityCounts,
        categoryCounts,
        latestTickets,
        machineStats,
        lowStockSpareparts,
        summary,
    } = usePage<DashboardProps>().props;

    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const applyDateFilter = (start: string, end: string) => {
        if (!start || !end || end < start) return;

        router.get(
            '/dashboard',
            {
                start_date: start,
                end_date: end,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleStartDateChange = (value: string) => {
        setStartDate(value);

        if (endDate && value <= endDate) {
            applyDateFilter(value, endDate);
        }
    };

    const handleEndDateChange = (value: string) => {
        setEndDate(value);

        if (startDate && value >= startDate) {
            applyDateFilter(startDate, value);
        }
    };

    return (
        <>
            <Head title="Dashboard" />

            <div className="mx-auto w-full px-3 pb-8">
                <section className="mb-3">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-lg leading-none text-gray-700">
                                Good Morning,
                            </p>
                            <h1 className="text-[24px] font-extrabold leading-tight text-[#111827]">
                                {auth.user?.name ?? '-'}
                            </h1>
                            <p className="text-sm text-gray-600">
                                Today is a new chance to create something amazing.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <DateInput
                                value={startDate}
                                onChange={handleStartDateChange}
                            />

                            <span className="text-sm text-gray-500">s/d</span>

                            <DateInput
                                value={endDate}
                                onChange={handleEndDateChange}
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

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Tiket"
                        value={ticketStats.total}
                        note={comparisonText(ticketStats.comparison.total)}
                        icon={<ClipboardList size={44} />}
                        accent="text-[#2faa32]"
                    />

                    <StatCard
                        title="Tiket Open"
                        value={ticketStats.open}
                        note={comparisonText(ticketStats.comparison.open)}
                        icon={<AlertTriangle size={44} />}
                        accent="text-[#e4443d]"
                    />

                    <StatCard
                        title="Tiket In Progress"
                        value={ticketStats.in_progress}
                        note={comparisonText(ticketStats.comparison.in_progress)}
                        icon={<Sparkles size={44} />}
                        accent="text-[#f2a000]"
                    />

                    <StatCard
                        title="Tiket Closed"
                        value={ticketStats.closed}
                        note={comparisonText(ticketStats.comparison.closed)}
                        icon={<CheckCircle2 size={44} />}
                        accent="text-[#4f86f7]"
                    />
                </section>

                <section className="mt-3 grid gap-3 xl:grid-cols-[1fr_390px]">
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
                            <table className="w-full min-w-[780px] border-collapse text-left text-sm">
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
                                            <td className="max-w-[300px] truncate px-3 py-2 text-gray-900">
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
                                                <span
                                                    className={`rounded px-2 py-1 text-xs ${
                                                        statusColors[ticket.status] ??
                                                        'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
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

                    <div className="rounded-2xl border border-gray-300 bg-white p-4">
                        <h2 className="text-lg font-extrabold text-[#111827]">
                            Tiket Per Prioritas
                        </h2>

                        <div className="mt-2 grid grid-cols-[110px_1fr] items-center gap-3">
                            <DonutChart
                                total={ticketStats.total}
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
                                    total={ticketStats.total}
                                />
                                <LegendRow
                                    color="#e5332f"
                                    label="Urgent"
                                    value={priorityCounts.urgent}
                                    total={ticketStats.total}
                                />
                            </div>
                        </div>

                        <h2 className="mt-6 text-lg font-extrabold text-[#111827]">
                            Tiket Per Kategori
                        </h2>

                        <div className="mt-2 grid grid-cols-[110px_1fr] items-center gap-3">
                            <DonutChart
                                total={ticketStats.total}
                                segments={Object.entries(categoryCounts).map(
                                    ([label, value]) => ({
                                        value,
                                        color: categoryColors[label] ?? '#9ca3af',
                                    }),
                                )}
                            />

                            <div className="space-y-1 text-sm">
                                {Object.entries(categoryCounts).map(
                                    ([label, value]) => (
                                        <LegendRow
                                            key={label}
                                            color={categoryColors[label] ?? '#9ca3af'}
                                            label={categoryLabels[label]}
                                            value={value}
                                            total={ticketStats.total}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-3 grid gap-3 xl:grid-cols-[350px_1fr_350px]">
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
                                total={machineStats.total}
                                size={205}
                                thickness={42}
                                segments={[
                                    {
                                        value: machineStats.good,
                                        color: '#2f8f18',
                                    },
                                    {
                                        value: machineStats.maintenance,
                                        color: '#f2a000',
                                    },
                                    {
                                        value: machineStats.broken,
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
                                value={machineStats.good}
                                total={machineStats.total}
                            />
                            <LegendRow
                                color="#f2a000"
                                label="Maintenance"
                                value={machineStats.maintenance}
                                total={machineStats.total}
                            />
                            <LegendRow
                                color="#e5372d"
                                label="Rusak/Tidak Aktif"
                                value={machineStats.broken}
                                total={machineStats.total}
                            />
                        </div>
                    </div>

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
                                                <div>{item.name}</div>
                                                <div className="text-xs text-gray-400">
                                                    {item.code}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 font-medium text-red-500">
                                                {item.stock} {item.unit}
                                            </td>
                                            <td className="px-3 py-2 font-medium text-gray-900">
                                                {item.minimum} {item.unit}
                                            </td>
                                        </tr>
                                    ))}

                                    {lowStockSpareparts.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="px-4 py-10 text-center text-gray-400"
                                            >
                                                Tidak ada sparepart dengan stok rendah.
                                            </td>
                                        </tr>
                                    )}
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

                    <div className="rounded-2xl border border-gray-300 bg-white p-4">
                        <h2 className="text-lg font-extrabold text-[#111827]">
                            Ringkasan
                        </h2>

                        <div className="mt-3 space-y-1 text-sm">
                            <SummaryRow
                                label="Total Mesin"
                                value={machineStats.total}
                            />
                            <SummaryRow
                                label="Mesin Aktif"
                                value={machineStats.good}
                                valueClassName="text-green-600"
                            />
                            <SummaryRow
                                label="Mesin Maintenance"
                                value={machineStats.maintenance}
                                valueClassName="text-amber-500"
                            />
                            <SummaryRow
                                label="Mesin Rusak / Tidak Aktif"
                                value={machineStats.broken}
                                valueClassName="text-red-500"
                            />

                            <div className="my-2 border-t border-gray-400" />

                            <SummaryRow
                                label="Total Stok Sparepart"
                                value={summary.total_sparepart_stock.toLocaleString('id-ID')}
                            />
                            <SummaryRow
                                label="Total Jenis Sparepart"
                                value={summary.total_sparepart_types.toLocaleString('id-ID')}
                            />
                            <SummaryRow
                                label="Total Transaksi Bulan Ini"
                                value={summary.stock_transactions_this_month.toLocaleString('id-ID')}
                            />
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
                onClick={(event) => {
                    if (typeof event.currentTarget.showPicker === 'function') {
                        event.currentTarget.showPicker();
                    }
                }}
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
