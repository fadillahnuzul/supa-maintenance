import { Head, router, useForm } from '@inertiajs/react';
import {
    ChevronDown,
    Circle,
    Cog,
    MapPin,
    Pencil,
    Upload,
    Wrench,
    X,
} from 'lucide-react';
import { FormEvent, useMemo, useRef, useState } from 'react';

type TicketStatus =
    | 'Waiting Approval'
    | 'Pending Approval'
    | 'Assigned'
    | 'Rejected'
    | 'In Progress'
    | 'Waiting Sparepart'
    | 'Completed';

type PriorityType = 'Darurat' | 'Standar' | 'Urgent' | 'Standard';

type Sparepart = {
    id: number;
    code?: string;
    name: string;
    stock?: number;
    unit?: string;
};

type UsedSparepart = {
    id: number;
    name: string;
    quantity: number;
    unit?: string;
};

type ProgressStatus = 'In Progress' | 'Waiting Sparepart' | 'Completed';

type SparepartRow = {
    id: string;
    name: string;
    quantity: string;
};

type RepairLog = {
    id: number;
    status: TicketStatus;
    description: string;
    created_at: string;
    created_by?: string;
};

type Documentation = {
    id: number;
    image: string;
    status: TicketStatus;
};

type Ticket = {
    id: number | string;
    code: string;
    category: string;
    detail: string;
    location: string;
    priority: PriorityType;
    deadline?: string | null;

    reporter: string;
    authorized_by?: string | null;
    technician?: string | null;
    member?: string | null;

    status: TicketStatus;

    machine_code?: string | null;
    machine_name?: string | null;

    image?: string | null;

    repair_logs?: RepairLog[];
    documentations?: Documentation[];
};

type Props = {
    ticket: Ticket;
    spareparts?: Sparepart[];
};

const statusStyles: Record<TicketStatus, string> = {
    'Waiting Approval': 'bg-amber-100 text-amber-700',
    'Pending Approval': 'bg-amber-100 text-amber-700',
    Assigned: 'bg-blue-100 text-blue-700',
    Rejected: 'bg-red-100 text-red-700',
    'In Progress': 'bg-amber-500 text-white',
    'Waiting Sparepart': 'bg-orange-100 text-orange-700',
    Completed: 'bg-green-100 text-green-700',
};

const timelineDotStyles: Record<TicketStatus, string> = {
    'Waiting Approval': 'bg-amber-500',
    'Pending Approval': 'bg-amber-500',
    Assigned: 'bg-blue-500',
    Rejected: 'bg-red-500',
    'In Progress': 'bg-blue-500',
    'Waiting Sparepart': 'bg-orange-500',
    Completed: 'bg-green-500',
};

function StatusBadge({ status }: { status: TicketStatus }) {
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
        >
            {status}
        </span>
    );
}

