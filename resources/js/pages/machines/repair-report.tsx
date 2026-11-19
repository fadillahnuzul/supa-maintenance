import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { repairReport } from '@/routes/machines';

type ReportTicket = {
    id: number;
    code: string;
    description: string;
    created_at: string | null;
    completed_at: string | null;
    machine: {
        code: string;
        name: string;
        location: {
            name: string;
        } | null;
    } | null;
    status: {
        name: string;
    } | null;
    technicians: {
        role: string;
        employee: {
            first_name: string;
            last_name: string;
        } | null;
    }[];
    spareparts: {
        id: number;
        quantity: string | number;
        sparepart: {
            code: string;
            name: string;
            unit: string;
        } | null;
    }[];
};

type Props = {
    tickets: ReportTicket[];
    filters: {
        start_date: string;
        end_date: string;
    };
};

export default function MachineRepairReport({
    tickets,
    filters,
}: Props) {
    return (
        <>
            <Head title="Laporan Perbaikan Mesin" />

            <main className="repair-report-page mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 py-6">
                <section className="repair-report-no-print flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm">
                    <form
                        action={repairReport().url}
                        method="get"
                        className="flex flex-wrap items-end gap-3"
                    >
                        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                            Dari tanggal request
                            <input
                                type="date"
                                name="start_date"
                                defaultValue={filters.start_date}
                                required
                                className="h-10 rounded-lg border border-gray-300 px-3"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                            Sampai tanggal
                            <input
                                type="date"
                                name="end_date"
                                defaultValue={filters.end_date}
                                required
                                className="h-10 rounded-lg border border-gray-300 px-3"
                            />
                        </label>
                        <button
                            type="submit"
                            className="h-10 rounded-lg bg-gray-800 px-4 font-semibold text-white hover:bg-black"
                        >
                            Tampilkan
                        </button>
                    </form>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1f6b55] px-4 font-semibold text-white hover:bg-[#185443]"
                    >
                        <Printer size={17} />
                        Cetak / Simpan PDF
                    </button>
                </section>

                <section className="repair-report-print rounded-2xl bg-white p-5 shadow-sm">
                    <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900">
                                Laporan Perbaikan Mesin
                            </h1>
                            <p className="text-sm text-gray-600">
                                Periode request: {formatDate(filters.start_date)} –{' '}
                                {formatDate(filters.end_date)}
                            </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                            Jumlah tiket: {tickets.length}
                        </p>
                    </header>

                    <div className="overflow-x-auto">
                        <table className="repair-report-table w-full min-w-[1200px] border-collapse text-left text-xs text-gray-800">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-2 py-2">No.</th>
                                    <th className="border border-gray-300 px-2 py-2">Tiket</th>
                                    <th className="border border-gray-300 px-2 py-2">Mesin</th>
                                    <th className="border border-gray-300 px-2 py-2">Area / Lokasi</th>
                                    <th className="border border-gray-300 px-2 py-2">Kerusakan / Pekerjaan</th>
                                    <th className="border border-gray-300 px-2 py-2">Tgl Request</th>
                                    <th className="border border-gray-300 px-2 py-2">PIC</th>
                                    <th className="border border-gray-300 px-2 py-2">Sparepart</th>
                                    <th className="border border-gray-300 px-2 py-2">Status</th>
                                    <th className="border border-gray-300 px-2 py-2">Tgl Selesai</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket, index) => (
                                    <tr key={ticket.id}>
                                        <td className="border border-gray-300 px-2 py-2">{index + 1}</td>
                                        <td className="border border-gray-300 px-2 py-2 font-semibold">{ticket.code}</td>
                                        <td className="border border-gray-300 px-2 py-2">
                                            <strong>{ticket.machine?.code ?? '-'}</strong>
                                            <br />
                                            {ticket.machine?.name ?? '-'}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2">
                                            {ticket.machine?.location?.name ?? '-'}
                                        </td>
                                        <td className="max-w-64 border border-gray-300 px-2 py-2 whitespace-pre-wrap">
                                            {ticket.description}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2">
                                            {formatDateTime(ticket.created_at)}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2">
                                            {getTechnicianNames(ticket)}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2">
                                            {getSparepartNames(ticket)}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2">
                                            {ticket.status?.name ?? '-'}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2">
                                            {formatDateTime(ticket.completed_at)}
                                        </td>
                                    </tr>
                                ))}
                                {tickets.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="border border-gray-300 px-3 py-8 text-center text-gray-500"
                                        >
                                            Tidak ada tiket perbaikan pada periode ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                        Laporan mencakup tiket perbaikan mesin berdasarkan tanggal request.
                    </p>
                </section>
            </main>
        </>
    );
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
    }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(value));
}

function getTechnicianNames(ticket: ReportTicket): string {
    const pic = ticket.technicians.find((technician) => technician.role === 'pic');
    const technicians = pic ? [pic] : ticket.technicians;

    return (
        technicians
            .map((technician) =>
                [technician.employee?.first_name, technician.employee?.last_name]
                    .filter(Boolean)
                    .join(' '),
            )
            .filter(Boolean)
            .join(', ') || '-'
    );
}

function getSparepartNames(ticket: ReportTicket): string {
    return (
        ticket.spareparts
            .map((item) =>
                item.sparepart
                    ? `${item.sparepart.code} ${item.sparepart.name} (${item.quantity} ${item.sparepart.unit})`
                    : `Sparepart tidak tersedia (${item.quantity})`,
            )
            .join(', ') || '-'
    );
}
