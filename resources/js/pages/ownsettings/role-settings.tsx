import {
    Head,
    router,
    useForm,
} from '@inertiajs/react';

import {
    Pencil,
    Plus,
    Search,
    Trash2,
    UserCog,
    Users,
    Wrench,
    X,
} from 'lucide-react';

import {
    FormEvent,
    useMemo,
    useState,
} from 'react';

type Role = {
    id: number;
    code: string;
    name: string;
};

type EmployeeOption = {
    id: number;
    name: string;
    email: string;
};

type UserRow = {
    id: number;
    name: string;
    id_karyawan: string;
    username: string;
    status: string;
    location: string;
    avatar?: string | null;
    roles: Role[];
};

type Props = {
    users: UserRow[];
    employees: EmployeeOption[];
    roles: Role[];
};

export default function RoleManagement({
    users,
    employees,
    roles,
}: Props) {
    const [roleFilter, setRoleFilter] =
        useState('');

    const [statusFilter, setStatusFilter] =
        useState('');

    const [search, setSearch] =
        useState('');

    const [
        modalType,
        setModalType,
    ] = useState<
        'create' | 'edit' | null
    >(null);

    const [
        selectedUser,
        setSelectedUser,
    ] = useState<UserRow | null>(null);

    const form = useForm<{
        employee_id: number | '';
        role_ids: number[];
    }>({
        employee_id: '',
        role_ids: [],
    });

    /*
     * Employee yang belum mempunyai role.
     */
    const availableEmployees =
        useMemo(() => {
            const assignedIds =
                new Set(
                    users.map(
                        (user) => user.id,
                    ),
                );

            return employees.filter(
                (employee) =>
                    !assignedIds.has(
                        employee.id,
                    ),
            );
        }, [employees, users]);

    const filteredUsers =
        useMemo(() => {
            const term =
                search
                    .trim()
                    .toLowerCase();

            return users.filter(
                (user) => {
                    const matchesRole =
                        !roleFilter ||
                        user.roles.some(
                            (role) =>
                                role.id ===
                                Number(
                                    roleFilter,
                                ),
                        );

                    const matchesStatus =
                        !statusFilter ||
                        user.status ===
                        statusFilter;

                    const roleText =
                        user.roles
                            .map(
                                (role) =>
                                    `${role.name} ${role.code}`,
                            )
                            .join(' ');

                    const matchesSearch =
                        !term ||
                        [
                            user.name,
                            user.id_karyawan,
                            user.username,
                            user.location,
                            roleText,
                        ]
                            .join(' ')
                            .toLowerCase()
                            .includes(
                                term,
                            );

                    return (
                        matchesRole &&
                        matchesStatus &&
                        matchesSearch
                    );
                },
            );
        }, [
            users,
            search,
            roleFilter,
            statusFilter,
        ]);

    const openCreate = () => {
        setSelectedUser(null);

        form.setData({
            employee_id: '',
            role_ids: [],
        });

        form.clearErrors();

        setModalType('create');
    };

    const openEdit = (
        user: UserRow,
    ) => {
        setSelectedUser(user);

        form.setData({
            employee_id:
                user.id,

            role_ids:
                user.roles.map(
                    (role) =>
                        role.id,
                ),
        });

        form.clearErrors();

        setModalType('edit');
    };

    const closeModal = () => {
        if (form.processing) {
            return;
        }

        setModalType(null);
        setSelectedUser(null);

        form.reset();
        form.clearErrors();
    };

    const toggleRole = (
        roleId: number,
    ) => {
        const exists =
            form.data.role_ids.includes(
                roleId,
            );

        if (exists) {
            form.setData(
                'role_ids',
                form.data.role_ids.filter(
                    (id) =>
                        id !==
                        roleId,
                ),
            );

            return;
        }

        form.setData(
            'role_ids',
            [
                ...form.data
                    .role_ids,
                roleId,
            ],
        );
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (modalType === 'create') {
            form.post('/roles', {
                preserveScroll: true,

                onSuccess: () => {
                    closeModal();
                },

                onError: (errors) => {
                    console.log('Validation errors:', errors);
                },
            });

            return;
        }

        if (modalType === 'edit' && selectedUser) {
            form.put(`/roles/${selectedUser.id}`, {
                preserveScroll: true,

                onSuccess: () => {
                    closeModal();
                },

                onError: (errors) => {
                    console.log('Validation errors:', errors);
                },
            });
        }
    };

    const deleteRoles = (
        user: UserRow,
    ) => {
        const confirmed =
            window.confirm(
                `Hapus semua role dari "${user.name}"?`,
            );

        if (!confirmed) {
            return;
        }

        router.delete(
            `/roles/${user.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    console.log('Role berhasil dihapus');
                },

                onError: (errors) => {
                    console.error('Gagal menghapus role:', errors);
                },
            },
        );
    };

    return (
        <>
            <Head title="Role and User Management" />

            <div className="mx-auto w-full px-3 pb-8">
                <section className="rounded-[22px] bg-white p-4 shadow-sm">

                    {/* HEADER */}
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Users
                                size={22}
                                className="text-gray-700"
                            />

                            <h1 className="text-[22px] font-extrabold text-[#111827]">
                                Role and User Management
                            </h1>
                        </div>

                        <button
                            type="button"
                            onClick={
                                openCreate
                            }
                            className="flex h-11 items-center gap-2 rounded-xl bg-[#2faa32] px-4 font-semibold text-white transition hover:bg-[#249428]"
                        >
                            Tambah Pengguna

                            <Plus
                                size={
                                    18
                                }
                            />
                        </button>
                    </div>

                    {/* FILTER */}
                    <div className="mb-3 flex flex-wrap justify-end gap-2">

                        <select
                            value={
                                roleFilter
                            }
                            onChange={(
                                event,
                            ) =>
                                setRoleFilter(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            className="h-11 min-w-[180px] rounded-xl border border-gray-400 bg-white px-4 text-sm text-gray-700"
                        >
                            <option value="">
                                Semua Role
                            </option>

                            {roles.map(
                                (
                                    role,
                                ) => (
                                    <option
                                        key={
                                            role.id
                                        }
                                        value={
                                            role.id
                                        }
                                    >
                                        {
                                            role.name
                                        }
                                    </option>
                                ),
                            )}
                        </select>

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(
                                event,
                            ) =>
                                setStatusFilter(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            className="h-11 min-w-[170px] rounded-xl border border-gray-400 bg-white px-4 text-sm text-gray-700"
                        >
                            <option value="">
                                Semua Status
                            </option>

                            <option value="Aktif">
                                Aktif
                            </option>

                            <option value="Tidak Aktif">
                                Tidak Aktif
                            </option>
                        </select>

                        <label className="flex h-11 min-w-[250px] items-center gap-2 rounded-xl border border-gray-400 bg-white px-3">
                            <Search
                                size={
                                    18
                                }
                                className="text-gray-500"
                            />

                            <input
                                value={
                                    search
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Search..."
                                className="w-full bg-transparent text-sm text-gray-700 outline-none"
                            />
                        </label>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto rounded-xl border border-gray-300">
                        <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                            <thead>
                                <tr className="bg-black text-white">
                                    <th className="w-[70px] px-3 py-3" />

                                    <th className="px-3 py-1">
                                        Nama
                                    </th>

                                    <th className="px-3 py-1">
                                        Username
                                    </th>

                                    <th className="px-3 py-1">
                                        ID Karyawan
                                    </th>

                                    <th className="px-3 py-1">
                                        Role
                                    </th>

                                    <th className="px-3 py-1">
                                        Status
                                    </th>

                                    <th className="px-3 py-1">
                                        Lokasi Kerja
                                    </th>

                                    <th className="px-3 py-1 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredUsers.map(
                                    (
                                        user,
                                    ) => (
                                        <tr
                                            key={
                                                user.id
                                            }
                                            className="border-b border-gray-200 hover:bg-gray-50"
                                        >
                                            <td className="px-3 py-1">
                                                <div className="h-11 w-11 overflow-hidden rounded-full bg-gray-200">
                                                    {user.avatar ? (
                                                        <img
                                                            src={
                                                                user.avatar
                                                            }
                                                            alt={
                                                                user.name
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                            <UserCog
                                                                size={
                                                                    20
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-3 py-1 font-bold text-gray-900">
                                                {
                                                    user.name
                                                }
                                            </td>

                                            <td className="px-3 py-1 text-gray-700">
                                                {
                                                    user.username
                                                }
                                            </td>

                                            <td className="px-3 py-1 text-gray-700">
                                                {
                                                    user.id_karyawan
                                                }
                                            </td>

                                            <td className="px-3 py-1">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map(
                                                        (
                                                            role,
                                                        ) => (
                                                            <span
                                                                key={
                                                                    role.id
                                                                }
                                                                className="rounded-full border border-green-400 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                                                            >
                                                                {
                                                                    role.name
                                                                }
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-3 py-1">
                                                <span
                                                    className={`rounded-md px-2.5 py-1 text-xs font-medium ${user.status ===
                                                            'Aktif'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-200 text-gray-600'
                                                        }`}
                                                >
                                                    ●{' '}
                                                    {
                                                        user.status
                                                    }
                                                </span>
                                            </td>

                                            <td className="px-3 py-1 text-gray-700">
                                                {
                                                    user.location
                                                }
                                            </td>

                                            <td className="px-3 py-1 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEdit(
                                                                user,
                                                            )
                                                        }
                                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4f86f7] text-white transition hover:bg-blue-600"
                                                        title="Edit role"
                                                    >
                                                        <Pencil
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteRoles(
                                                                user,
                                                            )
                                                        }
                                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dc2f2f] text-white transition hover:bg-red-700"
                                                        title="Hapus semua role"
                                                    >
                                                        <Trash2
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ),
                                )}

                                {filteredUsers.length ===
                                    0 && (
                                        <tr>
                                            <td
                                                colSpan={
                                                    7
                                                }
                                                className="px-4 py-8 text-center text-gray-400"
                                            >
                                                Tidak
                                                ada
                                                pengguna
                                                yang
                                                sesuai.
                                            </td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* MODAL */}
            {modalType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <form
                        onSubmit={
                            submit
                        }
                        className="w-full max-w-[520px] overflow-hidden rounded-[18px] bg-white shadow-2xl"
                    >
                        <ModalHeader
                            title={
                                modalType ===
                                    'create'
                                    ? 'Tambah Pengguna'
                                    : 'Edit Role Pengguna'
                            }
                            closeModal={
                                closeModal
                            }
                        />

                        <div className="space-y-4 p-5">

                            {/* EMPLOYEE */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-800">
                                    Pengguna
                                </label>

                                {modalType ===
                                    'create' ? (
                                    <select
                                        value={
                                            form
                                                .data
                                                .employee_id
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'employee_id',
                                                Number(
                                                    event
                                                        .target
                                                        .value,
                                                ) ||
                                                '',
                                            )
                                        }
                                        className="h-11 w-full rounded-lg border border-gray-400 bg-white px-3 text-sm text-gray-700"
                                    >
                                        <option value="">
                                            --
                                            Pilih
                                            Pengguna
                                            --
                                        </option>

                                        {availableEmployees.map(
                                            (
                                                employee,
                                            ) => (
                                                <option
                                                    key={
                                                        employee.id
                                                    }
                                                    value={
                                                        employee.id
                                                    }
                                                >
                                                    {
                                                        employee.name
                                                    }{' '}
                                                    -{' '}
                                                    {
                                                        employee.email
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                ) : (
                                    <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-3">
                                        <div className="font-semibold text-gray-900">
                                            {
                                                selectedUser?.name
                                            }
                                        </div>

                                        <div className="text-sm text-gray-500">
                                            {
                                                selectedUser?.email
                                            }
                                        </div>
                                    </div>
                                )}

                                {form.errors
                                    .employee_id && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {
                                                form
                                                    .errors
                                                    .employee_id
                                            }
                                        </p>
                                    )}
                            </div>

                            {/* ROLES */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-800">
                                    Role
                                </label>

                                <div className="space-y-2 rounded-xl border border-gray-300 p-3">
                                    {roles.map(
                                        (
                                            role,
                                        ) => {
                                            const checked =
                                                form.data.role_ids.includes(
                                                    role.id,
                                                );

                                            return (
                                                <label
                                                    key={
                                                        role.id
                                                    }
                                                    className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-gray-50"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            checked
                                                        }
                                                        onChange={() =>
                                                            toggleRole(
                                                                role.id,
                                                            )
                                                        }
                                                        className="h-4 w-4 accent-green-600"
                                                    />

                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-800">
                                                            {
                                                                role.name
                                                            }
                                                        </div>

                                                        <div className="text-xs text-gray-500">
                                                            {
                                                                role.code
                                                            }
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        },
                                    )}
                                </div>

                                {form.errors
                                    .role_ids && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {
                                                form
                                                    .errors
                                                    .role_ids
                                            }
                                        </p>
                                    )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                    className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        form.processing
                                    }
                                    className="min-w-[110px] rounded-xl bg-[#2faa32] px-5 py-3 font-semibold text-white transition hover:bg-[#249428] disabled:opacity-50"
                                >
                                    {form.processing
                                        ? 'Menyimpan...'
                                        : 'Simpan'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </>
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

                <span className="font-semibold">
                    {title}
                </span>
            </div>

            <button
                type="button"
                onClick={
                    closeModal
                }
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10"
            >
                <X size={17} />
            </button>
        </div>
    );
}