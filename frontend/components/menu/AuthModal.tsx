'use client';

import React, { useEffect, useState } from 'react';
import {CircleX, X} from 'lucide-react';

import { useTheme } from 'next-themes';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode: 'login' | 'signup';
    onSwitchMode: (mode: 'login' | 'signup') => void;
}

const AuthModal = ({ isOpen, onClose, initialMode, onSwitchMode }: AuthModalProps) => {
    const [mode, setMode] = useState(initialMode);

    // Sync internal mode if prop changes
    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    if (!isOpen) return null;

    const isLogin = mode === 'login';

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 font-space-grotesk">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-Main_BG dark:bg-Dark_Main_BG border border-BG_light dark:border-Dark_BG_light rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-8 pt-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-5xl font-bold text-Text dark:text-Dark_Text">
                            {isLogin ? 'Log-IN' : 'Sign-IN'}
                        </h2>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="text-subtext dark:text-Dark_subtext hover:scale-105 cursor-pointer transition-colors"
                        >
                            <CircleX size={30} />
                        </button>
                    </div>

                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>

                        {/* Fields for Sign Up only */}
                        {!isLogin && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="User Name"
                                    className="input-primary"
                                />
                            </div>
                        )}

                        <div>
                            <input
                                type="email"
                                placeholder="E-Mail"
                                className="input-primary"
                            />
                        </div>

                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                className="input-primary"
                            />
                        </div>

                        {/* Confirm Password for Sign Up only */}
                        {!isLogin && (
                            <div>
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    className="input-primary"
                                />
                            </div>
                        )}

                        <button className="w-full cursor-pointer bg-power dark:bg-Dark_power hover:scale-105 text-black font-bold py-3 rounded-lg transition-colors mt-6">
                            {isLogin ? 'Log In' : 'Sign In'}
                        </button>
                    </form>

                    {/* Footer / Switcher */}
                    <div className="mt-6 text-center text-sm text-subtext dark:text-Dark_subtext">
                        {isLogin ? (
                            <p>
                                Not Have account?{' '}
                                <button
                                    onClick={() => setMode('signup')}
                                    className="text-Text dark:text-Dark_Text font-medium hover:underline cursor-pointer"
                                >
                                    Sign In
                                </button>
                            </p>
                        ) : (
                            <p>
                                Have account?{' '}
                                <button
                                    onClick={() => setMode('login')}
                                    className="text-Text dark:text-Dark_Text font-medium hover:underline cursor-pointer"
                                >
                                    Log In
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;