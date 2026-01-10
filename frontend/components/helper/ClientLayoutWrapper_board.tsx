'use client'

import React, { useState } from "react";
import Navbar_board from "@/components/menu/Navbar_board";
import MobileMenu_board from "@/components/menu/MobileMenu_board";
import Sidebar from "@/components/menu/Sidebar";

export default function ClientLayoutWrapper_board({children}: { children: React.ReactNode; }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        // 1. OUTER WRAPPER: Black background with Padding (The "Gap" you asked for)
        <div className="h-screen w-full bg-BG_dark dark:bg-Dark_BG_dark p-2 flex items-center justify-center font-space-grotesk overflow-hidden">

            {/* 2. FLOATING DASHBOARD CARD */}
            <div className="w-full h-full bg-BG_dark dark:bg-Dark_BG_dark rounded-lg overflow-hidden flex flex-col relative ">

                {/* Mobile Menu Overlay */}
                <MobileMenu_board
                    isOpen={isMobileMenuOpen}
                    setIsOpen={setIsMobileMenuOpen}
                />

                {/* 3. NAVBAR: Takes ALL width at the top */}
                <Navbar_board
                    onMobileMenuClick={() => setIsMobileMenuOpen(true)}
                />

                {/* 4. LOWER SECTION: Sidebar + Main Content */}
                <div className="flex flex-1 overflow-hidden relative border-2 border-BG_light dark:border-Dark_BG_light rounded-lg">

                    {/* Sidebar: Sits below Navbar */}
                    <Sidebar
                        isCollapsed={isSidebarCollapsed}
                        setIsCollapsed={setIsSidebarCollapsed}
                    />

                    {/* Main Content: Sits next to Sidebar */}
                    <main className="flex-1 overflow-y-auto bg-BG_dark dark:bg-Dark_BG_dark p-4 relative">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}