import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    MapPin,
    Package,
    Pencil,
    Wrench,
} from 'lucide-react';
import {
    edit as editMachine,
    index as machinesIndex,
} from '@/actions/App/Http/Controllers/MachineController';
import { show as ticketShow } from '@/actions/App/Http/Controllers/TicketController';
import type { Machine } from '@/types/machine';

type UsedSparepart = {
    id: number;
    quantity: string | number;
    sparepart: {
        code: string;
        name: string;
        unit: string;
    } | null;
};

type MachineTicket = {
    id: number;
    code: string;
    description: string;
    created_at: string | null;
    completed_at: string | null;
    status: {
        code: string;
        name: string;
    } | null;
    spareparts: UsedSparepart[];
};

type Props = {
    machine: Machine & {
        tickets: MachineTicket[];
        repair_frequency: number;
        monthly_repair_frequency: number;
    };
};

export default function MachineShow({ machine }: Props) {
    return (
        <>
            <Head title={`Detail Mesin ${machine.name}`} />

            <main className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={machinesIndex().url}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
                    >
                        <ArrowLeft size={18} />
                        Kembali ke daftar mesin
                    </Link>

                    <Link
                        href={editMachine(machine.id).url}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#4f86f7] px-4 py-2 font-semibold text-white transition hover:bg-blue-600"
                    >
                        <Pencil size={17} />
                        Edit Mesin
                    </Link>
                </div>

                <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    <div className="grid gap-5 p-5 md:grid-cols-[240px_1fr]">
                        <div className="flex min-h-44 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                            {machine.photo_url ? (
                                <img
                                    src={machine.photo_url}
                                    alt={machine.name}
                                    className="h-full max-h-64 w-full object-cover"
                                />
                            ) : (
                                <Wrench
                                    size={36}
                                    className="text-gray-400"
                                />
                            )}
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500">
                                        {machine.code}
                                    </p>
                                    <h1 className="text-2xl font-extrabold text-gray-900">
                                        {machine.name}
                                    </h1>
                                </div>
                                <MachineStatus status={machine.status} />
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <MapPin size={17} className="shrink-0" />
                                <span>{machine.location?.name ?? '-'}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2">
                    <FrequencyCard
                        label="Frekuensi perbaikan"
                        description="Total tiket mesin selain yang ditolak"
                        count={machine.repair_frequency}
                    />
                    <FrequencyCard
                        label="30 hari terakhir"
                        description="Tiket perbaikan selain yang ditolak"
                        count={machine.monthly_repair_frequency}
                    />
                </section>

                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Riwayat Tiket Perbaikan
                            </h2>
                            <p className="text-sm text-gray-500">
                                Daftar tiket dan sparepart yang digunakan pada mesin ini.
                            </p>
                        </div>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                            {machine.tickets.length} tiket
                        </span>
                    </div>

                    {machine.tickets.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {machine.tickets.map((ticket) => (
                                <article
                                    key={ticket.id}
                                    className="rounded-xl border border-gray-200 p-4"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <Link
                                                href={ticketShow(ticket.id).url}
                                                className="font-bold text-blue-700 hover:underline"
                                            >
                                                {ticket.code}
                                            </Link>
                                            <p className="mt-1 whitespace-pre-line text-sm text-gray-700">
                                                {ticket.description}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                                            {ticket.status?.name ?? ticket.status?.code ?? '-'}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                                        <span className="inline-flex items-center gap-1.5">
                                            <CalendarDays size={14} />
                                            Dibuat: {formatDate(ticket.created_at)}
                                        </span>
                                        {ticket.completed_at && (
                                            <span className="inline-flex items-center gap-1.5">
                                                <CalendarDays size={14} />
                                                Selesai: {formatDate(ticket.completed_at)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4 border-t border-gray-100 pt-3">
                                        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                            <Package size={16} />
                                            Sparepart digunakan
                                        </h3>
                                        {ticket.spareparts.length > 0 ? (
                                            <ul className="flex flex-col gap-2">
                                                {ticket.spareparts.map((item) => (
                                                    <li
                                                        key={item.id}
                                                        className="flex flex-wrap justify-between gap-2 text-sm text-gray-600"
                                                    >
                                                        <span>
                                                            {item.sparepart?.code ?? '-'} —{' '}
                                                            {item.sparepart?.name ?? 'Sparepart tidak tersedia'}
                                                        </span>
                                                        <span className="font-medium text-gray-800">
                                                            {item.quantity} {item.sparepart?.unit ?? ''}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                Belum ada sparepart yang dicatat.
                                            </p>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
                            Belum ada riwayat tiket perbaikan untuk mesin ini.
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}

function FrequencyCard({
    label,
    description,
    count,
}: {
    label: string;
    description: string;
    count: number;
}) {
    return (
        <section className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">{label}</p>
            <p className="mt-1 text-3xl font-extrabold text-gray-900">
                {count} <span className="text-base font-semibold">kali</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">{description}</p>
        </section>
    );
}

function MachineStatus({ status }: { status: Machine['status'] }) {
    const styles = {
        Active: 'bg-green-100 text-green-700',
        Maintenance: 'bg-yellow-100 text-yellow-700',
        Inactive: 'bg-red-100 text-red-700',
    } satisfies Record<Machine['status'], string>;

    const labels = {
        Active: 'Aktif',
        Maintenance: 'Maintenance',
        Inactive: 'Rusak / Tidak Aktif',
    } satisfies Record<Machine['status'], string>;

    return (
        <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${styles[status]}`}
        >
            {labels[status]}
        </span>
    );
}

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}
