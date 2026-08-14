import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Package,
    Save,
    Upload,
} from 'lucide-react';
import { FormEvent, useEffect } from 'react';

type Sparepart = {
    id?: number | string;
    code?: string;
    name?: string;
    producer?: string;
    location?: string;
    building?: string;
    floor?: string;
    area?: string;

    minimum_stock?: number;
    minimum_stock_unit?: string;

    stock?: number;
    stock_unit?: string;

    status?: 'Stok Cukup' | 'On Delivery' | 'Stok Kurang';
    description?: string;
    image?: string | null;
};

type Props = {
    sparepart?: Sparepart;
    submitUrl?: string;
};

export default function SparepartForm({
    sparepart,
    submitUrl,
}: Props) {
    const isEdit = Boolean(sparepart?.id);

    const { data, setData, post, put, processing, errors } = useForm({
        code: sparepart?.code ?? '',
        name: sparepart?.name ?? '',
        producer: sparepart?.producer ?? '',
        location: sparepart?.location ?? '',
        building: sparepart?.building ?? '',
        floor: sparepart?.floor ?? '',
        area: sparepart?.area ?? '',

        minimum_stock: sparepart?.minimum_stock ?? 0,
        minimum_stock_unit: sparepart?.minimum_stock_unit ?? 'pcs',

        stock: sparepart?.stock ?? 0,
        stock_unit: sparepart?.stock_unit ?? 'pcs',

        status: sparepart?.status ?? 'Stok Cukup',
        description: sparepart?.description ?? '',
        image: null as File | null,
    });

    useEffect(() => {
        setData('stock_unit', data.minimum_stock_unit);
    }, [data.minimum_stock_unit]);

    useEffect(() => {
        if (data.status === 'On Delivery') {
            return;
        }

        const nextStatus =
            data.stock < data.minimum_stock
                ? 'Stok Kurang'
                : 'Stok Cukup';

        if (data.status !== nextStatus) {
            setData('status', nextStatus);
        }
    }, [data.stock, data.minimum_stock, data.status]);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (isEdit) {
            put(
                submitUrl ??
                `/spareparts/${sparepart?.id}`,
                {
                    preserveScroll: true,
                },
            );

            return;
        }

        post(
            submitUrl ?? '/spareparts',
            {
                forceFormData: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head
                title={
                    isEdit
                        ? `Edit Sparepart ${sparepart?.name}`
                        : 'Input Sparepart Baru'
                }
            />

            <div className="mx-auto w-full px-3 pb-8">
                <section className="overflow-hidden rounded-[22px] bg-white shadow-md">
                    <div className="flex h-[58px] items-center justify-between bg-black px-6 text-white">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/spareparts"
                                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10"
                            >
                                <ArrowLeft size={19} />
                            </Link>

                            <h1 className="text-lg font-semibold">
                                {isEdit
                                    ? 'Edit Sparepart'
                                    : 'Input Sparepart Baru'}
                            </h1>
                        </div>

                        <Package size={20} />
                    </div>

                    <form
                        onSubmit={submit}
                        className="p-6"
                    >
                        <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
                            {/* IMAGE */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Foto Sparepart
                                </label>

                                <label className="flex h-[270px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#8b8b8b] bg-[#f8f8f8]">
                                    {data.image ? (
                                        <img
                                            src={URL.createObjectURL(
                                                data.image,
                                            )}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : sparepart?.image ? (
                                        <img
                                            src={sparepart.image}
                                            alt={sparepart.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <>
                                            <Upload
                                                size={42}
                                                className="text-gray-400"
                                            />

                                            <span className="mt-2 text-sm text-gray-500">
                                                Klik untuk upload gambar
                                            </span>
                                        </>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(event) =>
                                            setData(
                                                'image',
                                                event.target.files?.[0] ??
                                                null,
                                            )
                                        }
                                    />
                                </label>

                                {errors.image && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.image}
                                    </p>
                                )}
                            </div>

                            {/* FORM */}
                            <div className="grid gap-4 md:grid-cols-2 text-gray-800">
                                <InputField
                                    label="Kode Sparepart"
                                    value={data.code}
                                    onChange={(value) =>
                                        setData('code', value)
                                    }
                                    error={errors.code}
                                />

                                <InputField
                                    label="Nama Sparepart"
                                    value={data.name}
                                    onChange={(value) =>
                                        setData('name', value)
                                    }
                                    error={errors.name}
                                />

                                <InputField
                                    label="Produsen"
                                    value={data.producer}
                                    onChange={(value) =>
                                        setData('producer', value)
                                    }
                                />

                                <InputField
                                    label="Lokasi"
                                    value={data.location}
                                    onChange={(value) =>
                                        setData('location', value)
                                    }
                                />

                                <div className="grid gap-4 md:grid-cols-3">
                                    {/* JUMLAH MINIMAL */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Jumlah Minimal
                                        </label>

                                        <div className="flex h-[52px] w-full overflow-hidden rounded-xl border border-[#8b8b8b] bg-white focus-within:border-green-600">
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.minimum_stock}
                                                onChange={(event) =>
                                                    setData(
                                                        'minimum_stock',
                                                        Number(event.target.value),
                                                    )
                                                }
                                                placeholder="Jumlah"
                                                className="min-w-0 flex-1 basis-[180px] border-0 bg-transparent px-4 text-gray-800 outline-none"
                                            />

                                            <div className="w-px bg-[#b5b5b5]" />

                                            <select
                                                value={data.minimum_stock_unit}
                                                onChange={(event) => {
                                                    const nextValue =
                                                        event.target.value;

                                                    setData(
                                                        'minimum_stock_unit',
                                                        nextValue,
                                                    );
                                                    setData(
                                                        'stock_unit',
                                                        nextValue,
                                                    );
                                                }}
                                                className="w-[110px] border-0 bg-[#f7f7f7] px-3 text-sm text-gray-700 outline-none"
                                            >
                                                <option value="pcs">Pcs</option>
                                                <option value="unit">Unit</option>
                                                <option value="set">Set</option>
                                                <option value="box">Box</option>
                                                <option value="pack">Pack</option>
                                                <option value="roll">Roll</option>
                                                <option value="meter">Meter</option>
                                                <option value="kg">Kg</option>
                                                <option value="liter">Liter</option>
                                            </select>
                                        </div>

                                        {errors.minimum_stock && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.minimum_stock}
                                            </p>
                                        )}
                                    </div>

                                    {/* STOK SAAT INI */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Stok Saat Ini
                                        </label>

                                        <div className="flex h-[52px] w-full overflow-hidden rounded-xl border border-[#8b8b8b] bg-white focus-within:border-green-600">
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.stock}
                                                onChange={(event) =>
                                                    setData(
                                                        'stock',
                                                        Number(event.target.value),
                                                    )
                                                }
                                                placeholder="Jumlah"
                                                className="min-w-0 flex-1 basis-[180px] border-0 bg-transparent px-4 text-gray-800 outline-none"
                                            />

                                            <div className="w-px bg-[#b5b5b5]" />

                                            <select
                                                value={data.stock_unit}
                                                onChange={(event) =>
                                                    setData(
                                                        'stock_unit',
                                                        event.target.value,
                                                    )
                                                }
                                                className="w-[110px] border-0 bg-[#f7f7f7] px-3 text-sm text-gray-700 outline-none"
                                            >
                                                <option value="pcs">Pcs</option>
                                                <option value="unit">Unit</option>
                                                <option value="set">Set</option>
                                                <option value="box">Box</option>
                                                <option value="pack">Pack</option>
                                                <option value="roll">Roll</option>
                                                <option value="meter">Meter</option>
                                                <option value="kg">Kg</option>
                                                <option value="liter">Liter</option>
                                            </select>
                                        </div>

                                        {errors.stock && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.stock}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Status
                                        </label>

                                        <select
                                            value={data.status}
                                            onChange={(event) =>
                                                setData(
                                                    'status',
                                                    event.target.value as
                                                    | 'Stok Cukup'
                                                    | 'On Delivery'
                                                    | 'Stok Kurang',
                                                )
                                            }
                                            className="h-[52px] w-full rounded-xl border border-[#8b8b8b] bg-white px-4 outline-none focus:border-green-600"
                                        >
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
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Deskripsi
                                    </label>

                                    <textarea
                                        rows={4}
                                        value={data.description}
                                        onChange={(event) =>
                                            setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Masukkan deskripsi sparepart..."
                                        className="w-full rounded-xl border border-[#8b8b8b] bg-white px-4 py-3 outline-none focus:border-green-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-[#2faa32] px-6 py-3 font-bold text-white transition hover:bg-[#249428] disabled:opacity-50"
                            >
                                <Save size={19} />

                                {processing
                                    ? 'Menyimpan...'
                                    : isEdit
                                        ? 'Simpan Perubahan'
                                        : 'Simpan Sparepart'}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </>
    );
}

function InputField({
    label,
    value,
    onChange,
    error,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {label}
            </label>

            <input
                type="text"
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="h-[52px] w-full rounded-xl border border-[#8b8b8b] bg-white px-4 outline-none focus:border-green-600"
            />

            {error && (
                <p className="mt-1 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

function NumberField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {label}
            </label>

            <input
                type="number"
                min="0"
                value={value}
                onChange={(event) =>
                    onChange(
                        Number(event.target.value),
                    )
                }
                className="h-[52px] w-full rounded-xl border border-[#8b8b8b] bg-white px-4 outline-none focus:border-green-600"
            />
        </div>
    );
}