function InfoBox({
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

export default function TicketShow({
    ticket,
    spareparts = [],
}: Props) {
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [sparepartRows, setSparepartRows] = useState<SparepartRow[]>([
        { id: '', name: '', quantity: '' },
    ]);
    const [additionalSparepartRows, setAdditionalSparepartRows] = useState<
        SparepartRow[]
    >([{ id: '', name: '', quantity: '' }]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Sesuai requirement:
     * Update Progress hanya muncul untuk:
     * - Assigned
     * - In Progress
     * - Rejected
     */
    const canUpdateProgress = [
        'Assigned',
        'In Progress',
        'Rejected',
    ].includes(ticket.status);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm<{
        progress_status: ProgressStatus | '';
        description: string;
        evidence: File | null;
        spareparts_used: UsedSparepart[];
    }>({
        progress_status: '',
        description: '',
        evidence: null,
        spareparts_used: [],
    });

    const addSparepartRow = (group: 'main' | 'additional') => {
        if (group === 'main') {
            setSparepartRows((current) => [
                ...current,
                { id: '', name: '', quantity: '' },
            ]);

            return;
        }

        setAdditionalSparepartRows((current) => [
            ...current,
            { id: '', name: '', quantity: '' },
        ]);
    };

    const updateSparepartRow = (
        group: 'main' | 'additional',
        index: number,
        field: keyof SparepartRow,
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

    const removeSparepartRow = (group: 'main' | 'additional', index: number) => {
        const setter =
            group === 'main' ? setSparepartRows : setAdditionalSparepartRows;

        setter((current) => {
            if (current.length === 1) {
                return [{ id: '', name: '', quantity: '' }];
            }

            return current.filter((_, rowIndex) => rowIndex !== index);
        });
    };

    const prepareSparepartRows = (rows: SparepartRow[], startIndex = 0) =>
        rows.flatMap((row, index) => {
            const quantity = Number(row.quantity);

            if (!row.quantity || Number.isNaN(quantity) || quantity <= 0) {
                return [];
            }

            const selectedSparepart = row.id
                ? spareparts.find((item) => String(item.id) === row.id)
                : undefined;
            const name = (selectedSparepart?.name || row.name || '').trim();

            if (!name) {
                return [];
            }

            return [
                {
                    id: selectedSparepart?.id ?? startIndex + index + 1,
                    name,
                    quantity,
                    unit: selectedSparepart?.unit || 'Pcs',
                },
            ];
        });

    const closeModal = () => {
        setShowUpdateModal(false);
        setSparepartRows([{ id: '', name: '', quantity: '' }]);
        setAdditionalSparepartRows([{ id: '', name: '', quantity: '' }]);
        reset();
    };

    const submitUpdate = (event: FormEvent) => {
        event.preventDefault();

        const preparedSpareparts = [
            ...prepareSparepartRows(sparepartRows, 0),
            ...prepareSparepartRows(additionalSparepartRows, sparepartRows.length),
        ];

        setData('spareparts_used', preparedSpareparts);

        post(`/tickets/${ticket.id}/progress`, {
            forceFormData: true,
            preserveScroll: true,
            data: {
                ...data,
                progress_status: data.progress_status,
                spareparts_used: preparedSpareparts,
            },
            onSuccess: () => {
                setShowUpdateModal(false);
                setSparepartRows([{ id: '', name: '', quantity: '' }]);
                setAdditionalSparepartRows([{ id: '', name: '', quantity: '' }]);
                reset();
            },
        });
    };

    return (
        <>
            <Head title={`Detail Tiket ${ticket.code}`} />

            <div className="mx-auto w-full px-3 pb-6">
                {/* =======================
                    DETAIL TICKET CARD
                ======================= */}
                <section className="overflow-hidden rounded-[20px] bg-white shadow-md">
                    {/* Header */}
                    <div className="flex h-[52px] items-center bg-black px-6 text-white">
                        <Wrench size={20} className="mr-2" />
                        <h1 className="text-lg font-semibold">
                            Detail Tiket Perbaikan
                        </h1>
                    </div>

                    <div className="p-5">
                        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
                            {/* LEFT SIDE */}
                            <div>
                                <div className="overflow-hidden rounded-xl bg-gray-100">
                                    {ticket.image ? (
                                        <img
                                            src={ticket.image}
                                            alt={`Tiket ${ticket.code}`}
                                            className="h-[205px] w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-[205px] items-center justify-center text-gray-400">
                                            Tidak ada foto
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 rounded-xl border border-[#8b8b8b] bg-[#f8f8f8] p-4">
                                    <div className="mb-1 text-sm text-gray-600">
                                        Status Terkini
                                    </div>

                                    <StatusBadge status={ticket.status} />

                                    <div className="mt-3 space-y-0.5 text-sm leading-tight text-gray-600">
                                        <p>
                                            <strong>Diajukan oleh:</strong>{' '}
                                            {ticket.reporter}
                                        </p>

                                        <p>
                                            <strong>Otorisasi oleh:</strong>{' '}
                                            {ticket.authorized_by || '-'}
                                        </p>

                                        <p>
                                            <strong>Teknisi Utama (PIC):</strong>{' '}
                                            <span className="text-green-600">
                                                {ticket.technician || '-'}
                                            </span>
                                        </p>

                                        <p>
                                            <strong>Anggota Tim:</strong>{' '}
                                            {ticket.member || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT SIDE */}
                            <div className="flex flex-col">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <InfoBox label="Kategori">
                                        {ticket.category}
                                    </InfoBox>

                                    <InfoBox label="Prioritas">
                                        <span
                                            className={
                                                ticket.priority === 'Darurat' ||
                                                    ticket.priority === 'Urgent'
                                                    ? 'text-red-600'
                                                    : ''
                                            }
                                        >
                                            {ticket.priority}
                                        </span>
                                    </InfoBox>

                                    <InfoBox label="Deadline">
                                        <span className="text-red-600">
                                            {ticket.deadline || '-'}
                                        </span>
                                    </InfoBox>
                                </div>

                                <div className="mt-3">
                                    <InfoBox label="Deskripsi Kerusakan">
                                        {ticket.detail}
                                    </InfoBox>
                                </div>

                                <div className="mt-3 rounded-xl border border-[#68b59b] bg-[#d9eee7] px-5 py-3 text-[#185c49]">
                                    <div className="text-sm text-gray-500">
                                        Lokasi Kerusakan
                                    </div>

                                    {(ticket.machine_code ||
                                        ticket.machine_name) && (
                                            <div className="flex items-center gap-2 font-bold">
                                                <Cog size={17} />

                                                <span>
                                                    {ticket.machine_code}
                                                    {ticket.machine_code &&
                                                        ticket.machine_name &&
                                                        ' - '}
                                                    {ticket.machine_name}
                                                </span>
                                            </div>
                                        )}

                                    <div className="flex items-center gap-2 font-bold">
                                        <MapPin size={17} />
                                        {ticket.location}
                                    </div>
                                </div>

                                {/* UPDATE BUTTON */}
                                {canUpdateProgress && (
                                    <div className="mt-auto flex justify-end pt-8">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowUpdateModal(true)
                                            }
                                            className="flex items-center gap-3 rounded-xl bg-[#2faa32] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#249428]"
                                        >
                                            Update Progress
                                            <Pencil size={21} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* =======================
                    HISTORY SECTION
                ======================= */}
                <section className="mt-4 rounded-[20px] bg-white p-6 shadow-md">
                    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
                        {/* LOG HISTORY */}
                        <div className="rounded-xl border border-gray-200 p-5 shadow-sm">
                            <h2 className="mb-5 text-xs font-bold uppercase text-gray-500">
                                Riwayat Log Upaya Perbaikan
                            </h2>

                            {ticket.repair_logs?.length ? (
                                <div className="relative ml-3 border-l-2 border-gray-200 pl-7">
                                    {ticket.repair_logs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="relative mb-6 last:mb-0"
                                        >
                                            <div
                                                className={`absolute -left-[36px] top-1 h-4 w-4 rounded-full ring-4 ring-white ${timelineDotStyles[log.status]}`}
                                            />

                                            <div className="text-[11px] font-semibold text-gray-500">
                                                {log.created_at}
                                            </div>

                                            <div
                                                className={`text-sm font-bold ${log.status === 'Completed'
                                                    ? 'text-green-600'
                                                    : log.status ===
                                                        'Waiting Sparepart'
                                                        ? 'text-orange-500'
                                                        : log.status ===
                                                            'Rejected'
                                                            ? 'text-red-600'
                                                            : 'text-blue-600'
                                                    }`}
                                            >
                                                {log.status}
                                            </div>

                                            {log.created_by && (
                                                <div className="text-xs text-gray-600">
                                                    {log.created_by}
                                                </div>
                                            )}

                                            <p className="mt-1 text-xs text-gray-600">
                                                {log.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 text-center text-sm text-gray-400">
                                    Belum ada riwayat perbaikan.
                                </div>
                            )}
                        </div>

                        {/* DOCUMENTATION */}
                        <div className="min-h-[265px] rounded-xl border border-[#8b8b8b] bg-[#f9fafb] p-5">
                            <h2 className="mb-3 text-sm text-gray-500">
                                Dokumentasi Proses
                            </h2>

                            {ticket.documentations?.length ? (
                                <div className="flex flex-wrap gap-4">
                                    {ticket.documentations.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex flex-col items-center"
                                        >
                                            <img
                                                src={doc.image}
                                                alt="Dokumentasi proses"
                                                className="h-[145px] w-[175px] rounded-sm object-cover"
                                            />

                                            <div className="mt-2">
                                                <StatusBadge
                                                    status={doc.status}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-[180px] items-center justify-center text-sm text-gray-400">
                                    Belum ada dokumentasi proses.
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            {/* ===========================
                UPDATE PROGRESS MODAL
            =========================== */}
            {showUpdateModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
                    onMouseDown={(event) => {
                        if (event.currentTarget === event.target) {
                            closeModal();
                        }
                    }}
                >
                    <form
                        onSubmit={submitUpdate}
                        className="relative max-h-[95vh] w-full max-w-[1200px] overflow-y-auto rounded-[18px] border border-[#185c49] bg-[#f8fafc] p-8 shadow-2xl"
                    >
                        {/* Close */}
                        <button
                            type="button"
                            onClick={closeModal}
                            className="absolute right-4 top-3 text-black transition hover:text-red-600"
                        >
                            <X size={22} />
                        </button>

                        <h2 className="mb-8 text-center text-3xl font-bold text-black">
                            Update Laporan Perbaikan
                        </h2>

                        {/* COMPLETED */}
                        <div className="mb-4 flex justify-end gap-3">
                            {(
                                ['In Progress', 'Waiting Sparepart', 'Completed'] as ProgressStatus[]
                            ).map((status) => (
                                <label
                                    key={status}
                                    className="flex min-w-[370px] cursor-pointer items-center gap-5 rounded-xl border border-[#8b8b8b] bg-white px-6 py-4 text-xl text-gray-800 font-bold"
                                >
                                    <input
                                        type="checkbox"
                                        checked={data.progress_status === status}
                                        onChange={() =>
                                            setData(
                                                'progress_status',
                                                data.progress_status === status
                                                    ? ''
                                                    : status,
                                            )
                                        }
                                        className="h-6 w-6"
                                    />

                                    {status === 'Waiting Sparepart'
                                        ? 'Waiting Sparepart'
                                        : status === 'Completed'
                                            ? 'Selesai'
                                            : 'In Progress'}
                                </label>
                            ))}
                        </div>

                        {/* SPAREPART */}
                        <div className="mb-4">
                            <label className="mb-2 block text-lg font-medium text-gray-800">
                                Sparepart yang digunakan
                            </label>

                            <div className="space-y-3">
                                {sparepartRows.map((row, index) => (
                                    <div
                                        key={`sparepart-row-${index}`}
                                        className="grid gap-2 md:grid-cols-[minmax(0,1fr)_180px_120px_48px]"
                                    >
                                        <div className="relative">
                                            <select
                                                id={`sparepart-select-${index}`}
                                                value={row.id}
                                                onChange={(event) =>
                                                    updateSparepartRow(
                                                        'main',
                                                        index,
                                                        'id',
                                                        event.target.value,
                                                    )
                                                }
                                                className="h-[64px] w-full appearance-none rounded-xl border border-[#8b8b8b] bg-white px-6 pr-12 text-lg outline-none focus:border-green-600 text-gray-600"
                                            >
                                                <option value="" className="text-gray-400">
                                                    -- Pilih Sparepart --
                                                </option>

                                                {spareparts.map((sparepart) => (
                                                    <option
                                                        key={sparepart.id}
                                                        value={sparepart.id}
                                                    >
                                                        {sparepart.code
                                                            ? `${sparepart.code} - `
                                                            : ''}
                                                        {sparepart.name}
                                                        {sparepart.stock !== undefined
                                                            ? ` (Stock: ${sparepart.stock})`
                                                            : ''}
                                                    </option>
                                                ))}
                                            </select>

                                            <ChevronDown
                                                size={28}
                                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                            />
                                        </div>

                                        <input
                                            id={`sparepart-quantity-${index}`}
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
                                            className="h-[64px] rounded-xl border border-[#8b8b8b] bg-white px-5 text-lg outline-none focus:border-green-600 text-gray-800"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                addSparepartRow('main')
                                            }
                                            className="h-[64px] rounded-xl bg-blue-500 px-6 text-lg font-bold text-white transition hover:bg-blue-600"
                                        >
                                            Tambah
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeSparepartRow('main', index)
                                            }
                                            className="h-[64px] rounded-xl border border-red-200 bg-red-50 px-4 text-red-600 transition hover:bg-red-100"
                                            aria-label="Hapus sparepart"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}

                            </div>

                            {/* ADDED SPAREPART */}
                            {data.spareparts_used.length > 0 && (
                                <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white">
                                    {data.spareparts_used.map(
                                        (sparepart, index) => (
                                            <div
                                                key={`${sparepart.id}-${index}`}
                                                className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-b-0"
                                            >
                                                <div>
                                                    <span className="font-semibold">
                                                        {sparepart.name}
                                                    </span>

                                                    <span className="ml-3 text-sm text-gray-500">
                                                        {sparepart.quantity}{' '}
                                                        {sparepart.unit || ''}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setData(
                                                            'spareparts_used',
                                                            data.spareparts_used.filter(
                                                                (_, i) => i !== index,
                                                            ),
                                                        )
                                                    }
                                                    className="rounded-lg p-1 text-red-500 hover:bg-red-50"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ADDITIONAL SPAREPART */}
                        <div className="mb-4">
                            <label className="mb-2 block text-lg font-medium text-gray-800">
                                Sparepart Tambahan
                            </label>

                            <div className="space-y-3">
                                {additionalSparepartRows.map((row, index) => (
                                    <div
                                        key={`additional-sparepart-row-${index}`}
                                        className="grid gap-2 md:grid-cols-[minmax(0,1fr)_180px_120px_48px]"
                                    >
                                        <input
                                            id={`additional-sparepart-name-${index}`}
                                            type="text"
                                            value={row.name}
                                            onChange={(event) =>
                                                updateSparepartRow(
                                                    'additional',
                                                    index,
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Sparepart custom"
                                            className="h-[64px] rounded-xl border border-[#8b8b8b] bg-white px-5 text-lg outline-none focus:border-green-600 text-gray-800"
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
                                            className="h-[64px] rounded-xl border border-[#8b8b8b] bg-white px-5 text-lg outline-none focus:border-green-600 text-gray-800"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                addSparepartRow('additional')
                                            }
                                            className="h-[64px] rounded-xl bg-blue-500 px-6 py-3 text-lg font-bold text-white transition hover:bg-blue-600"
                                        >
                                            Tambah
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeSparepartRow(
                                                    'additional',
                                                    index,
                                                )
                                            }
                                            className="h-[64px] rounded-xl border border-red-200 bg-red-50 px-4 text-red-600 transition hover:bg-red-100"
                                            aria-label="Hapus sparepart"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}

                            </div>

                            {/* ADDITIONAL SPAREPART */}
                            {data.spareparts_used.length > 0 && (
                                <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white">
                                    {data.spareparts_used.map(
                                        (sparepart, index) => (
                                            <div
                                                key={`${sparepart.id}-${index}`}
                                                className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-b-0"
                                            >
                                                <div>
                                                    <span className="font-semibold">
                                                        {sparepart.name}
                                                    </span>

                                                    <span className="ml-3 text-sm text-gray-500">
                                                        {sparepart.quantity}{' '}
                                                        {sparepart.unit || ''}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setData(
                                                            'spareparts_used',
                                                            data.spareparts_used.filter(
                                                                (_, i) => i !== index,
                                                            ),
                                                        )
                                                    }
                                                    className="rounded-lg p-1 text-red-500 hover:bg-red-50"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>

                        {/* DESCRIPTION */}
                        <div className="mb-4">
                            <label className="mb-2 block text-lg font-medium text-gray-800">
                                Deskripsi
                            </label>

                            <textarea
                                rows={3}
                                value={data.description}
                                onChange={(event) =>
                                    setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                placeholder="Deskripsi Perbaikan.."
                                className="w-full resize-y rounded-xl border border-[#8b8b8b] bg-white px-5 py-4 text-lg text-gray-800 outline-none focus:border-green-600"
                            />

                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* UPLOAD */}
                        <div className="">
                            <label className="mb-2 block text-lg font-medium text-gray-800">
                                Unggah Bukti
                            </label>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) =>
                                    setData(
                                        'evidence',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                className="flex min-h-[75px] w-full flex-col items-center justify-center rounded-xl border border-[#8b8b8b] bg-white transition hover:bg-gray-50"
                            >
                                <Upload
                                    size={30}
                                    strokeWidth={2.5}
                                    className="text-gray-500"
                                />

                                {data.evidence && (
                                    <span className="mt-2 text-sm font-medium text-gray-600">
                                        {data.evidence.name}
                                    </span>
                                )}
                            </button>

                            {errors.evidence && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.evidence}
                                </p>
                            )}
                        </div>

                        {/* SUBMIT */}
                        <div className="mt-8 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="min-w-[250px] rounded-xl bg-[#2faa32] px-8 py-4 text-2xl font-bold text-white transition hover:bg-[#249428] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Log'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}