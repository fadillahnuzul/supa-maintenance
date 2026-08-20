import { Head, router } from '@inertiajs/react';
import {
    Check,
    ChevronLeft,
    ChevronRight,
    Eye,
    Pencil,
    Plus,
    Search,
    ShieldCheck,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type TicketStatus =
    | 'pending_approval'
    | 'rejected'
    | 'assigned'
    | 'in_progress'
    | 'waiting_sparepart'
    | 'waiting_verification'
    | 'completed';

type PriorityType = 'standard' | 'urgent';

type TicketRow = {
    id: number;
    code: string;

    category: string;
    category_label: string;

    detail: string;

    location: string | null;

    priority: PriorityType;
    priority_label: string;

    reporter: string | null;
    technician: string | null;

    status: TicketStatus;
    status_label: string;

    created_at: string | null;
};

type Technician = {
    id: number;
    name: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedTickets = {
    data: TicketRow[];

    current_page: number;
    last_page: number;

    per_page: number;
    total: number;

    from: number | null;
    to: number | null;

    links: PaginationLink[];

    prev_page_url?: string | null;
    next_page_url?: string | null;
};

type Filters = {
    status?: string | null;
    priority?: string | null;
    technician_id?: string | number | null;
    search?: string | null;
};

type Props = {
    tickets: PaginatedTickets;

    technicians: Technician[];

    filters: Filters;

    can: {
        approve: boolean;
        verify: boolean;
    };
};

/*
|--------------------------------------------------------------------------
| STATUS STYLE
|--------------------------------------------------------------------------
*/

const statusStyles: Record<TicketStatus, string> = {
    pending_approval:
        'bg-[#fef3c7] text-[#b45309]',

    rejected:
        'bg-[#fee2e2] text-[#b91c1c]',

    assigned:
        'bg-[#e0f2fe] text-[#0369a1]',

    in_progress:
        'bg-[#fef3c7] text-[#a16207]',

    waiting_sparepart:
        'bg-[#ffedd5] text-[#c2410c]',

    waiting_verification:
        'bg-[#f3e8ff] text-[#7e22ce]',

    completed:
        'bg-[#dcfce7] text-[#166534]',
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function TicketIndex({
    tickets,
    technicians,
    filters,
    can,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | FILTER STATE
    |--------------------------------------------------------------------------
    */

    const [statusFilter, setStatusFilter] =
        useState(filters.status ?? '');

    const [priorityFilter, setPriorityFilter] =
        useState(filters.priority ?? '');

    const [technicianFilter, setTechnicianFilter] =
        useState(
            filters.technician_id
                ? String(filters.technician_id)
                : '',
        );

    const [search, setSearch] =
        useState(filters.search ?? '');

    /*
    |--------------------------------------------------------------------------
    | APPLY FILTER
    |--------------------------------------------------------------------------
    */

    const applyFilter = (
        next: {
            status?: string;
            priority?: string;
            technician_id?: string;
            search?: string;
        } = {},
    ) => {
        const nextStatus =
            next.status !== undefined
                ? next.status
                : statusFilter;

        const nextPriority =
            next.priority !== undefined
                ? next.priority
                : priorityFilter;

        const nextTechnician =
            next.technician_id !== undefined
                ? next.technician_id
                : technicianFilter;

        const nextSearch =
            next.search !== undefined
                ? next.search
                : search;

        router.get(
            '/tickets',
            {
                status:
                    nextStatus || undefined,

                priority:
                    nextPriority || undefined,

                technician_id:
                    nextTechnician || undefined,

                search:
                    nextSearch || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | STATUS FILTER
    |--------------------------------------------------------------------------
    */

    const handleStatusChange = (
        value: string,
    ) => {
        setStatusFilter(value);

        applyFilter({
            status: value,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | PRIORITY FILTER
    |--------------------------------------------------------------------------
    */

    const handlePriorityChange = (
        value: string,
    ) => {
        setPriorityFilter(value);

        applyFilter({
            priority: value,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | TECHNICIAN FILTER
    |--------------------------------------------------------------------------
    */

    const handleTechnicianChange = (
        value: string,
    ) => {
        setTechnicianFilter(value);

        applyFilter({
            technician_id: value,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    const submitSearch = (
        event: FormEvent,
    ) => {
        event.preventDefault();

        applyFilter({
            search,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | RESET FILTER
    |--------------------------------------------------------------------------
    */

    const resetFilter = () => {
        setStatusFilter('');
        setPriorityFilter('');
        setTechnicianFilter('');
        setSearch('');

        router.get(
            '/tickets',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | OPEN CREATE
    |--------------------------------------------------------------------------
    */

    const openCreate = () => {
        router.visit('/tickets/create');
    };

    /*
    |--------------------------------------------------------------------------
    | OPEN SHOW
    |--------------------------------------------------------------------------
    */

    const openShow = (
        code: string,
    ) => {
        router.visit(
            `/tickets/${encodeURIComponent(code)}`,
        );
    };

    /*
    |--------------------------------------------------------------------------
    | OPEN APPROVAL
    |--------------------------------------------------------------------------
    */

    const openApproval = (
        code: string,
    ) => {
        router.visit(
            `/tickets/${encodeURIComponent(code)}/approval`,
        );
    };

    /*
    |--------------------------------------------------------------------------
    | ACTION BUTTON
    |--------------------------------------------------------------------------
    */

    const getActionButton = (
        ticket: TicketRow,
    ) => {
        /*
         * PENDING APPROVAL
         */

        if (
            ticket.status ===
                'pending_approval' &&
            can.approve
        ) {
            return (
                <div className="flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            openApproval(
                                ticket.code,
                            )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22c55e] text-white shadow-sm transition hover:bg-[#16a34a]"
                        title="Approval"
                        aria-label="Approval"
                    >
                        <Check size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            openShow(
                                ticket.code,
                            )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3b82f6] text-white shadow-sm transition hover:bg-[#2563eb]"
                        title="Lihat Detail"
                        aria-label="Lihat Detail"
                    >
                        <Eye size={18} />
                    </button>
                </div>
            );
        }

        /*
         * ASSIGNED / IN PROGRESS /
         * WAITING SPAREPART
         */

        if (
            ticket.status === 'assigned' ||
            ticket.status === 'in_progress' ||
            ticket.status ===
                'waiting_sparepart'
        ) {
            return (
                <div className="flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            openShow(
                                ticket.code,
                            )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22c55e] text-white shadow-sm transition hover:bg-[#16a34a]"
                        title="Update Progress"
                        aria-label="Update Progress"
                    >
                        <Pencil size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            openShow(
                                ticket.code,
                            )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3b82f6] text-white shadow-sm transition hover:bg-[#2563eb]"
                        title="Lihat Detail"
                        aria-label="Lihat Detail"
                    >
                        <Eye size={18} />
                    </button>
                </div>
            );
        }

        /*
         * WAITING VERIFICATION
         */

        if (
            ticket.status ===
                'waiting_verification' &&
            can.verify
        ) {
            return (
                <div className="flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            openShow(
                                ticket.code,
                            )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#9333ea] text-white shadow-sm transition hover:bg-[#7e22ce]"
                        title="Verification"
                        aria-label="Verification"
                    >
                        <ShieldCheck
                            size={18}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            openShow(
                                ticket.code,
                            )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3b82f6] text-white shadow-sm transition hover:bg-[#2563eb]"
                        title="Lihat Detail"
                        aria-label="Lihat Detail"
                    >
                        <Eye size={18} />
                    </button>
                </div>
            );
        }

        /*
         * DEFAULT: VIEW ONLY
         */

        return (
            <div className="flex items-center justify-center">
                <button
                    type="button"
                    onClick={() =>
                        openShow(
                            ticket.code,
                        )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3b82f6] text-white shadow-sm transition hover:bg-[#2563eb]"
                    title="Lihat Detail"
                    aria-label="Lihat Detail"
                >
                    <Eye size={18} />
                </button>
            </div>
        );
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Daftar Tiket Maintenance" />

            <div className="mx-auto flex w-full flex-col px-3 pb-6">
                {/* ========================================================
                    HEADER
                ======================================================== */}

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
                    <div>
                        <h3 className="text-[24px] font-extrabold text-[#111827]">
                            Daftar Pengerjaan &amp;
                            Approval
                        </h3>

                        <p className="mt-1 text-sm text-[#6b7280]">
                            Kelola tiket perbaikan,
                            pengerjaan, approval,
                            dan verification.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#22c55e] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#16a34a]"
                    >
                        <Plus size={18} />

                        Buat Tiket
                    </button>
                </div>

                {/* ========================================================
                    FILTER
                ======================================================== */}

                <div className="mb-4 flex flex-wrap items-center gap-2.5">
                    {/* STATUS */}

                    <div className="min-w-[190px] rounded-xl border border-[#dfe3e8] bg-white px-3 py-2.5 text-[#4b5563] shadow-sm">
                        <select
                            value={
                                statusFilter
                            }
                            onChange={(event) =>
                                handleStatusChange(
                                    event.target
                                        .value,
                                )
                            }
                            className="w-full cursor-pointer bg-transparent text-sm font-medium outline-none"
                        >
                            <option value="">
                                Semua Status
                            </option>

                            <option value="pending_approval">
                                Pending Approval
                            </option>

                            <option value="assigned">
                                Assigned
                            </option>

                            <option value="in_progress">
                                In Progress
                            </option>

                            <option value="waiting_sparepart">
                                Waiting Sparepart
                            </option>

                            <option value="waiting_verification">
                                Waiting Verification
                            </option>

                            <option value="completed">
                                Completed
                            </option>

                            <option value="rejected">
                                Rejected
                            </option>
                        </select>
                    </div>

                    {/* PRIORITY */}

                    <div className="min-w-[175px] rounded-xl border border-[#dfe3e8] bg-white px-3 py-2.5 text-[#4b5563] shadow-sm">
                        <select
                            value={
                                priorityFilter
                            }
                            onChange={(event) =>
                                handlePriorityChange(
                                    event.target
                                        .value,
                                )
                            }
                            className="w-full cursor-pointer bg-transparent text-sm font-medium outline-none"
                        >
                            <option value="">
                                Semua Prioritas
                            </option>

                            <option value="urgent">
                                Urgent
                            </option>

                            <option value="standard">
                                Standar
                            </option>
                        </select>
                    </div>

                    {/* TECHNICIAN */}

                    <div className="min-w-[190px] rounded-xl border border-[#dfe3e8] bg-white px-3 py-2.5 text-[#4b5563] shadow-sm">
                        <select
                            value={
                                technicianFilter
                            }
                            onChange={(event) =>
                                handleTechnicianChange(
                                    event.target
                                        .value,
                                )
                            }
                            className="w-full cursor-pointer bg-transparent text-sm font-medium outline-none"
                        >
                            <option value="">
                                Semua Teknisi
                            </option>

                            {technicians.map(
                                (
                                    technician,
                                ) => (
                                    <option
                                        key={
                                            technician.id
                                        }
                                        value={
                                            technician.id
                                        }
                                    >
                                        {
                                            technician.name
                                        }
                                    </option>
                                ),
                            )}
                        </select>
                    </div>

                    {/* SEARCH */}

                    <form
                        onSubmit={submitSearch}
                        className="ml-auto flex min-w-[260px] items-center overflow-hidden rounded-xl border border-[#dfe3e8] bg-white shadow-sm"
                    >
                        <div className="flex flex-1 items-center gap-2 px-3">
                            <Search
                                size={17}
                                className="shrink-0 text-[#6b7280]"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(
                                    event,
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Cari tiket..."
                                className="w-full border-0 bg-transparent py-2.5 text-sm text-[#111827] outline-none placeholder:text-[#9ca3af]"
                            />
                        </div>

                        <button
                            type="submit"
                            className="border-l border-[#dfe3e8] bg-[#f9fafb] px-4 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#f3f4f6]"
                        >
                            Cari
                        </button>
                    </form>

                    {/* RESET */}

                    {(statusFilter ||
                        priorityFilter ||
                        technicianFilter ||
                        search) && (
                        <button
                            type="button"
                            onClick={
                                resetFilter
                            }
                            className="rounded-xl border border-[#dfe3e8] bg-white px-4 py-2.5 text-sm font-semibold text-[#6b7280] shadow-sm transition hover:bg-[#f9fafb]"
                        >
                            Reset
                        </button>
                    )}
                </div>

                {/* ========================================================
                    TABLE
                ======================================================== */}

                <div className="overflow-hidden rounded-xl border border-[#dfe3e8] bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse text-left text-sm text-[#374151]">
                            <thead>
                                <tr className="bg-[#e5e7eb] text-[#111827]">
                                    <th className="whitespace-nowrap border border-[#dfe3e8] px-3 py-3 font-bold">
                                        Kode Tiket
                                    </th>

                                    <th className="min-w-[260px] border border-[#dfe3e8] px-3 py-3 font-bold">
                                        Kategori dan Detail
                                    </th>

                                    <th className="min-w-[150px] border border-[#dfe3e8] px-3 py-3 font-bold">
                                        Lokasi
                                    </th>

                                    <th className="whitespace-nowrap border border-[#dfe3e8] px-3 py-3 font-bold">
                                        Prioritas
                                    </th>

                                    <th className="min-w-[150px] border border-[#dfe3e8] px-3 py-3 font-bold">
                                        Pelapor
                                    </th>

                                    <th className="min-w-[150px] border border-[#dfe3e8] px-3 py-3 font-bold">
                                        Teknisi
                                    </th>

                                    <th className="whitespace-nowrap border border-[#dfe3e8] px-3 py-3 font-bold">
                                        Status
                                    </th>

                                    <th className="w-[125px] whitespace-nowrap border border-[#dfe3e8] px-3 py-3 text-center font-bold">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {tickets.data.map(
                                    (ticket) => (
                                        <tr
                                            key={
                                                ticket.id
                                            }
                                            className="bg-white transition hover:bg-[#f9fafb]"
                                        >
                                            {/* CODE */}

                                            <td className="border border-[#dfe3e8] px-3 py-3 align-top">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openShow(
                                                            ticket.code,
                                                        )
                                                    }
                                                    className="text-left font-semibold text-[#111827] transition hover:text-blue-600"
                                                >
                                                    {
                                                        ticket.code
                                                    }
                                                </button>

                                                {ticket.created_at && (
                                                    <span className="mt-1 block whitespace-nowrap text-[11px] text-[#9ca3af]">
                                                        {
                                                            ticket.created_at
                                                        }
                                                    </span>
                                                )}
                                            </td>

                                            {/* CATEGORY */}

                                            <td className="border border-[#dfe3e8] px-3 py-3 align-top">
                                                <span className="block font-semibold text-[#111827]">
                                                    {
                                                        ticket.category_label
                                                    }
                                                </span>

                                                <span className="mt-0.5 block max-w-[350px] break-words text-[#4b5563]">
                                                    {
                                                        ticket.detail
                                                    }
                                                </span>
                                            </td>

                                            {/* LOCATION */}

                                            <td className="border border-[#dfe3e8] px-3 py-3 align-top text-[#111827]">
                                                {ticket.location ||
                                                    '-'}
                                            </td>

                                            {/* PRIORITY */}

                                            <td className="border border-[#dfe3e8] px-3 py-3 align-top">
                                                <span
                                                    className={
                                                        ticket.priority ===
                                                        'urgent'
                                                            ? 'font-bold text-[#dc2626]'
                                                            : 'font-medium text-[#111827]'
                                                    }
                                                >
                                                    {
                                                        ticket.priority_label
                                                    }
                                                </span>
                                            </td>

                                            {/* REPORTER */}

                                            <td className="border border-[#dfe3e8] px-3 py-3 align-top text-[#111827]">
                                                {ticket.reporter ||
                                                    '-'}
                                            </td>

                                            {/* TECHNICIAN */}

                                            <td className="border border-[#dfe3e8] px-3 py-3 align-top text-[#111827]">
                                                {ticket.technician ? (
                                                    ticket.technician
                                                ) : (
                                                    <span className="text-[#9ca3af]">
                                                        Belum
                                                        ditentukan
                                                    </span>
                                                )}
                                            </td>

                                            {/* STATUS */}

                                            <td className="border border-[#dfe3e8] px-3 py-3 align-top">
                                                <span
                                                    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        statusStyles[
                                                            ticket
                                                                .status
                                                        ]
                                                    }`}
                                                >
                                                    {
                                                        ticket.status_label
                                                    }
                                                </span>
                                            </td>

                                            {/* ACTION */}

                                            <td className="border border-[#dfe3e8] px-3 py-3 align-middle">
                                                {getActionButton(
                                                    ticket,
                                                )}
                                            </td>
                                        </tr>
                                    ),
                                )}

                                {tickets.data
                                    .length ===
                                    0 && (
                                    <tr>
                                        <td
                                            colSpan={
                                                8
                                            }
                                            className="px-4 py-10 text-center text-sm text-[#6b7280]"
                                        >
                                            Tidak ada
                                            tiket yang
                                            sesuai
                                            dengan
                                            filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ========================================================
                    PAGINATION FOOTER
                ======================================================== */}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-[#6b7280]">
                        {tickets.total >
                        0 ? (
                            <>
                                Menampilkan{' '}
                                <span className="font-semibold text-[#111827]">
                                    {tickets.from ??
                                        0}
                                </span>{' '}
                                -{' '}
                                <span className="font-semibold text-[#111827]">
                                    {tickets.to ??
                                        0}
                                </span>{' '}
                                dari{' '}
                                <span className="font-semibold text-[#111827]">
                                    {
                                        tickets.total
                                    }
                                </span>{' '}
                                tiket
                            </>
                        ) : (
                            '0 tiket'
                        )}
                    </div>

                    {tickets.last_page >
                        1 && (
                        <div className="flex items-center gap-1">
                            {/* PREVIOUS */}

                            <button
                                type="button"
                                disabled={
                                    !tickets.prev_page_url
                                }
                                onClick={() => {
                                    if (
                                        !tickets.prev_page_url
                                    ) {
                                        return;
                                    }

                                    router.visit(
                                        tickets.prev_page_url,
                                        {
                                            preserveScroll:
                                                true,
                                            preserveState:
                                                true,
                                        },
                                    );
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe3e8] bg-white text-[#4b5563] disabled:opacity-40"
                            >
                                <ChevronLeft
                                    size={17}
                                />
                            </button>

                            {/* PAGE NUMBER */}

                            {tickets.links
                                .filter(
                                    (
                                        _,
                                        index,
                                    ) =>
                                        index !==
                                            0 &&
                                        index !==
                                            tickets
                                                .links
                                                .length -
                                                1,
                                )
                                .map(
                                    (
                                        link,
                                        index,
                                    ) => {
                                        if (
                                            link.label.includes(
                                                '...',
                                            )
                                        ) {
                                            return (
                                                <span
                                                    key={
                                                        index
                                                    }
                                                    className="flex h-9 min-w-9 items-center justify-center px-2 text-sm text-gray-500"
                                                >
                                                    ...
                                                </span>
                                            );
                                        }

                                        return (
                                            <button
                                                key={
                                                    index
                                                }
                                                type="button"
                                                disabled={
                                                    !link.url
                                                }
                                                onClick={() => {
                                                    if (
                                                        !link.url
                                                    ) {
                                                        return;
                                                    }

                                                    router.visit(
                                                        link.url,
                                                        {
                                                            preserveScroll:
                                                                true,
                                                            preserveState:
                                                                true,
                                                        },
                                                    );
                                                }}
                                                className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium ${
                                                    link.active
                                                        ? 'border-[#22c55e] bg-[#22c55e] text-white'
                                                        : 'border-[#dfe3e8] bg-white text-[#4b5563]'
                                                }`}
                                            >
                                                {
                                                    link.label
                                                }
                                            </button>
                                        );
                                    },
                                )}

                            {/* NEXT */}

                            <button
                                type="button"
                                disabled={
                                    !tickets.next_page_url
                                }
                                onClick={() => {
                                    if (
                                        !tickets.next_page_url
                                    ) {
                                        return;
                                    }

                                    router.visit(
                                        tickets.next_page_url,
                                        {
                                            preserveScroll:
                                                true,
                                            preserveState:
                                                true,
                                        },
                                    );
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe3e8] bg-white text-[#4b5563] disabled:opacity-40"
                            >
                                <ChevronRight
                                    size={17}
                                />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}