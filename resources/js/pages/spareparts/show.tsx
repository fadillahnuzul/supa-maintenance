import {
    Head,
    Link,
    router,
} from '@inertiajs/react';

import {
    ArrowLeft,
    Box,
    Building2,
    Edit3,
    Hash,
    Minus,
    Package,
    Plus,
    Trash2,
} from 'lucide-react';

import {
    useState,
} from 'react';

/* ================================================================
 * TYPES
 * ================================================================ */

type StockStatus =
    | 'Stok Cukup'
    | 'On Delivery'
    | 'Stok Kurang';

type HistoryType =
    | 'Awal'
    | 'Tambah'
    | 'Kurang'
    | 'Tiket'
    | 'Penyesuaian';

type Building = {
    id: number;
    code: string;
    name: string;
};

type Sparepart = {
    id: number;

    code: string;
    name: string;

    producer: string | null;

    building_id: number;
    building: Building | null;

    minimum_stock: number;
    stock: number;

    unit: string;

    delivery_status:
    | 'none'
    | 'on_delivery';

    status: StockStatus;

    description: string | null;

    image: string | null;
    image_url: string | null;

    created_at: string | null;
    updated_at: string | null;
};

type StockHistory = {
    id: number;

    date: string | null;

    sparepart_id: number;
    sparepart: string;

    type: HistoryType;

    transaction_type:
    | 'initial'
    | 'addition'
    | 'reduction'
    | 'ticket'
    | 'adjustment';

    change: number;

    stock_before: number;
    new_stock: number;

    officer: string;

    note: string | null;

    reference_type: string | null;
    reference_id: number | null;
    reference_code: string | null;

    unit: string;
};

type Props = {
    sparepart: Sparepart;

    histories: StockHistory[];
};

/* ================================================================
 * STYLE
 * ================================================================ */

const statusStyles: Record<
    StockStatus,
    string
> = {
    'Stok Cukup':
        'bg-[#d9f9df] text-[#24913a]',

    'On Delivery':
        'bg-[#fffbcf] text-[#e6a300]',

    'Stok Kurang':
        'bg-[#ffd9d2] text-[#e65345]',
};

const historyStyles: Record<
    HistoryType,
    string
> = {
    Awal:
        'bg-gray-100 text-gray-600',

    Tambah:
        'bg-[#d9f9df] text-[#24913a]',

    Kurang:
        'bg-[#ffd9d2] text-[#e65345]',

    Tiket:
        'bg-[#d6effc] text-[#4c9dd2]',

    Penyesuaian:
        'bg-[#ede9fe] text-[#7c3aed]',
};

/* ================================================================
 * COMPONENT
 * ================================================================ */

export default function SparepartShow({
    sparepart,
    histories,
}: Props) {
    const [
        processingStock,
        setProcessingStock,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | UPDATE STOCK
    |--------------------------------------------------------------------------
    */
    const updateStock = (
        direction:
            | 'plus'
            | 'minus',
    ) => {
        if (
            direction === 'minus'
            &&
            sparepart.stock <= 0
        ) {
            return;
        }

        router.post(
            `/spareparts/${sparepart.id}/stock`,

            {
                type:
                    direction === 'plus'
                        ? 'addition'
                        : 'reduction',

                quantity: 1,

                note:
                    direction === 'plus'
                        ? 'Penambahan stok melalui detail sparepart'
                        : 'Pengurangan stok melalui detail sparepart',
            },

            {
                preserveScroll: true,

                onStart: () =>
                    setProcessingStock(
                        true,
                    ),

                onFinish: () =>
                    setProcessingStock(
                        false,
                    ),
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */
    const deleteSparepart = () => {
        const confirmed =
            window.confirm(
                `Hapus sparepart "${sparepart.name}"?`,
            );

        if (!confirmed) {
            return;
        }

        router.delete(
            `/spareparts/${sparepart.id}`,
        );
    };

    return (
        <>
            <Head
                title={`Detail Sparepart - ${sparepart.name}`}
            />

            <div className="mx-auto w-full px-3 pb-8">
                {/* =====================================================
                    MAIN CARD
                ====================================================== */}

                <section className="overflow-hidden rounded-[22px] bg-white shadow-md">
                    {/* HEADER */}

                    <div className="flex min-h-[58px] flex-wrap items-center justify-between gap-3 bg-[#151d2c] px-5 py-3 text-white">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/spareparts"
                                className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10"
                                title="Kembali"
                            >
                                <ArrowLeft
                                    size={19}
                                />
                            </Link>

                            <div>
                                <h1 className="text-lg font-semibold">
                                    Detail Sparepart
                                </h1>

                                <div className="text-xs text-gray-300">
                                    {
                                        sparepart.code
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href={`/spareparts/${sparepart.id}/edit`}
                                className="flex h-10 items-center gap-2 rounded-lg bg-[#3b82f6] px-4 text-sm font-semibold text-white transition hover:bg-blue-600"
                            >
                                <Edit3
                                    size={17}
                                />

                                Edit
                            </Link>

                            <button
                                type="button"
                                onClick={
                                    deleteSparepart
                                }
                                className="flex h-10 items-center gap-2 rounded-lg bg-[#dc2626] px-4 text-sm font-semibold text-white transition hover:bg-red-700"
                            >
                                <Trash2
                                    size={17}
                                />

                                Hapus
                            </button>
                        </div>
                    </div>

                    {/* CONTENT */}

                    <div className="p-5">
                        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                            {/* =========================================
                                LEFT - IMAGE
                            ========================================== */}

                            <div>
                                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                                    <div className="aspect-[4/3] w-full">
                                        {sparepart.image_url ? (
                                            <img
                                                src={
                                                    sparepart.image_url
                                                }
                                                alt={
                                                    sparepart.name
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
                                                <Package
                                                    size={
                                                        60
                                                    }
                                                    strokeWidth={
                                                        1.5
                                                    }
                                                />

                                                <span className="mt-3 text-sm">
                                                    Tidak ada foto
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* STATUS */}

                                <div className="mt-4 rounded-xl border border-gray-200 bg-[#fafafa] p-4">
                                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Status Stok
                                    </div>

                                    <span
                                        className={`inline-flex rounded-lg px-4 py-2 text-sm font-bold ${statusStyles[
                                            sparepart
                                                .status
                                            ]
                                            }`}
                                    >
                                        {
                                            sparepart.status
                                        }
                                    </span>
                                </div>
                            </div>

                            {/* =========================================
                                RIGHT - INFORMATION
                            ========================================== */}

                            <div>
                                {/* TITLE */}

                                <div className="border-b border-gray-200 pb-5">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                                            {
                                                sparepart.code
                                            }
                                        </span>
                                    </div>

                                    <h2 className="text-[28px] font-extrabold leading-tight text-[#111827]">
                                        {
                                            sparepart.name
                                        }
                                    </h2>

                                    <p className="mt-1 text-base text-gray-500">
                                        {sparepart.producer ??
                                            'Produsen tidak tersedia'}
                                    </p>
                                </div>

                                {/* INFORMATION GRID */}

                                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {/* BUILDING */}

                                    <InformationCard
                                        icon={
                                            <Building2
                                                size={
                                                    21
                                                }
                                            />
                                        }
                                        label="Lokasi"
                                        value={
                                            sparepart.building
                                                ? `${sparepart.building.code} - ${sparepart.building.name}`
                                                : '-'
                                        }
                                    />

                                    {/* STOCK */}

                                    <InformationCard
                                        icon={
                                            <Box
                                                size={
                                                    21
                                                }
                                            />
                                        }
                                        label="Stok Saat Ini"
                                        value={`${sparepart.stock} ${sparepart.unit}`}
                                    />

                                    {/* MINIMUM */}

                                    <InformationCard
                                        icon={
                                            <Package
                                                size={
                                                    21
                                                }
                                            />
                                        }
                                        label="Minimum Stok"
                                        value={`${sparepart.minimum_stock} ${sparepart.unit}`}
                                    />

                                    {/* CODE */}

                                    <InformationCard
                                        icon={
                                            <Hash
                                                size={
                                                    21
                                                }
                                            />
                                        }
                                        label="Kode Sparepart"
                                        value={
                                            sparepart.code
                                        }
                                    />

                                    {/* CREATED */}

                                    <InformationCard
                                        label="Dibuat"
                                        value={
                                            sparepart.created_at ??
                                            '-'
                                        }
                                    />

                                    {/* UPDATED */}

                                    <InformationCard
                                        label="Terakhir Diperbarui"
                                        value={
                                            sparepart.updated_at ??
                                            '-'
                                        }
                                    />
                                </div>

                                {/* DESCRIPTION */}

                                <div className="mt-5 rounded-xl border border-gray-200 bg-[#fafafa] p-4">
                                    <div className="mb-2 text-sm font-bold text-gray-800">
                                        Deskripsi
                                    </div>

                                    <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
                                        {sparepart.description ??
                                            'Tidak ada deskripsi.'}
                                    </p>
                                </div>

                                {/* =====================================
                                    STOCK CONTROL
                                ====================================== */}

                                <div className="mt-5 rounded-xl border border-gray-200 p-4">
                                    <div className="mb-3">
                                        <h3 className="text-base font-bold text-gray-900">
                                            Kontrol Stok
                                        </h3>

                                        <p className="mt-0.5 text-xs text-gray-500">
                                            Setiap perubahan akan otomatis dicatat pada riwayat stok.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        {/* MINUS */}

                                        <button
                                            type="button"
                                            disabled={
                                                processingStock ||
                                                sparepart.stock <=
                                                0
                                            }
                                            onClick={() =>
                                                updateStock(
                                                    'minus',
                                                )
                                            }
                                            className="flex h-12 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <Minus
                                                size={
                                                    19
                                                }
                                            />

                                            Kurangi 1
                                        </button>

                                        {/* CURRENT */}

                                        <div className="flex h-12 min-w-[130px] items-center justify-center rounded-xl border border-gray-300 bg-gray-50 px-5 text-lg font-extrabold text-gray-900">
                                            {
                                                sparepart.stock
                                            }{' '}
                                            <span className="ml-1 text-sm font-medium text-gray-500">
                                                {
                                                    sparepart.unit
                                                }
                                            </span>
                                        </div>

                                        {/* PLUS */}

                                        <button
                                            type="button"
                                            disabled={
                                                processingStock
                                            }
                                            onClick={() =>
                                                updateStock(
                                                    'plus',
                                                )
                                            }
                                            className="flex h-12 items-center gap-2 rounded-xl bg-[#2faa32] px-5 font-semibold text-white transition hover:bg-[#249428] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Plus
                                                size={
                                                    19
                                                }
                                            />

                                            Tambah 1
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    HISTORY
                ====================================================== */}

                <section className="mt-5 rounded-[22px] bg-white p-4 shadow-sm">
                    <div className="mb-3">
                        <h2 className="text-[22px] font-extrabold text-[#111827]">
                            Riwayat Stok
                        </h2>

                        <p className="mt-0.5 text-sm text-gray-500">
                            Seluruh perubahan stok untuk{' '}
                            <span className="font-semibold">
                                {
                                    sparepart.name
                                }
                            </span>
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-gray-300">
                        <div className="overflow-x-auto">
                            <table className="min-w-[950px] w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="bg-[#10b53b] text-white">
                                        <th className="px-4 py-3 font-bold">
                                            Waktu &amp; Tanggal
                                        </th>

                                        <th className="px-4 py-3 font-bold">
                                            Jenis
                                        </th>

                                        <th className="px-4 py-3 text-right font-bold">
                                            Perubahan
                                        </th>

                                        <th className="px-4 py-3 text-right font-bold">
                                            Stok Awal
                                        </th>

                                        <th className="px-4 py-3 text-right font-bold">
                                            Stok Akhir
                                        </th>

                                        <th className="px-4 py-3 font-bold">
                                            Petugas
                                        </th>

                                        <th className="px-4 py-3 font-bold">
                                            Keterangan
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {histories.map(
                                        (
                                            history,
                                        ) => (
                                            <tr
                                                key={
                                                    history.id
                                                }
                                                className="border-b border-gray-300 bg-white last:border-b-0 hover:bg-gray-50"
                                            >
                                                {/* DATE */}

                                                <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                                                    {history.date ??
                                                        '-'}
                                                </td>

                                                {/* TYPE */}

                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${historyStyles[
                                                            history
                                                                .type
                                                            ]
                                                            }`}
                                                    >
                                                        {
                                                            history.type
                                                        }
                                                    </span>
                                                </td>

                                                {/* CHANGE */}

                                                <td className="whitespace-nowrap px-4 py-3 text-right font-bold">
                                                    <span
                                                        className={
                                                            history.change >
                                                                0
                                                                ? 'text-green-600'
                                                                : history.change <
                                                                    0
                                                                    ? 'text-red-600'
                                                                    : 'text-gray-600'
                                                        }
                                                    >
                                                        {history.change >
                                                            0
                                                            ? `+${history.change}`
                                                            : history.change}{' '}
                                                        {
                                                            sparepart.unit
                                                        }
                                                    </span>
                                                </td>

                                                {/* BEFORE */}

                                                <td className="whitespace-nowrap px-4 py-3 text-right text-gray-600">
                                                    {
                                                        history.stock_before
                                                    }{' '}
                                                    {
                                                        sparepart.unit
                                                    }
                                                </td>

                                                {/* AFTER */}

                                                <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-gray-900">
                                                    {
                                                        history.new_stock
                                                    }{' '}
                                                    {
                                                        sparepart.unit
                                                    }
                                                </td>

                                                {/* OFFICER */}

                                                <td className="px-4 py-3 text-gray-700">
                                                    {
                                                        history.officer
                                                    }
                                                </td>

                                                {/* NOTE */}

                                                <td className="max-w-[320px] px-4 py-3 text-xs leading-5 text-gray-500">
                                                    {history.note ??
                                                        '-'}

                                                    {history.reference_code && (
                                                        <div className="mt-1 font-semibold text-blue-600">
                                                            Ref:{' '}
                                                            {
                                                                history.reference_code
                                                            }
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ),
                                    )}

                                    {histories.length ===
                                        0 && (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        7
                                                    }
                                                    className="px-4 py-12 text-center text-gray-400"
                                                >
                                                    Belum ada riwayat stok untuk sparepart ini.
                                                </td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

/* ================================================================
 * INFORMATION CARD
 * ================================================================ */

function InformationCard({
    icon,
    label,
    value,
}: {
    icon?: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-gray-400">
                {icon}

                <span className="text-xs font-semibold uppercase tracking-wide">
                    {label}
                </span>
            </div>

            <div className="text-base font-bold text-gray-900">
                {value}
            </div>
        </div>
    );
}