'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import {
    LayoutGrid,
    Coins,
    Zap,
    Crown,
    Globe,
    Image as ImageIcon,
    Box,
    Code
} from 'lucide-react';
import { DASHBOARD_STATS, RECENT_PROJECTS, TYPE_PRICES } from '@/lib/constants';

export default function DashboardPage() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    return (
        <div className="w-full flex flex-col gap-6 xl:max-w-9/10 mx-auto pb-12">

            {/* 1. Header Text */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-4xl font-bold text-Text dark:text-Dark_Text">Home Page</h1>
                <p className="text-xs font-light text-subtext dark:text-Dark_subtext">All Thing in you omnimetric</p>
            </div>

            {/* 2. TOP ROW: Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total Projects Card */}
                <div className="dashboard-stat-card">
                    <div className="items-start w-full z-10">
                        <h3 className="text-subtext dark:text-Dark_subtext text-lg font-medium">Total Projects</h3>
                    </div>
                    <div className="flex items-end justify-between w-full z-10">
                        <span className="text-6xl font-bold text-Text dark:text-Dark_Text tracking-tight leading-none">
                            {DASHBOARD_STATS.totalProjects}
                        </span>
                        <LayoutGrid size={64} strokeWidth={1.5} className="text-Text dark:text-Dark_Text opacity-80 mb-1" />
                    </div>
                </div>

                {/* Total Token Card */}
                <div className="dashboard-stat-card">
                    <div className="items-start w-full z-10">
                        <h3 className="text-subtext dark:text-Dark_subtext text-lg font-medium">Total Token</h3>
                    </div>
                    <div className="flex items-end justify-between w-full z-10">
                        <span className="text-6xl font-bold text-Text dark:text-Dark_Text tracking-tight leading-none">
                            {DASHBOARD_STATS.totalTokens}
                        </span>
                        <Coins size={64} strokeWidth={1.5} className="text-Text dark:text-Dark_Text opacity-80 mb-1" />
                    </div>
                </div>
            </div>

            {/* 3. MIDDLE SECTION */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

                {/* Left: Recent Projects (Span 5) */}
                <div className="xl:col-span-5 dashboard-panel-base p-4 flex flex-col">
                    <h3 className="text-xl font-bold text-Text dark:text-Dark_Text mb-6">Recent Projects</h3>

                    <div className="flex flex-col gap-3">
                        {RECENT_PROJECTS.map((project, i) => (
                            // ADDED 'group' HERE MANUALLY
                            <div key={i} className="dashboard-project-row group">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        {project.model.includes('Pro') ? <Crown size={20} /> : <Zap size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-Text dark:text-white">{project.name}</h4>
                                        <p className="text-[10px] text-subtext dark:text-zinc-400">{project.model}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-medium text-subtext dark:text-zinc-500 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md">
                                    {project.imageCount} Image
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center: Logo (Span 2) */}
                <div className="xl:col-span-2 flex items-center justify-center py-8 xl:py-0">
                    <div className="relative size-60 opacity-20 hover:opacity-100 transition-opacity duration-500">
                         {mounted && (theme === "dark"
                            ? <Image src="/images/OmniMetricW.png" alt="Logo" fill className="object-contain"/>
                            : <Image src="/images/OmniMetricB.png" alt="Logo" fill className="object-contain"/>
                        )}
                        {!mounted && <div className="w-full h-full" />}
                    </div>
                </div>

                {/* Right: Type Price (Span 5) */}
                <div className="xl:col-span-5 dashboard-panel-base p-4 flex flex-col">
                    <h3 className="text-xl font-bold text-Text dark:text-Dark_Text mb-6">Type Price</h3>

                    <div className="flex flex-col gap-4">

                        {/* 1. MODEL GROUP BOX */}
                        <div className="dashboard-price-group-box">
                            <div className="flex items-center gap-2 mb-4 text-Text dark:text-Dark_Text">
                                <Box size={24} strokeWidth={2} />
                                <span className="text-lg font-bold">Model</span>
                            </div>

                            <div className="space-y-4">
                                {TYPE_PRICES.models.map((item, idx) => (
                                    <div key={idx} className="dashboard-price-row">
                                        <div className="flex items-center gap-3">
                                            {item.name.includes('Pro') ? <Crown size={24} className="text-Text dark:text-white"/> : <Zap size={24} className="text-Text dark:text-white"/>}
                                            <span className="text-base text-Text dark:text-white font-medium">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-black bg-power dark:bg-Dark_power px-5 py-2 rounded-lg shadow-sm">
                                            XX Token
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. IMAGE GROUP BOX */}
                        <div className="dashboard-price-group-box">
                            <div className="flex items-center gap-2 mb-4 text-Text dark:text-Dark_Text">
                                <ImageIcon size={24} strokeWidth={2} />
                                <span className="text-lg font-bold">Image</span>
                            </div>

                            <div className="space-y-4">
                                {TYPE_PRICES.images.map((item, idx) => (
                                    <div key={idx} className="dashboard-price-row">
                                        <div className="flex items-center gap-3">
                                            {item.name.includes('360') ? <Globe size={24} className="text-Text dark:text-white"/> : <ImageIcon size={24} className="text-Text dark:text-white"/>}
                                            <span className="text-base text-Text dark:text-white font-medium">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-black bg-power dark:bg-Dark_power px-5 py-2 rounded-lg shadow-sm">
                                            XX Token
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* 4. BOTTOM ROW: Short Description */}
            <div className="dashboard-panel-base p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3 text-Text dark:text-Dark_Text">
                    <Code size={24} strokeWidth={2.5} />
                    <h3 className="text-lg font-bold">Short Description</h3>
                </div>
                <p className="text-subtext dark:text-Dark_subtext leading-relaxed text-base max-w-5xl">
                    Develop an online platform that uses artificial intelligence (AI) to detect objects and estimate metric depth and orientation from photographs, especially equirectangular projection photographs.
                </p>
            </div>

        </div>
    );
}