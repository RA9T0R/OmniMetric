'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { sidebar_content, icons } from '@/lib/constants';
import { X, LogOut } from 'lucide-react';
import Image from "next/image";
import { useTheme } from "next-themes";

interface MobileMenuProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const MobileMenu_board = ({ isOpen, setIsOpen }: MobileMenuProps) => {
    const pathname = usePathname();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const renderIcon = (name: keyof typeof icons) => {
        const IconComponent = icons[name];
        if (!IconComponent) return null;
        return <IconComponent size={20} strokeWidth={1.5} />;
    };

    return (
        <div className={`mobile-menu-wrapper ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>

            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}/>

            {/* Menu Panel */}
            <aside className={`mobile-menu-panel ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-BG_light dark:border-Dark_BG_light">
                    <Link href="/" className="flex items-center gap-2 overflow-hidden">
                        <div className="flex size-10 items-center justify-center shrink-0 select-none">
                            {mounted && (theme === "dark"
                                ? <Image src="/images/OmniMetricW.png" alt="Logo" width={40} height={40} />
                                : <Image src="/images/OmniMetricB.png" alt="Logo" width={40} height={40} />
                            )}
                            {!mounted && <div className="w-[30px] h-[30px]" />}
                        </div>
                        <h1 className="font-bold text-lg tracking-tight whitespace-nowrap">
                            OmniMetric
                        </h1>
                    </Link>
                    <button onClick={() => setIsOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                {/* Links */}
                <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
                    {sidebar_content.map((item) => {
                         const isActive = pathname === item.path;
                         return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`
                                    mobile-link-board
                                    ${isActive 
                                        ? 'bg-BG_light dark:bg-Dark_BG_light' 
                                        : 'hover:bg-BG_dark hover:dark:bg-Dark_BG_dark'
                                    }
                                `}
                            >
                                {renderIcon(item.icon)}
                                <span>{item.name}</span>
                            </Link>
                         )
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-BG_light dark:border-Dark_BG_light pb-8">
                    <button className="flex items-center gap-4 px-3 py-3 w-full rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors text-Text dark:text-Dark_Text">
                        <LogOut size={20} />
                        <span className="font-medium">LOGOUT</span>
                    </button>
                </div>
            </aside>
        </div>
    );
};

export default MobileMenu_board;