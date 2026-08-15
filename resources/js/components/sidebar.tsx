import { Link, usePage } from '@inertiajs/react';
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
} from 'lucide-react';
import { useState } from 'react';

type SidebarProps = {
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
};

const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Buat Tiket Perbaikan', href: '/tickets/create', icon: Pencil },
    { name: 'Daftar Pengerjaan', href: '/tickets', icon: Monitor },
    // { name: 'Tambah Stok Sparepart', href: '/spareparts/stock-in', icon: PackagePlus },
    { name: 'Stok Sparepart', href: '/spareparts', icon: Archive },
    { name: 'Daftar Mesin', href: '/machines', icon: Wrench },
    { name: 'Role Management', href: '/roles', icon: Users },
    { name: 'Pengaturan Lainnya', href: '/othersettings', icon: Settings },
    { name: 'Pengaturan Profil', href: '/profile', icon: UserCog },
];

export default function Sidebar({
    collapsed,
    setCollapsed,
}: SidebarProps) {
    const { url } = usePage();

    return (
        <aside
            className={`
                fixed left-0 top-0 z-40
                flex h-screen flex-col
                bg-[#18212f] text-white
                transition-all duration-300
                ${collapsed ? 'w-[88px]' : 'w-[265px]'}
            `}
        >
            {/* Logo */}
            <div className="relative flex h-[140px] items-center justify-center">
                {!collapsed ? (
                    <img
                        src="/images/logo-supa.png"
                        alt="Supa"
                        className="w-[160px]"
                    />
                ) : (
                    <img
                        src="/images/logo-supa.png"
                        alt="Supa"
                        className="w-[50px]"
                    />
                )}

                {/* Collapse Button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="
                        absolute -right-4 top-1/2
                        flex h-8 w-8 -translate-y-1/2
                        items-center justify-center
                        rounded-full bg-white
                        text-[#18212f]
                        shadow-md
                    "
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
                {menuItems.map((item) => {
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
                            title={collapsed ? item.name : undefined}
                            className={`
                                flex h-[62px] items-center
                                transition-all duration-200
                                ${
                                    collapsed
                                        ? 'justify-center px-0'
                                        : 'gap-4 px-6'
                                }
                                ${
                                    active
                                        ? 'bg-[#32a936] text-white'
                                        : 'text-gray-200 hover:bg-white/10'
                                }
                            `}
                        >
                            <Icon
                                size={26}
                                className="shrink-0"
                            />

                            {!collapsed && (
                                <span className="whitespace-nowrap text-[16px] font-semibold">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User */}
            <div
                className={`
                    flex items-center pb-6
                    ${collapsed ? 'justify-center' : 'gap-3 px-5'}
                `}
            >
                <img
                    src="/images/default-avatar.jpg"
                    alt="User"
                    className="h-11 w-11 rounded-full object-cover"
                />

                {!collapsed && (
                    <div>
                        <div className="font-semibold">
                            Budi Santoso
                        </div>

                        <div className="mt-1 inline-block rounded-full bg-[#32a936] px-3 py-0.5 text-xs">
                            Operasional
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}