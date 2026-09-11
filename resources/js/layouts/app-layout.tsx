import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
    Bell,
    CheckCheck,
    ClipboardCheck,
    UserCheck,
    Wrench,
} from 'lucide-react';
import { router, usePage } from '@inertiajs/react';

import Sidebar from '@/components/sidebar';

type AppLayoutProps = {
    children: ReactNode;
};

type NotificationItem = {
    id: string;
    title: string;
    message: string;
    type: string | null;
    ticket_code: string | null;
    url: string | null;
    read_at: string | null;
    created_at: string | null;
};

type Notifications = {
    unread_count: number;
    items: NotificationItem[];
};

type PageProps = {
    auth: {
        user: {
            id: number;
            name: string;
            avatar: string | null;
        } | null;
        roles: string[];
    };

    notifications: Notifications;
};

export default function AppLayout({
    children,
}: AppLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [notificationOpen, setNotificationOpen] =
        useState(false);

    const notificationRef =
        useRef<HTMLDivElement>(null);

    const {
        auth,
        notifications = {
            unread_count: 0,
            items: [],
        },
    } = usePage<PageProps>().props;

    /*
     * Tutup dropdown ketika klik di luar.
     */
    useEffect(() => {
        const handleClickOutside = (
            event: MouseEvent
        ) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    event.target as Node
                )
            ) {
                setNotificationOpen(false);
            }
        };

        document.addEventListener(
            'mousedown',
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );
        };
    }, []);

    /*
     * Icon berdasarkan jenis notification.
     */
    const getNotificationIcon = (
        type: string | null
    ) => {
        switch (type) {
            case 'ticket_created':
                return (
                    <Wrench
                        size={19}
                        className="text-orange-500"
                    />
                );

            case 'ticket_assigned':
                return (
                    <UserCheck
                        size={19}
                        className="text-blue-500"
                    />
                );

            case 'waiting_verification':
                return (
                    <ClipboardCheck
                        size={19}
                        className="text-green-600"
                    />
                );

            default:
                return (
                    <Bell
                        size={19}
                        className="text-gray-500"
                    />
                );
        }
    };

    /*
     * Klik notification.
     */
    const handleNotificationClick = (
        notification: NotificationItem
    ) => {
        setNotificationOpen(false);

        /*
         * Kalau sudah dibaca, langsung buka ticket.
         */
        if (notification.read_at) {
            if (notification.url) {
                router.visit(notification.url);
            }

            return;
        }

        /*
         * Kalau belum dibaca:
         * tandai read terlebih dahulu.
         */
        router.post(
            `/notifications/${notification.id}/read`,
            {},
            {
                preserveScroll: true,

                onSuccess: () => {
                    if (notification.url) {
                        router.visit(
                            notification.url
                        );
                    }
                },
            }
        );
    };

    /*
     * Mark semua notification sebagai read.
     */
    const markAllAsRead = () => {
        router.post(
            '/notifications/read-all',
            {},
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    /*
     * Format waktu sederhana.
     */
    const formatNotificationTime = (
        date: string | null
    ) => {
        if (!date) {
            return '';
        }

        return new Intl.DateTimeFormat(
            'id-ID',
            {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
            }
        ).format(new Date(date));
    };

    return (
        <div className="min-h-screen bg-[#f7f8fa]">
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            <div
                className={`
                    min-h-screen
                    transition-all duration-300
                    ${collapsed
                        ? 'ml-[88px]'
                        : 'ml-[265px]'
                    }
                `}
            >
                {/* Header */}
                <header className="flex h-[80px] items-center justify-between border-b border-gray-400 px-8">
                    <div>
                        <h1 className="text-[28px] font-bold text-gray-800">
                            Supa Maintenance
                        </h1>

                        <p className="text-[18px] text-gray-600">
                            Manajemen Perbaikan, Mesin,
                            dan Sparepart
                        </p>
                    </div>

                    <div className="flex items-center gap-5">

                        {/* NOTIFICATION */}
                        <div
                            ref={notificationRef}
                            className="relative"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setNotificationOpen(
                                        !notificationOpen
                                    )
                                }
                                className="relative flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-gray-100"
                            >
                                <Bell
                                    size={30}
                                    className="text-gray-600"
                                />

                                {/* Badge */}
                                {notifications.unread_count >
                                    0 && (
                                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                            {notifications.unread_count >
                                                99
                                                ? '99+'
                                                : notifications.unread_count}
                                        </span>
                                    )}
                            </button>

                            {/* DROPDOWN */}
                            {notificationOpen && (
                                <div className="absolute right-0 top-[52px] z-[100] w-[390px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">

                                    {/* Header */}
                                    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900">
                                                Notifikasi
                                            </h3>

                                            <p className="mt-0.5 text-xs text-gray-500">
                                                {
                                                    notifications.unread_count
                                                }{' '}
                                                belum dibaca
                                            </p>
                                        </div>

                                        {notifications.unread_count >
                                            0 && (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        markAllAsRead
                                                    }
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-[#32a936] transition hover:text-green-700"
                                                >
                                                    <CheckCheck
                                                        size={
                                                            16
                                                        }
                                                    />

                                                    Tandai semua
                                                </button>
                                            )}
                                    </div>

                                    {/* Notification list */}
                                    <div className="max-h-[420px] overflow-y-auto">
                                        {notifications.items
                                            .length ===
                                            0 ? (
                                            <div className="flex flex-col items-center justify-center px-5 py-12">
                                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                                    <Bell
                                                        size={
                                                            24
                                                        }
                                                        className="text-gray-400"
                                                    />
                                                </div>

                                                <p className="text-sm font-semibold text-gray-700">
                                                    Belum ada
                                                    notifikasi
                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    Notifikasi
                                                    terbaru akan
                                                    muncul di sini.
                                                </p>
                                            </div>
                                        ) : (
                                            notifications.items.map(
                                                (
                                                    notification
                                                ) => {
                                                    const unread =
                                                        !notification.read_at;

                                                    return (
                                                        <button
                                                            key={
                                                                notification.id
                                                            }
                                                            type="button"
                                                            onClick={() =>
                                                                handleNotificationClick(
                                                                    notification
                                                                )
                                                            }
                                                            className={`flex w-full gap-3 border-b border-gray-100 px-4 py-3.5 text-left transition last:border-b-0 hover:bg-gray-50 ${unread
                                                                    ? 'bg-green-50/60'
                                                                    : 'bg-white'
                                                                }`}
                                                        >
                                                            {/* Icon */}
                                                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                                                                {getNotificationIcon(
                                                                    notification.type
                                                                )}
                                                            </div>

                                                            {/* Content */}
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <p className="text-sm font-bold text-gray-900">
                                                                        {
                                                                            notification.title
                                                                        }
                                                                    </p>

                                                                    {unread && (
                                                                        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#32a936]" />
                                                                    )}
                                                                </div>

                                                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">
                                                                    {
                                                                        notification.message
                                                                    }
                                                                </p>

                                                                <div className="mt-2 flex items-center justify-between gap-2">
                                                                    {notification.ticket_code ? (
                                                                        <span className="text-xs font-bold text-[#32a936]">
                                                                            {
                                                                                notification.ticket_code
                                                                            }
                                                                        </span>
                                                                    ) : (
                                                                        <span />
                                                                    )}

                                                                    <span className="text-[11px] text-gray-400">
                                                                        {formatNotificationTime(
                                                                            notification.created_at
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                }
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* USER */}
                        {!collapsed && (
                            <div className="text-right">
                                <div className="font-bold text-gray-800">
                                    {auth.user?.name}
                                </div>

                                <div className="mt-1 rounded-full bg-[#32a936] px-4 py-1 text-sm text-white">
                                    {auth.roles[0] ??
                                        'Pengguna'}
                                </div>
                            </div>
                        )}

                        <img
                            src={
                                auth.user?.avatar
                                    ? `/storage/${auth.user.avatar}`
                                    : '/images/default-avatar.jpg'
                            }
                            alt="User"
                            className="h-11 w-11 rounded-full object-cover"
                        />
                    </div>
                </header>

                <main className="p-4">
                    {children}
                </main>
            </div>
        </div>
    );
}