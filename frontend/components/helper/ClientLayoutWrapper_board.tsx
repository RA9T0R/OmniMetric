'use client'

import React, { useState } from "react";
import Navbar_board from "@/components/menu/Navbar_board";
import MobileMenu_board from "@/components/menu/MobileMenu_board";
import Sidebar from "@/components/menu/Sidebar";

export default function ClientLayoutWrapper_landing({children,}: { children: React.ReactNode; }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <MobileMenu_board />
            <Navbar_board />

          <div className="flex min-h-screen bg-bg dark:bg-Dark_bg">
            <Sidebar/>
            <main className="flex-1 md:px-3 lg:px-6 xl:px-12 overflow-auto transition-all duration-300 text-text dark:text-Dark_text">
              {children}
            </main>
          </div>
        </>
    );
}