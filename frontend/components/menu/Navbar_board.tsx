'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {Coins, Settings, LogOut, Menu, User as UserIcon, HandCoins, ArrowDown} from 'lucide-react';
import ThemeToggle from "@/components/theme-toggle";
import { DUMMY_USER } from "@/lib/constants";

interface NavbarBoardProps {
    onMobileMenuClick: () => void;
}

const Navbar_board = ({ onMobileMenuClick }: NavbarBoardProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const user = {
        name: DUMMY_USER.username,
        email: DUMMY_USER.email,
        tokens: DUMMY_USER.credit_balance
    };

    return (
        <header className="navbar-board-header">

             <div className="flex items-center gap-2 md:gap-4">
                <button
                    onClick={onMobileMenuClick}
                    className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
                >
                    <Menu size={24} />
                </button>

                {/* User Dropdown */}
                <div className="relative z-50">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="navbar-user-trigger"
                    >
                        <div className="size-8 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold text-xs border border-white/10">
                            <UserIcon size={16} />
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-bold text-Text dark:text-Dark_Text leading-none">{user.name}</p>
                            <p className="text-[10px] text-subtext dark:text-Dark_subtext mt-1 truncate max-w-[150px]">{user.email}</p>
                        </div>
                        <ArrowDown
                            size={16}
                            className={`text-subtext dark:text-Dark_subtext transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Custom Dropdown Card */}
                    {isDropdownOpen && (
                        <>
                            <div className="cursor-pointer fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />

                            <div className="navbar-dropdown-card">

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="size-12 rounded-full border-2 border-white/20 flex items-center justify-center text-white">
                                        <UserIcon size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold text-Text dark:text-Dark_Text">
                                        {user.name}
                                    </h3>
                                </div>

                                <div className="space-y-2 mb-6 text-sm">
                                    <p className="text-subtext dark:text-Dark_subtext">
                                        Token : <span className="text-Text dark:text-Dark_Text font-medium">{user.tokens}</span>
                                    </p>
                                    <p className="text-subtext dark:text-Dark_subtext truncate">
                                        Email : <span className="text-Text dark:text-Dark_Text font-medium">{user.email}</span>
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Link href="/dashboard/settings" className="flex-1">
                                        <button onClick={() => setIsDropdownOpen(false)}
                                            className="w-full navbar-dropdown-item">
                                            <Settings size={16} />
                                            Setting
                                        </button>
                                    </Link>

                                    <button onClick={() => setIsDropdownOpen(false)}
                                        className="flex-1 navbar-dropdown-item">
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="hidden md:flex items-center gap-2 px-4 py-2 text-power dark:text-Dark_power">
                    <Coins size={24} />
                    <span className="font-bold text-sm whitespace-nowrap">Token : {user.tokens}</span>
                </div>

            </div>

            <div className="flex items-center gap-4">
                <Link href="/dashboard/price" >
                    <button className="navbar-btn-base shadow-xs shadow-text dark:shadow-Dark_text cursor-pointer size-8 md:size-11 flex items-center justify-center" >
                        <HandCoins strokeWidth={2}/>
                    </button>
                </Link>
                <div className="navbar-btn-base">
                    <ThemeToggle />
                </div>
            </div>

        </header>
    );
};

export default Navbar_board;