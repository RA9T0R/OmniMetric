'use client';

import React from 'react';
import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';

const PaymentCancelPage = () => {
    return (
        <div className="w-full min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-Main_BG dark:bg-Dark_Main_BG border border-white/10 rounded-2xl p-8 text-center shadow-xl">
                <div className="mb-6 inline-block p-4 rounded-full bg-red-500/10 border-2 border-red-500/50">
                    <XCircle size={64} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-Text dark:text-Dark_Text mb-2">Payment Cancelled</h1>
                <p className="text-subtext dark:text-Dark_subtext mb-8">
                    No charges were made. You can try again anytime.
                </p>
                <Link href="/dashboard/price">
                    <button className="cursor-pointer w-full py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                        <ArrowLeft size={18} />
                        Try Again
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default PaymentCancelPage;