'use client';

import React, { useState } from 'react';
import { CircleX, CloudUpload , Calculator, Loader2, CircleArrowDown , Crown, Zap, Globe, Image as ImageIcon, Coins } from 'lucide-react';
import { PRICING_CONFIG } from '@/lib/constants';

interface ProjectUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'add';
}

type ModelKey = keyof typeof PRICING_CONFIG.models;
type InputKey = keyof typeof PRICING_CONFIG.inputs;

const ProjectUploadModal = ({ isOpen, onClose, mode }: ProjectUploadModalProps) => {
    // 1. Form State
    const [title, setTitle] = useState('');
    const [selectedModel, setSelectedModel] = useState<ModelKey>('ProTypeModel');
    const [selectedInput, setSelectedInput] = useState<InputKey>('normal');

    // 2. File State
    const [files, setFiles] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showBreakdown, setShowBreakdown] = useState(false);

    // 3. Calculation Logic
    const modelPrice = PRICING_CONFIG.models[selectedModel];
    const inputPrice = PRICING_CONFIG.inputs[selectedInput];
    const pricePerImage = modelPrice + inputPrice;
    const totalCost = files.length * pricePerImage;

    const handleCloseInternal = () => {
        setFiles([]);
        setTitle('');
        setIsUploading(false);
        setShowBreakdown(false);
        setSelectedModel('ProTypeModel');
        setSelectedInput('normal');
        onClose();
    };

    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedModel(e.target.value as ModelKey);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedInput(e.target.value as InputKey);
    };

    const handleFileSimulate = () => {
        const newFiles = [
            `image_scan_${files.length + 1}.jpg`,
            `image_scan_${files.length + 2}.jpg`,
            `image_scan_${files.length + 3}.jpg`
        ];
        setFiles([...files, ...newFiles]);
        if (files.length === 0 && mode === 'create') setShowBreakdown(true);
    };

    const handleConfirm = () => {
        setIsUploading(true);
        setTimeout(() => {
            handleCloseInternal();
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto overflow-x-hidden">

            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleCloseInternal} />

            <div className="relative z-10 flex flex-col-reverse xl:flex-row items-center xl:items-start justify-center gap-4 transition-all duration-300 ease-in-out w-full my-auto">

                {/* 1. PRICE BREAKDOWN CARD (Only show in Create Mode) */}
                {showBreakdown && mode === 'create' && (
                    <div className="
                        w-full max-w-2xl xl:w-72
                        bg-Main_BG dark:bg-Dark_Main_BG backdrop-blur-xl border-2 border-BG_light dark:border-Dark_BG_light rounded-xl shadow-2xl p-4
                        animate-in slide-in-from-top-4 xl:slide-in-from-right-8 fade-in duration-300
                        shrink-0
                    ">
                        <div className="flex justify-between items-center mb-4 md:mb-5">
                            <h4 className="text-base md:text-lg font-medium text-Text dark:text-Dark_Text">Price Breakdown</h4>
                            <button onClick={() => setShowBreakdown(false)} className="cursor-pointer text-Text dark:text-Dark_Text hover:text-power dark:hover:text-Dark_power transition-colors">
                                <CircleX size={18} />
                            </button>
                        </div>

                        <div className="space-y-3 md:space-y-4 text-xs">
                            <hr className="h-px text-white/10 w-full" />
                            <div>
                                <p className="text-subtext dark:text-Dark_subtext mb-2 font-light">Unit Cost (per image)</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-Text dark:text-Dark_Text text-sm font-light">
                                        <div className="flex items-center gap-2">
                                            {selectedModel === 'ProTypeModel' ? <Crown size={14}/> : <Zap size={14}/>}
                                            <span className="truncate max-w-[120px]">{selectedModel}</span>
                                        </div>
                                        <span>{modelPrice} Token</span>
                                    </div>
                                    <div className="flex justify-between text-Text dark:text-Dark_Text text-sm font-light">
                                        <div className="flex items-center gap-2">
                                            {selectedInput === 'normal' ? <ImageIcon size={14}/> : <Globe size={14}/>}
                                            <span>{selectedInput}</span>
                                        </div>
                                        <span>{inputPrice} Token</span>
                                    </div>
                                </div>
                            </div>
                            <hr className="h-px text-white/10 w-full border-dashed" />
                            <div className="flex justify-between text-Text dark:text-Dark_Text font-light">
                                <span>Subtotal</span>
                                <span>{pricePerImage} Token / Image</span>
                            </div>
                            <hr className="h-px text-white/10 w-full" />
                            <div className="flex flex-col justify-between text-Text dark:text-Dark_Text">
                                <span className="text-subtext dark:text-Dark_subtext mb-1 font-light">Quantity</span>
                                <div className="flex justify-between">
                                    <span>x Image Amount</span>
                                    <span>{files.length || 0} Image</span>
                                </div>
                            </div>
                            <div className="h-px bg-white/10 w-full" />
                            <div>
                                <p className="text-subtext dark:text-Dark_subtext uppercase tracking-widest mb-2 font-light">Total Estimate</p>
                                <div className="flex items-center gap-3 text-power dark:text-Dark_power text-2xl md:text-3xl font-bold">
                                    <Coins size={28} className="md:w-[35px] md:h-[35px]" strokeWidth={2.5} />
                                    <span>{files.length > 0 ? totalCost : '???'} Tokens</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. MAIN MODAL CARD */}
                <div className="w-full max-w-2xl p-4 md:p-5 bg-Main_BG dark:bg-Dark_Main_BG border-2 border-BG_light dark:border-Dark_BG_light rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 shrink-0">

                    {/* Header */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl md:text-2xl font-medium text-Text dark:text-Dark_Text">
                                {mode === 'create' ? 'Create New Project' : 'Add Images To Project'}
                            </h2>
                            <button onClick={handleCloseInternal} className="cursor-pointer p-1 md:p-2 hover:bg-white/10 rounded-full transition-colors text-Text dark:text-Dark_Text">
                                <CircleX size={24} />
                            </button>
                        </div>
                        {/* Sub-text for ADD mode */}
                        {mode === 'add' && (
                            <p className="text-xs text-subtext dark:text-zinc-500">
                                Settings : {selectedModel},{selectedInput}
                            </p>
                        )}
                    </div>

                    {/* Form Content */}
                    <div className="mt-4 flex flex-col gap-3 md:gap-5">

                        {/* CREATE MODE: Inputs */}
                        {mode === 'create' && (
                            <>
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        placeholder="Project Title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="input-primary text-sm md:text-base py-2 md:py-3"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <div className="relative">
                                        <select
                                            value={selectedModel}
                                            onChange={handleModelChange}
                                            className="input-primary appearance-none cursor-pointer pr-8 md:pr-10 text-xs md:text-sm py-2 md:py-3"
                                        >
                                            <option value="ProTypeModel">ProTypeModel</option>
                                            <option value="FastTypeModel">FastTypeModel</option>
                                        </select>
                                        <CircleArrowDown className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-subtext pointer-events-none" size={16} />
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={selectedInput}
                                            onChange={handleInputChange}
                                            className="input-primary appearance-none cursor-pointer pr-8 md:pr-10 text-xs md:text-sm py-2 md:py-3"
                                        >
                                            <option value="normal">Normal Image</option>
                                            <option value="360_degree">360 Degree</option>
                                        </select>
                                        <CircleArrowDown className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-subtext pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Upload Zone */}
                        <div
                            onClick={handleFileSimulate}
                            className="bg-BG_dark dark:bg-Dark_BG_dark group cursor-pointer h-36 md:h-48 border-2 border-dashed border-black/10 dark:border-white/10 hover:border-power dark:hover:border-Dark_power rounded-2xl flex flex-col items-center justify-center gap-2 md:gap-3 transition-all"
                        >
                            <div className="size-14 md:size-18 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CloudUpload size={28} className="md:w-[35px] md:h-[35px] text-subtext dark:text-zinc-400 group-hover:text-power dark:group-hover:text-Dark_power" />
                            </div>
                            <div className="text-center select-none">
                                <h3 className="text-lg md:text-2xl font-bold text-Text dark:text-Dark_Text">Upload Your Image here!</h3>
                                <p className="text-[10px] md:text-xs text-subtext dark:text-zinc-500 mt-1">JPG, PNG (Max 10MB)</p>
                            </div>
                        </div>

                        {/* Progress Bars */}
                        {files.length > 0 && (
                            <div className="w-full bg-BG_dark dark:bg-Dark_BG_dark py-2 md:py-3 px-2 rounded-xl border border-white/10 max-h-28 md:max-h-32 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 md:gap-3 text-[10px] bg-black/5 dark:bg-white/5 p-2 px-3 rounded-lg">
                                        <span className="flex-1 truncate text-Text dark:text-Dark_Text font-mono opacity-70">{file} (520 KB)</span>
                                        <div className="w-16 md:w-24 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 w-[90%] rounded-full" />
                                        </div>
                                        <button className="cursor-pointer text-subtext hover:text-red-500"><CircleX size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ============================================= */}
                    {/* FOOTER AREA (Conditional based on mode)       */}
                    {/* ============================================= */}

                    {/* MODE: CREATE (Standard Layout) */}
                    {mode === 'create' && (
                        <div className="mt-4 flex items-center justify-between gap-3 md:gap-4">
                            <div className="flex-1 bg-BG_dark dark:bg-Dark_BG_dark text-xs md:text-sm text-Text dark:text-Dark_Text py-2 px-3 md:px-4 rounded-xl border border-white/10 flex justify-between items-center">
                                <span className="text-xs md:text-sm text-Text dark:text-Dark_Text">
                                    Total: <span className="text-power dark:text-Dark_power text-base md:text-xl font-bold">{files.length > 0 ? totalCost : '0'}</span>
                                </span>
                                <button
                                    onClick={() => setShowBreakdown(!showBreakdown)}
                                    className={`cursor-pointer p-1.5 md:p-2 rounded-full border transition-colors ${showBreakdown ? 'bg-power/20 border-power text-power' : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-Text dark:text-Dark_Text'}`}
                                >
                                    <Calculator size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>
                            </div>
                            <button
                                onClick={handleConfirm}
                                disabled={files.length === 0 || isUploading}
                                className={`cursor-pointer px-6 md:px-8 py-2 rounded-xl text-lg md:text-2xl font-bold text-black transition-all flex items-center gap-2 shadow-lg ${files.length > 0 && !isUploading ? 'bg-power dark:bg-Dark_power hover:scale-105 shadow-power/20' : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'}`}
                            >
                                {isUploading ? <Loader2 size={18} className="animate-spin" /> : 'CONFIRM'}
                            </button>
                        </div>
                    )}

                    {/* MODE: ADD (Summary Check Layout) */}
                    {mode === 'add' && (
                        <div className="mt-4 flex flex-col gap-2">
                            <div className="text-sm font-bold text-white">Summary Check</div>
                            <div className="text-xs text-zinc-400">
                                Adding {files.length} Images at {pricePerImage} Token/Image
                            </div>

                            <div className="flex items-center gap-2 mt-1 mb-2">
                                <span className="text-xl md:text-2xl font-bold text-white">Total New Cost :</span>
                                <span className="text-xl md:text-2xl font-bold text-power dark:text-Dark_power">
                                    {files.length > 0 ? totalCost : '??'} Tokens
                                </span>
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={files.length === 0 || isUploading}
                                className={`
                                    w-full cursor-pointer py-3 rounded-xl text-lg md:text-xl font-bold text-black transition-all flex justify-center items-center gap-2 shadow-lg
                                    ${files.length > 0 && !isUploading
                                        ? 'bg-power dark:bg-Dark_power hover:scale-105 shadow-power/20' 
                                        : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                                    }
                                `}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <span>Upload & Pay {files.length > 0 ? totalCost : '??'} Tokens</span>
                                )}
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProjectUploadModal;