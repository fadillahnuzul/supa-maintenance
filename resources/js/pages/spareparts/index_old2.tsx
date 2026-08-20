import {
    Head,
    Link,
    router,
} from '@inertiajs/react';

import {
    Edit3,
    Eye,
    Minus,
    Plus,
    Printer,
    Search,
    Trash2,
} from 'lucide-react';

import {
    FormEvent,
    useEffect,
    useState,
} from 'react';

import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function updateStatus(
    id: number,
    status: 'none' | 'on_delivery',
) {
    router.patch(
        route('spareparts.update-delivery-status', id),
        {
            delivery_status: status,
        },
        {
            preserveScroll: true,
            preserveState: true,
        },
    );
}

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

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedSpareparts = {
    data: Sparepart[];

    current_page: number;
    last_page: number;

    per_page: number;
    total: number;

    from: number | null;
    to: number | null;

    prev_page_url: string | null;
    next_page_url: string | null;

    links: PaginationLink[];
};

type Filters = {
    search?: string;
    status?: string;
    building_id?: string | number;
};

type Props = {
    spareparts: PaginatedSpareparts;

    histories: StockHistory[];

    buildings: Building[];

    filters: Filters;
};

/* ================================================================
 * STYLES
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

export default function SparepartIndex({
    spareparts,
    histories,
    buildings,
    filters,
}: Props) {
    const [
        search,
        setSearch,
    ] = useState(
        filters.search ?? '',
    );

    const [
        statusFilter,
        setStatusFilter,
    ] = useState(
        filters.status ?? '',
    );

    const [
        buildingFilter,
        setBuildingFilter,
    ] = useState(
        filters.building_id
            ? String(
                filters.building_id
            )
            : '',
    );

    const [
        processingStockId,
        setProcessingStockId,
    ] = useState<number | null>(
        null,
    );

    /*
    |--------------------------------------------------------------------------
    | SEARCH DEBOUNCE
    |--------------------------------------------------------------------------
    */
    useEffect(() => {
        const currentSearch =
            filters.search ?? '';

        if (
            search === currentSearch
        ) {
            return;
        }

        const timeout =
            window.setTimeout(
                () => {
                    visitIndex({
                        search,
                        status:
                            statusFilter,
                        building_id:
                            buildingFilter,
                    });
                },
                400,
            );

        return () =>
            window.clearTimeout(
                timeout,
            );
    }, [search]);

    /*
    |--------------------------------------------------------------------------
    | VISIT INDEX
    |--------------------------------------------------------------------------
    */
    const visitIndex = (
        params: {
            search?: string;
            status?: string;
            building_id?: string;
        },
    ) => {
        router.get(
            '/spareparts',

            {
                search:
                    params.search ?? '',

                status:
                    params.status ?? '',

                building_id:
                    params.building_id ??
                    '',
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

        visitIndex({
            search,
            status: value,
            building_id:
                buildingFilter,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | BUILDING FILTER
    |--------------------------------------------------------------------------
    */
    const handleBuildingChange = (
        value: string,
    ) => {
        setBuildingFilter(value);

        visitIndex({
            search,
            status:
                statusFilter,

            building_id:
                value,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | SEARCH FORM
    |--------------------------------------------------------------------------
    */
    const submitSearch = (
        event: FormEvent,
    ) => {
        event.preventDefault();

        visitIndex({
            search,
            status:
                statusFilter,

            building_id:
                buildingFilter,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | UPDATE STOCK
    |--------------------------------------------------------------------------
    */
    const updateStock = (
        item: Sparepart,
        direction:
            | 'plus'
            | 'minus',
    ) => {
        if (
            direction === 'minus'
            &&
            item.stock <= 0
        ) {
            return;
        }

        router.post(
            `/spareparts/${item.id}/stock`,

            {
                type:
                    direction === 'plus'
                        ? 'addition'
                        : 'reduction',

                quantity: 1,

                note:
                    direction === 'plus'
                        ? 'Penambahan stok melalui daftar sparepart'
                        : 'Pengurangan stok melalui daftar sparepart',
            },

            {
                preserveScroll: true,

                onStart: () => {
                    setProcessingStockId(
                        item.id,
                    );
                },

                onFinish: () => {
                    setProcessingStockId(
                        null,
                    );
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */
    const deleteSparepart = (
        item: Sparepart,
    ) => {
        const confirmed =
            window.confirm(
                `Hapus sparepart "${item.name}"?`,
            );

        if (!confirmed) {
            return;
        }

        router.delete(
            `/spareparts/${item.id}`,
            {
                preserveScroll: true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */
    const openPage = (
        url: string | null,
    ) => {
        if (!url) {
            return;
        }

        router.get(
            url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title="Daftar Sparepart" />

            <div className="mx-auto w-full px-3 pb-8">
                {/* =====================================================
                    DAFTAR SPAREPART
                ====================================================== */}

                <section className="rounded-[22px] bg-white p-4 shadow-sm">
                    {/* HEADER */}

                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-[24px] font-extrabold text-[#111827]">
                                Daftar Sparepart
                            </h1>

                            <p className="mt-0.5 text-sm text-gray-500">
                                Total {spareparts.total} sparepart
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    window.print()
                                }
                                className="flex h-11 items-center gap-2 rounded-xl bg-[#4f86f7] px-4 text-base font-medium text-white transition hover:bg-blue-600"
                            >
                                Print Laporan

                                <Printer
                                    size={18}
                                />
                            </button>

                            <Link
                                href="/spareparts/create"
                                className="flex h-11 items-center gap-2 rounded-xl bg-[#2faa32] px-4 text-base font-medium text-white transition hover:bg-[#249428]"
                            >
                                Tambah Sparepart

                                <Plus
                                    size={18}
                                />
                            </Link>
                        </div>
                    </div>

                    {/* =================================================
                        FILTER
                    ================================================== */}

                    <div className="mb-3 flex flex-wrap justify-end gap-2">
                        {/* STATUS */}

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(
                                event,
                            ) =>
                                handleStatusChange(
                                    event.target
                                        .value,
                                )
                            }
                            className="h-11 min-w-[210px] rounded-lg border border-[#8b8b8b] bg-white px-4 text-base text-gray-500 outline-none"
                        >
                            <option value="">
                                Semua Status
                            </option>

                            <option value="Stok Cukup">
                                Stok Cukup
                            </option>

                            <option value="On Delivery">
                                On Delivery
                            </option>

                            <option value="Stok Kurang">
                                Stok Kurang
                            </option>
                        </select>

                        {/* BUILDING */}

                        <select
                            value={
                                buildingFilter
                            }
                            onChange={(
                                event,
                            ) =>
                                handleBuildingChange(
                                    event.target
                                        .value,
                                )
                            }
                            className="h-11 min-w-[230px] rounded-lg border border-[#8b8b8b] bg-white px-4 text-base text-gray-500 outline-none"
                        >
                            <option value="">
                                Semua Lokasi
                            </option>

                            {buildings.map(
                                (
                                    building,
                                ) => (
                                    <option
                                        key={
                                            building.id
                                        }
                                        value={
                                            building.id
                                        }
                                    >
                                        {
                                            building.code
                                        }{' '}
                                        -{' '}
                                        {
                                            building.name
                                        }
                                    </option>
                                ),
                            )}
                        </select>

                        {/* SEARCH */}

                        <form
                            onSubmit={
                                submitSearch
                            }
                        >
                            <label className="flex h-11 min-w-[240px] items-center gap-2 rounded-lg border border-[#8b8b8b] bg-white px-3 text-base text-gray-500">
                                <Search
                                    size={18}
                                />

                                <input
                                    type="text"
                                    value={
                                        search
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setSearch(
                                            event.target
                                                .value,
                                        )
                                    }
                                    placeholder="Search..."
                                    className="w-full bg-transparent text-base text-gray-800 outline-none placeholder:text-gray-500"
                                />
                            </label>
                        </form>
                    </div>

                    {/* =================================================
                        TABLE
                    ================================================== */}

                    <div className="overflow-hidden rounded-lg border border-gray-300">
                        <div className="overflow-x-auto">
                            <table className="min-w-[1050px] w-full table-fixed border-collapse text-left">
                                <thead className="border-b border-gray-300">
                                    <tr className="bg-[#151d2c] text-white">
                                        <th className="w-[115px] px-4 py-3" />

                                        <th className="w-[230px] px-3 py-3 text-base font-bold">
                                            Nama Item &amp; Produsen
                                        </th>

                                        <th className="w-[190px] px-3 py-3 text-base font-bold">
                                            Lokasi
                                        </th>

                                        <th className="w-[100px] px-3 py-3 text-base font-bold">
                                            Min
                                        </th>

                                        <th className="w-[100px] px-3 py-3 text-base font-bold">
                                            Stok
                                        </th>

                                        <th className="w-[130px] px-3 py-3 text-center text-base font-bold">
                                            Status
                                        </th>

                                        <th className="w-[260px] px-3 py-3 text-center text-base font-bold">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {spareparts.data.map(
                                        (
                                            item,
                                        ) => {
                                            const processing =
                                                processingStockId ===
                                                item.id;

                                            return (
                                                <tr
                                                    key={
                                                        item.id
                                                    }
                                                    className="border-b border-gray-300 bg-white last:border-b-0 hover:bg-gray-50"
                                                >
                                                    {/* IMAGE */}

                                                    <td className="px-4 py-2">
                                                        <div className="h-[62px] w-[95px] overflow-hidden rounded-md bg-gray-100">
                                                            {item.image_url ? (
                                                                <img
                                                                    src={
                                                                        item.image_url
                                                                    }
                                                                    alt={
                                                                        item.name
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                                                    No Image
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* ITEM */}

                                                    <td className="px-3 py-2">
                                                        <Link
                                                            href={`/spareparts/${item.id}`}
                                                            className="block text-base font-bold leading-tight text-gray-900 hover:text-green-600"
                                                        >
                                                            {
                                                                item.name
                                                            }
                                                        </Link>

                                                        <span className="block text-sm leading-tight text-gray-600">
                                                            {item.producer ??
                                                                '-'}
                                                        </span>

                                                        <span className="mt-1 block text-xs font-medium text-gray-400">
                                                            {
                                                                item.code
                                                            }
                                                        </span>
                                                    </td>

                                                    {/* BUILDING */}

                                                    <td className="px-3 py-2">
                                                        {item.building ? (
                                                            <>
                                                                <div className="text-base font-semibold text-gray-900">
                                                                    {
                                                                        item
                                                                            .building
                                                                            .code
                                                                    }
                                                                </div>

                                                                <div className="text-sm leading-tight text-gray-500">
                                                                    {
                                                                        item
                                                                            .building
                                                                            .name
                                                                    }
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* MIN */}

                                                    <td className="whitespace-nowrap px-3 py-2 text-base text-gray-900">
                                                        {
                                                            item.minimum_stock
                                                        }{' '}
                                                        {
                                                            item.unit
                                                        }
                                                    </td>

                                                    {/* STOCK */}

                                                    <td className="px-3 py-2">
                                                        <span className="inline-flex rounded-md border border-gray-400 bg-white px-3 py-1 text-base font-medium text-gray-900">
                                                            {
                                                                item.stock
                                                            }{' '}
                                                            {
                                                                item.unit
                                                            }
                                                        </span>
                                                    </td>

                                                    {/* STATUS */}

                                                    <td className="px-3 py-2 text-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    onClick={(event) =>
                                                                        event.stopPropagation()
                                                                    }
                                                                    className="cursor-pointer rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                                                    title="Klik untuk mengubah status delivery"
                                                                >
                                                                    <Badge
                                                                        className={`min-w-[95px] justify-center border-0 px-3 py-2 text-sm font-medium hover:opacity-90 ${statusStyles[item.status]}`}
                                                                    >
                                                                        {item.status}
                                                                    </Badge>
                                                                </button>
                                                            </DropdownMenuTrigger>

                                                            <DropdownMenuContent
                                                                align="center"
                                                                onClick={(event) =>
                                                                    event.stopPropagation()
                                                                }
                                                            >
                                                                <DropdownMenuItem
                                                                    disabled={
                                                                        item.delivery_status ===
                                                                        'on_delivery'
                                                                    }
                                                                    onClick={() =>
                                                                        updateStatus(
                                                                            item.id,
                                                                            'on_delivery',
                                                                        )
                                                                    }
                                                                >
                                                                    On Delivery
                                                                </DropdownMenuItem>

                                                                <DropdownMenuItem
                                                                    disabled={
                                                                        item.delivery_status ===
                                                                        'none'
                                                                    }
                                                                    onClick={() =>
                                                                        updateStatus(
                                                                            item.id,
                                                                            'none',
                                                                        )
                                                                    }
                                                                >
                                                                    Tidak On Delivery
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>

                                                    {/* ACTION */}

                                                    <td className="px-3 py-2">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {/* STOCK CONTROL */}

                                                            <div className="flex h-10 shrink-0 overflow-hidden rounded-md border border-gray-400">
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        processing ||
                                                                        item.stock <=
                                                                        0
                                                                    }
                                                                    onClick={() =>
                                                                        updateStock(
                                                                            item,
                                                                            'minus',
                                                                        )
                                                                    }
                                                                    title="Kurangi stok"
                                                                    className="flex h-10 w-10 items-center justify-center bg-white text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                                >
                                                                    <Minus
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>

                                                                <div className="flex h-10 min-w-10 items-center justify-center border-x border-gray-400 bg-gray-200 px-2 font-semibold text-gray-900">
                                                                    {
                                                                        item.stock
                                                                    }
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    onClick={() =>
                                                                        updateStock(
                                                                            item,
                                                                            'plus',
                                                                        )
                                                                    }
                                                                    title="Tambah stok"
                                                                    className="flex h-10 w-10 items-center justify-center bg-white text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                                >
                                                                    <Plus
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>
                                                            </div>

                                                            {/* DETAIL */}

                                                            <Link
                                                                href={`/spareparts/${item.id}`}
                                                                title="Detail"
                                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-700 text-white transition hover:bg-gray-800"
                                                            >
                                                                <Eye
                                                                    size={
                                                                        19
                                                                    }
                                                                />
                                                            </Link>

                                                            {/* EDIT */}

                                                            <Link
                                                                href={`/spareparts/${item.id}/edit`}
                                                                title="Edit"
                                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#3b82f6] text-white transition hover:bg-blue-600"
                                                            >
                                                                <Edit3
                                                                    size={
                                                                        19
                                                                    }
                                                                    strokeWidth={
                                                                        2.3
                                                                    }
                                                                />
                                                            </Link>

                                                            {/* DELETE */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deleteSparepart(
                                                                        item,
                                                                    )
                                                                }
                                                                title="Hapus"
                                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#dc2626] text-white transition hover:bg-red-700"
                                                            >
                                                                <Trash2
                                                                    size={
                                                                        19
                                                                    }
                                                                    strokeWidth={
                                                                        2.3
                                                                    }
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        },
                                    )}

                                    {spareparts
                                        .data
                                        .length ===
                                        0 && (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        7
                                                    }
                                                    className="px-4 py-12 text-center text-gray-400"
                                                >
                                                    Tidak ada sparepart yang sesuai dengan filter.
                                                </td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* =================================================
                        PAGINATION
                    ================================================== */}

                    {spareparts.total >
                        0 && (
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                <div className="text-sm text-gray-500">
                                    Menampilkan{' '}
                                    {spareparts.from ??
                                        0}{' '}
                                    -{' '}
                                    {spareparts.to ??
                                        0}{' '}
                                    dari{' '}
                                    {
                                        spareparts.total
                                    }{' '}
                                    data
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={
                                            !spareparts.prev_page_url
                                        }
                                        onClick={() =>
                                            openPage(
                                                spareparts.prev_page_url,
                                            )
                                        }
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Sebelumnya
                                    </button>

                                    <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                                        {
                                            spareparts.current_page
                                        }{' '}
                                        /{' '}
                                        {
                                            spareparts.last_page
                                        }
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            !spareparts.next_page_url
                                        }
                                        onClick={() =>
                                            openPage(
                                                spareparts.next_page_url,
                                            )
                                        }
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Berikutnya
                                    </button>
                                </div>
                            </div>
                        )}
                </section>

                {/* =====================================================
                    STOCK HISTORY
                ====================================================== */}

                <section className="mt-5 rounded-[22px] bg-white p-4 shadow-sm">
                    <h2 className="mb-3 text-[22px] font-extrabold text-[#111827]">
                        Riwayat Perubahan Stok
                    </h2>

                    <div className="overflow-hidden rounded-lg border border-gray-300">
                        <div className="overflow-x-auto">
                            <table className="min-w-[1000px] w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="bg-[#10b53b] text-white">
                                        <th className="px-4 py-3 font-bold">
                                            Waktu &amp; Tanggal
                                        </th>

                                        <th className="px-4 py-3 font-bold">
                                            Unit Sparepart
                                        </th>

                                        <th className="px-4 py-3 font-bold">
                                            Jenis
                                        </th>

                                        <th className="px-4 py-3 font-bold">
                                            Perubahan
                                        </th>

                                        <th className="px-4 py-3 font-bold">
                                            Stok Awal
                                        </th>

                                        <th className="px-4 py-3 font-bold">
                                            Volume Baru
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
                                                <td className="whitespace-nowrap px-4 py-3 text-gray-800">
                                                    {history.date ??
                                                        '-'}
                                                </td>

                                                <td className="px-4 py-3 font-semibold text-gray-800">
                                                    <Link
                                                        href={`/spareparts/${history.sparepart_id}`}
                                                        className="hover:text-green-600"
                                                    >
                                                        {
                                                            history.sparepart
                                                        }
                                                    </Link>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${historyStyles[
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

                                                <td className="px-4 py-3 font-bold">
                                                    <span
                                                        className={
                                                            history.change >
                                                                0
                                                                ? 'text-green-600'
                                                                : history.change <
                                                                    0
                                                                    ? 'text-red-600'
                                                                    : 'text-gray-700'
                                                        }
                                                    >
                                                        {history.change >
                                                            0
                                                            ? `+${history.change}`
                                                            : history.change}{' '}
                                                        {
                                                            history.unit
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 text-gray-800">
                                                    {
                                                        history.stock_before
                                                    }{' '}
                                                    {
                                                        history.unit
                                                    }
                                                </td>

                                                <td className="px-4 py-3 font-semibold text-gray-800">
                                                    {
                                                        history.new_stock
                                                    }{' '}
                                                    {
                                                        history.unit
                                                    }
                                                </td>

                                                <td className="px-4 py-3 text-gray-800">
                                                    {
                                                        history.officer
                                                    }
                                                </td>

                                                <td className="max-w-[320px] px-4 py-3 text-xs text-gray-500">
                                                    {history.note ??
                                                        '-'}

                                                    {history.reference_code && (
                                                        <div className="mt-1 font-medium text-blue-600">
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
                                                        8
                                                    }
                                                    className="px-4 py-10 text-center text-gray-400"
                                                >
                                                    Belum ada riwayat perubahan stok.
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