'use client'

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const handleLinkClick = () => {setIsOpen(false);};

    return (
        <div className={`mobile-menu-wrapper ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>

            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)}/>

            {/* Menu Panel */}
            <aside className={`mobile-menu-panel ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-subtext/20 dark:border-Dark_subtext/20">
                    <div className="flex w-10 h-10 bg-bg dark:bg-Dark_bg rounded-lg items-center justify-center shrink-0 select-none">
                        {mounted && (theme === "dark"
                                ? <Image src="/images/OmniMetricW.png" alt="Logo" width={30} height={30}/>
                                : <Image src="/images/OmniMetricB.png" alt="Logo" width={30} height={30}/>
                        )}
                        {!mounted && <div className="w-[30px] h-[30px]" />}
                    </div>

                    <div className="flex flex-col overflow-hidden whitespace-nowrap mr-auto ml-3">
                        <h1 className="font-extrabold truncate">OmniMetric</h1>
                    </div>

                    <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10">
                        <X size={24} />
                    </button>
                </div>

                {/* Menu List */}
                <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">

                    <Link href="#features" onClick={handleLinkClick} className="mobile-link-landing">
                        <span className="whitespace-nowrap overflow-hidden">Key Features</span>
                    </Link>

                    <Link href="#how-it-works" onClick={handleLinkClick} className="mobile-link-landing">
                        <span className="whitespace-nowrap overflow-hidden">How It Works</span>
                    </Link>

                    <hr className="w-[90%] mx-auto my-2 border-t border-subtext/20 dark:border-Dark_subtext/20" />

                    <button onClick={onLoginClick} className="mobile-link-landing w-full text-left">
                        <span className="whitespace-nowrap overflow-hidden">Log In</span>
                    </button>

                    <button
                        onClick={onSignupClick}
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