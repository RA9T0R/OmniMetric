'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Home, Loader2, PartyPopper } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const PaymentSuccessPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const { refreshUser, user } = useAuth();

    const [isRefreshing, setIsRefreshing] = useState(true);

    useEffect(() => {
        const syncData = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await refreshUser();
            } catch (error) {
                console.error("Failed to refresh user data", error);
            } finally {
                setIsRefreshing(false);
            }
        };

        if (sessionId) {
            syncData();
        }
    }, [sessionId]);

    return (
        <div className="w-full min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-Main_BG dark:bg-Dark_Main_BG border border-white/10 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-green-500/20 blur-3xl -z-10 rounded-full"></div>

                <div className="mb-6 relative inline-block">
                    <div className="absolute inset-0 bg-green-500 blur-xl opacity-40 rounded-full animate-pulse"></div>
                    <div className="relative bg-BG_dark dark:bg-Dark_BG_dark p-4 rounded-full border-2 border-green-500">
                        <CheckCircle size={64} className="text-green-500 animate-in zoom-in duration-500" strokeWidth={3} />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-Text dark:text-Dark_Text mb-2">Payment Successful!</h1>
                <p className="text-subtext dark:text-Dark_subtext mb-8">
                    Thank you for your purchase. Your tokens have been added to your account.
                </p>

                <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 mb-8 border border-white/5">
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-subtext dark:text-zinc-400">Transaction Ref</span>
                        <span className="font-mono text-xs text-zinc-500 truncate max-w-[120px]">{sessionId?.slice(-8)}...</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-subtext dark:text-zinc-400">Current Balance</span>
                        {isRefreshing ? (
                             <div className="flex items-center gap-2 text-green-500">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-sm font-bold">Updating...</span>
                             </div>
                        ) : (
                            <span className="text-xl font-bold text-green-500 flex items-center gap-2">
                                <PartyPopper size={18} />
                                {user?.credit_balance} Tokens
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Link href="/dashboard/projects">
                        <button className="cursor-pointer w-full py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 group">
                            Start New Project
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>

                    <Link href="/dashboard">
                        <button className="cursor-pointer w-full py-3.5 bg-transparent hover:bg-white/5 text-subtext dark:text-zinc-400 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                            <Home size={18} />
                            Back to Dashboard
                        </button>
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default PaymentSuccessPage;