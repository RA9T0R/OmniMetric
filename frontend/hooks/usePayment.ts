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
            // หมายเหตุ: กรณี redirect สำเร็จ หน้าเว็บจะเปลี่ยนไป loading อาจจะค้างเป็น true ซึ่งถูกต้องแล้ว
            // แต่ถ้า error เราต้องปิด loading
            // การใส่ setIsLoading(false) ไว้ใน finally อาจทำให้เกิดปัญหากรณี redirect ไปแล้วแต่ code ยังรันต่อ
            // แต่สำหรับการใช้งานทั่วไป การใส่ไว้เพื่อ handle error case ถือว่าโอเคครับ
            /* ถ้า Redirect สำเร็จ Browser จะโหลดหน้าใหม่ state จะหายไปเอง
               แต่ถ้าอยาก safe ให้เช็คว่าถ้าไม่มี error ค่อยปิด loading ก็ได้
            */
             // setIsLoading(false); // ⚠️ เปิดบรรทัดนี้ถ้าอยากให้ปุ่มหายหมุนกรณี Error
        }
    };

    return {
        createCheckoutSession,
        isLoading,
        error
    };
};