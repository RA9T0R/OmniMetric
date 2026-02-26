'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { UserProfile, UserUpdatePayload, Transaction } from "@/types/type";

const AUTH_EVENT_KEY = 'auth-data-change';

export const useAuth = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const fetchUser = useCallback(async () => {
        const token = Cookies.get('token');

        if (!token) {
            setUser(null);
            setLoading(false);
            if (pathname?.includes('/dashboard')) router.push('/');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                Cookies.remove('token');
                setUser(null);
            }
        } catch (error) {
            console.error("Network Error:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [pathname, router, API_URL]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);


    useEffect(() => {
        const handleAuthChange = () => {
            fetchUser();
        };

        window.addEventListener(AUTH_EVENT_KEY, handleAuthChange);
        return () => {
            window.removeEventListener(AUTH_EVENT_KEY, handleAuthChange);
        };
    }, [fetchUser]);

    const login = async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed');
        Cookies.set('token', data.access_token, { expires: 1 });

        window.dispatchEvent(new Event(AUTH_EVENT_KEY));

        router.push('/dashboard');
    };

    const register = async (username: string, email: string, password: string) => {
        const res = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Registration failed');
    };

    const logout = () => {
        Cookies.remove('token');
        setUser(null);

        window.dispatchEvent(new Event(AUTH_EVENT_KEY));

        router.push('/');
    };

    const refreshUser = useCallback(async () => {
        await fetchUser(); // โหลดของตัวเอง
        window.dispatchEvent(new Event(AUTH_EVENT_KEY));
    }, [fetchUser]);

    const updateProfile = async (payload: UserUpdatePayload) => {
        const token = Cookies.get('token');
        const res = await fetch(`${API_URL}/users/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update profile');

        window.dispatchEvent(new Event(AUTH_EVENT_KEY));
    };

    const updateAvatar = async (file: File) => {
        const token = Cookies.get('token');
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_URL}/users/me/avatar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        if (!res.ok) throw new Error('Failed to upload avatar');

        window.dispatchEvent(new Event(AUTH_EVENT_KEY));
    };

    const getUserTransactions = useCallback(async (limit: number = 10, skip: number = 0): Promise<Transaction[]> => {
        try {
            const token = Cookies.get('token');
            if (!token) return [];

            const res = await fetch(`${API_URL}/users/transactions?limit=${limit}&skip=${skip}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                if (res.status === 401) {
                   logout()
                }
                return [];
            }

            const data = await res.json();
            return data;
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return [];
        }
    }, []);

    return {
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        updateAvatar,
        getUserTransactions
    };
};