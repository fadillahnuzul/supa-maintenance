import { Link } from '@inertiajs/react';
import { Check, Eye, Pencil, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

type TicketStatus =
    | 'Pending Approval'
    | 'Rejected'
    | 'Assigned'
    | 'In Progress'
    | 'Waiting Sparepart'
    | 'Completed';

type PriorityType = 'Darurat' | 'Standar';

type TicketRow = {
    code: string;
    category: string;
    detail: string;
    location: string;
    priority: PriorityType;
    reporter: string;
    technician: string;
    status: TicketStatus;
};

const ticketRows: TicketRow[] = [
    {
        code: 'TKT-260803-4054',
        category: 'Mesin',
        detail: 'Mesin macet',
        location: 'Gudang A2',
        priority: 'Darurat',
        reporter: 'Budi Santoso',
        technician: 'Rina',
        status: 'Pending Approval',
    },
    {
        code: 'TKT-260803-4054',
        category: 'Mesin',
        detail: 'Mesin macet',
        location: 'Gudang A3',
        priority: 'Standar',
        reporter: 'Budi Santoso',
        technician: 'Rina',
        status: 'Assigned',
    },
    {
        code: 'TKT-260803-4054',
        category: 'Mesin',
        detail: 'Mesin macet',
        location: 'Gudang A2',
        priority: 'Darurat',
        reporter: 'Budi Santoso',
        technician: 'Rina',
        status: 'In Progress',
    },
    {
        code: 'TKT-260803-4054',
        category: 'Mesin',
        detail: 'Mesin macet dsfhawhefahwerhywrtq5ysgfrasetawe4tw3ertregyqerywerywerthygbwserhererr',
        location: 'Gudang A3',
        priority: 'Darurat',
        reporter: 'Budi Santoso',
        technician: 'Rina',
        status: 'Completed',
    },
    {
        code: 'TKT-260803-4054',
        category: 'Mesin',
        detail: 'Mesin macet',
        location: 'Gudang A2',
        priority: 'Standar',
        reporter: 'Budi Santoso',
        technician: 'Rina',
        status: 'Rejected',
    },
    {
        code: 'TKT-260803-4054',
        category: 'Mesin',
        detail: 'Mesin macet',
        location: 'Gudang A2',
        priority: 'Darurat',
        reporter: 'Budi Santoso',
        technician: 'Rina',
        status: 'Pending Approval',
    },
];

const statusColors = {
    'Pending Approval': 'bg-[#fef3c7] text-[#b45309]',
    Rejected: 'bg-[#fee2e2] text-[#b91c1c]',
    Assigned: 'bg-[#e0f2fe] text-[#0369a1]',
    'In Progress': 'bg-[#fef3c7] text-[#a16207]',
    'Waiting Sparepart': 'bg-[#fef3c7] text-[#a16207]',
    Completed: 'bg-[#dcfce7] text-[#166534]',
} as const;

function getActionButton(status: TicketStatus, ticketCode: string) {
    if (status === 'Pending Approval') {
        return (
            <div className="flex items-center justify-center gap-2">
                <Link
                    href={`/tickets/approval/${encodeURIComponent(ticketCode)}`}
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22c55e] text-white shadow-sm transition hover:bg-[#16a34a]"
                    aria-label="Approve"
                    title="Approve"
                >
                    <Check size={18} />
                </Link>
                <Link
                    href={`/tickets/approval/${encodeURIComponent(ticketCode)}`}
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ef4444] text-white shadow-sm transition hover:bg-[#dc2626]"
                    aria-label="Reject"
                    title="Reject"
                >
                    <X size={18} />
                </Link>
            </div>
        );
    }

    if (status === 'Assigned' || status === 'In Progress') {
        return (
            <div className="flex items-center justify-center gap-2">
                <Link
                    href={`/tickets/${encodeURIComponent(ticketCode)}`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22c55e] text-sm font-semibold text-white shadow-sm transition hover:bg-[#16a34a]"
                    aria-label="Edit"
                    title="Edit"
                >
                    <Pencil size={18} />
                </Link>
                <Link
                    href={`/tickets/${encodeURIComponent(ticketCode)}`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3b82f6] text-sm font-semibold text-white shadow-sm transition hover:bg-[#2563eb]"
                    aria-label="View"
                    title="View"
                >
                    <Eye size={18} />
                </Link>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center gap-2">
            <Link
                href={`/tickets/${encodeURIComponent(ticketCode)}`}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3b82f6] text-sm font-semibold text-white shadow-sm transition hover:bg-[#2563eb]"
                aria-label="View"
                title="View"
            >
                <Eye size={18} />
            </Link>
        </div>
    );
}

export default function TicketList() {
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [priorityFilter, setPriorityFilter] = useState('Semua Prioritas');
    const [technicianFilter, setTechnicianFilter] = useState('Semua Teknisi');
    const [search, setSearch] = useState('');

    const filteredTickets = useMemo(() => {
        return ticketRows.filter((ticket) => {
            const matchesStatus =
                statusFilter === 'Semua Status' || ticket.status === statusFilter;

            const matchesPriority =
                priorityFilter === 'Semua Prioritas' || ticket.priority === priorityFilter;

            const matchesTechnician =
                technicianFilter === 'Semua Teknisi' || ticket.technician === technicianFilter;

            const term = search.trim().toLowerCase();
            const matchesSearch =
                term.length === 0 ||
                [ticket.code, ticket.category, ticket.detail, ticket.location, ticket.reporter, ticket.technician]
                    .join(' ')
                    .toLowerCase()
                    .includes(term);

            return matchesStatus && matchesPriority && matchesTechnician && matchesSearch;
        });
    }, [search, statusFilter, priorityFilter, technicianFilter]);

    return (
        <div className="mx-auto flex-col px-3">
            <h3 className="mb-4 px-1 text-[24px] font-extrabold text-[#111827]">
                Daftar Pengerjaan &amp; Approval
            </h3>

            <div className="mb-4 flex flex-wrap items-center gap-2.5">
                <div className="min-w-[175px] rounded-xl border border-[#dfe3e8] bg-white px-3 py-2.5 text-[#4b5563] shadow-sm">
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="w-full bg-transparent text-base font-medium outline-none"
                    >
                        <option>Semua Status</option>
                        <option>Pending Approval</option>
                        <option>Rejected</option>
                        <option>Assigned</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Waiting Sparepart</option>
                    </select>
                </div>

                <div className="min-w-[175px] rounded-xl border border-[#dfe3e8] bg-white px-3 py-2.5 text-[#4b5563] shadow-sm">
                    <select
                        value={priorityFilter}
                        onChange={(event) => setPriorityFilter(event.target.value)}
                        className="w-full bg-transparent text-base font-medium outline-none"
                    >
                        <option>Semua Prioritas</option>
                        <option>Darurat</option>
                        <option>Standar</option>
                    </select>
                </div>

                <div className="min-w-[175px] rounded-xl border border-[#dfe3e8] bg-white px-3 py-2.5 text-[#4b5563] shadow-sm">
                    <select
                        value={technicianFilter}
                        onChange={(event) => setTechnicianFilter(event.target.value)}
                        className="w-full bg-transparent text-base font-medium outline-none"
                    >
                        <option>Semua Teknisi</option>
                        <option>Rina</option>
                        <option>Budi</option>
                    </select>
                </div>

                <label className="ml-auto flex min-w-[220px] items-center gap-2 rounded-xl border border-[#dfe3e8] bg-white px-3 py-2.5 text-[#4b5563] shadow-sm">
                    <Search size={16} className="text-[#6b7280]" />
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search.."
                        className="w-full border-0 bg-transparent text-base text-[#111827] outline-none placeholder:text-[#9ca3af]"
                    />
                </label>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#dfe3e8] bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-left text-sm text-[#374151]">
                        <thead>
                            <tr className="bg-[#e5e7eb] text-[#111827]">
                                <th className="border border-[#dfe3e8] px-3 py-2.5 font-bold">Kode Tiket</th>
                                <th className="border border-[#dfe3e8] px-3 py-2.5 font-bold">Kategori dan Detail</th>
                                <th className="border border-[#dfe3e8] px-3 py-2.5 font-bold">Lokasi</th>
                                <th className="border border-[#dfe3e8] px-3 py-2.5 font-bold">Prioritas</th>
                                <th className="border border-[#dfe3e8] px-3 py-2.5 font-bold">Pelapor</th>
                                <th className="border border-[#dfe3e8] px-3 py-2.5 font-bold">Teknisi</th>
                                <th className="border border-[#dfe3e8] px-3 py-2.5 font-bold">Status</th>
                                <th className="border border-[#dfe3e8] px-3 py-2.5 font-bold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTickets.map((ticket, index) => (
                                <tr key={`${ticket.code}-${index}`} className="bg-white hover:bg-[#f9fafb]">
                                    <td className="border border-[#dfe3e8] px-3 py-2.5 align-top">
                                        <span className="block font-medium text-[#111827]">{ticket.code}</span>
                                    </td>
                                    <td className="border border-[#dfe3e8] px-3 py-2.5 align-top">
                                        <span className="block font-medium text-[#111827]">{ticket.category}</span>
                                        <span className="block text-[#4b5563]">{ticket.detail}</span>
                                    </td>
                                    <td className="border border-[#dfe3e8] px-3 py-2.5 align-top text-[#111827]">
                                        {ticket.location}
                                    </td>
                                    <td className="border border-[#dfe3e8] px-3 py-2.5 align-top">
                                        <span
                                            className={
                                                ticket.priority === 'Darurat'
                                                    ? 'font-bold text-[#dc2626]'
                                                    : 'font-medium text-[#111827]'
                                            }
                                        >
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="border border-[#dfe3e8] px-3 py-2.5 align-top text-[#111827]">
                                        {ticket.reporter}
                                    </td>
                                    <td className="border border-[#dfe3e8] px-3 py-2.5 align-top text-[#111827]">
                                        {ticket.technician}
                                    </td>
                                    <td className="border border-[#dfe3e8] px-3 py-2.5 align-top">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[ticket.status]}`}
                                        >
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="border border-[#dfe3e8] px-3 py-2.5 align-top">
                                        {getActionButton(ticket.status, ticket.code)}
                                    </td>
                                </tr>
                            ))}
                            {filteredTickets.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-4 text-center text-[#6b7280]">
                                        Tidak ada tiket yang sesuai dengan filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
