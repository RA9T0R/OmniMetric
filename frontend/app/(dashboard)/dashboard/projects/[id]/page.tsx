'use client';

import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    Trash2,
    Plus,
    Search,
    ChevronRight,
    Layers,
    Play,
    Pause,
    Pointer,
    User,
    Scan
} from 'lucide-react';
import { DUMMY_PROJECT_DETAIL } from '@/lib/constants';
import Link from 'next/link';
import ProjectUploadModal from '@/components/ProjectUploadModal';

const ProjectDetailPage = ({ params }: { params: { id: string } }) => {
    // 1. State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [viewMode, setViewMode] = useState<'normal' | 'depth'>('normal');
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [manualPage, setManualPage] = useState(1);

    // Get Data
    const project = DUMMY_PROJECT_DETAIL;
    const currentImage = project.images[currentImageIndex];
    const detectedObjects = currentImage.objects;

    // Effect: Sync manual page input when index changes
    useEffect(() => {
        setManualPage(currentImageIndex + 1);
        if (currentImage.objects.length > 0) {
            setSelectedObjectId(currentImage.objects[0].id);
        } else {
            setSelectedObjectId(null);
        }
    }, [currentImageIndex, currentImage]);

    // Effect: Auto-Run Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, project.images.length]);

    // Handlers
    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? project.images.length - 1 : prev - 1));
    };

    const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setManualPage(val);
        if (!isNaN(val) && val >= 1 && val <= project.images.length) {
            setCurrentImageIndex(val - 1);
        }
    };

    return (
        <div className="w-full flex flex-col gap-4 lg:gap-6 xl:max-w-9/10 mx-auto pb-4 lg:pb-0 h-auto lg:h-[calc(100vh-110px)]">

            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                         <Link href="/dashboard/projects" className="md:hidden text-subtext hover:text-white transition-colors">
                            <ChevronLeft size={24} />
                         </Link>
                         <h1 className="text-3xl md:text-4xl font-bold text-Text dark:text-Dark_Text">{project.title}</h1>
                    </div>
                    <p className="text-xs font-light text-subtext dark:text-Dark_subtext md:ml-0 ml-8">
                        {project.description}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="btn-primary-action px-4 py-3 bg-secondary dark:bg-Dark_secondary text-black flex items-center gap-2"
                    >
                        <Plus size={18} />
                        <span>Add Image</span>
                    </button>
                    <button className="btn-primary-action px-4 py-3 bg-red-500 dark:bg-red-600 text-white flex items-center gap-2">
                        <Trash2 size={18} />
                        <span>Delete Project</span>
                    </button>
                </div>
            </div>

            {/* 2. Main Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-14 gap-6 min-h-0">

                {/* LEFT: IMAGE VIEWER CONTAINER (Span 9) */}
                <div className="lg:col-span-11 flex flex-col overflow-hidden gap-4">

                    <div className="relative rounded-xl border-2 border-BG_light dark:border-Dark_BG_light h-[500px] lg:h-auto lg:flex-1 overflow-hidden flex items-center justify-center bg-zinc-900">
                        <div className="relative w-full h-full">
                            {/* Image */}
                            <div className={`w-full h-full ${viewMode === 'normal' ? 'bg-zinc-800' : 'bg-zinc-900'} flex items-center justify-center text-zinc-600`}>
                                <img
                                    src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop"
                                    alt="Project View"
                                    className={`w-full h-full object-cover transition-opacity duration-500 ${viewMode === 'depth' ? 'opacity-30 grayscale invert' : 'opacity-100'}`}
                                />
                            </div>

                            {/* Bounding Box (Single Selection) */}
                            {viewMode === 'normal' && detectedObjects.map((obj) => {
                                if (obj.id !== selectedObjectId) return null;
                                return (
                                    <div
                                        key={obj.id}
                                        className="absolute border-2 border-primary bg-primary/10 z-20 shadow-[0_0_15px_rgba(255,193,7,0.5)] transition-all duration-200"
                                        style={{
                                            top: `${obj.box.top}%`,
                                            left: `${obj.box.left}%`,
                                            width: `${obj.box.width}%`,
                                            height: `${obj.box.height}%`
                                        }}
                                    >
                                        <div className="absolute -top-7 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-bold shadow-sm">
                                            {obj.distance}m
                                        </div>
                                    </div>
                                );
                            })}

                            {/* OVERLAY CONTROLS (Only Toggles & Hand) */}
                            <div className="absolute bottom-4 left-4 flex items-center gap-2 z-30">
                                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
                                    <button
                                        onClick={() => setViewMode('normal')}
                                        className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'normal' ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
                                    >
                                        Normal
                                    </button>
                                    <button
                                        onClick={() => setViewMode('depth')}
                                        className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'depth' ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
                                    >
                                        Depth Map
                                    </button>
                                </div>
                                <button className="cursor-pointer p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all">
                                    <Pointer size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* B. BOTTOM CONTROL BAR (Outside Image) */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 shrink-0">

                        {/* Row 1: Search & Navigation */}
                        <div className="flex flex-col justify-between gap-2">
                            {/* Left: Search */}
                            <div className="relative max-w-96">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtext dark:text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search object..."
                                    className="w-full bg-BG_light dark:bg-black/20 border border-BG_light dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-Text dark:text-Dark_Text focus:outline-none focus:ring-1 focus:ring-power dark:focus:ring-Dark_power transition-all"
                                />
                            </div>

                            {/* Row 2: Info Text */}
                            <div className="text-xs text-subtext dark:text-zinc-500 font-mono flex items-center gap-2">
                                <span>Model Type : <span className="text-Text dark:text-zinc-300 font-bold">{project.modelType}</span></span>
                                <span className="w-px h-3 bg-zinc-700"></span>
                                <span>Image Type : <span className="text-Text dark:text-zinc-300 font-bold">{project.imageType}</span></span>
                            </div>
                        </div>

                        {/* Right: Auto Run & Pagination */}
                        <div className="flex justify-center items-center gap-3 py-1 md:p-3 bg-Main_BG dark:bg-Dark_Main_BG rounded-xl border border-BG_light dark:border-Dark_BG_light h-fit">
                            {/* Auto Run */}
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className={`cursor-pointer size-10 rounded-xl flex items-center justify-center border transition-all ${isPlaying ? 'bg-power text-black border-power' : 'bg-BG_light dark:bg-black/20 border-BG_light dark:border-white/10 text-Text dark:text-Dark_Text hover:bg-black/5 dark:hover:bg-white/5'}`}
                                title="Auto Run"
                            >
                                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                            </button>

                            {/* Pagination Control */}
                            <div className="h-10 flex items-center gap-1 bg-BG_light dark:bg-black/20 px-2 rounded-xl border border-BG_light dark:border-white/10">
                                <button onClick={handlePrevImage} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-subtext dark:text-zinc-400 transition-colors">
                                    <ChevronLeft size={18} />
                                </button>

                                <div className="flex items-center text-sm font-bold text-Text dark:text-Dark_Text px-2 gap-1">
                                    <input
                                        type="number"
                                        min={1}
                                        max={project.images.length}
                                        value={manualPage}
                                        onChange={handlePageInput}
                                        className="w-8 bg-transparent text-center focus:outline-none appearance-none hover:text-power transition-colors"
                                    />
                                    <span className="opacity-40 font-normal">/ {project.images.length}</span>
                                </div>

                                <button onClick={handleNextImage} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-subtext dark:text-zinc-400 transition-colors">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: OBJECT SIDEBAR (Span 3) */}
                <div className="lg:col-span-3 bg-Main_BG dark:bg-Dark_Main_BG rounded-xl border-2 border-BG_light dark:border-Dark_BG_light p-6 flex flex-col h-[500px] lg:h-full overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 shrink-0">
                        <div>
                            <h3 className="text-xl font-bold text-Text dark:text-Dark_Text">Object Detected</h3>
                            <p className="text-sm text-subtext dark:text-zinc-500 mt-1">Found {detectedObjects.length} object</p>
                        </div>
                        <Layers size={20} className="text-subtext dark:text-zinc-600" />
                    </div>

                    {/* Object List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-3">
                        {detectedObjects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-zinc-500 gap-2">
                                <Scan size={32} opacity={0.5} />
                                <span className="text-xs">No objects detected</span>
                            </div>
                        ) : (
                            detectedObjects.map((obj) => {
                                const isSelected = selectedObjectId === obj.id;
                                return (
                                    <div
                                        key={obj.id}
                                        onClick={() => setSelectedObjectId(obj.id)}
                                        className={`
                                            relative p-4 rounded-2xl border transition-all cursor-pointer
                                            ${isSelected 
                                                ? 'bg-BG_light dark:bg-Dark_BG_light border-primary dark:border-Dark_primary' 
                                                : 'bg-transparent border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        <div className="flex justify-between items-start">

                                            {/* Left: Icon & Info */}
                                            <div className="flex gap-3">
                                                <div className={`mt-0.5 ${isSelected ? 'text-Text dark:text-white' : 'text-subtext dark:text-zinc-500'}`}>
                                                    <User size={18} />
                                                </div>

                                                <div>
                                                    <p className={`text-sm font-bold mb-1 ${isSelected ? 'text-Text dark:text-white' : 'text-subtext dark:text-zinc-400'}`}>
                                                        {obj.label}
                                                    </p>
                                                    <p className={`text-[10px] font-medium ${obj.confidence > 90 ? 'text-green-600 dark:text-green-500' : 'text-yellow-600 dark:text-yellow-500'}`}>
                                                        {obj.confidence}% Confidence
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right: Distance */}
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-secondary dark:text-Dark_secondary">{obj.distance}m</p>
                                                <p className="text-[10px] text-subtext dark:text-zinc-600">Distance</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

            </div>

            <ProjectUploadModal 
                isOpen={isUploadModalOpen} 
                onClose={() => setIsUploadModalOpen(false)} 
                mode="add"
            />
        </div>
    );
};

export default ProjectDetailPage;