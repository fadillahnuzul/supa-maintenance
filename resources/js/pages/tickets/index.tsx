import { Link, router, useForm } from '@inertiajs/react';
import { Check, Cog, Eye, MapPin, Pencil, Search, Wrench, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type TicketStatus =
    | 'Pending Approval'
    | 'Rejected'
    | 'Assigned'
    | 'In Progress'
    | 'Waiting Sparepart'
    | 'Completed';

type PriorityType = 'Darurat' | 'Standar';

type TicketRow = {
    id: number;
    code: string;
    category: string;
    detail: string;
    location: string;
    priority: PriorityType;
    reporter: string;
    technician: string;
    status: TicketStatus;

    // Optional data untuk modal approval.
    image?: string;
    createdAt?: string;
    deadline?: string;
    machineCode?: string;
    machineName?: string;
};

type UsedSparepart = {
    sparepart_id: string;
    name: string;
    quantity: number;
};

type SparepartInputRow = {
    sparepart_id: string;
    custom_name: string;
    quantity: string;
};

const ticketRows: TicketRow[] = [
    {
        id: 1,
        code: 'TKT-260803-4054',
        category: 'Mesin',
        detail: 'Mesin macet',
        location: 'Gudang A2',
        priority: 'Darurat',
        reporter: 'Budi Santoso',
        technician: 'Rina',
        status: 'Pending Approval',
        image: '/images/tickets/mesin-giling.jpg',
        createdAt: '2026-08-03',
        deadline: '2026-08-03',
        machineCode: 'MC-1783994413365',
        machineName: 'Mesin Giling 1 (WFJ-30 Super Crusher)',
    },
    {
        id: 2,
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
        id: 3,
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
        id: 4,
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
        id: 5,
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
        id: 6,
        code: 'TKT-260803-4054',
        category: 'Mesin',
        detail: 'Mesin macet',
        location: 'Gudang A2',
        priority: 'Darurat',
        reporter: 'Budi Santoso',
        technician: 'Rina',
        status: 'Pending Approval',
        image: '/images/tickets/mesin-giling.jpg',
        createdAt: '2026-08-03',
        deadline: '2026-08-03',
        machineCode: 'MC-1783994413365',
        machineName: 'Mesin Giling 1 (WFJ-30 Super Crusher)',
    },
];

const technicians = [
    { id: '1', name: 'Rina' },
    { id: '2', name: 'Navi' },
    { id: '3', name: 'Syarif' },
    { id: '4', name: 'Riki' },
];

const spareparts = [
    { id: '1', name: 'Bearing 6205' },
    { id: '2', name: 'V-Belt A-42' },
    { id: '3', name: 'Seal Bearing' },
];

const statusColors = {
    'Pending Approval': 'bg-[#fef3c7] text-[#b45309]',
    Rejected: 'bg-[#fee2e2] text-[#b91c1c]',
    Assigned: 'bg-[#e0f2fe] text-[#0369a1]',
    'In Progress': 'bg-[#fef3c7] text-[#a16207]',
    'Waiting Sparepart': 'bg-[#fef3c7] text-[#a16207]',
    Completed: 'bg-[#dcfce7] text-[#166534]',
} as const;

function formatInputDate(value?: string) {
    if (!value) return '';
    return value.slice(0, 10);
}

export default function TicketList() {
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [priorityFilter, setPriorityFilter] = useState('Semua Prioritas');
    const [technicianFilter, setTechnicianFilter] = useState('Semua Teknisi');
    const [search, setSearch] = useState('');

    const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<TicketRow | null>(null);

    const [sparepartRows, setSparepartRows] = useState<SparepartInputRow[]>([
        { sparepart_id: '', custom_name: '', quantity: '' },
    ]);
    const [additionalSparepartRows, setAdditionalSparepartRows] = useState<
        SparepartInputRow[]
    >([{ sparepart_id: '', custom_name: '', quantity: '' }]);
    const [usedSpareparts, setUsedSpareparts] = useState<UsedSparepart[]>([]);

    const approveForm = useForm({
        pic_technician_id: '',
        additional_technician_ids: [] as string[],
        created_at: '',
        deadline: '',
        spareparts: [] as UsedSparepart[],
    });

    const rejectForm = useForm({
        reason: '',
    });

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
                [
                    ticket.code,
                    ticket.category,
                    ticket.detail,
                    ticket.location,
                    ticket.reporter,
                    ticket.technician,
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(term);

            return matchesStatus && matchesPriority && matchesTechnician && matchesSearch;
        });
    }, [search, statusFilter, priorityFilter, technicianFilter]);

    const openApproveModal = (ticket: TicketRow) => {
        setSelectedTicket(ticket);
        setModalType('approve');
        setUsedSpareparts([]);
        setSparepartRows([{ sparepart_id: '', custom_name: '', quantity: '' }]);
        setAdditionalSparepartRows([
            { sparepart_id: '', custom_name: '', quantity: '' },
        ]);

        approveForm.setData({
            pic_technician_id: '',
            additional_technician_ids: [],
            created_at: formatInputDate(ticket.createdAt) || '2026-08-03',
            deadline: formatInputDate(ticket.deadline) || '2026-08-03',
            spareparts: [],
        });
        approveForm.clearErrors();
    };

    const openRejectModal = (ticket: TicketRow) => {
        setSelectedTicket(ticket);
        setModalType('reject');
        rejectForm.setData('reason', '');
        rejectForm.clearErrors();
    };

    const closeModal = () => {
        if (approveForm.processing || rejectForm.processing) return;

        setModalType(null);
        setSelectedTicket(null);
        setUsedSpareparts([]);
        setSparepartRows([{ sparepart_id: '', custom_name: '', quantity: '' }]);
        setAdditionalSparepartRows([
            { sparepart_id: '', custom_name: '', quantity: '' },
        ]);
        approveForm.reset();
        rejectForm.reset();
    };

    const toggleAdditionalTechnician = (technicianId: string) => {
        const current = approveForm.data.additional_technician_ids;

        approveForm.setData(
            'additional_technician_ids',
            current.includes(technicianId)
                ? current.filter((id) => id !== technicianId)
                : [...current, technicianId],
        );
    };

    const addSparepartRow = (group: 'main' | 'additional') => {
        if (group === 'main') {
            setSparepartRows((current) => [
                ...current,
                { sparepart_id: '', custom_name: '', quantity: '' },
            ]);

            return;
        }

        setAdditionalSparepartRows((current) => [
            ...current,
            { sparepart_id: '', custom_name: '', quantity: '' },
        ]);
    };

    const updateSparepartRow = (
        group: 'main' | 'additional',
        index: number,
        field: keyof SparepartInputRow,
        value: string,
    ) => {
        const setter =
            group === 'main' ? setSparepartRows : setAdditionalSparepartRows;

        setter((current) =>
            current.map((row, rowIndex) =>
                rowIndex === index ? { ...row, [field]: value } : row,
            ),
        );
    };

    const removeSparepartRow = (
        group: 'main' | 'additional',
        index: number,
    ) => {
        const setter =
            group === 'main' ? setSparepartRows : setAdditionalSparepartRows;

        setter((current) => {
            if (current.length === 1) {
                return [{ sparepart_id: '', custom_name: '', quantity: '' }];
            }

            return current.filter((_, rowIndex) => rowIndex !== index);
        });
    };

    const buildUsedSpareparts = (rows: SparepartInputRow[], startIndex = 0) =>
        rows.flatMap((row, index) => {
            const quantity = Number(row.quantity);

            if (!row.quantity || Number.isNaN(quantity) || quantity <= 0) {
                return [];
            }

            const selectedSparepart = row.sparepart_id
                ? spareparts.find((item) => item.id === row.sparepart_id)
                : undefined;
            const name = (selectedSparepart?.name || row.custom_name || '').trim();

            if (!name) {
                return [];
            }

            return [
                {
                    sparepart_id: selectedSparepart?.id ?? `${startIndex + index + 1}`,
                    name,
                    quantity,
                },
            ];
        });

    const syncSparepartsToForm = () => {
        const next = [
            ...buildUsedSpareparts(sparepartRows, 0),
            ...buildUsedSpareparts(additionalSparepartRows, sparepartRows.length),
        ];

        setUsedSpareparts(next);
        approveForm.setData('spareparts', next);
        return next;
    };

    const removeSparepart = (index: number) => {
        const next = usedSpareparts.filter((_, itemIndex) => itemIndex !== index);
        setUsedSpareparts(next);
        approveForm.setData('spareparts', next);
    };

    const submitApprove = (event: FormEvent) => {
        event.preventDefault();
        if (!selectedTicket) return;

        approveForm.post(
            `/tickets/${encodeURIComponent(selectedTicket.code)}/approve`,
            {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            },
        );
    };

    const submitReject = (event: FormEvent) => {
        event.preventDefault();
        if (!selectedTicket) return;

        rejectForm.post(
            `/tickets/${encodeURIComponent(selectedTicket.code)}/reject`,
            {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            },
        );
    };

    const getActionButton = (ticket: TicketRow) => {
        if (ticket.status === 'Pending Approval') {
            return (
                <div className="flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => openApproveModal(ticket)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22c55e] text-white shadow-sm transition hover:bg-[#16a34a]"
                        aria-label="Approve"
                        title="Approve"
                    >
                        <Check size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={() => openRejectModal(ticket)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ef4444] text-white shadow-sm transition hover:bg-[#dc2626]"
                        aria-label="Reject"
                        title="Reject"
                    >
                        <X size={18} />
                    </button>
                </div>
            );
        }

        if (ticket.status === 'Assigned' || ticket.status === 'In Progress') {
            return (
                <div className="flex items-center justify-center gap-2">
                    <Link
                        href={`/tickets/${encodeURIComponent(ticket.code)}`}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22c55e] text-sm font-semibold text-white shadow-sm transition hover:bg-[#16a34a]"
                        aria-label="Edit"
                        title="Edit"
                    >
                        <Pencil size={18} />
                    </Link>

                    <Link
                        href={`/tickets/${encodeURIComponent(ticket.code)}`}
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
                    href={`/tickets/${encodeURIComponent(ticket.code)}`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3b82f6] text-sm font-semibold text-white shadow-sm transition hover:bg-[#2563eb]"
                    aria-label="View"
                    title="View"
                >
                    <Eye size={18} />
                </Link>
            </div>
        );
    };

    return (
        <>
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
                                    <tr
                                        key={`${ticket.code}-${index}`}
                                        className="bg-white hover:bg-[#f9fafb]"
                                    >
                                        <td className="border border-[#dfe3e8] px-3 py-2.5 align-top">
                                            <span className="block font-medium text-[#111827]">
                                                {ticket.code}
                                            </span>
                                        </td>

                                        <td className="border border-[#dfe3e8] px-3 py-2.5 align-top">
                                            <span className="block font-medium text-[#111827]">
                                                {ticket.category}
                                            </span>
                                            <span className="block text-[#4b5563]">
                                                {ticket.detail}
                                            </span>
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
                                            {getActionButton(ticket)}
                                        </td>
                                    </tr>
                                ))}

                                {filteredTickets.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-4 text-center text-[#6b7280]"
                                        >
                                            Tidak ada tiket yang sesuai dengan filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {modalType && selectedTicket && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeModal();
                    }}
                >
                    {modalType === 'approve' ? (
                        <ApproveModal
                            ticket={selectedTicket}
                            form={approveForm}
                            usedSpareparts={usedSpareparts}
                            sparepartRows={sparepartRows}
                            additionalSparepartRows={additionalSparepartRows}
                            toggleAdditionalTechnician={toggleAdditionalTechnician}
                            addSparepartRow={addSparepartRow}
                            updateSparepartRow={updateSparepartRow}
                            removeSparepartRow={removeSparepartRow}
                            syncSparepartsToForm={syncSparepartsToForm}
                            removeSparepart={removeSparepart}
                            closeModal={closeModal}
                            submitApprove={submitApprove}
                        />
                    ) : (
                        <RejectModal
                            ticket={selectedTicket}
                            form={rejectForm}
                            closeModal={closeModal}
                            submitReject={submitReject}
                        />
                    )}
                </div>
            )}
        </>
    );
}

