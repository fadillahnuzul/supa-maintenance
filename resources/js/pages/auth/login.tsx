import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        id_karyawan: '',
        password: '',
        remember: false,
    });

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post('/login', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Login | Supa Maintenance" />

            <div className="min-h-screen w-full bg-white lg:grid lg:grid-cols-[46%_54%]">

                {/* =========================================================
                    LEFT SIDE
                ========================================================= */}
                <section className="relative hidden min-h-screen overflow-hidden bg-[#ffffff] lg:flex lg:flex-col w-full">
                    <div
                        className="absolute inset-0 bg-left-center bg-no-repeat opacity-25"
                        style={{
                            backgroundImage: "url('/images/watermark-left.png')",
                            backgroundSize: 'auto 100%',
                            backgroundPosition: 'left top',
                        }}
                    />

                    <div className="relative z-10 flex h-full min-h-screen flex-col px-16 py-12">

                        {/* Logo */}
                        <div>
                            <img
                                src="/images/logo-supa.png"
                                alt="PT Supa Surya Niaga"
                                className="h-[75px] w-auto object-contain"
                            />
                        </div>

                        {/* Main content */}
                        <div className="my-auto max-w-[520px]">

                            <div className="mb-4 inline-flex items-center rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-medium text-[#2faa32]">
                                Maintenance Management System
                            </div>

                            <h1 className="text-[46px] font-bold leading-[1.1] tracking-tight text-[#111111]">
                                Supa
                                <br />
                                Maintenance
                            </h1>

                            <p className="mt-5 max-w-[440px] text-[18px] leading-7 text-gray-600">
                                Manajemen perbaikan, mesin, dan sparepart
                                dalam satu sistem yang terintegrasi.
                            </p>

                            {/* Features */}
                            <div className="mt-12 space-y-7">

                                <Feature
                                    icon={
                                        <WrenchIcon />
                                    }
                                    title="Kelola Perbaikan"
                                    description="Buat, pantau, dan selesaikan tiket perbaikan dengan lebih terstruktur."
                                />

                                <Feature
                                    icon={
                                        <MachineIcon />
                                    }
                                    title="Pantau Kondisi Mesin"
                                    description="Pantau status dan kondisi mesin dengan mudah."
                                />

                                <Feature
                                    icon={
                                        <BoxIcon />
                                    }
                                    title="Kelola Sparepart"
                                    description="Kontrol stok sparepart dan minimum persediaan."
                                />

                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-sm text-gray-400">
                            © 2026 PT Supa Surya Niaga
                        </div>
                    </div>
                </section>

                {/* =========================================================
                    RIGHT SIDE
                ========================================================= */}
                <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-16">

                    <div className="w-full max-w-[440px]">

                        {/* Mobile Logo */}
                        <div className="mb-10 lg:hidden">
                            <img
                                src="/images/logo-supa.png"
                                alt="PT Supa Surya Niaga"
                                className="h-16 w-auto"
                            />
                        </div>

                        {/* Login Header */}
                        <div className="mb-9">

                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#2faa32]">
                                <LockIcon />
                            </div>

                            <h2 className="text-[32px] font-bold tracking-tight text-[#111111]">
                                Selamat Datang
                            </h2>

                            <p className="mt-2 text-[15px] leading-6 text-gray-500">
                                Masuk menggunakan akun Anda untuk mengakses
                                Supa Maintenance.
                            </p>
                        </div>

                        {/* =====================================================
                            FORM
                        ===================================================== */}
                        <form onSubmit={submit} className="space-y-5">

                            {/* ID Karyawan */}
                            <div>
                                <label
                                    htmlFor="id_karyawan"
                                    className="mb-2 block text-sm font-semibold text-gray-800"
                                >
                                    ID Karyawan
                                </label>

                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                        <MailIcon />
                                    </div>

                                    <input
                                        id="id_karyawan"
                                        type="text"
                                        autoComplete="username"
                                        autoFocus
                                        value={data.id_karyawan}
                                        onChange={(e) =>
                                            setData('id_karyawan', e.target.value)
                                        }
                                        placeholder="Contoh: 2604.01.0122 atau 2604010122"
                                        className="
                                            h-[52px]
                                            w-full
                                            rounded-xl
                                            border
                                            border-gray-300
                                            bg-white
                                            pl-12
                                            pr-4
                                            text-[15px]
                                            text-gray-900
                                            outline-none
                                            transition
                                            placeholder:text-gray-400
                                            hover:border-gray-400
                                            focus:border-[#2faa32]
                                            focus:ring-4
                                            focus:ring-green-100
                                        "
                                    />
                                </div>

                                {errors.id_karyawan && (
                                    <p className="mt-2 text-sm text-red-500">
                                        {errors.id_karyawan}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">

                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-semibold text-gray-800"
                                    >
                                        Password
                                    </label>

                                    <a
                                        href="/forgot-password"
                                        className="text-sm font-medium text-[#2faa32] transition hover:text-[#238d27]"
                                    >
                                        Lupa password?
                                    </a>

                                </div>

                                <div className="relative">

                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                        <LockSmallIcon />
                                    </div>

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData(
                                                'password',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Masukkan password"
                                        className="
                                            h-[52px]
                                            w-full
                                            rounded-xl
                                            border
                                            border-gray-300
                                            bg-white
                                            pl-12
                                            pr-12
                                            text-[15px]
                                            text-gray-900
                                            outline-none
                                            transition
                                            placeholder:text-gray-400
                                            hover:border-gray-400
                                            focus:border-[#2faa32]
                                            focus:ring-4
                                            focus:ring-green-100
                                        "
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        className="
                                            absolute
                                            inset-y-0
                                            right-0
                                            flex
                                            w-12
                                            items-center
                                            justify-center
                                            text-gray-400
                                            transition
                                            hover:text-gray-700
                                        "
                                    >
                                        <EyeIcon />
                                    </button>

                                </div>

                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="
                                    flex
                                    h-[52px]
                                    w-full
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-[#2faa32]
                                    text-[15px]
                                    font-semibold
                                    text-white
                                    shadow-sm
                                    transition
                                    hover:bg-[#289b2c]
                                    focus:outline-none
                                    focus:ring-4
                                    focus:ring-green-200
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                {processing ? (
                                    <span>Memproses...</span>
                                ) : (
                                    <span>Masuk</span>
                                )}
                            </button>

                        </form>

                        {/* Bottom */}
                        <div className="mt-10 border-t border-gray-100 pt-6">
                            <p className="text-center text-xs leading-5 text-gray-400">
                                Supa Maintenance
                                <br />
                                PT Supa Surya Niaga
                            </p>
                        </div>

                    </div>
                </section>
            </div>
        </>
    );
}


/* =========================================================
    FEATURE COMPONENT
========================================================= */

type FeatureProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
};

function Feature({
    icon,
    title,
    description,
}: FeatureProps) {
    return (
        <div className="flex items-start gap-4">

            <div className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#2faa32]
                text-white
                shadow-sm
            ">
                {icon}
            </div>

            <div>
                <h3 className="text-[15px] font-semibold text-gray-900">
                    {title}
                </h3>

                <p className="mt-1 max-w-[350px] text-sm leading-5 text-gray-500">
                    {description}
                </p>
            </div>

        </div>
    );
}


/* =========================================================
    ICONS
========================================================= */

function LockIcon() {
    return (
        <svg
            width="27"
            height="27"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect
                x="5"
                y="10"
                width="14"
                height="10"
                rx="2"
            />

            <path d="M8 10V7a4 4 0 018 0v3" />
        </svg>
    );
}


function LockSmallIcon() {
    return (
        <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect
                x="5"
                y="10"
                width="14"
                height="10"
                rx="2"
            />

            <path d="M8 10V7a4 4 0 018 0v3" />
        </svg>
    );
}


function MailIcon() {
    return (
        <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
            />

            <path d="m3 7 9 6 9-6" />
        </svg>
    );
}


function EyeIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
            <circle cx="12" cy="12" r="2.5" />
        </svg>
    );
}


function WrenchIcon() {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.7 6.3a4 4 0 01-5 5L4 17l3 3 5.7-5.7a4 4 0 005-5l-3 3-3-3 3-3Z" />
        </svg>
    );
}


function MachineIcon() {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.8 1.8 0 00.4 2l.1.1-2.8 2.8-.1-.1a1.8 1.8 0 00-2-.4 1.8 1.8 0 00-1.1 1.6V21h-4v-.1a1.8 1.8 0 00-1.1-1.6 1.8 1.8 0 00-2 .4l-.1.1-2.8-2.8.1-.1a1.8 1.8 0 00.4-2A1.8 1.8 0 003 13.8V10a1.8 1.8 0 001.4-1.1 1.8 1.8 0 00-.4-2l-.1-.1L6.7 4l.1.1a1.8 1.8 0 002 .4A1.8 1.8 0 009.9 3H14a1.8 1.8 0 001.1 1.5 1.8 1.8 0 002-.4l.1-.1L20 6.8l-.1.1a1.8 1.8 0 00-.4 2 1.8 1.8 0 001.5 1.1v4a1.8 1.8 0 00-1.6 1Z" />
        </svg>
    );
}


function BoxIcon() {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m21 8-9 5-9-5" />
            <path d="m3 8 9-5 9 5v8l-9 5-9-5Z" />
            <path d="M12 13v8" />
        </svg>
    );
}