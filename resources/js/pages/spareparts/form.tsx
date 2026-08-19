import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Package,
    Save,
    Upload,
} from 'lucide-react';
import {
    FormEvent,
    useEffect,
    useMemo,
} from 'react';

type Building = {
    id: number;
    name: string;
};

type DeliveryStatus =
    | 'none'
    | 'on_delivery';

type Sparepart = {
    id?: number;

    code?: string;
    name?: string;
    producer?: string | null;

    building_id?: number;

    minimum_stock?: number;
    stock?: number;

    unit?: string;

    delivery_status?: DeliveryStatus;

    description?: string | null;

    image?: string | null;
    image_url?: string | null;
};

type Props = {
    sparepart?: Sparepart;

    buildings: Building[];
};

export default function SparepartForm({
    sparepart,
    buildings,
}: Props) {
    const isEdit =
        Boolean(sparepart?.id);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        progress,
    } = useForm({
        _method:
            isEdit
                ? 'put'
                : 'post',

        code:
            sparepart?.code ?? '',

        name:
            sparepart?.name ?? '',

        producer:
            sparepart?.producer ?? '',

        building_id:
            sparepart?.building_id
                ? String(
                    sparepart.building_id,
                )
                : '',

        minimum_stock:
            sparepart?.minimum_stock ?? 0,

        /*
         * Stock hanya digunakan saat Create.
         *
         * Saat Edit, stock ditampilkan
         * tetapi tidak seharusnya diubah
         * dari halaman master.
         */
        stock:
            sparepart?.stock ?? 0,

        unit:
            sparepart?.unit ?? 'pcs',

        delivery_status:
            sparepart?.delivery_status ??
            'none',

        description:
            sparepart?.description ?? '',

        image:
            null as File | null,
    });

    /*
    |--------------------------------------------------------------------------
    | IMAGE PREVIEW
    |--------------------------------------------------------------------------
    */
    const imagePreview =
        useMemo(() => {
            if (!data.image) {
                return null;
            }

            return URL.createObjectURL(
                data.image,
            );
        }, [data.image]);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(
                    imagePreview,
                );
            }
        };
    }, [imagePreview]);

    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */
    const submit = (
        event: FormEvent,
    ) => {
        event.preventDefault();

        const url =
            isEdit
                ? `/spareparts/${sparepart?.id}`
                : '/spareparts';

        post(
            url,
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
                        ? `Edit Sparepart - ${sparepart?.name}`
                        : 'Tambah Sparepart'
                }
            />

            <div className="mx-auto w-full px-3 pb-8">
                <section className="overflow-hidden rounded-[22px] bg-white shadow-md">
                    {/* =================================================
                        HEADER
                    ================================================== */}

                    <div className="flex min-h-[58px] items-center justify-between bg-[#151d2c] px-5 text-white">
                        <div className="flex items-center gap-3">
                            <Link
                                href={
                                    isEdit
                                        ? `/spareparts/${sparepart?.id}`
                                        : '/spareparts'
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10"
                                title="Kembali"
                            >
                                <ArrowLeft
                                    size={19}
                                />
                            </Link>

                            <div>
                                <h1 className="text-lg font-semibold">
                                    {isEdit
                                        ? 'Edit Sparepart'
                                        : 'Input Sparepart Baru'}
                                </h1>

                                {isEdit &&
                                    sparepart?.code && (
                                        <div className="text-xs text-gray-300">
                                            {
                                                sparepart.code
                                            }
                                        </div>
                                    )}
                            </div>
                        </div>

                        <Package
                            size={21}
                        />
                    </div>

                    {/* =================================================
                        FORM
                    ================================================== */}

                    <form
                        onSubmit={submit}
                        className="p-6"
                    >
                        <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
                            {/* =========================================
                                IMAGE
                            ========================================== */}

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Foto Sparepart
                                </label>

                                <label className="flex h-[270px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#8b8b8b] bg-[#f8f8f8] transition hover:bg-gray-50">
                                    {imagePreview ? (
                                        <img
                                            src={
                                                imagePreview
                                            }
                                            alt="Preview Sparepart"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : sparepart?.image_url ? (
                                        <img
                                            src={
                                                sparepart.image_url
                                            }
                                            alt={
                                                sparepart.name ??
                                                'Sparepart'
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : sparepart?.image ? (
                                        <img
                                            src={
                                                sparepart.image
                                            }
                                            alt={
                                                sparepart.name ??
                                                'Sparepart'
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <>
                                            <Upload
                                                size={44}
                                                className="text-gray-400"
                                            />

                                            <span className="mt-3 text-sm font-medium text-gray-500">
                                                Klik untuk upload gambar
                                            </span>

                                            <span className="mt-1 text-xs text-gray-400">
                                                JPG, PNG, WEBP
                                            </span>

                                            <span className="text-xs text-gray-400">
                                                Maks. 5 MB
                                            </span>
                                        </>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={(
                                            event,
                                        ) =>
                                            setData(
                                                'image',
                                                event
                                                    .target
                                                    .files?.[0] ??
                                                    null,
                                            )
                                        }
                                    />
                                </label>

                                {errors.image && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {
                                            errors.image
                                        }
                                    </p>
                                )}

                                {/* UPLOAD PROGRESS */}

                                {progress && (
                                    <div className="mt-3">
                                        <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                                            <span>
                                                Uploading
                                            </span>

                                            <span>
                                                {
                                                    progress.percentage
                                                }
                                                %
                                            </span>
                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                            <div
                                                className="h-full bg-green-600 transition-all"
                                                style={{
                                                    width: `${progress.percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* =========================================
                                RIGHT FORM
                            ========================================== */}

                            <div className="grid gap-4 md:grid-cols-2">
                                {/* CODE */}

                                <InputField
                                    label="Kode Sparepart"
                                    value={
                                        data.code
                                    }
                                    onChange={(
                                        value,
                                    ) =>
                                        setData(
                                            'code',
                                            value,
                                        )
                                    }
                                    error={
                                        errors.code
                                    }
                                    placeholder="Contoh: SP-0001"
                                    required
                                />

                                {/* NAME */}

                                <InputField
                                    label="Nama Sparepart"
                                    value={
                                        data.name
                                    }
                                    onChange={(
                                        value,
                                    ) =>
                                        setData(
                                            'name',
                                            value,
                                        )
                                    }
                                    error={
                                        errors.name
                                    }
                                    placeholder="Contoh: Wire Mesh #30"
                                    required
                                />

                                {/* PRODUCER */}

                                <InputField
                                    label="Produsen"
                                    value={
                                        data.producer
                                    }
                                    onChange={(
                                        value,
                                    ) =>
                                        setData(
                                            'producer',
                                            value,
                                        )
                                    }
                                    error={
                                        errors.producer
                                    }
                                    placeholder="Contoh: Unbranded"
                                />

                                {/* BUILDING */}

                                <div>
                                    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Building2
                                            size={16}
                                        />

                                        Lokasi / Building

                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        value={
                                            data.building_id
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setData(
                                                'building_id',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        className={`h-[52px] w-full rounded-xl border bg-white px-4 text-gray-800 outline-none transition ${
                                            errors.building_id
                                                ? 'border-red-500'
                                                : 'border-[#8b8b8b] focus:border-green-600'
                                        }`}
                                    >
                                        <option value="">
                                            == Pilih Building ==
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
                                                        building.name
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>

                                    {errors.building_id && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {
                                                errors.building_id
                                            }
                                        </p>
                                    )}
                                </div>

                                {/* =====================================
                                    STOCK SECTION
                                ====================================== */}

                                <div className="md:col-span-2">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        {/* MINIMUM STOCK */}

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Minimum Stok

                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.001"
                                                value={
                                                    data.minimum_stock
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setData(
                                                        'minimum_stock',
                                                        Number(
                                                            event
                                                                .target
                                                                .value,
                                                        ),
                                                    )
                                                }
                                                className={`h-[52px] w-full rounded-xl border bg-white px-4 text-gray-800 outline-none ${
                                                    errors.minimum_stock
                                                        ? 'border-red-500'
                                                        : 'border-[#8b8b8b] focus:border-green-600'
                                                }`}
                                            />

                                            {errors.minimum_stock && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {
                                                        errors.minimum_stock
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {/* CURRENT / INITIAL STOCK */}

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                {isEdit
                                                    ? 'Stok Saat Ini'
                                                    : 'Stok Awal'}

                                                {!isEdit && (
                                                    <span className="ml-1 text-red-500">
                                                        *
                                                    </span>
                                                )}
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.001"
                                                disabled={
                                                    isEdit
                                                }
                                                value={
                                                    data.stock
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setData(
                                                        'stock',
                                                        Number(
                                                            event
                                                                .target
                                                                .value,
                                                        ),
                                                    )
                                                }
                                                className={`h-[52px] w-full rounded-xl border px-4 outline-none text-gray-800 ${
                                                    isEdit
                                                        ? 'cursor-not-allowed border-gray-300 bg-gray-100 text-gray-500'
                                                        : errors.stock
                                                          ? 'border-red-500 bg-white'
                                                          : 'border-[#8b8b8b] bg-white focus:border-green-600 text-gray-800'
                                                }`}
                                            />

                                            {isEdit && (
                                                <p className="mt-1 text-xs text-gray-400">
                                                    Ubah stok melalui kontrol stok pada halaman detail.
                                                </p>
                                            )}

                                            {errors.stock && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {
                                                        errors.stock
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {/* UNIT */}

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Satuan

                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                            </label>

                                            <select
                                                value={
                                                    data.unit
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setData(
                                                        'unit',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                className={`h-[52px] w-full rounded-xl border bg-white px-4 text-gray-800 outline-none ${
                                                    errors.unit
                                                        ? 'border-red-500'
                                                        : 'border-[#8b8b8b] focus:border-green-600'
                                                }`}
                                            >
                                                <option value="pcs">
                                                    Pcs
                                                </option>

                                                <option value="unit">
                                                    Unit
                                                </option>

                                                <option value="set">
                                                    Set
                                                </option>

                                                <option value="box">
                                                    Box
                                                </option>

                                                <option value="pack">
                                                    Pack
                                                </option>

                                                <option value="roll">
                                                    Roll
                                                </option>

                                                <option value="meter">
                                                    Meter
                                                </option>

                                                <option value="kg">
                                                    Kg
                                                </option>

                                                <option value="liter">
                                                    Liter
                                                </option>
                                            </select>

                                            {errors.unit && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {
                                                        errors.unit
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* DELIVERY STATUS */}

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Status Pengadaan
                                    </label>

                                    <select
                                        value={
                                            data.delivery_status
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setData(
                                                'delivery_status',
                                                event
                                                    .target
                                                    .value as DeliveryStatus,
                                            )
                                        }
                                        className={`h-[52px] w-full rounded-xl border bg-white px-4 text-gray-800 outline-none ${
                                            errors.delivery_status
                                                ? 'border-red-500'
                                                : 'border-[#8b8b8b] focus:border-green-600'
                                        }`}
                                    >
                                        <option value="none">
                                            Tidak Ada
                                        </option>

                                        <option value="on_delivery">
                                            On Delivery
                                        </option>
                                    </select>

                                    {errors.delivery_status && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {
                                                errors.delivery_status
                                            }
                                        </p>
                                    )}

                                    <p className="mt-1 text-xs text-gray-400">
                                        Status stok cukup/kurang dihitung otomatis dari jumlah stok.
                                    </p>
                                </div>

                                {/* EMPTY COLUMN */}

                                <div />

                                {/* DESCRIPTION */}

                                <div className="md:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Deskripsi
                                    </label>

                                    <textarea
                                        rows={5}
                                        value={
                                            data.description
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setData(
                                                'description',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="Masukkan deskripsi sparepart..."
                                        className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-gray-800 outline-none ${
                                            errors.description
                                                ? 'border-red-500'
                                                : 'border-[#8b8b8b] focus:border-green-600'
                                        }`}
                                    />

                                    {errors.description && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {
                                                errors.description
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            FOOTER BUTTONS
                        ================================================== */}

                        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-5">
                            <Link
                                href={
                                    isEdit
                                        ? `/spareparts/${sparepart?.id}`
                                        : '/spareparts'
                                }
                                className="flex min-w-[120px] items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                disabled={
                                    processing
                                }
                                className="flex min-w-[190px] items-center justify-center gap-2 rounded-xl bg-[#2faa32] px-6 py-3 font-bold text-white transition hover:bg-[#249428] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Save
                                    size={19}
                                />

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

/* ================================================================
 * INPUT FIELD
 * ================================================================ */

function InputField({
    label,
    value,
    onChange,
    error,
    placeholder,
    required = false,
}: {
    label: string;

    value: string;

    onChange: (
        value: string,
    ) => void;

    error?: string;

    placeholder?: string;

    required?: boolean;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}
            </label>

            <input
                type="text"
                value={value}
                placeholder={
                    placeholder
                }
                onChange={(
                    event,
                ) =>
                    onChange(
                        event.target.value,
                    )
                }
                className={`h-[52px] w-full rounded-xl border bg-white px-4 text-gray-800 outline-none transition ${
                    error
                        ? 'border-red-500'
                        : 'border-[#8b8b8b] focus:border-green-600'
                }`}
            />

            {error && (
                <p className="mt-1 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}