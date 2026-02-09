'use client';

import React, { useEffect, useState } from 'react';
import { CircleX, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode: 'login' | 'signup';
    onSwitchMode?: (mode: 'login' | 'signup') => void;
}

const AuthModal = ({ isOpen, onClose, initialMode }: AuthModalProps) => {
    const { login, register } = useAuth();
    const [mode, setMode] = useState(initialMode);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if(isOpen) {
             setMode(initialMode);
             setError('');
             setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        }
    }, [initialMode, isOpen]);

    if (!isOpen) return null;

    const isLogin = mode === 'login';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                onClose();
            } else {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error("Passwords do not match!");
                }

                await register(formData.username, formData.email, formData.password);

                alert('Registration Successful! Please Login.');
                setMode('login');
            }
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-space-grotesk">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={onClose}/>

            <div className="relative w-full max-w-md bg-Main_BG dark:bg-Dark_Main_BG border border-BG_light dark:border-Dark_BG_light rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-8 pt-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-5xl font-bold text-Text dark:text-Dark_Text">
                            {isLogin ? 'Log-IN' : 'Sign-IN'}
                        </h2>

                        <button onClick={onClose} className="text-subtext dark:text-Dark_subtext hover:scale-105 cursor-pointer transition-colors">
                            <CircleX size={30} />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 text-sm text-red-500 bg-red-100/10 border border-red-500/20 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div>
                                <input
                                    name="username"
                                    type="text"
                                    placeholder="User Name"
                                    className="input-primary w-full p-3 rounded-lg border-none outline-none"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <input
                                name="email"
                                type="email"
                                placeholder="E-Mail"
                                className="input-primary w-full p-3 rounded-lg border-none outline-none"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <input
                                name="password"
                                type="password"
                                placeholder="Password"
                                className="input-primary w-full p-3 rounded-lg border-none outline-none"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm Password"
                                    className="input-primary w-full p-3 rounded-lg border-none outline-none"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}

                        <button disabled={isLoading} className="w-full flex justify-center items-center cursor-pointer bg-power dark:bg-Dark_power hover:scale-105 text-black font-bold py-3 rounded-lg transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                isLogin ? 'Log In' : 'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-subtext dark:text-Dark_subtext">
                        {isLogin ? (
                            <p> Not Have account ? - {' '}
                                <button onClick={() => setMode('signup')} className="text-Text dark:text-Dark_Text font-medium hover:underline cursor-pointer">
                                    Sign In
                                </button>
                            </p>
                        ) : (
                            <p> Have account ? - {' '}
                                <button onClick={() => setMode('login')} className="text-Text dark:text-Dark_Text font-medium hover:underline cursor-pointer">
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