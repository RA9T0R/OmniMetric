'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    BookOpen, Zap, Crown, Globe, Image as ImageIcon,
    ScanEye, Info, History, ArrowUpRight, ArrowDownLeft,
    Calendar, CreditCard, Loader2
} from 'lucide-react';
import { PRICING_CONFIG } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { Transaction } from "@/types/type";

const DescriptionPage = () => {
    const { user, loading: authLoading, getUserTransactions } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingTx, setLoadingTx] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (user) {
                const data = await getUserTransactions(20);
                setTransactions(data);
                setLoadingTx(false);
            }
        };

        loadData();
    }, [user, getUserTransactions]);

    return (
        <div className="w-full flex flex-col gap-6 xl:max-w-9/10 mx-auto pb-12">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-4xl font-bold text-Text dark:text-Dark_Text">Platform Overview</h1>
                <p className="text-xs font-light text-subtext dark:text-Dark_subtext">
                    Technical specifications and your financial activity.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                    <section className="bg-Main_BG dark:bg-Dark_Main_BG border border-BG_light dark:border-Dark_BG_light p-4 md:p-6 rounded-3xl relative overflow-hidden shrink-0">
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                                <ScanEye size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-Text dark:text-Dark_Text">System Architecture</h2>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <p className="text-subtext dark:text-Dark_subtext leading-relaxed">
                                OmniMetric employs a sophisticated AI pipeline. Images are processed through our <strong>ProTypeModel</strong> for high-fidelity depth mapping or <strong>FastTypeModel</strong> for rapid batch inference.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                {[
                                    { step: 1, title: 'Input', desc: 'Accepts standard & 360° Equirectangular images.' },
                                    { step: 2, title: 'Inference', desc: 'Object Detection (YOLO) + Metric Depth Estimation.' },
                                    { step: 3, title: 'Output', desc: 'JSON Metadata, Point Cloud & 3D Visualization.' }
                                ].map((item) => (
                                    <div key={item.step} className="p-4 rounded-2xl bg-BG_light dark:bg-black/20 border border-black/5 dark:border-white/5 h-full">
                                        <div className="size-8 rounded-full bg-power text-black font-bold flex items-center justify-center mb-3 shadow-lg shadow-power/20">{item.step}</div>
                                        <h4 className="font-bold text-Text dark:text-white mb-1">{item.title}</h4>
                                        <p className="text-xs text-subtext dark:text-zinc-500">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                        <div className="p-6 rounded-3xl bg-Main_BG dark:bg-Dark_Main_BG border border-BG_light dark:border-Dark_BG_light hover:border-power dark:hover:border-Dark_power transition-colors group flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
                                    <Zap size={24} />
                                </div>
                                <span className="text-xs font-bold px-2 py-1 bg-black/5 dark:bg-white/10 rounded text-subtext dark:text-zinc-400">
                                    {PRICING_CONFIG.models.FastTypeModel} Tokens
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-Text dark:text-white mb-2">FastTypeModel</h3>
                            <p className="text-sm text-subtext dark:text-zinc-500 mt-auto">
                                Optimized for speed (&lt; 2s). Ideal for drafts.
                            </p>
                        </div>

                        <div className="p-6 rounded-3xl bg-linear-to-br from-Main_BG to-purple-900/10 dark:from-Dark_Main_BG dark:to-purple-900/20 border border-purple-500/30 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                                    <Crown size={24} />
                                </div>
                                <span className="text-xs font-bold px-2 py-1 rounded bg-purple-600 text-white shadow-sm">
                                    {PRICING_CONFIG.models.ProTypeModel} Tokens
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-Text dark:text-white mb-2">ProTypeModel</h3>
                            <p className="text-sm text-subtext dark:text-zinc-500 mt-auto">
                                High-precision architecture for detailed analysis.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                        <section className="bg-Main_BG dark:bg-Dark_Main_BG border border-BG_light dark:border-Dark_BG_light p-6 rounded-3xl h-full">
                            <div className="flex items-center gap-3 mb-4">
                                <BookOpen size={20} className="text-subtext dark:text-zinc-400"/>
                                <h3 className="text-lg font-bold text-Text dark:text-Dark_Text">Input Support</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-BG_light/50 dark:bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <ImageIcon size={20} className="text-orange-500" />
                                        <span className="text-sm font-medium text-Text dark:text-white">Normal Image</span>
                                    </div>
                                    <span className="text-xs font-bold text-subtext dark:text-zinc-500">{PRICING_CONFIG.inputs.Normal} T</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-BG_light/50 dark:bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <Globe size={20} className="text-green-500" />
                                        <span className="text-sm font-medium text-Text dark:text-white">360° Panorama</span>
                                    </div>
                                    <span className="text-xs font-bold text-subtext dark:text-zinc-500">{PRICING_CONFIG.inputs['360_degree']} T</span>
                                </div>
                            </div>
                        </section>

                        <section className="bg-linear-to-b from-blue-900/20 to-Main_BG dark:to-Dark_Main_BG border border-blue-500/20 p-6 rounded-3xl h-full flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-4 text-blue-400">
                                <Info size={20} />
                                <h3 className="text-lg font-bold">Metadata Export</h3>
                            </div>
                            <p className="text-sm text-subtext dark:text-zinc-400 leading-relaxed">
                                Processed data includes JSON-formatted bounding boxes & metric depth maps, compatible with GIS tools.
                            </p>
                        </section>
                    </div>
                </div>

                <div className="flex flex-col gap-6 h-full lg:sticky lg:top-6">
                    <section className="bg-Main_BG dark:bg-Dark_Main_BG border border-BG_light dark:border-Dark_BG_light p-6 rounded-3xl flex flex-col items-center text-center relative overflow-hidden shrink-0 shadow-xl">
                        <div className="absolute top-0 w-full h-1 bg-linear-to-r from-transparent via-power to-transparent opacity-50"></div>
                        <div className="mb-4 p-3 rounded-full bg-BG_dark dark:bg-Dark_BG_dark">
                            <CreditCard size={32} className="text-power" />
                        </div>
                        <h3 className="text-Text dark:text-white font-bold text-lg">Current Balance</h3>
                        <p className="text-subtext dark:text-Dark_subtext text-xs mb-6">Available Tokens</p>

                        {authLoading ? (
                            <Loader2 className="animate-spin text-Text dark:text-white mb-6"/>
                        ) : (
                            <div className="text-4xl font-bold text-Text dark:text-white mb-6 tracking-tight">
                                {user?.credit_balance || 0}
                            </div>
                        )}

                        <Link href="/dashboard/price" className="w-full">
                            <button className="cursor-pointer w-full py-3 rounded-xl bg-power hover:bg-power/70 text-black font-bold text-sm transition-all shadow-lg shadow-power/20 flex items-center justify-center gap-2">
                                <ArrowDownLeft size={18} />
                                Top Up Balance
                            </button>
                        </Link>
                    </section>

                    <section className="bg-Main_BG dark:bg-Dark_Main_BG border border-BG_light dark:border-Dark_BG_light rounded-3xl flex-1 flex flex-col overflow-hidden shadow-lg h-full">
                        <div className="p-6 border-b border-BG_light dark:border-white/5 bg-BG_light/30 dark:bg-white/5 shrink-0">
                            <div className="flex items-center gap-3">
                                <History size={20} className="text-subtext dark:text-zinc-400" />
                                <h3 className="text-lg font-bold text-Text dark:text-Dark_Text">History</h3>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar max-h-[300px]">
                            {loadingTx ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-subtext"/></div>
                            ) : transactions.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                    {transactions.map((tx, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${tx.type === 'purchase' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {tx.type === 'purchase' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-bold text-Text dark:text-white">
                                                        {tx.type === 'purchase' ? 'Top Up' : 'Project Cost'}
                                                    </h4>
                                                    <p className="text-[10px] text-subtext dark:text-zinc-500 flex items-center gap-1">
                                                        <Calendar size={10} />
                                                        {new Date(tx.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className={`font-mono font-bold text-sm ${tx.type === 'purchase' ? 'text-green-500' : 'text-Text dark:text-white'}`}>
                                                {tx.type === 'purchase' ? '+' : ''}{tx.amount}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-subtext dark:text-zinc-500 gap-2 opacity-50">
                                    <History size={32} />
                                    <span className="text-sm">No transactions yet</span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default DescriptionPage;