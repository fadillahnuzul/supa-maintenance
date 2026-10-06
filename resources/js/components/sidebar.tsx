import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Pencil,
    Monitor,
    PackagePlus,
    Archive,
    Wrench,
    Users,
    Settings,
    UserCog,
    ChevronLeft,
    ChevronRight,
    LogOut,
    X,
} from 'lucide-react';
import { useState } from 'react';

type SidebarProps = {
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
    mobileOpen: boolean;
    setMobileOpen: (value: boolean) => void;
    logoutUrl?: string;
};

const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Buat Tiket Perbaikan', href: '/tickets/create', icon: Pencil },
    { name: 'Daftar Pengerjaan', href: '/tickets', icon: Monitor },
    { name: 'Stok Sparepart', href: '/spareparts', icon: Archive },
    { name: 'Daftar Mesin', href: '/machines', icon: Wrench },
    { name: 'Role Management', href: '/roles', icon: Users },
    { name: 'Pengaturan Lainnya', href: '/other-settings', icon: Settings },
    { name: 'Pengaturan Profil', href: '/profile', icon: UserCog },
];

export default function Sidebar({
    collapsed,
    setCollapsed,
    mobileOpen,
    setMobileOpen,
    logoutUrl = '/logout',
}: SidebarProps) {
    const { url } = usePage();
    const { auth } = usePage().props;
    const visibleMenuItems = menuItems.filter((item) => {
        if (item.href === '/dashboard' || item.href === '/spareparts') {
            return (
                auth.roles.includes('System Admin') ||
                auth.roles.includes('Maintenance Supervisor') ||
                auth.roles.includes('Maintenance Admin') ||
                auth.roles.includes('Teknisi') ||
                auth.roles.includes('Maintenance Verifier')
            );
        }

        if (item.href === '/roles') {
            return (
                auth.roles.includes('System Admin') ||
                auth.roles.includes('Maintenance Supervisor')
            );
        }

        if (item.href === '/other-settings' || item.href === '/machines') {
            return (
                auth.roles.includes('System Admin') ||
                auth.roles.includes('Maintenance Supervisor') ||
                auth.roles.includes('Maintenance Admin')
            );
        }

        // Menu lainnya
        return true;
    });

    const logout = () => {
        router.post(logoutUrl);
    };

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-[min(85vw,320px)] flex-col overflow-y-auto bg-[#18212f] text-white transition-[width,transform] duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${collapsed ? 'lg:w-[88px]' : 'lg:w-[265px]'} `}
        >
            {/* Logo */}
            <div className="relative flex h-[140px] items-center justify-center">
                <img
                    src="/images/logo-supa.png"
                    alt="Supa"
                    className={
                        collapsed ? 'w-[160px] lg:w-[50px]' : 'w-[160px]'
                    }
                />

                <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Tutup menu navigasi"
                    className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 lg:hidden"
                >
                    <X size={20} />
                </button>

                <button
                    type="button"
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={
                        collapsed
                            ? 'Perlebar menu navigasi'
                            : 'Ciutkan menu navigasi'
                    }
                    className="absolute top-1/2 -right-4 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#18212f] shadow-md lg:flex"
                >
                    {collapsed ? (
                        <ChevronRight size={18} />
                    ) : (
                        <ChevronLeft size={18} />
                    )}
                </button>
            </div>

            {/* Menu */}
            <nav className="flex-1">
                {visibleMenuItems.map((item) => {
                    const Icon = item.icon;
                    const active = (() => {
                        if (url === item.href) {
                            return true;
                        }

                        if (item.href === '/dashboard') {
                            return url === '/dashboard';
                        }

                        if (item.href === '/tickets') {
                            return false;
                        }

                        if (item.href === '/spareparts') {
                            return url.startsWith('/spareparts/');
                        }

                        return url.startsWith(`${item.href}/`);
                    })();

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            title={collapsed ? item.name : undefined}
                            className={`flex h-[62px] items-center transition-all duration-200 ${
                                collapsed
                                    ? 'gap-4 px-6 lg:justify-center lg:px-0'
                                    : 'gap-4 px-6'
                            } ${
                                active
                                    ? 'bg-[#32a936] text-white'
                                    : 'text-gray-200 hover:bg-white/10'
                            } `}
                        >
                            <Icon size={26} className="shrink-0" />

                            <span
                                className={`text-[16px] font-semibold whitespace-nowrap ${collapsed ? 'lg:hidden' : ''}`}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* User */}
            <div className="">
                <div className="mb-5 px-5">
                    <button
                        type="button"
                        onClick={logout}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#e54d42] px-5 font-semibold text-white transition hover:bg-red-600"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
                <div
                    className={`flex items-center gap-3 px-5 pb-6 ${collapsed ? 'lg:justify-center lg:px-0' : ''} `}
                >
                    <img
                        src={auth.user?.avatar || '/images/default-avatar.jpg'}
                        alt="User"
                        className="h-11 w-11 rounded-full object-cover"
                    />

                    <div className={collapsed ? 'lg:hidden' : ''}>
                        <div className="font-semibold">{auth.user?.name}</div>

                        <div className="mt-1 inline-block rounded-full bg-[#32a936] px-3 py-0.5 text-xs">
                            {auth.roles[0] ?? 'Pengguna'}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
