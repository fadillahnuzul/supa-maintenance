import { Head, router, useForm } from '@inertiajs/react';
import {
    KeyRound,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserCog,
    Users,
    Wrench,
    X,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type UserRole = 'Supervisor' | 'Operational' | 'Teknisi' | 'Admin Sistem';
type UserStatus = 'Aktif' | 'Tidak Aktif';

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    location: string;
    avatar?: string | null;
};

type Props = {
    users?: UserRow[];
    storeUrl?: string;
    updateBaseUrl?: string;
    resetPasswordBaseUrl?: string;
    toggleStatusBaseUrl?: string;
    deleteBaseUrl?: string;
};

const dummyUsers: UserRow[] = [
    {
        id: 1,
        name: 'Haryono',
        email: 'admin@supasurya.com',
        role: 'Supervisor',
        status: 'Aktif',
        location: 'Gedung B, Lantai 2 (Area Mixing Utama)',
        avatar: '/images/profile/budi.jpg',
    },
    {
        id: 2,
        name: 'PPIC',
        email: 'ppic@supasurya.com',
        role: 'Operational',
        status: 'Aktif',
        location: 'Gedung B, Lantai 2 (Area Mixing Utama)',
        avatar: '/images/profile/budi.jpg',
    },
    {
        id: 3,
        name: 'Teknisi',
        email: 'teknisi@supasurya.com',
        role: 'Teknisi',
        status: 'Aktif',
        location: 'Gedung B, Lantai 2 (Area Mixing Utama)',
        avatar: '/images/profile/budi.jpg',
    },
    {
        id: 4,
        name: 'Digicom',
        email: 'admin@supasurya.com',
        role: 'Admin Sistem',
        status: 'Aktif',
        location: 'Gedung B, Lantai 2 (Area Mixing Utama)',
        avatar: '/images/profile/budi.jpg',
    },
];

const roleStyles: Record<string, string> = {
    Supervisor: 'border-purple-400 bg-purple-50 text-purple-700',
    Operational: 'border-lime-400 bg-lime-50 text-lime-700',
    Teknisi: 'border-blue-700 bg-blue-50 text-blue-700',
    'Admin Sistem': 'border-green-400 bg-green-50 text-green-700',
};
console.log('roleStyles:', dummyUsers.map((user) => ({ role: user.role, style: roleStyles[user.role] })));
const getRoleStyle = (role: string) =>
    roleStyles[role] ?? 'border-gray-300 bg-gray-50 text-gray-700';

