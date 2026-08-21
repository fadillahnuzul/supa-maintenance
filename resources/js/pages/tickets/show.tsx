import {
    Head,
    router,
    useForm,
} from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Cog,
    FileText,
    History,
    ImageIcon,
    ImageUp,
    MapPin,
    Package,
    Plus,
    ShieldCheck,
    Trash2,
    UserRound,
    UsersRound,
    Wrench,
    X,
    XCircle,
} from 'lucide-react';
import {
    useRef,
    useState,
    useEffect,
} from 'react';
import type { FormEvent } from 'react';

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

type PriorityType =
    | 'standard'
    | 'urgent';

type Technician = {
    id: number;
    name: string;
    is_pic: boolean;
};

type TicketHistory = {
    id: number;

    action: string;
    action_label: string;

    description: string | null;

    actor: string | null;

    created_at: string;
};

type TicketDocumentation = {
    id: number;
    image: string;
    created_at: string;
};

type Sparepart = {
    id: number;
    code: string;
    name: string;
    stock: number;
    unit: string;
};

type Ticket = {
    id: number;

    code: string;

    category: string;
    category_label: string;

    detail: string;

    location: string | null;

    priority: PriorityType;
    priority_label: string;

    reporter: string | null;

    status: TicketStatus;
    status_label: string;

    machine_code: string | null;
    machine_name: string | null;

    image: string | null;

    created_at: string | null;

    approved_at: string | null;
    approved_by: string | null;

    rejected_at: string | null;
    rejected_by: string | null;
    rejection_reason: string | null;

    deadline: string | null;

    verified_at: string | null;
    verified_by: string | null;

    completed_at: string | null;

    technicians: Technician[];

    histories: TicketHistory[];

    documentations: TicketDocumentation[];
};

type Props = {
    ticket: Ticket;

    spareparts: Sparepart[];

    can: {
        update_progress: boolean;
        verify: boolean;
    };
};

/*
|--------------------------------------------------------------------------
| STATUS STYLE
|--------------------------------------------------------------------------
*/

const statusStyles: Record<
    TicketStatus,
    string
