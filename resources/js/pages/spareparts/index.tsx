import { Head, Link } from '@inertiajs/react';
import {
    Edit3,
    Minus,
    Plus,
    Printer,
    Search,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type StockStatus = 'Stok Cukup' | 'On Delivery' | 'Stok Kurang';

type Sparepart = {
    id: number;
    code: string;
    name: string;
    producer: string;
    image: string;
    location: string;
    minimumStock: number;
    stock: number;
    unit: string;
    status: StockStatus;
};

type StockHistoryType = 'Tambah' | 'Kurang' | 'Tiket';

type StockHistory = {
    id: number;
    date: string;
    sparepart: string;
    type: StockHistoryType;
    change: number;
    newStock: number;
    officer: string;
    note: string;
};

const initialSpareparts: Sparepart[] = [
    {
        id: 1,
        code: 'SP-0001',
        name: 'Wire Mesh #30',
        producer: 'Unbranded',
        image: '/images/spareparts/wire-mesh.jpg',
        location: 'Gedung B, Lantai 1 (Area Packing Sachet)',
        minimumStock: 5,
        stock: 10,
        unit: 'pcs',
        status: 'Stok Cukup',
    },
    {
        id: 2,
        code: 'SP-0002',
        name: 'Wire Mesh #30',
        producer: 'Unbranded',
        image: '/images/spareparts/wire-mesh.jpg',
        location: 'Gedung B, Lantai 1 (Area Packing Sachet)',
        minimumStock: 5,
        stock: 10,
        unit: 'pcs',
        status: 'On Delivery',
    },
    {
        id: 3,
        code: 'SP-0003',
        name: 'Wire Mesh #30',
        producer: 'Unbranded',
        image: '/images/spareparts/wire-mesh.jpg',
        location: 'Gedung B, Lantai 1 (Area Packing Sachet)',
        minimumStock: 5,
        stock: 3,
        unit: 'pcs',
        status: 'Stok Kurang',
    },
];

const initialHistories: StockHistory[] = [
    {
        id: 1,
        date: '04/08/2026 16:06',
        sparepart: 'Wire Mesh #90 - Unbranded',
        type: 'Tambah',
        change: 1,
        newStock: 10,
        officer: 'Ibu Rina',
        note: 'Penambahan stok oleh Admin',
    },
    {
        id: 2,
        date: '04/08/2026 16:06',
        sparepart: 'Wire Mesh #30 - Unbranded',
        type: 'Kurang',
        change: -1,
        newStock: 9,
        officer: 'Ibu Rina',
        note: 'Pengurangan stok oleh Admin',
    },
    {
        id: 3,
        date: '04/08/2026 16:06',
        sparepart: 'Wire Mesh #30 - Unbranded',
        type: 'Tiket',
        change: -1,
        newStock: 9,
        officer: 'Ibu Rina',
        note: 'Digunakan otomatis untuk pengerjaan perbaikan tiket TKT-20260730-4954',
    },
];

const statusStyles: Record<StockStatus, string> = {
    'Stok Cukup': 'bg-[#d9f9df] text-[#24913a]',
    'On Delivery': 'bg-[#fffbcf] text-[#e6a300]',
    'Stok Kurang': 'bg-[#ffd9d2] text-[#e65345]',
};

const historyStyles: Record<StockHistoryType, string> = {
    Tambah: 'bg-[#d9f9df] text-[#24913a]',
    Kurang: 'bg-[#ffd9d2] text-[#e65345]',
    Tiket: 'bg-[#d6effc] text-[#4c9dd2]',
};

export default function SparepartIndex() {
    const [spareparts, setSpareparts] = useState(initialSpareparts);

    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [locationFilter, setLocationFilter] = useState('Semua Lokasi');
    const [search, setSearch] = useState('');

    const filteredSpareparts = useMemo(() => {
        return spareparts.filter((item) => {
            const matchesStatus =
                statusFilter === 'Semua Status' ||
                item.status === statusFilter;

            const matchesLocation =
                locationFilter === 'Semua Lokasi' ||
                item.location === locationFilter;

            const term = search.trim().toLowerCase();

            const matchesSearch =
                term.length === 0 ||
                [
                    item.code,
                    item.name,
                    item.producer,
                    item.location,
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(term);

            return matchesStatus && matchesLocation && matchesSearch;
        });
    }, [spareparts, statusFilter, locationFilter, search]);

    const updateStock = (
        id: number,
        direction: 'plus' | 'minus',
    ) => {
        setSpareparts((current) =>
            current.map((item) => {
                if (item.id !== id) return item;

                const nextStock =
                    direction === 'plus'
                        ? item.stock + 1
                        : Math.max(0, item.stock - 1);

                let nextStatus: StockStatus = item.status;

                if (nextStock < item.minimumStock) {
                    nextStatus = 'Stok Kurang';
                } else if (item.status !== 'On Delivery') {
                    nextStatus = 'Stok Cukup';
                }

                return {
                    ...item,
                    stock: nextStock,
                    status: nextStatus,
                };
            }),
        );
    };

    const deleteSparepart = (id: number) => {
        if (!window.confirm('Hapus sparepart ini?')) return;

        setSpareparts((current) =>
            current.filter((item) => item.id !== id),
        );
    };

    const locationOptions = useMemo(
        () => [...new Set(spareparts.map((item) => item.location))],
        [spareparts],
    );

    return (
        <>
            <Head title="Daftar Sparepart" />

            <div className="mx-auto w-full px-3 pb-8">
                {/* =========================
                    DAFTAR SPAREPART
                ========================= */}
                <section className="rounded-[22px] bg-white p-4 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-[24px] font-extrabold text-[#111827]">
                            Daftar Sparepart
                        </h1>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex h-11 items-center gap-2 rounded-xl bg-[#4f86f7] px-4 text-base font-medium text-white transition hover:bg-blue-600"
                            >
                                Print Laporan
                                <Printer size={18} />
                            </button>

                            <Link
                                href="/spareparts/create"
                                className="flex h-11 items-center gap-2 rounded-xl bg-[#2faa32] px-4 text-base font-medium text-white transition hover:bg-[#249428]"
                            >
                                Tambah Sparepart
                                <Plus size={18} />
                            </Link>
                        </div>
                    </div>

                    {/* FILTER */}
                    <div className="mb-3 flex flex-wrap justify-end gap-2">
                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            className="h-11 min-w-[220px] rounded-lg border border-[#8b8b8b] bg-white px-4 text-base outline-none text-gray-500"
                        >
                            <option>Semua Status</option>
                            <option>Stok Cukup</option>
                            <option>On Delivery</option>
                            <option>Stok Kurang</option>
                        </select>

                        <select
                            value={locationFilter}
                            onChange={(event) =>
                                setLocationFilter(event.target.value)
                            }
                            className="h-11 min-w-[220px] rounded-lg border border-[#8b8b8b] bg-white px-4 text-base outline-none text-gray-500"
                        >
                            <option>Semua Lokasi</option>

                            {locationOptions.map((location) => (
                                <option key={location}>
                                    {location}
                                </option>
                            ))}
                        </select>

                        <label className="flex h-11 min-w-[220px] items-center gap-2 rounded-lg border border-[#8b8b8b] bg-white px-3 text-base text-gray-500">
                            <Search
                                size={18}
                                className="text-gray-500"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search.."
                                className="w-full bg-transparent text-base outline-none placeholder:text-gray-500"
                            />
                        </label>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-visible rounded-lg border border-gray-300">
                        <div className="overflow-x-auto overflow-y-visible">
                            <table className="min-w-full table-fixed border-collapse text-left">
                                <thead className="sticky top-0 z-10 border-b border-gray-300">
                                    <tr className="bg-[#151d2c] text-white">
                                        <th className="w-[115px] px-4 py-3" />

                                        <th className="px-3 py-3 text-base font-bold">
                                            Nama Item &amp; Produsen
                                        </th>

                                        <th className="px-3 py-3 text-base font-bold">
                                            Lokasi
                                        </th>

                                        <th className="px-3 py-3 text-base font-bold">
                                            Min
                                        </th>

                                        <th className="px-3 py-3 text-base font-bold">
                                            Stok
                                        </th>

                                        <th className="px-3 py-3 text-center text-base font-bold">
                                            Status
                                        </th>

                                        <th className="w-[280px] min-w-[280px] px-3 py-3 text-center text-base font-bold">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredSpareparts.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-gray-300 bg-white last:border-b-0 hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-2">
                                                <div className="h-[62px] w-[95px] overflow-hidden bg-gray-100">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            </td>

                                            <td className="px-3 py-2">
                                                <Link
                                                    href={`/spareparts/${item.id}`}
                                                    className="block text-base font-bold leading-tight text-gray-900 hover:text-green-600"
                                                >
                                                    {item.name}
                                                </Link>

                                                <span className="block text-base leading-tight text-gray-900">
                                                    {item.producer}
                                                </span>
                                            </td>

                                            <td className="max-w-[250px] px-3 py-2 text-base leading-tight text-gray-900">
                                                {item.location}
                                            </td>

                                            <td className="whitespace-nowrap px-3 py-2 text-base text-gray-900">
                                                {item.minimumStock}{' '}
                                                {item.unit}
                                            </td>

                                            <td className="px-3 py-2">
                                                <span className="inline-flex rounded-md border border-gray-400 bg-white px-3 py-1 text-base font-medium text-gray-900">
                                                    {item.stock}{' '}
                                                    {item.unit}
                                                </span>
                                            </td>

                                            <td className="px-3 py-2 text-center">
                                                <span
                                                    className={`inline-flex min-w-[82px] justify-center rounded-lg px-3 py-2 text-sm font-medium ${statusStyles[item.status]}`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>

                                            <td className="min-w-[100px] px-3 py-2">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* STOCK CONTROL */}
                                                    <div className="flex h-10 shrink-0 overflow-hidden rounded-md border border-gray-400">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateStock(item.id, 'minus')}
                                                            className="flex h-10 w-10 items-center justify-center bg-white text-gray-800 hover:bg-gray-100"
                                                        >
                                                            <Minus size={17} />
                                                        </button>

                                                        <div className="flex h-10 w-10 items-center justify-center border-x border-gray-400 bg-gray-200 font-semibold text-gray-900">
                                                            {item.stock}
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => updateStock(item.id, 'plus')}
                                                            className="flex h-10 w-10 items-center justify-center bg-white text-gray-800 hover:bg-gray-100"
                                                        >
                                                            <Plus size={17} />
                                                        </button>
                                                    </div>

                                                    {/* EDIT */}
                                                    <Link
                                                        href={`/spareparts/edit/${item.id}`}
                                                        title="Edit"
                                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                                                        style={{
                                                            backgroundColor: '#3b82f6',
                                                            color: '#ffffff',
                                                        }}
                                                    >
                                                        <Edit3
                                                            size={19}
                                                            strokeWidth={2.3}
                                                            style={{ color: '#ffffff' }}
                                                        />
                                                    </Link>

                                                    {/* DELETE */}
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteSparepart(item.id)}
                                                        title="Hapus"
                                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                                                        style={{
                                                            backgroundColor: '#dc2626',
                                                            color: '#ffffff',
                                                        }}
                                                    >
                                                        <Trash2
                                                            size={19}
                                                            strokeWidth={2.3}
                                                            style={{ color: '#ffffff' }}
                                                        />
                                                    </button>
                                                </div> 
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredSpareparts.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-4 py-10 text-center text-gray-400"
                                            >
                                                Tidak ada sparepart yang sesuai
                                                dengan filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* =========================
                    STOCK HISTORY
                ========================= */}
                <section className="mt-5 rounded-[22px] bg-white p-4 shadow-sm">
                    <h2 className="mb-3 text-[22px] font-extrabold text-[#111827]">
                        Riwayat Perubahan Stok
                    </h2>

                    <div className="overflow-hidden rounded-lg border border-gray-300">
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse text-left text-sm">
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
                                            Volume baru
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
                                    {initialHistories.map((history) => (
                                        <tr
                                            key={history.id}
                                            className="border-b border-gray-300 bg-white last:border-b-0 hover:bg-gray-50"
                                        >
                                            <td className="whitespace-nowrap px-4 py-3 text-gray-800">
                                                {history.date}
                                            </td>

                                            <td className="px-4 py-3 font-semibold text-gray-800">
                                                {history.sparepart}
                                            </td>

                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${historyStyles[history.type]}`}
                                                >
                                                    {history.type}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 font-medium text-gray-800">
                                                {history.change > 0
                                                    ? `+${history.change}`
                                                    : history.change}
                                            </td>

                                            <td className="px-4 py-3 text-gray-800">
                                                {history.newStock}
                                            </td>

                                            <td className="px-4 py-3 text-gray-800">
                                                {history.officer}
                                            </td>

                                            <td className="max-w-[310px] px-4 py-3 text-xs text-gray-500">
                                                {history.note}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}