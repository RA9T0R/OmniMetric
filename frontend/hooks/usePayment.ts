import { useState } from 'react';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const usePayment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createCheckoutSession = async (packageId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const token = Cookies.get('token');
            if (!token) throw new Error("No authentication token found");

            const res = await fetch(`${API_URL}/payments/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ package_id: packageId })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Failed to create checkout session");
            }

            if (data.url) {
                window.location.href = data.url;
            }

        } catch (err: any) {
            console.error("Payment Error:", err);
            const errorMessage = err.message || "Something went wrong during checkout.";
            setError(errorMessage);
            alert(errorMessage);
        } finally {
        }
    };

    return {
        createCheckoutSession,
        isLoading,
        error
    };
};