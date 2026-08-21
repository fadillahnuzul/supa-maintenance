import {
    Head,
    router,
    useForm,
} from '@inertiajs/react';
import {
    Check,
    Clock,
    Cog,
    MapPin,
    UserRound,
    UsersRound,
    Wrench,
    X,
} from 'lucide-react';
import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { approve as approveTicket } from '@/actions/App/Http/Controllers/TicketController';

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type Technician = {
    id: number;
    name: string;
};

type Ticket = {
    id: number;

    code: string;

    category: string;
    category_label: string;

    detail: string;

    location: string | null;

    priority:
        | 'standard'
        | 'urgent';

    priority_label: string;

    deadline: string | null;

    reporter: string | null;

    status: string;
    status_label: string;

    machine_code: string | null;
    machine_name: string | null;

    image: string | null;

    created_at: string | null;
};

type Props = {
    ticket: Ticket;

    technicians: Technician[];
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function TicketApproval({
    ticket,
    technicians,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | REJECT MODAL
    |--------------------------------------------------------------------------
    */

    const [
        showRejectModal,
        setShowRejectModal,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | APPROVE FORM
    |--------------------------------------------------------------------------
    */

    const approveForm =
        useForm<{
            pic_technician_id: string;

            additional_technician_ids:
                number[];

            deadline: string;
        }>({
            pic_technician_id: '',

            additional_technician_ids:
                [],

            deadline: '',
        });

    const deadlineInputRef =
        useRef<HTMLInputElement>(null);

    /*
    |--------------------------------------------------------------------------
    | REJECT FORM
    |--------------------------------------------------------------------------
    */

    const rejectForm =
        useForm<{
            reason: string;
        }>({
            reason: '',
        });

    /*
    |--------------------------------------------------------------------------
    | ADDITIONAL TECHNICIAN
    |--------------------------------------------------------------------------
    */

    const toggleAdditionalTechnician = (
        technicianId: number,
    ) => {
        const current =
            approveForm.data
                .additional_technician_ids;

        if (
            current.includes(
                technicianId,
            )
        ) {
            approveForm.setData(
                'additional_technician_ids',
                current.filter(
                    (id) =>
                        id !==
                        technicianId,
                ),
            );

            return;
        }

        approveForm.setData(
            'additional_technician_ids',
            [
                ...current,
                technicianId,
            ],
        );
    };

    /*
    |--------------------------------------------------------------------------
    | PIC
    |--------------------------------------------------------------------------
    */

    const handlePicChange = (
        value: string,
    ) => {
        approveForm.setData(
            'pic_technician_id',
            value,
        );

        /*
         * Jika orang yang dipilih sebagai
         * PIC sebelumnya ada di additional,
         * hapus dari additional.
         */

        if (value) {
            approveForm.setData(
                'additional_technician_ids',
                approveForm.data
                    .additional_technician_ids
                    .filter(
                        (id) =>
                            String(id) !==
                            value,
                    ),
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | APPROVE
    |--------------------------------------------------------------------------
    */

    const submitApprove = (
        event: FormEvent,
    ) => {
        event.preventDefault();

        /*
         * Endpoint Laravel:
         *
         * POST /tickets/{id}/approve
         */

        approveForm.post(
            approveTicket.url(ticket.id),
            {
                preserveScroll: true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | REJECT
    |--------------------------------------------------------------------------
    */

    const submitReject = (
        event: FormEvent,
    ) => {
        event.preventDefault();

        /*
         * Endpoint Laravel:
         *
         * POST /tickets/{id}/reject
         */

        rejectForm.post(
            `/tickets/${encodeURIComponent(
                ticket.id,
            )}/reject`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setShowRejectModal(
                        false,
                    );
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | BACK
    |--------------------------------------------------------------------------
    */

    const goBack = () => {
        router.visit('/tickets');
    };

    /*
    |--------------------------------------------------------------------------
    | OPEN REJECT
    |--------------------------------------------------------------------------
    */

    const openRejectModal = () => {
        rejectForm.reset();
        rejectForm.clearErrors();

        setShowRejectModal(true);
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head
                title={`Approval ${ticket.code}`}
            />

            <div className="mx-auto w-full px-3 pb-8">
                {/* ========================================================
                    MAIN CARD
                ======================================================== */}

                <form
                    onSubmit={submitApprove}
                    className="overflow-hidden rounded-[20px] bg-white shadow-md"
                >
                    {/* HEADER */}

                    <div className="flex min-h-[58px] flex-wrap items-center justify-between gap-3 bg-black px-6 py-3 text-white">
                        <div className="flex items-center gap-2">
                            <Wrench
                                size={20}
                            />

                            <h1 className="text-lg font-semibold">
                                Approval Tiket
                                Perbaikan
                            </h1>
                        </div>

                        <div className="text-sm">
                            <span className="text-gray-400">
                                Nomor:{' '}
                            </span>

                            <span className="font-bold">
                                {
                                    ticket.code
                                }
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* ====================================================
                            TICKET DETAIL
                        ==================================================== */}

                        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
                            {/* IMAGE */}

                            <div>
                                <div className="overflow-hidden rounded-xl bg-gray-100">
                                    {ticket.image ? (
                                        <img
                                            src={
                                                ticket.image
                                            }
                                            alt={
                                                ticket.code
                                            }
                                            className="h-[245px] w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-[245px] items-center justify-center text-sm text-gray-400">
                                            Tidak ada
                                            foto
                                        </div>
                                    )}
                                </div>

                                {/* CREATED */}

                                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock
                                            size={
                                                15
                                            }
                                        />

                                        Diajukan
                                    </div>

                                    <div className="mt-1 font-semibold text-gray-800">
                                        {ticket.created_at ??
                                            '-'}
                                    </div>
                                </div>
                            </div>

                            {/* DETAIL */}

                            <div className="flex flex-col">
                                <div className="grid gap-3 md:grid-cols-3">
                                    <InfoBox label="Diajukan Oleh">
                                        {ticket.reporter ??
                                            '-'}
                                    </InfoBox>

                                    <InfoBox label="Kategori">
                                        {
                                            ticket.category_label
                                        }
                                    </InfoBox>

                                    <InfoBox label="Prioritas">
                                        <span
                                            className={
                                                ticket.priority ===
                                                'urgent'
                                                    ? 'font-bold text-red-600'
                                                    : ''
                                            }
                                        >
                                            {
                                                ticket.priority_label
                                            }
                                        </span>
                                    </InfoBox>
                                </div>

                                {/* DESCRIPTION */}

                                <div className="mt-3">
                                    <InfoBox label="Deskripsi Kerusakan">
                                        {
                                            ticket.detail
                                        }
                                    </InfoBox>
                                </div>

                                {/* LOCATION */}

                                <div className="mt-3 rounded-xl border border-[#68b59b] bg-[#d9eee7] px-5 py-4 text-[#185c49]">
                                    <div className="mb-2 text-xs text-gray-500">
                                        Lokasi
                                        Kerusakan
                                    </div>

                                    {(ticket.machine_code ||
                                        ticket.machine_name) && (
                                        <div className="flex items-start gap-2 text-sm font-bold">
                                            <Cog
                                                size={
                                                    17
                                                }
                                                className="mt-0.5 shrink-0"
                                            />

                                            <span>
                                                {ticket.machine_code ??
                                                    ''}

                                                {ticket.machine_code &&
                                                    ticket.machine_name &&
                                                    ' - '}

                                                {ticket.machine_name ??
                                                    ''}
                                            </span>
                                        </div>
                                    )}

                                    <div className="mt-1 flex items-center gap-2 text-sm font-bold">
                                        <MapPin
                                            size={
                                                17
                                            }
                                        />

                                        <span>
                                            {ticket.location ??
                                                '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ====================================================
                            DIVIDER
                        ==================================================== */}

                        <div className="my-6 border-t border-gray-300" />

                        {/* ====================================================
                            ASSIGNMENT
                        ==================================================== */}

                        <div className="grid gap-5 lg:grid-cols-2">
                            {/* PIC */}

                            <div>
                                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <UserRound
                                        size={17}
                                    />

                                    PIC Teknisi

                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                <select
                                    value={
                                        approveForm
                                            .data
                                            .pic_technician_id
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        handlePicChange(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className="h-[52px] w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-800 outline-none transition focus:border-green-600 focus:ring-1 focus:ring-green-600"
                                >
                                    <option value="">
                                        -- Pilih
                                        Teknisi
                                        Utama --
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

                                {approveForm.errors
                                    .pic_technician_id && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {
                                            approveForm
                                                .errors
                                                .pic_technician_id
                                        }
                                    </p>
                                )}

                                {/* DEADLINE */}

                                <div className="mt-4">
                                    <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                        <Clock
                                            size={
                                                17
                                            }
                                        />

                                        Deadline

                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        ref={
                                            deadlineInputRef
                                        }
                                        type="date"
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                        onClick={(event) => {
                                            event.currentTarget.showPicker?.();
                                        }}
                                        value={
                                            approveForm
                                                .data
                                                .deadline
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            approveForm.setData(
                                                'deadline',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        className="h-[52px] w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-800 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                                    />

                                    {approveForm
                                        .errors
                                        .deadline && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {
                                                approveForm
                                                    .errors
                                                    .deadline
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* ADDITIONAL TECHNICIANS */}

                            <div>
                                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <UsersRound
                                        size={17}
                                    />

                                    Teknisi
                                    Tambahan
                                </label>

                                <div className="min-h-[130px] rounded-xl border border-gray-300 bg-gray-50 p-4">
                                    {technicians.filter(
                                        (
                                            technician,
                                        ) =>
                                            String(
                                                technician.id,
                                            ) !==
                                            approveForm
                                                .data
                                                .pic_technician_id,
                                    ).length >
                                    0 ? (
                                        <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                                            {technicians
                                                .filter(
                                                    (
                                                        technician,
                                                    ) =>
                                                        String(
                                                            technician.id,
                                                        ) !==
                                                        approveForm
                                                            .data
                                                            .pic_technician_id,
                                                )
                                                .map(
                                                    (
                                                        technician,
                                                    ) => (
                                                        <label
                                                            key={
                                                                technician.id
                                                            }
                                                            className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={approveForm.data.additional_technician_ids.includes(
                                                                    technician.id,
                                                                )}
                                                                onChange={() =>
                                                                    toggleAdditionalTechnician(
                                                                        technician.id,
                                                                    )
                                                                }
                                                                className="h-4 w-4 rounded border-gray-400 accent-green-600"
                                                            />

                                                            <span>
                                                                {
                                                                    technician.name
                                                                }
                                                            </span>
                                                        </label>
                                                    ),
                                                )}
                                        </div>
                                    ) : (
                                        <div className="flex min-h-[95px] items-center justify-center text-sm text-gray-400">
                                            Tidak ada
                                            teknisi
                                            tambahan.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ====================================================
                            SUMMARY
                        ==================================================== */}

                        {approveForm.data
                            .pic_technician_id && (
                            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
                                <div className="text-xs font-semibold uppercase text-blue-500">
                                    Assignment
                                    Summary
                                </div>

                                <div className="mt-2 text-sm text-gray-700">
                                    <span className="font-semibold">
                                        PIC:{' '}
                                    </span>

                                    {technicians.find(
                                        (
                                            technician,
                                        ) =>
                                            String(
                                                technician.id,
                                            ) ===
                                            approveForm
                                                .data
                                                .pic_technician_id,
                                    )?.name ??
                                        '-'}
                                </div>

                                <div className="mt-1 text-sm text-gray-700">
                                    <span className="font-semibold">
                                        Anggota:{' '}
                                    </span>

                                    {approveForm
                                        .data
                                        .additional_technician_ids
                                        .length >
                                    0
                                        ? technicians
                                              .filter(
                                                  (
                                                      technician,
                                                  ) =>
                                                      approveForm.data.additional_technician_ids.includes(
                                                          technician.id,
                                                      ),
                                              )
                                              .map(
                                                  (
                                                      technician,
                                                  ) =>
                                                      technician.name,
                                              )
                                              .join(
                                                  ', ',
                                              )
                                        : '-'}
                                </div>
                            </div>
                        )}

                        {/* ====================================================
                            ACTION
                        ==================================================== */}

                        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-5">
                            <button
                                type="button"
                                onClick={
                                    goBack
                                }
                                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                            >
                                Kembali
                            </button>

                            <button
                                type="button"
                                onClick={
                                    openRejectModal
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                            >
                                <X
                                    size={18}
                                />

                                Reject
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    approveForm.processing
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-[#22c55e] px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#16a34a] disabled:opacity-50"
                            >
                                <Check
                                    size={18}
                                />

                                {approveForm.processing
                                    ? 'Memproses...'
                                    : 'Approve Ticket'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* ============================================================
                REJECT MODAL
            ============================================================ */}

            {showRejectModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(
                        event,
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setShowRejectModal(
                                false,
                            );
                        }
                    }}
                >
                    <form
                        onSubmit={
                            submitReject
                        }
                        className="w-full max-w-[580px] overflow-hidden rounded-[20px] bg-white shadow-2xl"
                    >
                        {/* HEADER */}

                        <div className="flex items-center justify-between bg-black px-5 py-4 text-white">
                            <div className="flex items-center gap-2">
                                <Wrench
                                    size={19}
                                />

                                <h2 className="font-semibold">
                                    Reject Ticket
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowRejectModal(
                                        false,
                                    )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/15"
                            >
                                <X
                                    size={18}
                                />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* TICKET */}

                            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                                <div className="text-xs text-gray-500">
                                    Nomor
                                    Tiket
                                </div>

                                <div className="font-bold text-gray-800">
                                    {
                                        ticket.code
                                    }
                                </div>
                            </div>

                            {/* REASON */}

                            <div className="mt-4">
                                <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                                    Alasan
                                    Penolakan

                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <textarea
                                    rows={5}
                                    value={
                                        rejectForm
                                            .data
                                            .reason
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        rejectForm.setData(
                                            'reason',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Tuliskan alasan tiket ditolak..."
                                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                />

                                {rejectForm
                                    .errors
                                    .reason && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {
                                            rejectForm
                                                .errors
                                                .reason
                                        }
                                    </p>
                                )}
                            </div>

                            {/* BUTTON */}

                            <div className="mt-5 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowRejectModal(
                                            false,
                                        )
                                    }
                                    className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        rejectForm.processing
                                    }
                                    className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {rejectForm.processing
                                        ? 'Memproses...'
                                        : 'Reject Ticket'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}

/*
|--------------------------------------------------------------------------
| INFO BOX
|--------------------------------------------------------------------------
*/

function InfoBox({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3">
            <div className="text-xs text-gray-500">
                {label}
            </div>

            <div className="mt-0.5 font-semibold text-gray-800">
                {children}
            </div>
        </div>
    );
}