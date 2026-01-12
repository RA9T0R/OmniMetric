'use client';

import React from 'react';
import { Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface ProjectProps {
    data: {
        projectId: string;
        title: string;
        date: string;
        modelName: string;
        inputType: string;
        imageCount: number;
        status: string;
    };
}

const ProjectCard = ({ data }: ProjectProps) => {

    // 1. Determine State
    const isProcessing = data.status === 'Processing';
    const isFailed = data.status === 'Failed';
    const isCompleted = data.status === 'Completed';

    // 2. Base Card Content (The visual part)
    const CardContent = (
        <>
            {/* Image Thumbnail Section */}
            <div className="relative w-full h-40 bg-zinc-800 overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                {/* Placeholder for real image */}
                <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                    <ImageIcon size={48} strokeWidth={1} />
                </div>

                {/* OVERLAY: If Processing */}
                {isProcessing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-blue-400 z-10">
                        <Loader2 size={32} className="animate-spin mb-2" />
                        <span className="text-xs font-bold tracking-wider uppercase">Processing AI</span>
                    </div>
                )}

                {/* OVERLAY: If Failed */}
                {isFailed && (
                    <div className="absolute inset-0 bg-red-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-red-400 z-10">
                        <AlertCircle size={32} className="mb-2" />
                        <span className="text-xs font-bold tracking-wider uppercase">Scan Failed</span>
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="p-5 flex flex-col gap-4">

                {/* Row 1: Title & Date */}
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-Text dark:text-Dark_Text truncate max-w-[180px]">
                        {data.title}
                    </h3>
                    <span className="text-[10px] text-subtext dark:text-zinc-500 font-medium mt-1.5">
                        {data.date}
                    </span>
                </div>

                {/* Row 2: Details Grid */}
                <div className="grid grid-cols-3 gap-2 text-[10px] text-subtext dark:text-zinc-400">

                    {/* Model Type */}
                    <div className="flex flex-col gap-1">
                        <span className="uppercase tracking-wider font-bold opacity-50">Model Type</span>
                        <span className="truncate" title={data.modelName}>{data.modelName}</span>
                    </div>

                    {/* Image Type */}
                    <div className="flex flex-col gap-1 border-l border-white/10 pl-3">
                        <span className="uppercase tracking-wider font-bold opacity-50">Image Type</span>
                        <span className="truncate" title={data.inputType}>{data.inputType}</span>
                    </div>

                    {/* Count */}
                    <div className="flex flex-col gap-1 border-l border-white/10 pl-3">
                        <span className="uppercase tracking-wider font-bold opacity-50">Images</span>
                        <span>{data.imageCount}</span>
                    </div>
                </div>
            </div>
        </>
    );

    // 3. Logic Wrapper
    // If completed, wrap in Link. If not, just a Div (unclickable).
    if (isCompleted) {
        return (
            <Link href={`/dashboard/projects/${data.projectId}`} className="block">
                <div className="dashboard-panel-base overflow-hidden hover:border-power dark:hover:border-Dark_power transition-all cursor-pointer group relative">
                    {CardContent}
                </div>
            </Link>
        );
    }

    // Processing or Failed state (No Link)
    return (
        <div className={`dashboard-panel-base overflow-hidden transition-all relative ${isFailed ? 'border-red-500/30' : 'opacity-80 cursor-not-allowed'}`}>
            {CardContent}
        </div>
    );
};

export default ProjectCard;