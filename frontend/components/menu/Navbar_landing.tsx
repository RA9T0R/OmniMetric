'use client';

import React, { useEffect, useState } from 'react';
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { useTheme } from "next-themes";
import Container from "@/components/landing/Container";

interface NavbarProps {
    onMenuClick: () => void;
    onLoginClick: () => void;
    onSignupClick: () => void;
}

const Navbar_landing = ({ onMenuClick, onLoginClick, onSignupClick }: NavbarProps) => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    return (

        <nav className="navbar-landing-fixed">

            {/* Container handles the width and vertical borders */}
            <Container className="flex justify-between items-center h-20">

                {/* 1. Left Section: Logo */}
                <div className="flex items-center gap-3">
                    <button onClick={onMenuClick} className="p-2 -ml-2 rounded-lg hover:bg-white/10 md:hidden cursor-pointer text-Text dark:text-Dark_Text">
                        <Menu size={24} />
                    </button>

                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex w-8 h-8 md:w-10 md:h-10 items-center justify-center shrink-0 select-none">
                            {mounted && (theme === "dark"
                                ? <Image src="/images/OmniMetricW.png" alt="Logo" width={30} height={30} />
                                : <Image src="/images/OmniMetricB.png" alt="Logo" width={30} height={30} />
                            )}
                            {!mounted && <div className="w-[30px] h-[30px]" />}
                        </div>
                        <h1 className="font-bold text-lg md:text-xl tracking-tight text-Text dark:text-Dark_Text">OmniMetric</h1>
                    </Link>
                </div>

                {/* 2. Center Section: Navigation Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="navbar-landing-link">
                        Key Features
                    </Link>
                    <Link href="#how-it-works" className="navbar-landing-link">
                        How It Works
                    </Link>
                </div>

                {/* 3. Right Section: Actions */}
                <div className="flex items-center gap-4 md:gap-6">
                    <ThemeToggle />

                    <button
                        onClick={onLoginClick}
                        className="cursor-pointer hidden md:block text-sm font-medium text-Text dark:text-Dark_Text hover:underline"
                    >
                        Log In
                    </button>

                    <button
                        onClick={onSignupClick}
                        className="btn-power-action"
                    >
                        Sign In
                    </button>
                </div>
            </Container>
        </nav>
    );
};

export default Navbar_landing;