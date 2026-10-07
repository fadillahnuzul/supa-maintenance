import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Clock,
    FileText,
    ImageUp,
    MapPin,
    Save,
    UsersRound,
    Wrench,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
    show as showTicket,
    update as updateTicket,
} from '@/actions/App/Http/Controllers/TicketController';
import { compressImage } from '@/lib/compress-image';

type RepairType =
    | 'machine'
    | 'electrical'
    | 'maintenance'
    | 'preventive_maintenance'
    | 'other';

type PriorityType = 'standard' | 'urgent';

type Ticket = {
    id: number;
    code: string;
    category: RepairType;
    priority: PriorityType;
    division_id: string;
    machine_id: string;
    description: string;
    image: string | null;
    deadline: string;
    pic_technician_id: string;
    additional_technician_ids: number[];
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

type Technician = {
    id: number;
    name: string;
};

type Props = {
    ticket: Ticket;
    divisions: Division[];
    machines: Machine[];
    technicians: Technician[];
};

const repairTypes: { value: RepairType; label: string }[] = [
    { value: 'machine', label: 'Mesin' },
    { value: 'electrical', label: 'Kelistrikan' },
    { value: 'maintenance', label: 'Pemeliharaan' },
    { value: 'preventive_maintenance', label: 'Preventif Maintenance' },
    { value: 'other', label: 'Pekerjaan Lainnya' },
];

export default function EditTicket({
    ticket,
    divisions,
    machines,
    technicians,
}: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCompressingPhoto, setIsCompressingPhoto] =
        useState(false);
    const [photoError, setPhotoError] =
        useState<string | null>(null);
    const form = useForm<{
        category: RepairType;
        priority: PriorityType;
        division_id: string;
        machine_id: string;
        description: string;
        damage_photo: File | null;
        pic_technician_id: string;
        additional_technician_ids: number[];
        deadline: string;
        _method: 'put';
    }>({
        category: ticket.category,
        priority: ticket.priority,
        division_id: ticket.division_id,
        machine_id: ticket.machine_id,
        description: ticket.description,
        damage_photo: null,
        pic_technician_id: ticket.pic_technician_id,
        additional_technician_ids: ticket.additional_technician_ids,
        deadline: ticket.deadline,
        _method: 'put',
    });

    const imagePreview = useMemo(
        () => form.data.damage_photo
            ? URL.createObjectURL(form.data.damage_photo)
            : null,
        [form.data.damage_photo],
    );

    const handleDamagePhotoChange = async (
        file: File | null,
    ): Promise<void> => {
        setPhotoError(null);

        if (!file) {
            form.setData('damage_photo', null);

            return;
        }

        form.setData('damage_photo', null);

        setIsCompressingPhoto(true);

        try {
            form.setData('damage_photo', await compressImage(file));
        } catch (error) {
            setPhotoError(
                error instanceof Error
                    ? error.message
                    : 'Foto tidak dapat diproses. Silakan coba gambar lain.',
            );
        } finally {
            setIsCompressingPhoto(false);
        }
    };

    useEffect(() => () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
    }, [imagePreview]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isCompressingPhoto) {
            return;
        }

        form.post(updateTicket.url(ticket.id), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const cancel = () => {
        router.visit(showTicket.url(ticket.id));
    };

    const selectCategory = (category: RepairType) => {
        form.setData('category', category);

        if (category !== 'machine') {
            form.setData('machine_id', '');
        }
    };

    const selectMachine = (machineId: string) => {
        form.setData('machine_id', machineId);

        const machine = machines.find(
            (item) => String(item.id) === machineId,
        );

        if (machine) {
            form.setData('division_id', String(machine.location_id));
        }
    };

    const selectPic = (technicianId: string) => {
        form.setData('pic_technician_id', technicianId);
        form.setData(
            'additional_technician_ids',
            form.data.additional_technician_ids.filter(
                (id) => String(id) !== technicianId,
            ),
        );
    };

    const toggleAdditionalTechnician = (technicianId: number) => {
        const selectedIds = form.data.additional_technician_ids;

        form.setData(
            'additional_technician_ids',
            selectedIds.includes(technicianId)
                ? selectedIds.filter((id) => id !== technicianId)
                : [...selectedIds, technicianId],
        );
    };

    const preview = imagePreview ?? ticket.image;

    return (
        <>
            <Head title={`Edit Tiket ${ticket.code}`} />

            <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 px-3 pb-8">
                <div>
                    <button
                        type="button"
                        onClick={cancel}
                        className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-800"
                    >
                        <ArrowLeft size={17} />
                        Kembali ke Detail
                    </button>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                        Edit Tiket Perbaikan
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Perbarui informasi tiket {ticket.code}.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="overflow-hidden rounded-[20px] bg-white shadow-md"
                >
                    <div className="flex min-h-[58px] items-center gap-2 bg-black px-6 py-3 text-white">
                        <Wrench size={20} />
                        <span className="font-semibold">Informasi Tiket</span>
                        <span className="ml-auto text-sm font-bold">
                            {ticket.code}
                        </span>
                    </div>

                    <div className="grid gap-5 p-6 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="category"
                                className="mb-1.5 block text-sm font-semibold text-gray-700"
                            >
                                Jenis Perbaikan
                            </label>
                            <select
                                id="category"
                                value={form.data.category}
                                onChange={(event) =>
                                    selectCategory(event.target.value as RepairType)
                                }
                                className="h-[52px] w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-800 outline-none focus:border-blue-500"
                            >
                                {repairTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            {form.errors.category && (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.category}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="priority"
                                className="mb-1.5 block text-sm font-semibold text-gray-700"
                            >
                                Prioritas
                            </label>
                            <select
                                id="priority"
                                value={form.data.priority}
                                onChange={(event) =>
                                    form.setData(
                                        'priority',
                                        event.target.value as PriorityType,
                                    )
                                }
                                className="h-[52px] w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-800 outline-none focus:border-blue-500"
                            >
                                <option value="standard">Standar</option>
                                <option value="urgent">Urgent</option>
                            </select>
                            {form.errors.priority && (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.priority}
                                </p>
                            )}
                        </div>

                        {form.data.category === 'machine' && (
                            <div>
                                <label
                                    htmlFor="machine_id"
                                    className="mb-1.5 block text-sm font-semibold text-gray-700"
                                >
                                    Unit Mesin
                                </label>
                                <div className="flex items-center gap-3 rounded-xl border border-gray-300 px-4">
                                    <Wrench size={18} className="shrink-0 text-gray-500" />
                                    <select
                                        id="machine_id"
                                        value={form.data.machine_id}
                                        onChange={(event) =>
                                            selectMachine(event.target.value)
                                        }
                                        className="h-[52px] w-full bg-transparent text-sm text-gray-800 outline-none"
                                    >
                                        <option value="">-- Pilih Mesin --</option>
                                        {machines.map((machine) => (
                                            <option
                                                key={machine.id}
                                                value={machine.id}
                                            >
                                                {machine.code
                                                    ? `${machine.code} - ${machine.name}`
                                                    : machine.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {form.errors.machine_id && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.machine_id}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className={form.data.category !== 'machine' ? 'md:col-span-2' : ''}>
                            <label
                                htmlFor="division_id"
                                className="mb-1.5 block text-sm font-semibold text-gray-700"
                            >
                                Lokasi Kejadian
                            </label>
                            <div className="flex items-center gap-3 rounded-xl border border-gray-300 px-4">
                                <MapPin size={18} className="shrink-0 text-gray-500" />
                                <select
                                    id="division_id"
                                    value={form.data.division_id}
                                    onChange={(event) =>
                                        form.setData('division_id', event.target.value)
                                    }
                                    className="h-[52px] w-full bg-transparent text-sm text-gray-800 outline-none"
                                >
                                    <option value="">-- Pilih Lokasi --</option>
                                    {divisions.map((division) => (
                                        <option key={division.id} value={division.id}>
                                            {division.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {form.errors.division_id && (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.division_id}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-5 md:col-span-2 md:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="pic_technician_id"
                                    className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-800"
                                >
                                    <UsersRound size={17} />
                                    PIC Teknisi
                                </label>
                                <select
                                    id="pic_technician_id"
                                    value={form.data.pic_technician_id}
                                    required={
                                        form.data.additional_technician_ids.length > 0
                                    }
                                    onChange={(event) =>
                                        selectPic(event.target.value)
                                    }
                                    className="h-[52px] w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-800 outline-none focus:border-blue-600"
                                >
                                    <option value="">-- Belum ditentukan --</option>
                                    {technicians.map((technician) => (
                                        <option
                                            key={technician.id}
                                            value={technician.id}
                                        >
                                            {technician.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    PIC wajib dipilih jika menambahkan teknisi.
                                </p>
                                {form.errors.pic_technician_id && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.pic_technician_id}
                                    </p>
                                )}

                                <label
                                    htmlFor="deadline"
                                    className="mb-1.5 mt-4 flex items-center gap-2 text-sm font-semibold text-gray-800"
                                >
                                    <Clock size={17} />
                                    Deadline
                                    {(form.data.pic_technician_id ||
                                        form.data.additional_technician_ids.length > 0) && (
                                        <span className="text-red-500">*</span>
                                    )}
                                </label>
                                <input
                                    id="deadline"
                                    type="date"
                                    required={Boolean(
                                        form.data.pic_technician_id ||
                                            form.data.additional_technician_ids.length > 0,
                                    )}
                                    value={form.data.deadline}
                                    onClick={(event) =>
                                        event.currentTarget.showPicker?.()
                                    }
                                    onChange={(event) =>
                                        form.setData('deadline', event.target.value)
                                    }
                                    className="h-[52px] w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-800 outline-none focus:border-blue-600"
                                />
                                {form.errors.deadline && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.deadline}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <UsersRound size={17} />
                                    Teknisi Tambahan
                                </label>
                                <div className="min-h-[130px] rounded-xl border border-gray-300 bg-gray-50 p-4">
                                    {technicians.filter(
                                        (technician) =>
                                            String(technician.id) !==
                                            form.data.pic_technician_id,
                                    ).length > 0 ? (
                                        <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                                            {technicians
                                                .filter(
                                                    (technician) =>
                                                        String(technician.id) !==
                                                        form.data.pic_technician_id,
                                                )
                                                .map((technician) => (
                                                    <label
                                                        key={technician.id}
                                                        className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={form.data.additional_technician_ids.includes(
                                                                technician.id,
                                                            )}
                                                            onChange={() =>
                                                                toggleAdditionalTechnician(
                                                                    technician.id,
                                                                )
                                                            }
                                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                                        />
                                                        {technician.name}
                                                    </label>
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            Teknisi tambahan belum tersedia.
                                        </p>
                                    )}
                                </div>
                                {form.errors.additional_technician_ids && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.additional_technician_ids}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label
                                htmlFor="description"
                                className="mb-1.5 block text-sm font-semibold text-gray-700"
                            >
                                Deskripsi Kerusakan / Pekerjaan
                            </label>
                            <div className="flex gap-3 rounded-xl border border-gray-300 p-4">
                                <FileText size={19} className="mt-1 shrink-0 text-gray-500" />
                                <textarea
                                    id="description"
                                    rows={6}
                                    value={form.data.description}
                                    onChange={(event) =>
                                        form.setData('description', event.target.value)
                                    }
                                    className="min-h-[130px] w-full resize-y bg-transparent text-sm text-gray-800 outline-none"
                                />
                            </div>
                            {form.errors.description && (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.description}
                                </p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                Foto Bukti Kerusakan
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(event) => {
                                    const file = event.target.files?.[0] ?? null;
                                    event.target.value = '';
                                    void handleDamagePhotoChange(file);
                                }}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isCompressingPhoto}
                                className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
                            >
                                <ImageUp size={22} />
                                {isCompressingPhoto
                                    ? 'Memproses foto...'
                                    : form.data.damage_photo
                                      ? form.data.damage_photo.name
                                      : 'Ambil atau pilih foto baru (opsional)'}
                            </button>
                            {preview && (
                                <img
                                    src={preview}
                                    alt={`Foto tiket ${ticket.code}`}
                                    className="mt-3 max-h-64 rounded-xl border border-gray-200 object-contain"
                                />
                            )}
                            {form.errors.damage_photo && (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.damage_photo}
                                </p>
                            )}
                            {photoError && (
                                <p className="mt-1 text-xs text-red-600">
                                    {photoError}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 px-6 py-5">
                        <button
                            type="button"
                            onClick={cancel}
                            className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing || isCompressingPhoto}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save size={17} />
                            {form.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