type ApproveForm = ReturnType<typeof useForm<{
    pic_technician_id: string;
    additional_technician_ids: string[];
    created_at: string;
    deadline: string;
    spareparts: UsedSparepart[];
}>>;

function ApproveModal({
    ticket,
    form,
    usedSpareparts,
    sparepartRows,
    additionalSparepartRows,
    toggleAdditionalTechnician,
    addSparepartRow,
    updateSparepartRow,
    removeSparepartRow,
    syncSparepartsToForm,
    removeSparepart,
    closeModal,
    submitApprove,
}: {
    ticket: TicketRow;
    form: ApproveForm;
    usedSpareparts: UsedSparepart[];
    sparepartRows: SparepartInputRow[];
    additionalSparepartRows: SparepartInputRow[];
    toggleAdditionalTechnician: (id: string) => void;
    addSparepartRow: (group: 'main' | 'additional') => void;
    updateSparepartRow: (
        group: 'main' | 'additional',
        index: number,
        field: keyof SparepartInputRow,
        value: string,
    ) => void;
    removeSparepartRow: (
        group: 'main' | 'additional',
        index: number,
    ) => void;
    syncSparepartsToForm: () => UsedSparepart[];
    removeSparepart: (index: number) => void;
    closeModal: () => void;
    submitApprove: (event: FormEvent) => void;
}) {
    return (
        <form
            onSubmit={submitApprove}
            className="max-h-[94vh] w-full max-w-[1180px] overflow-y-auto rounded-[20px] bg-white shadow-2xl"
        >
            {/* Header hitam dibuat sama dengan form detail/update Anda */}
            <div className="flex h-[52px] items-center justify-between bg-black px-6 text-white">
                <div className="flex items-center gap-2">
                    <Wrench size={20} />
                    <h2 className="text-lg font-semibold">Detail Tiket Perbaikan</h2>
                </div>

                <button
                    type="button"
                    onClick={closeModal}
                    className="flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-white/15"
                    aria-label="Tutup"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="p-5">
                {/* ======================
                    TICKET INFORMATION
                ====================== */}
                <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
                    {/* FOTO */}
                    <div className="overflow-hidden rounded-xl bg-gray-100">
                        {ticket.image ? (
                            <img
                                src={ticket.image}
                                alt={`Tiket ${ticket.code}`}
                                className="h-[205px] w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-[205px] items-center justify-center text-sm text-gray-400">
                                Tidak ada foto
                            </div>
                        )}
                    </div>

                    {/* DETAIL */}
                    <div className="flex flex-col gap-3">
                        <div className="grid gap-3 md:grid-cols-3">
                            <ApproveInfoBox label="Diajukan Oleh">
                                {ticket.reporter}
                            </ApproveInfoBox>

                            <ApproveInfoBox label="Kategori">
                                {ticket.category}
                            </ApproveInfoBox>

                            <ApproveInfoBox label="Prioritas">
                                <span
                                    className={
                                        ticket.priority === 'Darurat'
                                            ? 'text-red-600'
                                            : ''
                                    }
                                >
                                    {ticket.priority === 'Darurat'
                                        ? 'Urgent'
                                        : 'Standard'}
                                </span>
                            </ApproveInfoBox>
                        </div>

                        <ApproveInfoBox label="Deskripsi Kerusakan">
                            {ticket.detail}
                        </ApproveInfoBox>

                        <div className="rounded-xl border border-[#68b59b] bg-[#d9eee7] px-5 py-3 text-[#185c49]">
                            <div className="mb-0.5 text-sm text-gray-500">
                                Lokasi Kerusakan
                            </div>

                            <div className="flex items-center gap-2 text-sm font-bold">
                                <Cog size={17} />
                                <span>
                                    {ticket.machineCode || 'MC-1783994413365'}
                                    {' - '}
                                    {ticket.machineName ||
                                        'Mesin Giling 1 (WFJ-30 Super Crusher)'}
                                </span>
                            </div>

                            <div className="mt-0.5 flex items-center gap-2 text-sm font-bold">
                                <MapPin size={17} />
                                <span>{ticket.location}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="my-4 border-t border-[#333]" />

                {/* ======================
                    ASSIGNMENT AREA
                ====================== */}
                <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
                    {/* PIC + DATE */}
                    <div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-800">
                                Pilih PIC Teknisi
                            </label>

                            <select
                                value={form.data.pic_technician_id}
                                onChange={(event) =>
                                    form.setData(
                                        'pic_technician_id',
                                        event.target.value,
                                    )
                                }
                                className="h-[52px] w-full rounded-xl border border-[#8b8b8b] bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-green-600 focus:ring-1 focus:ring-green-600"
                            >
                                <option value="">-- Pilih Teknisi --</option>
                                {technicians.map((technician) => (
                                    <option
                                        key={technician.id}
                                        value={technician.id}
                                    >
                                        {technician.name}
                                    </option>
                                ))}
                            </select>

                            {form.errors.pic_technician_id && (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.pic_technician_id}
                                </p>
                            )}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-800">
                                    Tanggal Dibuat
                                </label>
                                <input
                                    type="date"
                                    value={form.data.created_at}
                                    onChange={(event) =>
                                        form.setData(
                                            'created_at',
                                            event.target.value,
                                        )
                                    }
                                    className="h-[52px] w-full rounded-xl border border-[#8b8b8b] bg-[#f8f8f8] px-4 text-sm text-gray-700 outline-none focus:border-green-600"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-800">
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    value={form.data.deadline}
                                    onChange={(event) =>
                                        form.setData(
                                            'deadline',
                                            event.target.value,
                                        )
                                    }
                                    className="h-[52px] w-full rounded-xl border border-[#8b8b8b] bg-[#f8f8f8] px-4 text-sm text-gray-700 outline-none focus:border-green-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* TEKNISI TAMBAHAN */}
                    <div className="min-h-[145px] rounded-xl border border-[#8b8b8b] bg-[#f9fafb] px-5 py-4">
                        <div className="mb-3 text-sm font-medium text-gray-800">
                            Teknisi Tambahan
                        </div>

                        <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                            {technicians
                                .filter(
                                    (technician) =>
                                        technician.id !==
                                        form.data.pic_technician_id,
                                )
                                .map((technician) => (
                                    <label
                                        key={technician.id}
                                        className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.data.additional_technician_ids.includes(
                                                technician.id,
                                            )}
                                            onChange={() =>
                                                toggleAdditionalTechnician(
                                                    technician.id,
                                                )
                                            }
                                            className="h-4 w-4 rounded border-gray-400 accent-green-600"
                                        />
                                        <span>{technician.name}</span>
                                    </label>
                                ))}
                        </div>
                    </div>
                </div>

                {/* ======================
                    SPAREPART
                ====================== */}
                <div className="mt-4">
                    <label className="mb-1.5 block text-sm font-medium text-gray-800">
                        Daftar Sparepart
                    </label>

                    <div className="space-y-3">
                        {sparepartRows.map((row, index) => (
                            <div
                                key={`sparepart-row-${index}`}
                                className="grid gap-2 md:grid-cols-[minmax(0,1fr)_160px_110px_48px]"
                            >
                                <select
                                    id={`approve-sparepart-select-${index}`}
                                    value={row.sparepart_id}
                                    onChange={(event) =>
                                        updateSparepartRow(
                                            'main',
                                            index,
                                            'sparepart_id',
                                            event.target.value,
                                        )
                                    }
                                    className="h-[52px] w-full rounded-xl border border-[#8b8b8b] bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-green-600"
                                >
                                    <option value="">-- Pilih Sparepart --</option>
                                    {spareparts.map((sparepart) => (
                                        <option
                                            key={sparepart.id}
                                            value={sparepart.id}
                                        >
                                            {sparepart.name}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    id={`approve-sparepart-quantity-${index}`}
                                    type="number"
                                    min="1"
                                    value={row.quantity}
                                    onChange={(event) =>
                                        updateSparepartRow(
                                            'main',
                                            index,
                                            'quantity',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Jumlah.."
                                    className="h-[52px] rounded-xl border border-[#8b8b8b] bg-white px-4 text-sm text-gray-700 outline-none focus:border-green-600"
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        addSparepartRow('main');
                                        syncSparepartsToForm();
                                    }}
                                    className="h-[52px] rounded-xl bg-blue-500 px-5 text-sm font-bold text-white transition hover:bg-blue-600"
                                >
                                    Tambah
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeSparepartRow('main', index)
                                    }
                                    className="h-[52px] rounded-xl border border-red-200 bg-red-50 px-2 text-red-500 transition hover:bg-red-100"
                                    aria-label="Hapus sparepart"
                                >
                                    <X size={17} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {usedSpareparts.length > 0 && (
                        <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white">
                            {usedSpareparts.map((item, index) => (
                                <div
                                    key={`${item.sparepart_id}-${index}`}
                                    className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-b-0"
                                >
                                    <div className="text-sm text-gray-700">
                                        <span className="font-semibold">
                                            {item.name}
                                        </span>
                                        <span className="ml-3 text-gray-500">
                                            {item.quantity} Pcs
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeSparepart(index)
                                        }
                                        className="rounded-lg p-1 text-red-500 transition hover:bg-red-50"
                                        aria-label="Hapus sparepart"
                                    >
                                        <X size={17} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <label className="mb-1.5 block text-sm font-medium text-gray-800">
                        Sparepart Tambahan
                    </label>

                    <div className="space-y-3">
                        {additionalSparepartRows.map((row, index) => (
                            <div
                                key={`additional-sparepart-row-${index}`}
                                className="grid gap-2 md:grid-cols-[minmax(0,1fr)_160px_110px_48px]"
                            >
                                <input
                                    id={`additional-sparepart-name-${index}`}
                                    type="text"
                                    value={row.custom_name}
                                    onChange={(event) =>
                                        updateSparepartRow(
                                            'additional',
                                            index,
                                            'custom_name',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Sparepart custom"
                                    className="h-[52px] rounded-xl border border-[#8b8b8b] bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-green-600"
                                />

                                <input
                                    id={`additional-sparepart-quantity-${index}`}
                                    type="number"
                                    min="1"
                                    value={row.quantity}
                                    onChange={(event) =>
                                        updateSparepartRow(
                                            'additional',
                                            index,
                                            'quantity',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Jumlah.."
                                    className="h-[52px] rounded-xl border border-[#8b8b8b] bg-white px-4 text-sm text-gray-700 outline-none focus:border-green-600"
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        addSparepartRow('additional');
                                        syncSparepartsToForm();
                                    }}
                                    className="h-[52px] rounded-xl bg-blue-500 px-5 text-sm font-bold text-white transition hover:bg-blue-600"
                                >
                                    Tambah
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeSparepartRow('additional', index)
                                    }
                                    className="h-[52px] rounded-xl border border-red-200 bg-red-50 px-2 text-red-500 transition hover:bg-red-100"
                                    aria-label="Hapus sparepart tambahan"
                                >
                                    <X size={17} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ACTION */}
                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="min-w-[150px] rounded-xl bg-[#2faa32] px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-[#249428] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {form.processing ? 'Memproses...' : 'Assign Ticket'}
                    </button>
                </div>
            </div>
        </form>
    );
}

function ApproveInfoBox({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-[#8b8b8b] bg-[#f7f7f7] px-4 py-3">
            <div className="text-sm text-[#7a7a7a]">{label}</div>
            <div className="font-semibold text-[#1f2937]">{children}</div>
        </div>
    );
}


type RejectForm = ReturnType<typeof useForm<{ reason: string }>>;

function RejectModal({
    ticket,
    form,
    closeModal,
    submitReject,
}: {
    ticket: TicketRow;
    form: RejectForm;
    closeModal: () => void;
    submitReject: (event: FormEvent) => void;
}) {
    return (
        <form
            onSubmit={submitReject}
            className="max-h-[94vh] w-full max-w-[1030px] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        >
            <ModalHeader closeModal={closeModal} />

            <div className="p-5">
                <TicketSummary ticket={ticket} />

                <div className="my-3 border-t border-black" />

                <label className="mb-1 block text-sm font-medium text-gray-800">
                    Keterangan Reject
                </label>

                <textarea
                    rows={3}
                    value={form.data.reason}
                    onChange={(event) => form.setData('reason', event.target.value)}
                    placeholder="Deskripsi Perbaikan.."
                    className="w-full resize-y rounded-md border border-gray-400 px-4 py-3 text-sm outline-none focus:border-red-500 text-gray-900"
                />

                {form.errors.reason && (
                    <p className="mt-1 text-xs text-red-600">
                        {form.errors.reason}
                    </p>
                )}

                <div className="mt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="rounded-md bg-[#dc5148] px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        {form.processing ? 'Memproses...' : 'Reject Ticket'}
                    </button>
                </div>
            </div>
        </form>
    );
}

function ModalHeader({ closeModal }: { closeModal: () => void }) {
    return (
        <div className="flex items-center justify-between rounded-t-2xl bg-black px-5 py-3 text-white">
            <div className="flex items-center gap-2 text-sm font-medium">
                <Wrench size={17} />
                Detail Tiket Perbaikan
            </div>

            <button
                type="button"
                onClick={closeModal}
                className="flex h-7 w-7 items-center justify-center rounded hover:bg-white/15"
                aria-label="Tutup"
            >
                <X size={16} />
            </button>
        </div>
    );
}

function TicketSummary({ ticket }: { ticket: TicketRow }) {
    return (
        <div className="grid gap-5 md:grid-cols-[395px_1fr]">
            <div className="overflow-hidden rounded-xl bg-gray-100">
                {ticket.image ? (
                    <img
                        src={ticket.image}
                        alt={ticket.code}
                        className="h-[265px] w-full object-cover"
                    />
                ) : (
                    <div className="flex h-[265px] items-center justify-center text-gray-400">
                        Tidak ada foto
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                    <SummaryBox label="Diajukan Oleh" value={ticket.reporter} />
                    <SummaryBox label="Kategori" value={ticket.category} />
                    <SummaryBox
                        label="Prioritas"
                        value={ticket.priority === 'Darurat' ? 'Urgent' : 'Standard'}
                        valueClassName={
                            ticket.priority === 'Darurat' ? 'text-red-600' : ''
                        }
                    />
                </div>

                <SummaryBox
                    label="Deskripsi Kerusakan"
                    value={ticket.detail}
                    large
                />

                <div className="rounded-xl border border-emerald-500/40 bg-[#d7eee6] px-4 py-3">
                    <p className="text-xs text-gray-500">Lokasi Kerusakan</p>
                    <p className="flex items-center gap-1 text-sm font-semibold text-emerald-950">
                        <span>⚙</span>
                        {ticket.machineCode || 'MC-1783994413365'} -{' '}
                        {ticket.machineName ||
                            'Mesin Giling 1 (WFJ-30 Super Crusher)'}
                    </p>
                    <p className="flex items-center gap-1 text-sm font-semibold text-emerald-950">
                        <span>●</span>
                        {ticket.location}
                    </p>
                </div>
            </div>
        </div>
    );
}

function SummaryBox({
    label,
    value,
    valueClassName = '',
    large = false,
}: {
    label: string;
    value: string;
    valueClassName?: string;
    large?: boolean;
}) {
    return (
        <div
            className={`rounded-xl border border-gray-400 bg-gray-50 px-4 py-3 ${
                large ? 'min-h-[82px]' : ''
            }`}
        >
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-sm font-semibold text-gray-900 ${valueClassName}`}>
                {value}
            </p>
        </div>
    );
}
