'use client'

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import { X } from 'lucide-react'; // Removed unused icon imports
import Image from "next/image";
import {useTheme} from "next-themes";

interface MobileMenuProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onLoginClick: () => void;
    onSignupClick: () => void;
}

const MobileMenu_landing = ({ isOpen, setIsOpen, onLoginClick, onSignupClick }: MobileMenuProps) => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLinkClick = () => {setIsOpen(false);};

    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 ease-in-out md:hidden
                ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>

            {/* Backdrop (Exact same as your old code: no blur, black/50) */}
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)}/>

            {/* Menu Panel (Exact same width w-72 and colors) */}
            <aside className={`absolute top-0 left-0 h-full w-72 shrink-0 bg-Main_BG dark:bg-Dark_Main_BG flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Header: Updated Data to OmniMetric, kept exact styling */}
                <div className="flex items-center justify-between p-4 border-b border-subtext/20 dark:border-Dark_subtext/20">
                    <div className="flex w-10 h-10 bg-bg dark:bg-Dark_bg rounded-lg items-center justify-center shrink-0 select-none">
                        {/* OmniMetric Logo Logic */}
                        {mounted && (theme === "dark"
                                ? <Image src="/images/OmniMetricW.png" alt="Logo" width={30} height={30}/>
                                : <Image src="/images/OmniMetricB.png" alt="Logo" width={30} height={30}/>
                        )}
                        {!mounted && <div className="w-[30px] h-[30px]" />}
                    </div>

                    {/* Updated Title Data */}
                    <div className="flex flex-col overflow-hidden whitespace-nowrap mr-auto ml-3">
                        <h1 className="font-extrabold truncate">OmniMetric</h1>
                    </div>

                    <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10">
                        <X size={24} />
                    </button>
                </div>

                {/* Menu List: Updated Links, kept exact styling classes */}
                <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">

                    {/* Link 1: Key Features */}
                    <Link
                        href="#features"
                        onClick={handleLinkClick}
                        className="flex items-center py-2 px-3 font-medium rounded-xl transition-colors gap-3 text-Text dark:text-Dark_Text hover:bg-black/5 dark:hover:bg-white/5"
                    >
                        <span className="whitespace-nowrap overflow-hidden">Key Features</span>
                    </Link>

                    {/* Link 2: How It Works */}
                    <Link
                        href="#how-it-works"
                        onClick={handleLinkClick}
                        className="flex items-center py-2 px-3 font-medium rounded-xl transition-colors gap-3 text-Text dark:text-Dark_Text hover:bg-black/5 dark:hover:bg-white/5"
                    >
                        <span className="whitespace-nowrap overflow-hidden">How It Works</span>
                    </Link>

                    {/* Separator (Exact same styling) */}
                    <hr className="w-[90%] mx-auto my-2 border-t border-subtext/20 dark:border-Dark_subtext/20" />

                    {/* Link 3: Log In */}
                    <button
                        onClick={onLoginClick} // Use prop
                        className="w-full flex items-center justify-center py-2 px-3 font-medium rounded-xl transition-colors gap-3 text-Text dark:text-Dark_Text hover:bg-black/5 dark:hover:bg-white/5 text-left"
                    >
                        <span className="whitespace-nowrap overflow-hidden">Log In</span>
                    </button>

                    {/* Button: Sign In */}
                    <button
                        onClick={onSignupClick} // Use prop
                        className="w-full bg-power dark:bg-Dark_power hover:scale-105 text-black font-semibold py-2 px-3 rounded-xl transition-colors"
                    >
                        Sign In
                    </button>

                </div>
            </aside>
        </div>
    );
};

export default MobileMenu_landing;