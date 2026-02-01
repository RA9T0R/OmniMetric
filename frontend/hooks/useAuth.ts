import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';

interface UserProfile {
    user_id: string;
    username: string;
    email: string;
    credit_balance: number;
    profile_picture_url?: string;
}

export const useAuth = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchUser = useCallback(async () => {
        const token = Cookies.get('token');

        if (!token) {
            setUser(null);
            setLoading(false);

            if (pathname.includes('/dashboard')) router.push('/');
            return;
        }

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${API_URL}/api/v1/users/me`, {
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
    }, [pathname, router]);

    useEffect(() => {
        fetchUser()
    }, [fetchUser]);

    const logout = () => {
        Cookies.remove('token');
        setUser(null);
        router.push('/');
    };

    return { user, loading, logout, refreshUser: fetchUser };
};