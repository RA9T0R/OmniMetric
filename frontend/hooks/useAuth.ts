import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { UserProfile,UserUpdatePayload } from "@/types/type";

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
            if (pathname.includes('/dashboard')) router.push('/');
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
                console.error("Token invalid, logging out...");
                Cookies.remove('token');
                setUser(null);
                router.push('/');
            }
        } catch (error) {
            console.error("Network Error or API Down:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [pathname, router, API_URL]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (email: string, password: string): Promise<void> => {
        try {
            const res = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.detail || 'Login failed');

            Cookies.set('token', data.access_token, { expires: 1 });

            await fetchUser();

            router.push('/dashboard');
        } catch (error) {
            throw error;
        }
    };

    // --- เพิ่มฟังก์ชัน REGISTER ---
    const register = async (username: string, email: string, password: string): Promise<void> => {
        try {
            const res = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Registration failed');

        } catch (error) {
            throw error;
        }
    };

    const updateProfile = async (payload: UserUpdatePayload) => {
        const token = Cookies.get('token');
        try {
            const res = await fetch(`${API_URL}/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Failed to update profile');

            // อัปเดตข้อมูลใน State ทันที
            await fetchUser();
        } catch (error) {
            throw error;
        }
    };

    // --- 2. ฟังก์ชันอัปโหลดรูปภาพ Avatar ---
    const updateAvatar = async (file: File) => {
        const token = Cookies.get('token');
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${API_URL}/users/me/avatar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) throw new Error('Failed to upload avatar');

            // อัปเดตข้อมูลใน State เพื่อให้รูปเปลี่ยนทันที
            await fetchUser();
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        Cookies.remove('token');
        setUser(null);
        router.push('/');
        console.log("logout");
    };

    return { user, loading, login, register, logout, refreshUser: fetchUser, updateProfile, updateAvatar };
};