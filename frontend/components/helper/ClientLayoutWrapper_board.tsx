'use client'

import React, { useState } from "react";
import Navbar_board from "@/components/menu/Navbar_board";
import MobileMenu_board from "@/components/menu/MobileMenu_board";
import Sidebar from "@/components/menu/Sidebar";

export default function ClientLayoutWrapper_board({children}: { children: React.ReactNode; }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="h-screen w-full bg-BG_dark dark:bg-Dark_BG_dark p-2 flex items-center justify-center font-space-grotesk overflow-hidden">
            <div className="w-full h-full bg-BG_dark dark:bg-Dark_BG_dark rounded-lg overflow-hidden flex flex-col relative ">

                <MobileMenu_board
                    isOpen={isMobileMenuOpen}
                    setIsOpen={setIsMobileMenuOpen}
                />

                <Navbar_board
                    onMobileMenuClick={() => setIsMobileMenuOpen(true)}
                />

                <div className="flex flex-1 overflow-hidden relative border-2 border-BG_light dark:border-Dark_BG_light rounded-lg">
                    <Sidebar
                        isCollapsed={isSidebarCollapsed}
                        setIsCollapsed={setIsSidebarCollapsed}
                    />

                    <main className="flex-1 overflow-y-auto bg-BG_dark dark:bg-Dark_BG_dark p-4 relative">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}