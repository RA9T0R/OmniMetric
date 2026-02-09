'use client'

import React, { useState } from "react";
import Navbar_landing from "@/components/menu/Navbar_landing";
import MobileMenu_landing from "@/components/menu/MobileMenu_landing";
import AuthModal from "@/components/menu/AuthModal";
import { AuthProvider } from "@/components/landing/AuthContext";

export default function ClientLayoutWrapper_landing({ children }: { children: React.ReactNode; }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

    const openLogin = () => {
        setAuthMode('login');
        setIsAuthOpen(true);
        setIsMobileMenuOpen(false);
    };

    const openSignup = () => {
        setAuthMode('signup');
        setIsAuthOpen(true);
        setIsMobileMenuOpen(false);
    };

    return (
        <AuthProvider value={{ openLogin, openSignup }}>

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                initialMode={authMode}
                onSwitchMode={(mode) => setAuthMode(mode)}
            />

            <MobileMenu_landing
                isOpen={isMobileMenuOpen}
                setIsOpen={setIsMobileMenuOpen}
                onLoginClick={openLogin}
                onSignupClick={openSignup}
            />

            <Navbar_landing
                onMenuClick={() => setIsMobileMenuOpen(true)}
                onLoginClick={openLogin}
                onSignupClick={openSignup}
            />

            <div className="font-space-grotesk flex-1 px-5 md:px-8 lg:px-0  overflow-auto transition-all duration-300 ">
                {children}
            </div>
        </AuthProvider>
    );
}