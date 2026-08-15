import { Head, router, useForm } from '@inertiajs/react';
import { Camera, LogOut, Save, Upload } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';

type UserProfile = {
    id?: number | string;
    name?: string;
    email?: string;
    avatar?: string | null;
    role?: string;
};

type Props = {
    user?: UserProfile;
    updatePasswordUrl?: string;
    updatePhotoUrl?: string;
    logoutUrl?: string;
};

export default function SettingsProfile({
    user,
    updatePasswordUrl = '/settings/password',
    updatePhotoUrl = '/settings/photo',
    logoutUrl = '/logout',
}: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [preview, setPreview] = useState<string | null>(
        user?.avatar ?? null,
    );

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const photoForm = useForm<{
        photo: File | null;
    }>({
        photo: null,
    });

    const submitPassword = (event: FormEvent) => {
        event.preventDefault();

        passwordForm.post(updatePasswordUrl, {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    const selectPhoto = (file?: File | null) => {
        if (!file) return;

        photoForm.setData('photo', file);

        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
    };

    const uploadPhoto = () => {
        if (!photoForm.data.photo) {
            fileInputRef.current?.click();
            return;
        }

        photoForm.post(updatePhotoUrl, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const logout = () => {
        router.post(logoutUrl);
    };

    return (
        <>
            <Head title="Pengaturan Profil" />

            <div className="mx-auto w-full max-w-[920px] px-3 pb-8">
                <h1 className="mb-3 text-[24px] font-extrabold text-[#111827]">
                    Pengaturan Profil
                </h1>

                <section className="rounded-[22px] bg-white p-5 shadow-sm">
                    <div className="grid gap-6 md:grid-cols-[130px_1fr]">
                        {/* LEFT PROFILE */}
                        <div className="flex flex-col items-center">
                            <div className="relative h-[110px] w-[110px] overflow-hidden rounded-full bg-gray-200">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt={user?.name || 'Foto profil'}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                        <Camera size={38} />
                                    </div>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) =>
                                    selectPhoto(
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />

                            <button
                                type="button"
                                onClick={uploadPhoto}
                                disabled={photoForm.processing}
                                className="mt-3 flex h-9 items-center gap-2 rounded-lg bg-[#7e807f] px-3 text-xs font-medium text-white transition hover:bg-[#6e706f] disabled:opacity-50"
                            >
                                Upload Foto Profil
                                <Upload size={14} />
                            </button>

                            {photoForm.errors.photo && (
                                <p className="mt-1 text-center text-xs text-red-600">
                                    {photoForm.errors.photo}
                                </p>
                            )}
                        </div>

                        {/* RIGHT PASSWORD */}
                        <form onSubmit={submitPassword}>
                            <div className="mb-2 border-b border-[#8b8b8b] pb-1">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Ubah Kata Sandi
                                </h2>
                            </div>

                            <div className="space-y-3">
                                <PasswordField
                                    label="Kata Sandi Lama"
                                    placeholder="Masukkan kata sandi lama"
                                    value={passwordForm.data.current_password}
                                    onChange={(value) =>
                                        passwordForm.setData(
                                            'current_password',
                                            value,
                                        )
                                    }
                                    error={
                                        passwordForm.errors
                                            .current_password
                                    }
                                />

                                <PasswordField
                                    label="Kata Sandi Baru"
                                    placeholder="Masukkan kata sandi yang baru"
                                    value={passwordForm.data.password}
                                    onChange={(value) =>
                                        passwordForm.setData(
                                            'password',
                                            value,
                                        )
                                    }
                                    error={
                                        passwordForm.errors.password
                                    }
                                />

                                <PasswordField
                                    label="Konfirmasi Kata Sandi Baru"
                                    placeholder="Masukkan ulang kata sandi yang baru"
                                    value={
                                        passwordForm.data
                                            .password_confirmation
                                    }
                                    onChange={(value) =>
                                        passwordForm.setData(
                                            'password_confirmation',
                                            value,
                                        )
                                    }
                                    error={
                                        passwordForm.errors
                                            .password_confirmation
                                    }
                                />
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={logout}
                                    className="flex h-11 items-center gap-2 rounded-xl bg-[#e54d42] px-5 font-semibold text-white transition hover:bg-red-600"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>

                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="flex h-11 items-center gap-2 rounded-xl bg-[#2faa32] px-5 font-semibold text-white transition hover:bg-[#249428] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {passwordForm.processing
                                        ? 'Menyimpan...'
                                        : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </>
    );
}

function PasswordField({
    label,
    placeholder,
    value,
    onChange,
    error,
}: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-500">
                {label}
            </label>

            <input
                type="password"
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                placeholder={placeholder}
                className="h-[44px] w-full rounded-xl border border-[#8b8b8b] bg-white px-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-600"
            />

            {error && (
                <p className="mt-1 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
