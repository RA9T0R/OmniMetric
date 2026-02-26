'use client';

import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, Trash2, Plus, Search, ChevronRight, Layers, Play, Pause, Pointer, User, Scan, Loader2, MapPin
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import ProjectUploadModal from '@/components/ProjectUploadModal';
import NormalImageViewer from '@/components/viewers/NormalImageViewer';
import PanoramaImageViewer from '@/components/viewers/PanoramaImageViewer';
import SelectionPopup from '@/components/SelectionPopup';
import MeasurementResultPopup from '@/components/MeasurementResultPopup';

import { useProjectDetail } from '@/hooks/useProjectDetail';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';

import { PixelSelectionData } from '@/types/type';

const ProjectDetailPage = () => {
    // 1. เรียกใช้ Hook
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const { project, projectScenes, isLoading, error, refreshProject, measurePoint } = useProjectDetail(id);
    const { deleteProject } = useProjects();
    const { refreshUser } = useAuth();

    // 2. States
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [viewMode, setViewMode] = useState<'normal' | 'depth'>('normal');
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [manualPage, setManualPage] = useState(1);
    const [isPointerActive, setIsPointerActive] = useState(false);

    const [selectionData, setSelectionData] = useState<PixelSelectionData | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const [resultData, setResultData] = useState<{distance: number, unit: string, x: number, y: number} | null>(null);
    const [isResultPopupOpen, setIsResultPopupOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [isMeasuring, setIsMeasuring] = useState(false);

    const [selectedScene, setSelectedScene] = useState<string | null>(null);

    // 3. Computed Values
    const displayedImages = project?.images.filter(img =>
        selectedScene ? img.sceneLabel === selectedScene : true
    ) || [];

    const safeImageIndex = Math.min(currentImageIndex, Math.max(0, displayedImages.length - 1));
    const currentImage = displayedImages[safeImageIndex];

    const detectedObjects = currentImage?.objects || [];

    const filteredObjects = detectedObjects.filter(obj =>
        obj.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (manualPage !== safeImageIndex + 1) {
            setManualPage(safeImageIndex + 1);
        }

        if (currentImageIndex >= displayedImages.length && displayedImages.length > 0) {
            setCurrentImageIndex(0);
        }

        setSelectedObjectId(null);
        setSearchTerm('');
        setIsPopupOpen(false);
        setSelectionData(null);
        setIsResultPopupOpen(false);
        setResultData(null);

    }, [safeImageIndex, selectedScene, displayedImages.length]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && displayedImages.length > 0) {
            interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % displayedImages.length);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, displayedImages.length]);

    const handleDelete = async () => {
        const confirmed = window.confirm(`Are you sure you want to delete project "${project?.title}"? This action cannot be undone.`);
        if (confirmed) {
            try {
                await deleteProject(id);
                router.push('/dashboard/projects');
            } catch (err) {
                alert("Failed to delete project");
            }
        }
    };

    const handleObjectToggle = (objectId: string) => {
        if (selectedObjectId === objectId) {
            setSelectedObjectId(null);
        } else {
            setSelectedObjectId(objectId);
        }
    };

    const handleNextImage = () => { if (displayedImages.length === 0) return; setCurrentImageIndex((prev) => (prev + 1) % displayedImages.length); };
    const handlePrevImage = () => { if (displayedImages.length === 0) return; setCurrentImageIndex((prev) => (prev === 0 ? displayedImages.length - 1 : prev - 1)); };

    const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setManualPage(val);
        if (displayedImages.length > 0 && !isNaN(val) && val >= 1 && val <= displayedImages.length) {
            setCurrentImageIndex(val - 1);
        }
    };

    const handlePixelSelect = (data: PixelSelectionData) => {
        setSelectionData(data);
        setIsPopupOpen(true);
    };

    const handleProcessAI = async () => {
        if (!selectionData || !currentImage) return;

        setIsMeasuring(true);
        setIsPopupOpen(false);

        try {
            const result = await measurePoint({
                image_id: currentImage.id,
                x: selectionData.x,
                y: selectionData.y,
            });

            if (result) {
                setResultData({
                    distance: result.distance,
                    unit: result.unit,
                    x: selectionData.x,
                    y: selectionData.y
                });
                setIsResultPopupOpen(true);
                if(currentImage.type === '360_degree') {
                    await refreshUser();
                }
            }

        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message || "Failed to measure distance"}`);
        } finally {
            setIsMeasuring(false);
            setIsPointerActive(false);
            setSelectionData(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-subtext gap-4">
                <Loader2 className="animate-spin" size={48} />
                <p>Loading Project Details...</p>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-subtext gap-4">
                <Layers size={64} className="text-zinc-600" />
                <h2 className="text-xl font-bold text-Text dark:text-Dark_Text">Project Not Found</h2>
                <Link href="/dashboard/projects" className="text-power hover:underline">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-4 lg:gap-6 xl:max-w-9/10 mx-auto pb-4 lg:pb-0 h-auto lg:h-[calc(100vh-110px)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                         <Link href="/dashboard/projects" className="md:hidden text-subtext hover:text-white transition-colors"><ChevronLeft size={24} /></Link>
                         <h1 className="text-3xl md:text-4xl font-bold text-Text dark:text-Dark_Text">{project.title}</h1>
                    </div>
                    <p className="text-xs font-light text-subtext dark:text-Dark_subtext md:ml-0 ml-8">{project.description}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsUploadModalOpen(true)} className="btn-primary-action px-4 py-3 bg-secondary dark:bg-Dark_secondary text-black flex items-center gap-2"><Plus size={18} /><span>Add Image</span></button>
                    <button onClick={handleDelete} className="btn-primary-action px-4 py-3 bg-red-500 dark:bg-red-600 text-white flex items-center gap-2"><Trash2 size={18} /><span>Delete Project</span></button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-14 gap-6 min-h-0">
                {/* LEFT: IMAGE VIEWER */}
                <div className="lg:col-span-11 flex flex-col overflow-hidden gap-4">
                    <div className="relative rounded-xl border-2 border-BG_light dark:border-Dark_BG_light h-[500px] lg:h-auto lg:flex-1 overflow-hidden flex items-center justify-center bg-zinc-900">
                        {displayedImages.length > 0 && currentImage ? (
                            <>
                                {currentImage.type === '360_degree' ? (
                                    <PanoramaImageViewer
                                        url={currentImage.url}
                                        depthUrl={currentImage.depthUrl ?? undefined}
                                        viewMode={viewMode}
                                        isPointerActive={isPointerActive}
                                        objects={detectedObjects}
                                        selectedObjectId={selectedObjectId}
                                        onObjectClick={handleObjectToggle}
                                        onPixelSelect={handlePixelSelect}
                                    />
                                ) : (
                                    <NormalImageViewer
                                        url={currentImage.url}
                                        depthUrl={currentImage.depthUrl ?? undefined}
                                        viewMode={viewMode}
                                        objects={detectedObjects}
                                        selectedObjectId={selectedObjectId}
                                        isPointerActive={isPointerActive}
                                        onObjectClick={handleObjectToggle}
                                        onPixelSelect={handlePixelSelect}
                                    />
                                )}

                                {/* Controls Overlay */}
                                <div className="absolute bottom-4 left-4 flex items-center gap-2 z-30">
                                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
                                        <button onClick={() => setViewMode('normal')} className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'normal' ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}>Normal</button>
                                        <button onClick={() => setViewMode('depth')} className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'depth' ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}>Depth Map</button>
                                    </div>
                                    <button onClick={() => setIsPointerActive(!isPointerActive)} className={`cursor-pointer p-2 rounded-xl backdrop-blur-md border border-white/10 transition-all ${isPointerActive ? 'bg-power text-black' : 'bg-black/60 text-white hover:bg-white/20'}`} title="AI Pointer">
                                        <Pointer size={18} />
                                    </button>
                                </div>

                                {/* Scene Label Badge (Optional: เพื่อบอกว่ารูปนี้คืออะไร) */}
                                {currentImage.sceneLabel && (
                                    <div className="absolute top-4 left-4 z-30 animate-in fade-in zoom-in">
                                         <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
                                            <MapPin size={12} className="text-power" />
                                            <span className="text-xs font-bold text-white capitalize">{currentImage.sceneLabel}</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center text-subtext">
                                <Scan size={48} className="mx-auto mb-2 opacity-50"/>
                                <p>{selectedScene ? `No images found in "${selectedScene}"` : "No images in this project."}</p>
                                <button onClick={() => setIsUploadModalOpen(true)} className="text-power hover:underline mt-2">Upload Now</button>
                            </div>
                        )}

                        <SelectionPopup
                            isOpen={isPopupOpen}
                            onClose={() => setIsPopupOpen(false)}
                            onProcess={handleProcessAI}
                            type={currentImage.type}
                            data={selectionData}
                        />

                        <MeasurementResultPopup
                            isOpen={isResultPopupOpen}
                            onClose={() => setIsResultPopupOpen(false)}
                            data={resultData}
                        />

                        {isMeasuring && (
                            <div className="absolute inset-0 bg-black/50 z-50 flex flex-col items-center justify-center gap-2 backdrop-blur-sm animate-in fade-in">
                                <Loader2 className="animate-spin text-power" size={32} />
                                <span className="text-white font-bold text-sm tracking-wider">Measuring...</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">

                        <div className="flex flex-col justify-between gap-2 flex-1 min-w-0 w-full md:w-auto">
                            <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3">
                                <div className="relative w-full lg:w-80 xl:w-96 shrink-0">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtext dark:text-zinc-500" />
                                    <input
                                        type="text"
                                        placeholder="Search object..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-BG_light dark:bg-black/20 border border-BG_light dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-Text dark:text-Dark_Text focus:outline-none focus:ring-1 focus:ring-power dark:focus:ring-Dark_power transition-all"
                                    />
                                </div>

                                {projectScenes && projectScenes.length > 0 && (
                                    <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar min-w-0 max-w-full">

                                        {/* Divider (Show only on Desktop) */}
                                        <div className="bg-black/10 dark:bg-white/10 mx-1 shrink-0 hidden xl:block"></div>

                                        <button
                                            onClick={() => { setSelectedScene(null); setCurrentImageIndex(0); }}
                                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border whitespace-nowrap shrink-0 ${
                                                selectedScene === null
                                                    ? 'bg-power text-black border-power'
                                                    : 'bg-transparent text-subtext dark:text-zinc-500 border-transparent hover:bg-black/5 dark:hover:bg-white/5 hover:text-Text dark:hover:text-zinc-300'
                                            }`}
                                        >
                                            All ({project.images.length})
                                        </button>

                                        {projectScenes.map((scene) => (
                                            <button
                                                key={scene.label}
                                                onClick={() => { setSelectedScene(scene.label); setCurrentImageIndex(0); }}
                                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border whitespace-nowrap shrink-0 ${
                                                    selectedScene === scene.label
                                                        ? 'bg-power text-black border-power'
                                                        : 'bg-transparent text-subtext dark:text-zinc-500 border-transparent hover:bg-black/5 dark:hover:bg-white/5 hover:text-Text dark:hover:text-zinc-300'
                                                }`}
                                            >
                                                {scene.label} ({scene.count})
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="text-xs text-subtext dark:text-zinc-500 font-mono flex items-center gap-2">
                                <span>Model : <span className="text-Text dark:text-zinc-300 font-bold">{project.modelType}</span></span>
                                <span className="w-px h-3 bg-zinc-700"></span>
                                <span>Type : <span className="text-Text dark:text-zinc-300 font-bold">{project.imageType}</span></span>
                            </div>
                        </div>

                        {/* Pagination (Fixed Right) */}
                        {displayedImages.length > 0 && (
                            <div className="w-full md:w-auto flex justify-center items-center gap-3 py-1 md:p-3 bg-Main_BG dark:bg-Dark_Main_BG rounded-xl border border-BG_light dark:border-Dark_BG_light h-fit shrink-0">
                                <button onClick={() => setIsPlaying(!isPlaying)} className={`cursor-pointer size-10 rounded-xl flex items-center justify-center border transition-all ${isPlaying ? 'bg-power text-black border-power' : 'bg-BG_light dark:bg-black/20 border-BG_light dark:border-white/10 text-Text dark:text-Dark_Text'}`}>
                                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                                </button>
                                <div className="h-10 flex items-center gap-1 bg-BG_light dark:bg-black/20 px-2 rounded-xl border border-BG_light dark:border-white/10">
                                    <button onClick={handlePrevImage} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-subtext dark:text-zinc-400"><ChevronLeft size={18} /></button>
                                    <div className="flex items-center text-sm font-bold text-Text dark:text-Dark_Text px-2 gap-1">
                                        <input type="number" min={1} max={displayedImages.length} value={manualPage} onChange={handlePageInput} className="w-8 bg-transparent text-center focus:outline-none appearance-none hover:text-power transition-colors" />
                                        <span className="opacity-40 font-normal">/ {displayedImages.length}</span>
                                    </div>
                                    <button onClick={handleNextImage} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-subtext dark:text-zinc-400"><ChevronRight size={18} /></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: OBJECT SIDEBAR (คงเดิม 100% ตามคำขอ) */}
                <div className="lg:col-span-3 bg-Main_BG dark:bg-Dark_Main_BG rounded-xl border-2 border-BG_light dark:border-Dark_BG_light p-6 flex flex-col h-[500px] lg:h-full overflow-hidden">
                    <div className="flex items-center justify-between mb-6 shrink-0">
                        <div>
                            <h3 className="text-xl font-bold text-Text dark:text-Dark_Text">Object Detected</h3>
                            <p className="text-sm text-subtext dark:text-zinc-500 mt-1">Found {filteredObjects.length} object</p>
                        </div>
                        <Layers size={20} className="text-subtext dark:text-zinc-600" />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-3">
                        {filteredObjects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-zinc-500 gap-2"><Scan size={32} opacity={0.5} /><span className="text-xs">{detectedObjects.length > 0 ? "No result found" : "No objects detected (Run AI first)"}</span></div>
                        ) : (
                            filteredObjects.map((obj) => {
                                const isSelected = selectedObjectId === obj.id;
                                return (
                                    <div key={obj.id} onClick={() => handleObjectToggle(obj.id)} className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'bg-BG_light dark:bg-Dark_BG_light border-primary dark:border-Dark_primary' : 'bg-transparent border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                <div className={`mt-0.5 ${isSelected ? 'text-Text dark:text-white' : 'text-subtext dark:text-zinc-500'}`}><User size={18} /></div>
                                                <div><p className={`text-sm font-bold mb-1 ${isSelected ? 'text-Text dark:text-white' : 'text-subtext dark:text-zinc-400'}`}>{obj.label}</p><p className={`text-[10px] font-medium ${obj.confidence > 90 ? 'text-green-600 dark:text-green-500' : 'text-yellow-600 dark:text-yellow-500'}`}>{obj.confidence}% Confidence</p></div>
                                            </div>
                                            <div className="text-right"><p className="text-xs font-bold text-secondary dark:text-Dark_secondary">{obj.distance}m</p><p className="text-[10px] text-subtext dark:text-zinc-600">Distance</p></div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <ProjectUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} mode="add" projectId={id} onSuccess={refreshProject} currentInputType={project.inputType} currentModel={project.modelType} />
        </div>
    );
};

export default ProjectDetailPage;