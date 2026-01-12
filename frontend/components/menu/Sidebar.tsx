'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { sidebar_content, icons } from '@/lib/constants';
import {ArrowLeftFromLine, ArrowRightFromLine, LogOut} from 'lucide-react';
import Image from "next/image";
import {useTheme} from "next-themes";

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
}

const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
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
        <aside
            className={`
                hidden md:flex flex-col h-full text-Text dark:text-Dark_Text bg-Main_BG dark:bg-Dark_Main_BG border-r border-BG_light dark:border-Dark_BG_light transition-all duration-300 ease-in-out relative 
                ${isCollapsed ? 'w-20' : 'w-64'}
            `}
        >
            {/* 1. HEADER FIX: Logic to handle spacing when collapsed */}
            <div className={`flex items-center h-20 px-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>

                {/* Only show Logo & Text if NOT collapsed */}
                {!isCollapsed && (
                    <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
                        <div className="flex size-10 items-center justify-center shrink-0 select-none">
                            {mounted && (theme === "dark"
                                ? <Image src="/images/OmniMetricW.png" alt="Logo" width={40} height={40} />
                                : <Image src="/images/OmniMetricB.png" alt="Logo" width={40} height={40} />
                            )}
                            {!mounted && <div className="w-[30px] h-[30px]" />}
                        </div>
                        <h1 className="font-bold text-lg tracking-tight  whitespace-nowrap">
                            OmniMetric
                        </h1>
                    </Link>
                )}

                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className=" hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg shrink-0 cursor-pointer"
                >
                    {isCollapsed ? <ArrowRightFromLine size={20} /> : <ArrowLeftFromLine size={20} />}
                </button>
            </div>

            {/* 2. NAVIGATION LINKS */}
            <nav className="flex-1 flex flex-col gap-2 px-4">
                {sidebar_content.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <React.Fragment key={item.path}>
                            {/* Separator Line */}
                            {item.separator && (
                                <div className={`my-2 border-t border-white/10 ${isCollapsed ? 'mx-2' : 'mx-4'}`} />
                            )}

                            <Link
                                href={item.path}
                                className={`
                                    flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group text-Text dark:text-Dark_Text
                                    ${isActive 
                                        ? 'bg-BG_light dark:bg-Dark_BG_light ' 
                                        : 'hover:bg-BG_dark hover:dark:bg-Dark_BG_dark'
                                    }
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                            >
                                <span>
                                    {renderIcon(item.icon)}
                                </span>

                                {/* Hide Text when Collapsed */}
                                {!isCollapsed && (
                                    <span className="font-medium whitespace-nowrap">
                                        {item.name}
                                    </span>
                                )}
                            </Link>
                        </React.Fragment>
                    )
                })}
            </nav>

            {/* 3. LOGOUT (Bottom) */}
            <div className="p-2 border-t border-white/10">
                <button 
                    className={`
                        flex items-center gap-4 px-3 py-3 w-full rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-colors
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                >
                    <LogOut size={20} strokeWidth={1.5} />
                    {!isCollapsed && <span className="font-medium">LOGOUT</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;