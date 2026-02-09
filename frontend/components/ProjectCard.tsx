'use client';

import React from 'react';
import { Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useProjectDetail } from '@/hooks/useProjectDetail';

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
    const { project, isLoading: isProjectLoading } = useProjectDetail(data.projectId);

    const firstImage = project?.images?.[0];
    const thumbnailUrl = firstImage?.url;

    const isProcessing = data.status === 'Processing';
    const isFailed = data.status === 'Failed';
    const isCompleted = data.status === 'Completed';

    const CardContent = (
        <div className="flex flex-col h-full">
            <div className="relative w-full h-40 bg-zinc-800 overflow-hidden group-hover:brightness-110 transition-all duration-500">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={data.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-600 bg-zinc-800/50">
                        {isProjectLoading ? (
                            <Loader2 size={24} className="animate-spin opacity-50" />
                        ) : (
                            <ImageIcon size={48} strokeWidth={1} />
                        )}
                    </div>
                )}

                {isProcessing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-blue-400 z-10">
                        <Loader2 size={32} className="animate-spin mb-2" />
                        <span className="text-xs font-bold tracking-wider uppercase">Processing AI</span>
                    </div>
                )}

                {isFailed && (
                    <div className="absolute inset-0 bg-red-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-red-400 z-10">
                        <AlertCircle size={32} className="mb-2" />
                        <span className="text-xs font-bold tracking-wider uppercase">Scan Failed</span>
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col gap-4 flex-1 justify-between">

                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-Text dark:text-Dark_Text truncate max-w-[180px]">
                        {data.title}
                    </h3>
                    <span className="text-[10px] text-subtext dark:text-zinc-500 font-medium mt-1.5">
                        {data.date}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] text-subtext dark:text-zinc-400">

                    <div className="flex flex-col gap-1">
                        <span className="uppercase tracking-wider font-bold opacity-50">Model Type</span>
                        <span className="truncate" title={data.modelName}>{data.modelName}</span>
                    </div>

                    <div className="flex flex-col gap-1 border-l border-white/10 pl-3">
                        <span className="uppercase tracking-wider font-bold opacity-50">Image Type</span>
                        <span className="truncate" title={data.inputType}>{data.inputType}</span>
                    </div>

                    <div className="flex flex-col gap-1 border-l border-white/10 pl-3">
                        <span className="uppercase tracking-wider font-bold opacity-50">Images</span>
                        <span>{data.imageCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    if (isCompleted) {
        return (
            <Link href={`/dashboard/projects/${data.projectId}`} className="block h-full">
                <div className="dashboard-panel-base overflow-hidden hover:border-power dark:hover:border-Dark_power transition-all cursor-pointer group relative h-full">
                    {CardContent}
                </div>
            </Link>
        );
    }

    return (
        <div className={`dashboard-panel-base overflow-hidden transition-all relative h-full ${isFailed ? 'border-red-500/30' : 'opacity-80 cursor-not-allowed'}`}>
            {CardContent}
        </div>
    );
};

export default ProjectCard;