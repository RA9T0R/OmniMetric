'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
    LayoutGrid,
    Coins,
    Zap,
    Crown,
    Globe,
    Image as ImageIcon,
    Box,
    Code,
    Loader2
} from 'lucide-react';
import { PRICING_CONFIG } from '@/lib/constants';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
    const { theme } = useTheme();
    const router = useRouter();

    const { projects, isLoading: projectsLoading } = useProjects();
    const { user, loading: authLoading } = useAuth();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const recentProjects = [...(projects || [])]
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .slice(0, 5);


    if (!mounted) return null;

    return (
        <div className="w-full flex flex-col gap-6 xl:max-w-9/10 mx-auto pb-12">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-4xl font-bold text-Text dark:text-Dark_Text">Home Page</h1>
                <p className="text-xs font-light text-subtext dark:text-Dark_subtext">All things in your OmniMetric</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total Projects Card */}
                <div className="dashboard-stat-card">
                    <div className="items-start w-full z-10">
                        <h3 className="text-subtext dark:text-Dark_subtext text-lg font-medium">Total Projects</h3>
                    </div>
                    <div className="flex items-end justify-between w-full z-10">
                        <span className="text-6xl font-bold text-Text dark:text-Dark_Text tracking-tight leading-none">
                            {/* เช็ค Loading และแสดงผล */}
                            {projectsLoading ? (
                                <Loader2 className="animate-spin w-10 h-10 opacity-50"/>
                            ) : (
                                projects?.length || 0
                            )}
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
                             {authLoading ? (
                                 <Loader2 className="animate-spin w-10 h-10 opacity-50"/>
                             ) : (
                                 user?.credit_balance || 0
                             )}
                        </span>
                        <Coins size={64} strokeWidth={1.5} className="text-Text dark:text-Dark_Text opacity-80 mb-1" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

                {/* 1. Recent Projects Section */}
                <div className="xl:col-span-5 dashboard-panel-base p-4 flex flex-col">
                    <h3 className="text-xl font-bold text-Text dark:text-Dark_Text mb-6">Recent Projects</h3>

                    <div className="flex flex-col gap-3">
                        {projectsLoading ? (
                             <div className="flex justify-center p-4"><Loader2 className="animate-spin text-subtext"/></div>
                        ) : recentProjects.length > 0 ? (
                            recentProjects.map((project, i) => (
                                <div
                                    key={project.project_id || i}
                                    className="dashboard-project-row group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    onClick={() => router.push(`/dashboard/projects/${project.project_id}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            {project.model_name?.includes('Pro') ? <Crown size={20} className="text-purple-500" /> : <Zap size={20} />}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="font-bold text-sm text-Text dark:text-white truncate max-w-[150px]">
                                                {project.title}
                                            </h4>
                                            <p className="text-[10px] text-subtext dark:text-zinc-400 truncate">
                                                {project.model_name} • {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-medium text-subtext dark:text-zinc-500 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md shrink-0">
                                        {project.images?.length || 0} Image
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-subtext text-sm py-4">No projects yet.</div>
                        )}
                    </div>
                </div>

                {/* Center: Logo (Span 2) */}
                <div className="xl:col-span-2 flex items-center justify-center py-8 xl:py-0">
                    <div className="relative size-60 opacity-20 hover:opacity-100 transition-opacity duration-500">
                        {theme === "dark"
                            ? <Image src="/images/OmniMetricW.png" alt="Logo" fill className="object-contain"/>
                            : <Image src="/images/OmniMetricB.png" alt="Logo" fill className="object-contain"/>
                        }
                    </div>
                </div>

                {/* Right: Type Price (Span 5) */}
                <div className="xl:col-span-5 dashboard-panel-base p-4 flex flex-col">
                    <h3 className="text-xl font-bold text-Text dark:text-Dark_Text mb-6">Service Pricing</h3>
                    <div className="flex flex-col gap-4">

                        {/* Models Price Group */}
                        <div className="dashboard-price-group-box">
                            <div className="flex items-center gap-2 mb-4 text-Text dark:text-Dark_Text">
                                <Box size={24} strokeWidth={2} />
                                <span className="text-lg font-bold">Model Costs</span>
                            </div>

                            <div className="space-y-4">
                                {Object.entries(PRICING_CONFIG.models).map(([name, price], idx) => (
                                    <div key={idx} className="dashboard-price-row">
                                        <div className="flex items-center gap-3">
                                            {name.includes('Pro') ? <Crown size={24} className="text-purple-500"/> : <Zap size={24} className="text-blue-500"/>}
                                            <span className="text-base text-Text dark:text-white font-medium">{name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-black bg-power dark:bg-Dark_power px-5 py-2 rounded-lg shadow-sm">
                                            {price} Token
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image Type Price Group */}
                        <div className="dashboard-price-group-box">
                            <div className="flex items-center gap-2 mb-4 text-Text dark:text-Dark_Text">
                                <ImageIcon size={24} strokeWidth={2} />
                                <span className="text-lg font-bold">Image Types</span>
                            </div>
                            <div className="space-y-4">
                                {Object.entries(PRICING_CONFIG.inputs).map(([name, price], idx) => (
                                    <div key={idx} className="dashboard-price-row">
                                        <div className="flex items-center gap-3">
                                            {name.includes('360') ? <Globe size={24} className="text-green-500"/> : <ImageIcon size={24} className="text-orange-500"/>}
                                            <span className="text-base text-Text dark:text-white font-medium capitalize">{name.replace('_', ' ')}</span>
                                        </div>
                                        <span className="text-sm font-bold text-black bg-power dark:bg-Dark_power px-5 py-2 rounded-lg shadow-sm">
                                            {price} Token
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

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