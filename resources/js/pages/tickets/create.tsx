import {
    Head,
    router,
    useForm,
} from '@inertiajs/react';
import {
    FileText,
    ImageUp,
    MapPin,
    Wrench,
    X,
} from 'lucide-react';
import {
    FormEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type RepairType =
    | 'machine'
    | 'electrical'
    | 'maintenance'
    | 'preventive_maintenance'
    | 'other';

type PriorityType =
    | 'standard'
    | 'urgent';

type Reporter = {
    id: number;
    employee_code: string;
    name: string;
};

type Division = {
    id: number;
    name: string;
};

type Machine = {
    id: number;
    name: string;
    code: string | null;
    location_id: number;
};

type Props = {
    ticketCode: string;

    reporter: Reporter | null;

    divisions: Division[];

    machines: Machine[];
};

/*
|--------------------------------------------------------------------------
| REPAIR TYPES
|--------------------------------------------------------------------------
*/

const repairTypes: {
    value: RepairType;
    label: string;
}[] = [
    {
        value: 'machine',
        label: 'Mesin',
    },
    {
        value: 'electrical',
        label: 'Kelistrikan',
    },
    {
        value: 'maintenance',
        label: 'Pemeliharaan',
    },
    {
        value: 'preventive_maintenance',
        label: 'Preventif Maintenance',
    },
    {
        value: 'other',
        label: 'Pekerjaan Lainnya',
    },
];

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function CreateTicket({
    ticketCode,
    reporter,
    divisions,
    machines,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | TYPE MODAL
    |--------------------------------------------------------------------------
    */

    const [
        showTypeModal,
        setShowTypeModal,
    ] = useState(true);

    /*
    |--------------------------------------------------------------------------
    | FILE INPUT
    |--------------------------------------------------------------------------
    */

    const fileInputRef =
        useRef<HTMLInputElement>(null);

    /*
    |--------------------------------------------------------------------------
    | FORM
    |--------------------------------------------------------------------------
    */

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm<{
        category: RepairType;
        priority: PriorityType;
        division_id: string;
        machine_id: string;
        description: string;
        damage_photo: File | null;
    }>({
        category: 'machine',
        priority: 'standard',

        division_id: '',
        machine_id: '',

        description: '',

        damage_photo: null,
    });

    /*
    |--------------------------------------------------------------------------
    | IMAGE PREVIEW
    |--------------------------------------------------------------------------
    */

    const imagePreview =
        useMemo(() => {
            if (
                !data.damage_photo
            ) {
                return null;
            }

            return URL.createObjectURL(
                data.damage_photo,
            );
        }, [data.damage_photo]);

    /*
    |--------------------------------------------------------------------------
    | CLEANUP PREVIEW URL
    |--------------------------------------------------------------------------
    */

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
    | CATEGORY
    |--------------------------------------------------------------------------
    */

    const selectCategory = (
        category: RepairType,
    ) => {
        setData(
            'category',
            category,
        );

        /*
         * Mesin hanya dipakai
         * untuk category machine.
         */

        if (
            category !== 'machine'
        ) {
            setData(
                'machine_id',
                '',
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | MACHINE
    |--------------------------------------------------------------------------
    */

    const handleMachineChange = (
        machineId: string,
    ) => {
        setData(
            'machine_id',
            machineId,
        );

        const selectedMachine =
            machines.find(
                (machine) =>
                    String(
                        machine.id,
                    ) === machineId,
            );

        /*
         * Gunakan bagian ini hanya jika
         * machines.location_id memang
         * mengarah ke core.divisions.id.
         */

        if (
            selectedMachine?.location_id
        ) {
            setData(
                'division_id',
                String(
                    selectedMachine.location_id,
                ),
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | FILE
    |--------------------------------------------------------------------------
    */

    const handleFileChange = (
        file: File | null,
    ) => {
        setData(
            'damage_photo',
            file,
        );
    };

    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const submit = (
        event: FormEvent,
    ) => {
        event.preventDefault();

        /*
         * Endpoint:
         *
         * POST /tickets
         */

        post(
            '/tickets',
            {
                forceFormData: true,
                preserveScroll: true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | CANCEL
    |--------------------------------------------------------------------------
    */

    const cancel = () => {
        reset();

        router.visit(
            '/tickets',
        );
    };

    /*
    |--------------------------------------------------------------------------
    | LABEL
    |--------------------------------------------------------------------------
    */

    const categoryLabel =
        repairTypes.find(
            (item) =>
                item.value ===
                data.category,
        )?.label ?? '-';

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Buat Tiket Perbaikan" />

            <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 px-3 pb-8">
                {/* ========================================================
                    TITLE
                ======================================================== */}

                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#111827]">
                        Buat Tiket Perbaikan
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Buat laporan kerusakan
                        atau pekerjaan
                        maintenance baru.
                    </p>
                </div>

                {/* ========================================================
                    FORM
                ======================================================== */}

                <form
                    onSubmit={submit}
                    className="overflow-hidden rounded-[20px] bg-white shadow-md"
                >
                    {/* HEADER */}

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
                                {
                                    ticketCode
                                }
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* ====================================================
                            SUMMARY
                        ==================================================== */}

                        <div className="grid gap-3 md:grid-cols-3">
                            <InfoBox label="Pelapor">
                                {reporter?.name ??
                                    '-'}
                            </InfoBox>

                            <InfoBox label="Jenis Perbaikan">
                                {
                                    categoryLabel
                                }
                            </InfoBox>

                            <InfoBox label="Prioritas">
                                <span
                                    className={
                                        data.priority ===
                                        'urgent'
                                            ? 'font-bold text-red-600'
                                            : ''
                                    }
                                >
                                    {data.priority ===
                                    'urgent'
                                        ? 'Urgent'
                                        : 'Standar'}
                                </span>
                            </InfoBox>
                        </div>

                        {/* CHANGE TYPE */}

                        <div className="mt-3 flex justify-end">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowTypeModal(
                                        true,
                                    )
                                }
                                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Ubah Jenis
                                Perbaikan /
                                Prioritas
                            </button>
                        </div>

                        {/* ====================================================
                            MACHINE + LOCATION
                        ==================================================== */}

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            {/* MACHINE */}

                            {data.category ===
                                'machine' && (
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                        Unit Mesin

                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <div className="flex items-center gap-3 rounded-xl border border-[#d1d5db] bg-white px-4">
                                        <Wrench
                                            size={18}
                                            className="shrink-0 text-gray-500"
                                        />

                                        <select
                                            value={
                                                data.machine_id
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                handleMachineChange(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className="h-[52px] w-full bg-transparent text-sm text-gray-800 outline-none"
                                        >
                                            <option value="">
                                                -- Pilih
                                                Mesin --
                                            </option>

                                            {machines.map(
                                                (
                                                    machine,
                                                ) => (
                                                    <option
                                                        key={
                                                            machine.id
                                                        }
                                                        value={
                                                            machine.id
                                                        }
                                                    >
                                                        {machine.code
                                                            ? `${machine.code} - ${machine.name}`
                                                            : machine.name}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </div>

                                    {errors.machine_id && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {
                                                errors.machine_id
                                            }
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* LOCATION */}

                            <div
                                className={
                                    data.category !==
                                    'machine'
                                        ? 'md:col-span-2'
                                        : ''
                                }
                            >
                                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                    Lokasi Kejadian

                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <div className="flex items-center gap-3 rounded-xl border border-[#d1d5db] bg-white px-4">
                                    <MapPin
                                        size={18}
                                        className="shrink-0 text-gray-500"
                                    />

                                    <select
                                        value={
                                            data.division_id
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setData(
                                                'division_id',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        className="h-[52px] w-full bg-transparent text-sm text-gray-800 outline-none"
                                    >
                                        <option value="">
                                            -- Pilih
                                            Lokasi --
                                        </option>

                                        {divisions.map(
                                            (
                                                division,
                                            ) => (
                                                <option
                                                    key={
                                                        division.id
                                                    }
                                                    value={
                                                        division.id
                                                    }
                                                >
                                                    {
                                                        division.name
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>

                                {errors.division_id && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {
                                            errors.division_id
                                        }
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ====================================================
                            DESCRIPTION
                        ==================================================== */}

                        <div className="mt-5">
                            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                Deskripsi Kerusakan /
                                Pekerjaan

                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <div className="flex gap-3 rounded-xl border border-[#d1d5db] bg-white p-4">
                                <FileText
                                    size={19}
                                    className="mt-1 shrink-0 text-gray-500"
                                />

                                <textarea
                                    rows={6}
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
                                    placeholder="Jelaskan kerusakan atau pekerjaan yang diperlukan..."
                                    className="min-h-[130px] w-full resize-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                                />
                            </div>

                            {errors.description && (
                                <p className="mt-1 text-xs text-red-600">
                                    {
                                        errors.description
                                    }
                                </p>
                            )}
                        </div>

                        {/* ====================================================
                            IMAGE
                        ==================================================== */}

                        <div className="mt-5">
                            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                Foto Bukti
                                Kerusakan
                            </label>

                            <input
                                ref={
                                    fileInputRef
                                }
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(
                                    event,
                                ) =>
                                    handleFileChange(
                                        event
                                            .target
                                            .files?.[0] ??
                                            null,
                                    )
                                }
                                className="hidden"
                            />

                            {!imagePreview ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="flex min-h-[180px] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-green-500"
                                >
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                                        <ImageUp
                                            size={27}
                                        />
                                    </div>

                                    <div className="text-center">
                                        <div className="text-sm font-semibold text-gray-700">
                                            Upload
                                            Foto
                                        </div>

                                        <div className="mt-1 text-xs text-gray-400">
                                            JPG,
                                            PNG,
                                            WEBP.
                                            Maks. 5
                                            MB
                                        </div>
                                    </div>
                                </button>
                            ) : (
                                <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                                    <img
                                        src={
                                            imagePreview
                                        }
                                        alt="Preview"
                                        className="h-[260px] w-full object-contain"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleFileChange(
                                                null,
                                            );

                                            if (
                                                fileInputRef.current
                                            ) {
                                                fileInputRef.current.value =
                                                    '';
                                            }
                                        }}
                                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white"
                                    >
                                        <X
                                            size={17}
                                        />
                                    </button>
                                </div>
                            )}

                            {errors.damage_photo && (
                                <p className="mt-1 text-xs text-red-600">
                                    {
                                        errors.damage_photo
                                    }
                                </p>
                            )}
                        </div>

                        {/* ====================================================
                            ACTION
                        ==================================================== */}

                        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5">
                            <button
                                type="button"
                                onClick={cancel}
                                disabled={
                                    processing
                                }
                                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    processing
                                }
                                className="rounded-xl bg-[#35b34a] px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2e9d41] disabled:opacity-50"
                            >
                                {processing
                                    ? 'Mengirim...'
                                    : 'Kirim Laporan'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* ============================================================
                TYPE MODAL
            ============================================================ */}

            {showTypeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-[680px] overflow-hidden rounded-[22px] bg-white shadow-2xl">
                        {/* HEADER */}

                        <div className="flex items-center justify-between bg-black px-6 py-4 text-white">
                            <div className="flex items-center gap-2">
                                <Wrench
                                    size={20}
                                />

                                <h2 className="text-lg font-semibold">
                                    Jenis Laporan
                                    Perbaikan
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowTypeModal(
                                        false,
                                    )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/15"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* CATEGORY */}

                            <div className="space-y-3">
                                {repairTypes.map(
                                    (item) => (
                                        <label
                                            key={
                                                item.value
                                            }
                                            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                                                data.category ===
                                                item.value
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                checked={
                                                    data.category ===
                                                    item.value
                                                }
                                                onChange={() =>
                                                    selectCategory(
                                                        item.value,
                                                    )
                                                }
                                                className="h-5 w-5 accent-blue-600"
                                            />

                                            <span className="font-medium text-gray-800">
                                                {
                                                    item.label
                                                }
                                            </span>
                                        </label>
                                    ),
                                )}
                            </div>

                            {/* PRIORITY */}

                            <div className="mt-6">
                                <div className="mb-2 text-sm font-semibold text-gray-700">
                                    Prioritas
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData(
                                                'priority',
                                                'standard',
                                            )
                                        }
                                        className={`rounded-xl px-5 py-3 font-bold ${
                                            data.priority ===
                                            'standard'
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-300 bg-white text-gray-700'
                                        }`}
                                    >
                                        Standar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData(
                                                'priority',
                                                'urgent',
                                            )
                                        }
                                        className={`rounded-xl px-5 py-3 font-bold ${
                                            data.priority ===
                                            'urgent'
                                                ? 'bg-red-600 text-white'
                                                : 'border border-red-200 bg-red-50 text-red-600'
                                        }`}
                                    >
                                        Urgent
                                    </button>
                                </div>
                            </div>

                            {/* CONTINUE */}

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowTypeModal(
                                            false,
                                        )
                                    }
                                    className="rounded-xl bg-[#2f80ed] px-7 py-3 font-bold text-white transition hover:bg-[#2674d5]"
                                >
                                    Lanjutkan
                                </button>
                            </div>
                        </div>
                    </div>
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