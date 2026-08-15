import { router } from '@inertiajs/react';
import { CalendarClock, FileText, ImageUp, Wrench, X } from 'lucide-react';
import { useState } from 'react';

type RepairType =
    | 'Mesin'
    | 'Kelistrikan'
    | 'Pemeliharaan'
    | 'Preventif Maintenance'
    | 'Pekerjaan Lainnya';

type Priority = 'Standar' | 'Urgent';

const repairTypes: RepairType[] = [
    'Mesin',
    'Kelistrikan',
    'Pemeliharaan',
    'Preventif Maintenance',
    'Pekerjaan Lainnya',
];

const machineOptions = ['MES-001', 'MES-002', 'MES-003', 'MES-004'];
const locationOptions = ['Area Produksi', 'Warehouse', 'Line 1', 'Line 2'];

const ticketInfo = [
    { label: 'Nomor Tiket', value: 'TKT-20260803-4054' },
    { label: 'Pelapor', value: 'Budi Santoso' },
];

export default function CreateTicket() {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [repairType, setRepairType] = useState<RepairType>('Mesin');
    const [priority, setPriority] = useState<Priority>('Standar');
    const [selectedMachine, setSelectedMachine] = useState('');

    const handleCloseModal = () => {
        setIsModalOpen(false);
        router.visit('/tickets');
    };

    return (
        <div className="mx-auto flex w-full max-w-[980px] flex-col gap-6 px-2 py-4">
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                    <div className="relative h-[80vh] w-full max-w-[1180px] rounded-[22px] bg-[#f3f3f3] shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full text-3xl font-light text-[#1f2937] transition hover:bg-black/5"
                            aria-label="Tutup"
                        >
                            <X size={30} />
                        </button>

                        <div className="flex h-full flex-col justify-between px-8 pb-10 pt-8">
                            <h2 className="text-center text-5xl font-extrabold tracking-tight text-[#111827]">
                                Jenis Laporan Perbaikan
                            </h2>

                            <div className="mx-auto flex w-full max-w-[620px] flex-col gap-6 pt-6">
                                <div className="space-y-4">
                                    {repairTypes.map((item) => (
                                        <label
                                            key={item}
                                            className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#dfe3e8] bg-white px-4 py-4 text-lg font-medium text-[#1f2937] shadow-sm transition hover:border-[#cbd5e1]"
                                        >
                                            <input
                                                type="radio"
                                                name="repairType"
                                                checked={repairType === item}
                                                onChange={() => setRepairType(item)}
                                                className="h-5 w-5 accent-[#1e88e5]"
                                            />
                                            <span>{item}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setPriority('Standar')}
                                        className={
                                            priority === 'Standar'
                                                ? 'rounded-2xl bg-[#2f80ed] px-5 py-4 text-2xl font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-[#2674d5]'
                                                : 'rounded-2xl border border-[#dfe3e8] bg-white px-5 py-4 text-2xl font-extrabold text-[#374151] shadow-sm transition hover:bg-[#f8fafc]'
                                        }
                                    >
                                        Standar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPriority('Urgent')}
                                        className={
                                            priority === 'Urgent'
                                                ? 'rounded-2xl bg-[#ef4444] px-5 py-4 text-2xl font-extrabold text-white shadow-lg shadow-red-200 transition hover:bg-[#dc2626]'
                                                : 'rounded-2xl border border-[#f9c8c8] bg-[#fff1f2] px-5 py-4 text-2xl font-extrabold text-[#b91c1c] shadow-sm transition hover:bg-[#ffe4e6]'
                                        }
                                    >
                                        Urgent
                                    </button>
                                </div>

                                <div className="flex justify-center pt-1">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="rounded-2xl bg-[#2f80ed] px-10 py-4 text-2xl font-extrabold text-white shadow-md transition hover:bg-[#2674d5]"
                                    >
                                        Lanjutkan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <h1 className="text-center text-4xl font-extrabold tracking-tight text-[#1f2937]">
                Buat Tiket Perbaikan
            </h1>

            <div className="rounded-2xl border border-[#dfe3e8] bg-[#f3f4f6] p-5 shadow-sm">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dfe3e8] bg-[#f9fafb] px-4 py-3">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#374151]">
                        {ticketInfo.map((item) => (
                            <div key={item.label} className="flex items-center gap-2">
                                <span className="font-medium">{item.label}:</span>
                                <span className="font-semibold text-[#111827]">{item.value}</span>
                            </div>
                        ))}
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Jenis Perbaikan:</span>
                            <span className="font-semibold text-[#111827]">{repairType}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={
                            priority === 'Urgent'
                                ? 'rounded-xl border border-[#f3a4a4] bg-[#fce9e9] px-4 py-2 text-sm font-semibold text-[#d35b5b] transition hover:bg-[#f9dcdc]'
                                : 'rounded-xl border border-[#dfe3e8] bg-[#f0fdf4] px-4 py-2 text-sm font-semibold text-[#15803d] transition hover:bg-[#dcfce7]'
                        }
                    >
                        {priority}
                    </button>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    {repairType === 'Mesin' && (
                        <label className="flex items-center gap-3 rounded-xl border border-[#dfe3e8] bg-white px-3 py-3 text-[#6b7280] shadow-sm">
                            <Wrench size={18} className="text-[#4b5563]" />
                            <select
                                value={selectedMachine}
                                onChange={(event) => setSelectedMachine(event.target.value)}
                                className="w-full appearance-none border-0 bg-transparent text-base text-[#111827] outline-none"
                                aria-label="Unit Mesin"
                            >
                                <option value="" className="text-[#9ca3af]">
                                    Unit Mesin
                                </option>
                                {machineOptions.map((option) => (
                                    <option key={option} value={option} className="text-[#111827] px-2 py-1">
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                    {repairType === 'Mesin' && (
                    <label className="flex items-center gap-3 rounded-xl border border-[#dfe3e8] bg-white px-3 py-3 text-[#6b7280] shadow-sm">
                        <CalendarClock size={18} className="text-[#4b5563]" />
                        <select
                            defaultValue=""
                            className="w-full appearance-none border-0 bg-transparent text-base text-[#111827] outline-none"
                            aria-label="Lokasi Kejadian"
                        >
                            <option value="" className="text-[#9ca3af]">
                                Lokasi Kejadian
                            </option>
                            {locationOptions.map((option) => (
                                <option key={option} value={option} className="text-[#111827] px-2 py-1">
                                    {option}
                                </option>
                            ))}
                        </select>
                    </label>
                    )}
                </div>

                <div className="grid gap-5 ">
                    {repairType != 'Mesin' && (
                    <label className="flex items-center gap-3 rounded-xl border border-[#dfe3e8] bg-white px-3 py-3 text-[#6b7280] shadow-sm">
                        <CalendarClock size={18} className="text-[#4b5563]" />
                        <select
                            defaultValue=""
                            className="w-full appearance-none border-0 bg-transparent text-base text-[#111827] outline-none"
                            aria-label="Lokasi Kejadian"
                        >
                            <option value="" className="text-[#9ca3af]">
                                Lokasi Kejadian
                            </option>
                            {locationOptions.map((option) => (
                                <option key={option} value={option} className="text-[#111827] px-2 py-1">
                                    {option}
                                </option>
                            ))}
                        </select>
                    </label>
                    )}
                </div>

                <div className="mt-5 rounded-xl border border-[#dfe3e8] bg-white p-3 shadow-sm">
                    <label className="flex gap-3 text-[#6b7280]">
                        <FileText size={18} className="text-[#4b5563] align-start" />
                        <textarea
                            rows={5}
                            className="min-h-[120px] w-full resize-none border-0 bg-transparent text-base text-[#111827] outline-none placeholder:text-[#9ca3af]"
                            placeholder="Text Area..."
                            aria-label="Deskripsi"
                        />
                    </label>
                </div>

                <div className="mt-5 rounded-xl border border-dashed border-[#d1d5db] bg-[#f9fafb] p-6 text-center shadow-sm">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef1f4] text-[#6b7280]">
                            <ImageUp size={30} />
                        </div>
                        <span className="text-base font-medium text-[#4b5563]">
                            Foto Bukti Kerusakan
                        </span>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        className="rounded-xl bg-[#35b34a] px-8 py-3 text-lg font-bold text-white shadow-md transition hover:bg-[#2e9d41]"
                    >
                        Kirim Laporan
                    </button>
                </div>
            </div>
        </div>
    );
}