> = {
    pending_approval:
        'bg-yellow-100 text-yellow-700',

    rejected:
        'bg-red-100 text-red-700',

    assigned:
        'bg-blue-100 text-blue-700',

    in_progress:
        'bg-yellow-100 text-yellow-700',

    waiting_sparepart:
        'bg-orange-100 text-orange-700',

    waiting_verification:
        'bg-purple-100 text-purple-700',

    completed:
        'bg-green-100 text-green-700',
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function TicketShow({
    ticket,
    can,
    spareparts,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | MODAL
    |--------------------------------------------------------------------------
    */

    const [
        showProgressModal,
        setShowProgressModal,
    ] = useState(false);

    const [
        showVerifyModal,
        setShowVerifyModal,
    ] = useState(false);

    const [
        showRejectVerificationModal,
        setShowRejectVerificationModal,
    ] = useState(false);

    const [selectedSparepartId, setSelectedSparepartId] =
        useState('');

    const [sparepartQuantity, setSparepartQuantity] =
        useState('');

    const [sparepartError, setSparepartError] =
        useState<string | null>(null);

    const evidenceInputRef =
        useRef<HTMLInputElement>(null);

    const [evidencePreview, setEvidencePreview] =
        useState<string | null>(null);

    /*
    |--------------------------------------------------------------------------
    | PROGRESS FORM
    |--------------------------------------------------------------------------
    */

    const progressForm = useForm<{
        progress_status:
            | 'in_progress'
            | 'waiting_sparepart'
            | 'waiting_verification';

        description: string;

        evidence: File | null;

        spareparts_used: {
            id: number;
            quantity: number;
        }[];
    }>({
        progress_status: 'in_progress',
        description: '',
        evidence: null,
        spareparts_used: [],
    });

    /*
    |--------------------------------------------------------------------------
    | VERIFY FORM
    |--------------------------------------------------------------------------
    */

    const verifyForm = useForm<{
        note: string;
    }>({
        note: '',
    });

    /*
    |--------------------------------------------------------------------------
    | REJECT VERIFICATION FORM
    |--------------------------------------------------------------------------
    */

    const rejectVerificationForm =
        useForm<{
            reason: string;
        }>({
            reason: '',
        });

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
    | OPEN PROGRESS
    |--------------------------------------------------------------------------
    */

    const openProgressModal = () => {
        progressForm.clearErrors();

        setSelectedSparepartId('');
        setSparepartQuantity('');
        setSparepartError(null);

        /*
         * Assigned pertama kali
         * otomatis default ke In Progress.
         */

        if (
            ticket.status === 'assigned'
        ) {
            progressForm.setData(
                'progress_status',
                'in_progress',
            );
        }

        /*
         * Kalau sedang waiting sparepart,
         * default ketika dibuka kembali
         * adalah In Progress.
         */

        if (
            ticket.status ===
            'waiting_sparepart'
        ) {
            progressForm.setData(
                'progress_status',
                'in_progress',
            );
        }

        setShowProgressModal(true);
    };

    const addSparepart = () => {
        const sparepartId = Number(
            selectedSparepartId,
        );
        const quantity = Number(
            sparepartQuantity,
        );
        const sparepart = spareparts.find(
            (item) => item.id === sparepartId,
        );

        if (!sparepart) {
            setSparepartError('Pilih sparepart terlebih dahulu.');

            return;
        }

        if (!Number.isFinite(quantity) || quantity <= 0) {
            setSparepartError('Masukkan jumlah sparepart yang valid.');

            return;
        }

        if (quantity > sparepart.stock) {
            setSparepartError(
                `Jumlah melebihi stok tersedia (${sparepart.stock} ${sparepart.unit}).`,
            );

            return;
        }

        const existingItem = progressForm.data.spareparts_used.find(
            (item) => item.id === sparepartId,
        );

        if (
            existingItem &&
            existingItem.quantity + quantity > sparepart.stock
        ) {
            setSparepartError(
                `Total jumlah melebihi stok tersedia (${sparepart.stock} ${sparepart.unit}).`,
            );

            return;
        }

        if (existingItem) {
            progressForm.setData(
                'spareparts_used',
                progressForm.data.spareparts_used.map(
                    (item) =>
                        item.id === sparepartId
                            ? {
                                  ...item,
                                  quantity: item.quantity + quantity,
                              }
                            : item,
                ),
            );
        } else {
            progressForm.setData(
                'spareparts_used',
                [
                    ...progressForm.data.spareparts_used,
                    {
                        id: sparepartId,
                        quantity,
                    },
                ],
            );
        }

        setSelectedSparepartId('');
        setSparepartQuantity('');
        setSparepartError(null);
    };

    const removeSparepart = (sparepartId: number) => {
        progressForm.setData(
            'spareparts_used',
            progressForm.data.spareparts_used.filter(
                (item) => item.id !== sparepartId,
            ),
        );

        setSparepartError(null);
    };

    const handleEvidenceChange = (
        file: File | null,
    ) => {
        if (evidencePreview) {
            URL.revokeObjectURL(evidencePreview);
        }

        progressForm.setData(
            'evidence',
            file,
        );

        setEvidencePreview(
            file ? URL.createObjectURL(file) : null,
        );
    };

    useEffect(() => {
        return () => {
            if (evidencePreview) {
                URL.revokeObjectURL(evidencePreview);
            }
        };
    }, [evidencePreview]);

    /*
    |--------------------------------------------------------------------------
    | SUBMIT PROGRESS
    |--------------------------------------------------------------------------
    */

    const submitProgress = (
        event: FormEvent,
    ) => {
        event.preventDefault();

        /*
         * Sesuai route Laravel:
         *
         * POST
         * /tickets/{id}/progress
         */

        progressForm.post(
            `/tickets/${encodeURIComponent(
                ticket.id,
            )}/progress`,
            {
                forceFormData: true,
                preserveScroll: true,

                onSuccess: () => {
                    setShowProgressModal(
                        false,
                    );

                    progressForm.reset();

                    setSelectedSparepartId('');
                    setSparepartQuantity('');
                    setSparepartError(null);
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | VERIFY
    |--------------------------------------------------------------------------
    */

    const submitVerification = (
        event: FormEvent,
    ) => {
        event.preventDefault();

        /*
         * Sesuai route:
         *
         * POST
         * /tickets/{id}/verify
         */

        verifyForm.post(
            `/tickets/${encodeURIComponent(
                ticket.id,
            )}/verify`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setShowVerifyModal(
                        false,
                    );

                    verifyForm.reset();
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | REJECT VERIFICATION
    |--------------------------------------------------------------------------
    */

    const submitRejectVerification = (
        event: FormEvent,
    ) => {
        event.preventDefault();

        /*
         * POST
         * /tickets/{id}/verification-reject
         */

        rejectVerificationForm.post(
            `/tickets/${encodeURIComponent(
                ticket.id,
            )}/verification-reject`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setShowRejectVerificationModal(
                        false,
                    );

                    rejectVerificationForm.reset();
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head
                title={`Detail ${ticket.code}`}
            />

            <div className="mx-auto w-full px-3 pb-8">
                {/* ========================================================
                    PAGE HEADER
                ======================================================== */}

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <button
                            type="button"
                            onClick={goBack}
                            className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition hover:text-gray-800"
                        >
                            <ArrowLeft
                                size={17}
                            />

                            Kembali ke Daftar
                        </button>

                        <h1 className="text-2xl font-extrabold text-gray-900">
                            Detail Tiket
                        </h1>
                    </div>

                    <span
                        className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${
                            statusStyles[
                                ticket.status
                            ]
                        }`}
                    >
                        {ticket.status_label}
                    </span>
                </div>

                {/* ========================================================
                    MAIN DETAIL
                ======================================================== */}

                <div className="overflow-hidden rounded-[20px] bg-white shadow-md">
                    {/* BLACK HEADER */}

                    <div className="flex min-h-[58px] flex-wrap items-center justify-between gap-3 bg-black px-6 py-3 text-white">
                        <div className="flex items-center gap-2">
                            <Wrench
                                size={20}
                            />

                            <span className="font-semibold">
                                Informasi Tiket
                            </span>
                        </div>

                        <div className="text-sm">
                            <span className="text-gray-400">
                                Nomor Tiket:{' '}
                            </span>

                            <span className="font-bold">
                                {ticket.code}
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* ====================================================
                            TOP SECTION
                        ==================================================== */}

                        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
                            {/* PHOTO */}

                            <div>
                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                                    {ticket.image ? (
                                        <img
                                            src={
                                                ticket.image
                                            }
                                            alt={
                                                ticket.code
                                            }
                                            className="h-[270px] w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-[270px] flex-col items-center justify-center gap-2 text-gray-400">
                                            <ImageIcon
                                                size={
                                                    35
                                                }
                                            />

                                            <span className="text-sm">
                                                Tidak
                                                ada foto
                                                kerusakan
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* CREATED */}

                                <div className="mt-3 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                                    <Clock
                                        size={18}
                                        className="mt-0.5 text-gray-500"
                                    />

                                    <div>
                                        <div className="text-xs text-gray-500">
                                            Tiket
                                            Dibuat
                                        </div>

                                        <div className="mt-0.5 text-sm font-semibold text-gray-800">
                                            {ticket.created_at ??
                                                '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* INFORMATION */}

                            <div>
                                <div className="grid gap-3 md:grid-cols-3">
                                    <InfoBox
                                        label="Pelapor"
                                        icon={
                                            <UserRound
                                                size={
                                                    16
                                                }
                                            />
                                        }
                                    >
                                        {ticket.reporter ??
                                            '-'}
                                    </InfoBox>

                                    <InfoBox
                                        label="Kategori"
                                        icon={
                                            <Wrench
                                                size={
                                                    16
                                                }
                                            />
                                        }
                                    >
                                        {
                                            ticket.category_label
                                        }
                                    </InfoBox>

                                    <InfoBox
                                        label="Prioritas"
                                        icon={
                                            <Clock
                                                size={
                                                    16
                                                }
                                            />
                                        }
                                    >
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

                                <div className="mt-3 rounded-xl border border-gray-300 bg-gray-50 px-4 py-4">
                                    <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                                        <FileText
                                            size={
                                                15
                                            }
                                        />

                                        Deskripsi
                                        Kerusakan /
                                        Pekerjaan
                                    </div>

                                    <div className="whitespace-pre-line text-sm font-medium leading-6 text-gray-800">
                                        {
                                            ticket.detail
                                        }
                                    </div>
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
                                                    ticket.machine_name
                                                    ? ' - '
                                                    : ''}

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

                                        {ticket.location ??
                                            '-'}
                                    </div>
                                </div>

                                {/* DEADLINE */}

                                {ticket.deadline && (
                                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
                                        <Calendar
                                            size={
                                                19
                                            }
                                            className="text-orange-600"
                                        />

                                        <div>
                                            <div className="text-xs text-gray-500">
                                                Deadline
                                                Pengerjaan
                                            </div>

                                            <div className="font-bold text-orange-700">
                                                {
                                                    ticket.deadline
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ====================================================
                            TECHNICIAN
                        ==================================================== */}

                        <div className="mt-6 border-t border-gray-200 pt-6">
                            <div className="mb-3 flex items-center gap-2">
                                <UsersRound
                                    size={19}
                                />

                                <h2 className="font-bold text-gray-900">
                                    Teknisi
                                    Pengerjaan
                                </h2>
                            </div>

                            {ticket.technicians
                                .length > 0 ? (
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {ticket.technicians.map(
                                        (
                                            technician,
                                        ) => (
                                            <div
                                                key={
                                                    technician.id
                                                }
                                                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                                                    <UserRound
                                                        size={
                                                            19
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <div className="font-semibold text-gray-800">
                                                        {
                                                            technician.name
                                                        }
                                                    </div>

                                                    <div className="text-xs text-gray-500">
                                                        {technician.is_pic
                                                            ? 'PIC Teknisi'
                                                            : 'Teknisi'}
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center text-sm text-gray-400">
                                    Teknisi belum
                                    ditentukan.
                                </div>
                            )}
                        </div>

                        {/* ====================================================
                            REJECT INFORMATION
                        ==================================================== */}

                        {ticket.status ===
                            'rejected' && (
                            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
                                <div className="flex items-center gap-2 font-bold text-red-700">
                                    <XCircle
                                        size={20}
                                    />

                                    Tiket Ditolak
                                </div>

                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                    <InfoBox label="Ditolak Oleh">
                                        {ticket.rejected_by ??
                                            '-'}
                                    </InfoBox>

                                    <InfoBox label="Waktu Penolakan">
                                        {ticket.rejected_at ??
                                            '-'}
                                    </InfoBox>
                                </div>

                                <div className="mt-3 rounded-lg bg-white px-4 py-3">
                                    <div className="text-xs text-gray-500">
                                        Alasan
                                    </div>

                                    <div className="mt-1 text-sm font-medium text-red-700">
                                        {ticket.rejection_reason ??
                                            '-'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ====================================================
                            COMPLETED
                        ==================================================== */}

                        {ticket.status ===
                            'completed' && (
                            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
                                <div className="flex items-center gap-2 font-bold text-green-700">
                                    <CheckCircle2
                                        size={20}
                                    />

                                    Pekerjaan
                                    Selesai dan
                                    Terverifikasi
                                </div>

                                <div className="mt-3 grid gap-3 md:grid-cols-3">
                                    <InfoBox label="Diverifikasi Oleh">
                                        {ticket.verified_by ??
                                            '-'}
                                    </InfoBox>

                                    <InfoBox label="Waktu Verifikasi">
                                        {ticket.verified_at ??
                                            '-'}
                                    </InfoBox>

                                    <InfoBox label="Selesai">
                                        {ticket.completed_at ??
                                            '-'}
                                    </InfoBox>
                                </div>
                            </div>
                        )}

                        {/* ====================================================
                            ACTION
                        ==================================================== */}

                        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-5">
                            <button
                                type="button"
                                onClick={goBack}
                                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                            >
                                Kembali
                            </button>

                            {/* UPDATE PROGRESS */}

                            {can.update_progress &&
                                [
                                    'assigned',
                                    'in_progress',
                                    'waiting_sparepart',
                                ].includes(
                                    ticket.status,
                                ) && (
                                    <button
                                        type="button"
                                        onClick={
                                            openProgressModal
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#22c55e] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#16a34a]"
                                    >
                                        <Wrench
                                            size={
                                                18
                                            }
                                        />

                                        Update
                                        Progress
                                    </button>
                                )}

                            {/* VERIFICATION */}

                            {can.verify &&
                                ticket.status ===
                                    'waiting_verification' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                rejectVerificationForm.reset();
                                                rejectVerificationForm.clearErrors();

                                                setShowRejectVerificationModal(
                                                    true,
                                                );
                                            }}
                                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                                        >
                                            <XCircle
                                                size={
                                                    18
                                                }
                                            />

                                            Tolak
                                            Verifikasi
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                verifyForm.reset();
                                                verifyForm.clearErrors();

                                                setShowVerifyModal(
                                                    true,
                                                );
                                            }}
                                            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
                                        >
                                            <ShieldCheck
                                                size={
                                                    18
                                                }
                                            />

                                            Verifikasi
                                            Selesai
                                        </button>
                                    </>
                                )}
                        </div>
                    </div>
                </div>

                {/* ========================================================
                    HISTORY
                ======================================================== */}

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-[20px] bg-white shadow-md">
                        <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-4">
                            <History size={20} />

                            <h2 className="font-bold text-gray-900">
                                Histori Perbaikan
                            </h2>
                        </div>

                        <div className="p-6">
                        {ticket.histories
                            .length === 0 ? (
                            <div className="py-8 text-center text-sm text-gray-400">
                                Belum ada
                                histori tiket.
                            </div>
                        ) : (
                            <div className="relative">
                                {ticket.histories.map(
                                    (
                                        history,
                                        index,
                                    ) => (
                                        <div
                                            key={
                                                history.id
                                            }
                                            className="relative flex gap-4 pb-7 last:pb-0"
                                        >
                                            {/* LINE */}

                                            {index !==
                                                ticket
                                                    .histories
                                                    .length -
                                                    1 && (
                                                <div className="absolute left-[15px] top-8 h-[calc(100%-20px)] w-[2px] bg-gray-200" />
                                            )}

                                            {/* DOT */}

                                            <div className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white">
                                                <CheckCircle2
                                                    size={
                                                        16
                                                    }
                                                />
                                            </div>

                                            {/* CONTENT */}

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-start justify-between gap-2">
                                                    <div>
                                                        <div className="font-bold text-gray-800">
                                                            {
                                                                history.action_label
                                                            }
                                                        </div>

                                                        <div className="mt-0.5 text-xs text-gray-500">
                                                            Oleh:{' '}
                                                            {history.actor ??
                                                                'System'}
                                                        </div>
                                                    </div>

                                                    <div className="whitespace-nowrap text-xs text-gray-500">
                                                        {
                                                            history.created_at
                                                        }
                                                    </div>
                                                </div>

                                                {history.description && (
                                                    <div className="mt-2 rounded-lg bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-600">
                                                        {
                                                            history.description
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[20px] bg-white shadow-md">
                        <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-4">
                            <ImageIcon size={20} />

                            <h2 className="font-bold text-gray-900">
                                Dokumentasi Progress
                            </h2>
                        </div>

                        <div className="p-6">
                            {ticket.documentations.length === 0 ? (
                                <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 text-center text-sm text-gray-400">
                                    Belum ada dokumentasi progress.
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {ticket.documentations.map(
                                        (documentation) => (
                                            <figure
                                                key={documentation.id}
                                                className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                                            >
                                                <a
                                                    href={documentation.image}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <img
                                                        src={documentation.image}
                                                        alt="Dokumentasi progress"
                                                        className="aspect-[4/3] w-full object-cover transition hover:scale-[1.02]"
                                                    />
                                                </a>

                                                <figcaption className="px-3 py-2 text-xs text-gray-500">
                                                    {documentation.created_at}
                                                </figcaption>
                                            </figure>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================================================
                UPDATE PROGRESS MODAL
            ============================================================ */}

            {showProgressModal && (
                <ModalOverlay
                    onClose={() =>
                        setShowProgressModal(
                            false,
                        )
                    }
                >
                    <form
                        onSubmit={
                            submitProgress
                        }
                        className="w-full max-w-[600px] overflow-hidden rounded-[20px] bg-white shadow-2xl"
                    >
                        <ModalHeader
                            title="Update Progress"
                            onClose={() =>
                                setShowProgressModal(
                                    false,
                                )
                            }
                        />

                        <div className="p-6">
                            {/* STATUS */}

                            <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                                Status Progress
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <div className="grid gap-2 sm:grid-cols-3">
                                {[
                                    {
                                        value: 'in_progress',
                                        label: 'In Progress',
                                    },
                                    {
                                        value: 'waiting_sparepart',
                                        label: 'Tambah Stok Sparepart',
                                    },
                                    {
                                        value: 'waiting_verification',
                                        label: 'Selesai',
                                    },
                                ].map((statusOption) => (
                                    <label
                                        key={statusOption.value}
                                        className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition ${
                                            progressForm.data.progress_status ===
                                            statusOption.value
                                                ? 'border-green-600 bg-green-50 text-green-700'
                                                : 'border-gray-300 bg-white text-gray-700 hover:border-green-500'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="progress_status"
                                            value={statusOption.value}
                                            checked={
                                                progressForm.data.progress_status ===
                                                statusOption.value
                                            }
                                            onChange={() =>
                                                progressForm.setData(
                                                    'progress_status',
                                                    statusOption.value as
                                                        | 'in_progress'
                                                        | 'waiting_sparepart'
                                                        | 'waiting_verification',
                                                )
                                            }
                                            className="accent-green-600"
                                        />
                                        {statusOption.label}
                                    </label>
                                ))}
                            </div>

                            {progressForm.errors
                                .progress_status && (
                                <p className="mt-1 text-xs text-red-600">
                                    {
                                        progressForm
                                            .errors
                                            .progress_status
                                    }
                                </p>
                            )}

                            {/* INFORMATION */}

                            {progressForm.data
                                .progress_status ===
                                'waiting_sparepart' && (
                                <div className="mt-3 flex gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                                    <Package
                                        size={
                                            18
                                        }
                                        className="mt-0.5 shrink-0"
                                    />

                                    Pengerjaan akan
                                    ditandai sedang
                                    menunggu
                                    sparepart.
                                </div>
                            )}

                            {progressForm.data
                                .progress_status ===
                                'waiting_verification' && (
                                <div className="mt-3 flex gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">
                                    <ShieldCheck
                                        size={
                                            18
                                        }
                                        className="mt-0.5 shrink-0"
                                    />

                                    Pekerjaan belum
                                    dianggap selesai.
                                    Tiket akan
                                    menunggu
                                    Maintenance
                                    Verification.
                                </div>
                            )}

                            {/* SPAREPART */}

                            <div className="mt-4">
                                <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                                    Sparepart yang digunakan
                                </label>

                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <select
                                        value={selectedSparepartId}
                                        onChange={(event) => {
                                            setSelectedSparepartId(
                                                event.target.value,
                                            );
                                            setSparepartError(null);
                                        }}
                                        className="h-11 min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-green-600"
                                    >
                                        <option value="">
                                            -- Pilih Sparepart --
                                        </option>

                                        {spareparts.map((sparepart) => (
                                            <option
                                                key={sparepart.id}
                                                value={sparepart.id}
                                                disabled={sparepart.stock <= 0}
                                            >
                                                {sparepart.name} ({Number(sparepart.stock).toFixed(1)}{' '}
                                                {sparepart.unit})
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        type="number"
                                        min="0.0"
                                        step="0.5"
                                        value={sparepartQuantity}
                                        onChange={(event) => {
                                            setSparepartQuantity(
                                                event.target.value,
                                            );
                                            setSparepartError(null);
                                        }}
                                        placeholder="Jumlah..."
                                        className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-green-600 sm:w-28 text-gray-600"
                                    />

                                    <button
                                        type="button"
                                        onClick={addSparepart}
                                        className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-blue-500 px-4 text-sm font-bold text-white transition hover:bg-blue-600"
                                    >
                                        <Plus size={16} />
                                        Tambah
                                    </button>
                                </div>

                                {sparepartError && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {sparepartError}
                                    </p>
                                )}

                                {progressForm.data.spareparts_used.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {progressForm.data.spareparts_used.map(
                                            (item) => {
                                                const sparepart = spareparts.find(
                                                    (option) =>
                                                        option.id === item.id,
                                                );

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className="grid grid-cols-[1fr_auto_44px] items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700"
                                                    >
                                                        <span>
                                                            {sparepart?.name ??
                                                                'Sparepart'}{' '}
                                                            x {Number(item.quantity).toFixed(1)}{' '}
                                                            {sparepart?.unit ?? ''}
                                                        </span>

                                                        <span className="text-right text-xs text-gray-500">
                                                            {Number(sparepart?.stock).toFixed(1) ?? 0}{' '}
                                                            tersedia
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeSparepart(
                                                                    item.id,
                                                                )
                                                            }
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                                                            title="Hapus Sparepart"
                                                            aria-label="Hapus Sparepart"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* DESCRIPTION */}

                            <div className="mt-4">
                                <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                                    Catatan Progress
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <textarea
                                    rows={5}
                                    value={
                                        progressForm
                                            .data
                                            .description
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        progressForm.setData(
                                            'description',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Jelaskan pekerjaan yang telah dilakukan..."
                                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 placeholder:text-gray-500 text-gray-600"
                                />

                                {progressForm.errors
                                    .description && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {
                                            progressForm
                                                .errors
                                                .description
                                        }
                                    </p>
                                )}
                            </div>

                            {/* EVIDENCE */}

                            <div className="mt-4">
                                <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                                    Unggah Bukti
                                </label>

                                <input
                                    ref={evidenceInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(event) =>
                                        handleEvidenceChange(
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        evidenceInputRef.current?.click()
                                    }
                                    className="flex min-h-28 w-full items-center justify-center overflow-hidden rounded-md border border-gray-300 bg-white text-gray-500 transition hover:border-green-600"
                                >
                                    {evidencePreview ? (
                                        <img
                                            src={evidencePreview}
                                            alt="Preview bukti progres"
                                            className="max-h-40 w-full object-contain"
                                        />
                                    ) : (
                                        <ImageUp size={38} />
                                    )}
                                </button>

                                {progressForm.data.evidence && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        {progressForm.data.evidence.name}
                                    </p>
                                )}

                                {progressForm.errors.evidence && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {progressForm.errors.evidence}
                                    </p>
                                )}
                            </div>

                            {/* ACTION */}

                            <div className="mt-5 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowProgressModal(
                                            false,
                                        )
                                    }
                                    className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        progressForm.processing
                                    }
                                    className="rounded-xl bg-[#22c55e] px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                                >
                                    {progressForm.processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Progress'}
                                </button>
                            </div>
                        </div>
                    </form>
                </ModalOverlay>
            )}

            {/* ============================================================
                VERIFY MODAL
            ============================================================ */}

            {showVerifyModal && (
                <ModalOverlay
                    onClose={() =>
                        setShowVerifyModal(
                            false,
                        )
                    }
                >
                    <form
                        onSubmit={
                            submitVerification
                        }
                        className="w-full max-w-[580px] overflow-hidden rounded-[20px] bg-white shadow-2xl"
                    >
                        <ModalHeader
                            title="Verifikasi Pekerjaan"
                            onClose={() =>
                                setShowVerifyModal(
                                    false,
                                )
                            }
                        />

                        <div className="p-6">
                            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                                <div className="flex items-center gap-2 font-bold text-green-700">
                                    <ShieldCheck
                                        size={
                                            20
                                        }
                                    />

                                    Konfirmasi
                                    Penyelesaian
                                </div>

                                <p className="mt-2 text-sm leading-6 text-green-700">
                                    Pastikan
                                    pekerjaan sudah
                                    diperiksa dan
                                    kondisi telah
                                    sesuai sebelum
                                    tiket dinyatakan
                                    selesai.
                                </p>
                            </div>

                            <div className="mt-4">
                                <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                                    Catatan
                                    Verifikasi
                                </label>

                                <textarea
                                    rows={4}
                                    value={
                                        verifyForm
                                            .data
                                            .note
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        verifyForm.setData(
                                            'note',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Catatan hasil pemeriksaan..."
                                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-purple-600"
                                />
                            </div>

                            <div className="mt-5 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowVerifyModal(
                                            false,
                                        )
                                    }
                                    className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        verifyForm.processing
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                                >
                                    <CheckCircle2
                                        size={
                                            18
                                        }
                                    />

                                    {verifyForm.processing
                                        ? 'Memproses...'
                                        : 'Verifikasi & Selesaikan'}
                                </button>
                            </div>
                        </div>
                    </form>
                </ModalOverlay>
            )}

            {/* ============================================================
                REJECT VERIFICATION MODAL
            ============================================================ */}

            {showRejectVerificationModal && (
                <ModalOverlay
                    onClose={() =>
                        setShowRejectVerificationModal(
                            false,
                        )
                    }
                >
                    <form
                        onSubmit={
                            submitRejectVerification
                        }
                        className="w-full max-w-[580px] overflow-hidden rounded-[20px] bg-white shadow-2xl"
                    >
                        <ModalHeader
                            title="Tolak Verifikasi"
                            onClose={() =>
                                setShowRejectVerificationModal(
                                    false,
                                )
                            }
                        />

                        <div className="p-6">
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                Pekerjaan akan
                                dikembalikan ke
                                teknisi untuk
                                diperbaiki atau
                                dilanjutkan.
                            </div>

                            <div className="mt-4">
                                <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                                    Alasan Penolakan
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <textarea
                                    rows={5}
                                    value={
                                        rejectVerificationForm
                                            .data
                                            .reason
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        rejectVerificationForm.setData(
                                            'reason',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Jelaskan bagian pekerjaan yang masih perlu diperbaiki..."
                                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500 text-gray-600"
                                />

                                {rejectVerificationForm
                                    .errors
                                    .reason && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {
                                            rejectVerificationForm
                                                .errors
                                                .reason
                                        }
                                    </p>
                                )}
                            </div>

                            <div className="mt-5 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowRejectVerificationModal(
                                            false,
                                        )
                                    }
                                    className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        rejectVerificationForm.processing
                                    }
                                    className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                                >
                                    {rejectVerificationForm.processing
                                        ? 'Memproses...'
                                        : 'Tolak & Kembalikan'}
                                </button>
                            </div>
                        </div>
                    </form>
                </ModalOverlay>
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
    icon,
    children,
}: {
    label: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                {icon}

                {label}
            </div>

            <div className="mt-1 font-semibold text-gray-800">
                {children}
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| MODAL OVERLAY
|--------------------------------------------------------------------------
*/

function ModalOverlay({
    children,
    onClose,
}: {
    children: React.ReactNode;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            {children}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| MODAL HEADER
|--------------------------------------------------------------------------
*/

function ModalHeader({
    title,
    onClose,
}: {
    title: string;
    onClose: () => void;
}) {
    return (
        <div className="flex items-center justify-between bg-black px-5 py-4 text-white">
            <div className="flex items-center gap-2">
                <Wrench size={19} />

                <h2 className="font-semibold">
                    {title}
                </h2>
            </div>

            <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-white/15"
            >
                <X size={18} />
            </button>
        </div>
    );
}