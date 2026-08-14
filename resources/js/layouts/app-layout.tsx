import type { ReactNode } from 'react';
import { useState } from 'react';
import { Bell } from 'lucide-react';

import Sidebar from '@/components/sidebar';

type AppLayoutProps = {
    children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);

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
                    ${collapsed ? 'ml-[88px]' : 'ml-[265px]'}
                `}
            >
                {/* Header */}
                <header className="flex h-[80px] items-center justify-between px-8 border-b border-gray-400">
                    <div>
                        <h1 className="text-[28px] font-bold text-gray-800">
                            Supa Maintenance
                        </h1>

                        <p className="text-[18px] text-gray-600">
                            Manajemen Perbaikan, Mesin, dan Sparepart
                        </p>
                    </div>

                    <div className="flex items-center gap-5">
                        <button className="relative">
                            <Bell size={30} className="text-gray-600" />

                            <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-red-500" />
                        </button>

                        <div className="text-right">
                            <div className="font-bold text-gray-800">
                                Budi Santoso
                            </div>

                            <div className="mt-1 rounded-full bg-[#32a936] px-4 py-1 text-sm text-white">
                                Operasional
                            </div>
                        </div>

                        <img
                            src="/images/default-avatar.jpg"
                            className="h-14 w-14 rounded-full object-cover"
                            alt="User"
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