export default function RoleManagement({
    users = dummyUsers,
    storeUrl,
    updateBaseUrl,
    resetPasswordBaseUrl,
    toggleStatusBaseUrl,
    deleteBaseUrl,
}: Props) {
    const [localUsers, setLocalUsers] = useState<UserRow[]>(users);
    const [roleFilter, setRoleFilter] = useState('Semua Role');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [search, setSearch] = useState('');

    const [modalType, setModalType] = useState<'create' | 'edit' | 'reset' | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

    const userForm = useForm({
        name: '',
        role: '' as UserRole | '',
        email: '',
        password: '',
    });

    const resetForm = useForm({
        password: '',
        password_confirmation: '',
    });

    const filteredUsers = useMemo(() => {
        return localUsers.filter((user) => {
            const matchesRole =
                roleFilter === 'Semua Role' || user.role === roleFilter;

            const matchesStatus =
                statusFilter === 'Semua Status' || user.status === statusFilter;

            const term = search.trim().toLowerCase();

            const matchesSearch =
                !term ||
                [user.name, user.email, user.role, user.location]
                    .join(' ')
                    .toLowerCase()
                    .includes(term);

            return matchesRole && matchesStatus && matchesSearch;
        });
    }, [localUsers, roleFilter, statusFilter, search]);

    const openCreate = () => {
        setSelectedUser(null);
        setModalType('create');
        userForm.setData({
            name: '',
            role: '',
            email: '',
            password: '',
        });
        userForm.clearErrors();
    };

    const openEdit = (user: UserRow) => {
        setSelectedUser(user);
        setModalType('edit');
        userForm.setData({
            name: user.name,
            role: user.role,
            email: user.email,
            password: '',
        });
        userForm.clearErrors();
    };

    const openResetPassword = (user: UserRow) => {
        setSelectedUser(user);
        setModalType('reset');
        resetForm.setData({
            password: '',
            password_confirmation: '',
        });
        resetForm.clearErrors();
    };

    const closeModal = () => {
        if (userForm.processing || resetForm.processing) return;

        setModalType(null);
        setSelectedUser(null);
        userForm.reset();
        resetForm.reset();
    };

    const submitUser = (event: FormEvent) => {
        event.preventDefault();

        if (modalType === 'create') {
            if (storeUrl) {
                userForm.post(storeUrl, {
                    preserveScroll: true,
                    onSuccess: closeModal,
                });
                return;
            }

            setLocalUsers((current) => [
                ...current,
                {
                    id: Date.now(),
                    name: userForm.data.name,
                    email: userForm.data.email,
                    role: (userForm.data.role || 'Operational') as UserRole,
                    status: 'Aktif',
                    location: 'Belum ditentukan',
                    avatar: null,
                },
            ]);

            closeModal();
            return;
        }

        if (modalType === 'edit' && selectedUser) {
            if (updateBaseUrl) {
                router.put(
                    `${updateBaseUrl}/${selectedUser.id}`,
                    {
                        name: userForm.data.name,
                        role: userForm.data.role,
                        email: userForm.data.email,
                    },
                    {
                        preserveScroll: true,
                        onSuccess: closeModal,
                    },
                );
                return;
            }

            setLocalUsers((current) =>
                current.map((user) =>
                    user.id === selectedUser.id
                        ? {
                            ...user,
                            name: userForm.data.name,
                            email: userForm.data.email,
                            role: userForm.data.role as UserRole,
                        }
                        : user,
                ),
            );

            closeModal();
        }
    };

    const submitResetPassword = (event: FormEvent) => {
        event.preventDefault();

        if (!selectedUser) return;

        if (resetPasswordBaseUrl) {
            resetForm.post(`${resetPasswordBaseUrl}/${selectedUser.id}`, {
                preserveScroll: true,
                onSuccess: closeModal,
            });
            return;
        }

        alert(`Password ${selectedUser.name} berhasil diubah (dummy mode).`);
        closeModal();
    };

    const toggleStatus = (user: UserRow) => {
        const nextStatus: UserStatus =
            user.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';

        const confirmed = window.confirm(
            `${nextStatus === 'Aktif' ? 'Aktifkan' : 'Nonaktifkan'} pengguna "${user.name}"?`,
        );

        if (!confirmed) return;

        if (toggleStatusBaseUrl) {
            router.patch(
                `${toggleStatusBaseUrl}/${user.id}`,
                { status: nextStatus },
                { preserveScroll: true },
            );
            return;
        }

        setLocalUsers((current) =>
            current.map((item) =>
                item.id === user.id ? { ...item, status: nextStatus } : item,
            ),
        );
    };

    const deleteUser = (user: UserRow) => {
        const confirmed = window.confirm(
            `Hapus pengguna "${user.name}"? Tindakan ini tidak dapat dibatalkan.`,
        );

        if (!confirmed) return;

        if (deleteBaseUrl) {
            router.delete(`${deleteBaseUrl}/${user.id}`, {
                preserveScroll: true,
            });
            return;
        }

        setLocalUsers((current) =>
            current.filter((item) => item.id !== user.id),
        );
    };

    return (
        <>
            <Head title="Role and User Management" />

            <div className="mx-auto w-full px-3 pb-8">
                <section className="rounded-[22px] bg-white p-4 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Users size={22} className="text-gray-700" />
                            <h1 className="text-[22px] font-extrabold text-[#111827]">
                                Role and User Management
                            </h1>
                        </div>
                        <button
                            type="button"
                            onClick={openCreate}
                            className="flex h-11 items-center gap-2 rounded-xl bg-[#2faa32] px-4 font-semibold text-white transition hover:bg-[#249428]"
                        >
                            Tambah Pengguna
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="mb-3 flex flex-wrap justify-end gap-2">
                        <select
                            value={roleFilter}
                            onChange={(event) => setRoleFilter(event.target.value)}
                            className="h-11 min-w-[170px] rounded-xl border border-[#8b8b8b] bg-white px-4 text-sm text-gray-700 outline-none"
                        >
                            <option>Semua Role</option>
                            <option>Supervisor</option>
                            <option>Operational</option>
                            <option>Teknisi</option>
                            <option>Admin Sistem</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="h-11 min-w-[170px] rounded-xl border border-[#8b8b8b] bg-white px-4 text-sm text-gray-700 outline-none"
                        >
                            <option>Semua Status</option>
                            <option>Aktif</option>
                            <option>Tidak Aktif</option>
                        </select>

                        <label className="flex h-11 min-w-[250px] items-center gap-2 rounded-xl border border-[#8b8b8b] bg-white px-3">
                            <Search size={18} className="text-gray-500" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search.."
                                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400 text-gray-700"
                            />
                        </label>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-gray-300">
                        <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="bg-black text-white">
                                    <th className="w-[72px] px-3 py-3" />
                                    <th className="px-3 py-3 font-bold">Nama</th>
                                    <th className="px-3 py-3 font-bold">Email</th>
                                    <th className="px-3 py-3 font-bold">Role</th>
                                    <th className="px-3 py-3 font-bold">Status</th>
                                    <th className="px-3 py-3 font-bold">Lokasi Kerja</th>
                                    <th className="min-w-[210px] px-3 py-3 text-center font-bold">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-gray-300 bg-white last:border-b-0 hover:bg-gray-50"
                                    >
                                        <td className="px-3 py-2">
                                            <div className="h-11 w-11 overflow-hidden rounded-full bg-gray-200">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                        <UserCog size={20} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-3 py-2 font-bold text-gray-900">
                                            {user.name}
                                        </td>

                                        <td className="px-3 py-2 text-gray-900">
                                            {user.email}
                                        </td>

                                        <td className="px-3 py-2">
                                            <span
                                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getRoleStyle(user.role)}`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>

                                        <td className="px-3 py-2">
                                            <span
                                                className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${user.status === 'Aktif'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-200 text-gray-600'
                                                    }`}
                                            >
                                                ● {user.status}
                                            </span>
                                        </td>

                                        <td className="px-3 py-2 text-gray-900">
                                            {user.location}
                                        </td>

                                        <td className="px-3 py-2">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleStatus(user)}
                                                    className={`relative h-7 w-12 rounded-full transition ${user.status === 'Aktif'
                                                            ? 'bg-[#2faa32]'
                                                            : 'bg-gray-400'
                                                        }`}
                                                    title={
                                                        user.status === 'Aktif'
                                                            ? 'Nonaktifkan pengguna'
                                                            : 'Aktifkan pengguna'
                                                    }
                                                >
                                                    <span
                                                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${user.status === 'Aktif'
                                                                ? 'left-6'
                                                                : 'left-1'
                                                            }`}
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(user)}
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4f86f7] text-white transition hover:bg-blue-600"
                                                    title="Edit pengguna"
                                                >
                                                    <Pencil size={19} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => openResetPassword(user)}
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#efa600] text-white transition hover:bg-amber-600"
                                                    title="Reset password"
                                                >
                                                    <KeyRound size={19} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => deleteUser(user)}
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dc2f2f] text-white transition hover:bg-red-700"
                                                    title="Hapus pengguna"
                                                >
                                                    <Trash2 size={19} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-4 text-center text-gray-400"
                                        >
                                            Tidak ada pengguna yang sesuai dengan filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {modalType && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(event) => {
                        if (event.currentTarget === event.target) {
                            closeModal();
                        }
                    }}
                >
                    {modalType === 'reset' ? (
                        <ResetPasswordModal
                            form={resetForm}
                            closeModal={closeModal}
                            submit={submitResetPassword}
                        />
                    ) : (
                        <UserFormModal
                            mode={modalType}
                            form={userForm}
                            closeModal={closeModal}
                            submit={submitUser}
                        />
                    )}
                </div>
            )}
        </>
    );
}

function UserFormModal({
    mode,
    form,
    closeModal,
    submit,
}: {
    mode: 'create' | 'edit';
    form: ReturnType<
        typeof useForm<{
            name: string;
            role: UserRole | '';
            email: string;
            password: string;
        }>
    >;
    closeModal: () => void;
    submit: (event: FormEvent) => void;
}) {
    const isCreate = mode === 'create';

    return (
        <form
            onSubmit={submit}
            className="w-full max-w-[520px] overflow-hidden rounded-[18px] bg-white shadow-2xl"
        >
            <ModalHeader
                title={isCreate ? 'Tambah Pengguna' : 'Data Pengguna'}
                closeModal={closeModal}
            />

            <div className="space-y-3 p-5">
                <FieldLabel label="Nama Pengguna">
                    <input
                        type="text"
                        value={form.data.name}
                        onChange={(event) => form.setData('name', event.target.value)}
                        placeholder="Nama Pengguna.."
                        className="h-11 w-full rounded-lg border border-[#8b8b8b] px-3 text-sm outline-none focus:border-green-600 text-gray-700"
                    />
                </FieldLabel>

                <FieldLabel label="Role">
                    <select
                        value={form.data.role}
                        onChange={(event) =>
                            form.setData(
                                'role',
                                event.target.value as UserRole | '',
                            )
                        }
                        className="h-11 w-full rounded-lg border border-[#8b8b8b] bg-white px-3 text-sm outline-none focus:border-green-600 text-gray-700 placeholder:text-gray-400"
                    >
                        <option value="">-- Pilih Role --</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Operational">Operational</option>
                        <option value="Teknisi">Teknisi</option>
                        <option value="Admin Sistem">Admin Sistem</option>
                    </select>
                </FieldLabel>

                <FieldLabel label="Email">
                    <input
                        type="email"
                        value={form.data.email}
                        onChange={(event) => form.setData('email', event.target.value)}
                        placeholder="Email Pengguna.."
                        className="h-11 w-full rounded-lg border border-[#8b8b8b] px-3 text-sm outline-none focus:border-green-600 text-gray-700 placeholder:text-gray-400"
                    />
                </FieldLabel>

                {isCreate && (
                    <FieldLabel label="Password">
                        <input
                            type="password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                            placeholder="Password Pengguna.."
                            className="h-11 w-full rounded-lg border border-[#8b8b8b] px-3 text-sm outline-none focus:border-green-600 text-gray-700 placeholder:text-gray-400"
                        />
                    </FieldLabel>
                )}

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="min-w-[110px] rounded-xl bg-[#2faa32] px-5 py-3 font-semibold text-white transition hover:bg-[#249428] disabled:opacity-50"
                    >
                        {form.processing ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </div>
        </form>
    );
}

function ResetPasswordModal({
    form,
    closeModal,
    submit,
}: {
    form: ReturnType<
        typeof useForm<{
            password: string;
            password_confirmation: string;
        }>
    >;
    closeModal: () => void;
    submit: (event: FormEvent) => void;
}) {
    return (
        <form
            onSubmit={submit}
            className="w-full max-w-[520px] overflow-hidden rounded-[18px] bg-white shadow-2xl"
        >
            <ModalHeader title="Reset Password" closeModal={closeModal} />

            <div className="space-y-3 p-5">
                <FieldLabel label="Password Baru">
                    <input
                        type="password"
                        value={form.data.password}
                        onChange={(event) =>
                            form.setData('password', event.target.value)
                        }
                        placeholder="Masukkan password baru.."
                        className="h-11 w-full rounded-lg border border-[#8b8b8b] px-3 text-sm outline-none focus:border-green-600 text-gray-700 placeholder:text-gray-400"
                    />
                </FieldLabel>

                <FieldLabel label="Ketik Ulang Password Baru">
                    <input
                        type="password"
                        value={form.data.password_confirmation}
                        onChange={(event) =>
                            form.setData(
                                'password_confirmation',
                                event.target.value,
                            )
                        }
                        placeholder="Ketik ulang password baru.."
                        className="h-11 w-full rounded-lg border border-[#8b8b8b] px-3 text-sm outline-none focus:border-green-600 text-gray-700 placeholder:text-gray-400"
                    />
                </FieldLabel>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="min-w-[110px] rounded-xl bg-[#2faa32] px-5 py-3 font-semibold text-white transition hover:bg-[#249428] disabled:opacity-50"
                    >
                        {form.processing ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </div>
        </form>
    );
}

function ModalHeader({
    title,
    closeModal,
}: {
    title: string;
    closeModal: () => void;
}) {
    return (
        <div className="flex h-[50px] items-center justify-between bg-black px-5 text-white">
            <div className="flex items-center gap-2">
                <Wrench size={17} />
                <span className="font-semibold">{title}</span>
            </div>

            <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10"
                aria-label="Tutup"
            >
                <X size={17} />
            </button>
        </div>
    );
}

function FieldLabel({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
                {label}
            </label>
            {children}
        </div>
    );
}
