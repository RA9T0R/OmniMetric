'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    CheckCheck, CircleX, CloudUpload, Calculator, Loader2,
    CircleArrowDown, Crown, Zap, Globe, Image as ImageIcon,
    Coins, AlertCircle
} from 'lucide-react';
import { PRICING_CONFIG } from '@/lib/constants';
import { useProjects } from '@/hooks/useProjects';

interface ProjectUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'add';
    onSuccess?: () => void;
    projectId?: string;
    currentInputType?: string;
}

type ModelKey = keyof typeof PRICING_CONFIG.models;
type InputKey = keyof typeof PRICING_CONFIG.inputs;

interface FileWithStatus {
    id: string;
    file: File;
    isValid: boolean;
    error?: string;
}

const ProjectUploadModal = ({ isOpen, onClose, mode, onSuccess, projectId, currentInputType }: ProjectUploadModalProps) => {
    const { createProjectWithImages, addImagesToProject } = useProjects();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Form State
    const [title, setTitle] = useState('');
    const [selectedModel, setSelectedModel] = useState<ModelKey>('ProTypeModel');
    const [selectedInput, setSelectedInput] = useState<InputKey>('Normal');

    // 2. File State (เก็บแบบ Object เพื่อรู้สถานะ)
    const [files, setFiles] = useState<FileWithStatus[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [showBreakdown, setShowBreakdown] = useState(false);

    // 3. Calculation Logic
    const modelPrice = PRICING_CONFIG.models[selectedModel];
    const inputPrice = PRICING_CONFIG.inputs[selectedInput];
    const pricePerImage = modelPrice + inputPrice;

    // 4. Effect: Lock Input Type based on Mode
    useEffect(() => {
        if (isOpen && mode === 'add' && currentInputType) {
            if (currentInputType === '360_degree') {
                setSelectedInput('360_degree');
            } else {
                setSelectedInput('Normal');
            }
        } else if (isOpen && mode === 'create') {
            setSelectedInput('Normal');
            setSelectedModel('ProTypeModel');
            setTitle('');
            setFiles([]);
            setIsCompleted(false);
            setIsUploading(false);
        }
    }, [isOpen, mode, currentInputType]);

    const totalCost = files.length * pricePerImage;

    const hasInvalidFiles = files.some(f => !f.isValid);

    const handleCloseInternal = () => {
        setFiles([]);
        setTitle('');
        setIsUploading(false);
        setIsCompleted(false);
        setShowBreakdown(false);
        setSelectedModel('ProTypeModel');
        setSelectedInput('Normal');
        onClose();
    };

    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedModel(e.target.value as ModelKey);
    };

    // -------------------------------------------------------------
    // 🛠️ Logic การเช็คไฟล์
    // -------------------------------------------------------------
    const validateFile = (file: File, inputType: InputKey): Promise<FileWithStatus> => {
        return new Promise((resolve) => {
            const fileId = `${file.name}-${file.size}-${Date.now()}`;

            if (inputType === 'Normal') {
                resolve({ id: fileId, file, isValid: true });
                return;
            }

            const img = new Image();
            img.src = URL.createObjectURL(file);

            img.onload = () => {
                const ratio = img.width / img.height;
                URL.revokeObjectURL(img.src);

                const isValid = ratio >= 1.9 && ratio <= 2.1;
                resolve({
                    id: fileId,
                    file,
                    isValid,
                    error: isValid ? undefined : 'Invalid Aspect Ratio (Must be 2:1)'
                });
            };

            img.onerror = () => {
                resolve({ id: fileId, file, isValid: false, error: 'Invalid Image File' });
            };
        });
    };

    // เมื่อเปลี่ยน Input Type
    const handleInputChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newInput = e.target.value as InputKey;
        setSelectedInput(newInput);

        if (files.length > 0) {
            const revalidatedFiles = await Promise.all(
                files.map(async (item) => {
                    const result = await validateFile(item.file, newInput);
                    return { ...result, id: item.id };
                })
            );
            setFiles(revalidatedFiles);
        }
    };

    // เลือกไฟล์ใหม่
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newRawFiles = Array.from(e.target.files);

            const newValidatedFiles = await Promise.all(
                newRawFiles.map(file => validateFile(file, selectedInput))
            );

            setFiles(prev => [...prev, ...newValidatedFiles]);

            if (files.length === 0 && mode === 'create') setShowBreakdown(true);
        }
        if (e.target) e.target.value = '';
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleConfirm = async () => {
        if (mode === 'create' && !title) {
            alert("Please enter a project title");
            return;
        }
        if (files.length === 0) return;
        if (hasInvalidFiles) {
             alert("Please remove invalid files");
             return;
        }

        setIsUploading(true);

        try {
            const filesToSend = files.map(f => f.file);

            if (mode === 'create') {
                await createProjectWithImages(title, selectedModel, selectedInput, filesToSend);
            } else if (mode === 'add') {
                if (!projectId) {
                    throw new Error("Project ID is missing");
                }
                await addImagesToProject(projectId, filesToSend);
            }

            // Common Success Actions
            setIsUploading(false);
            setIsCompleted(true);

            if (onSuccess) onSuccess();

            setTimeout(() => {
                handleCloseInternal();
            }, 1500);

        } catch (error) {
            console.error(error);
            alert("Failed to process request.");
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto overflow-x-hidden">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleCloseInternal} />
            <div className="relative z-10 flex flex-col-reverse xl:flex-row items-center xl:items-start justify-center gap-4 transition-all duration-300 ease-in-out w-full my-auto">
                {/* 1. PRICE BREAKDOWN CARD (Create Mode Only) */}
                {showBreakdown && mode === 'create' && (
                    <div className="w-full max-w-2xl xl:w-72 bg-Main_BG dark:bg-Dark_Main_BG backdrop-blur-xl border-2 border-BG_light dark:border-Dark_BG_light rounded-xl shadow-2xl p-4 animate-in slide-in-from-top-4 xl:slide-in-from-right-8 fade-in duration-300 shrink-0">
                        <div className="flex justify-between items-center mb-4 md:mb-5">
                            <h4 className="text-base md:text-lg font-medium text-Text dark:text-Dark_Text">Price Breakdown</h4>
                            <button onClick={() => setShowBreakdown(false)} className="cursor-pointer text-Text dark:text-Dark_Text hover:text-power dark:hover:text-Dark_power transition-colors">
                                <CircleX size={18} />
                            </button>
                        </div>

                        <div className="space-y-3 md:space-y-4 text-xs">
                            <hr className="h-px text-subtext dark:text-Dark_subtext w-full" />
                            <div>
                                <p className="text-subtext dark:text-Dark_subtext mb-2 font-light">Unit Cost (per image)</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-Text dark:text-Dark_Text text-sm font-light">
                                        <div className="flex items-center gap-2">
                                            {selectedModel === 'ProTypeModel' ? <Crown size={14} /> : <Zap size={14} />}
                                            <span className="truncate max-w-[120px]">{selectedModel}</span>
                                        </div>
                                        <span>{modelPrice} Token</span>
                                    </div>
                                    <div className="flex justify-between text-Text dark:text-Dark_Text text-sm font-light">
                                        <div className="flex items-center gap-2">
                                            {selectedInput === 'Normal' ? <ImageIcon size={14} /> : <Globe size={14} />}
                                            <span>{selectedInput}</span>
                                        </div>
                                        <span>{inputPrice} Token</span>
                                    </div>
                                </div>
                            </div>
                            <hr className="h-px text-subtext dark:text-Dark_subtext w-full border-dashed" />
                            <div className="flex justify-between text-Text dark:text-Dark_Text font-light">
                                <span>Subtotal</span>
                                <span>{pricePerImage} Token / Image</span>
                            </div>
                            <hr className="h-px text-subtext dark:text-Dark_subtext w-full" />
                            <div className="flex flex-col justify-between text-Text dark:text-Dark_Text">
                                <span className="text-subtext dark:text-Dark_subtext mb-1 font-light">Quantity</span>
                                <div className="flex justify-between">
                                    <span>x Image Amount</span>
                                    <span>{files.length || 0} Image</span>
                                </div>
                            </div>
                            <hr className="h-px text-subtext dark:text-Dark_subtext w-full" />
                            <div>
                                <p className="text-subtext dark:text-Dark_subtext uppercase tracking-widest mb-2 font-light">Total Estimate</p>
                                <div className="flex items-center gap-3 text-power dark:text-Dark_power text-2xl md:text-3xl font-bold">
                                    <Coins size={28} className="md:w-[35px] md:h-[35px]" strokeWidth={2.5} />
                                    <span>{files.length > 0 ? totalCost : '???'} Tokens</span>
                                </div>
                                {hasInvalidFiles && (
                                    <p className="text-red-500 text-[10px] mt-2 text-center">
                                        *Contains invalid files
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. MAIN MODAL CARD */}
                <div className="w-full max-w-2xl p-4 md:p-5 bg-Main_BG dark:bg-Dark_Main_BG border-2 border-BG_light dark:border-Dark_BG_light rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 shrink-0">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl md:text-2xl font-medium text-Text dark:text-Dark_Text">
                                {mode === 'create' ? 'Create New Project' : 'Add Images To Project'}
                            </h2>
                            <button onClick={handleCloseInternal} className="cursor-pointer p-1 md:p-2 hover:bg-white/10 rounded-full transition-colors text-Text dark:text-Dark_Text">
                                <CircleX size={24} />
                            </button>
                        </div>
                        {mode === 'add' && (
                            <p className="text-xs text-subtext dark:text-zinc-500">
                                Settings Locked: {selectedModel}, {selectedInput}
                            </p>
                        )}
                    </div>

                    <div className="mt-4 flex flex-col gap-3 md:gap-5">
                        <input
                            type="file"
                            multiple
                            accept="image/png, image/jpeg, image/jpg"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                        />

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
                                            <option value="Normal">Normal Image</option>
                                            <option value="360_degree">360 Degree</option>
                                        </select>
                                        <CircleArrowDown className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-subtext pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </>
                        )}

                        {mode === 'add' && (
                            <div className="flex gap-4 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-subtext uppercase">Input Type</span>
                                    <span className="text-sm font-bold text-Text dark:text-Dark_Text flex items-center gap-2">
                                        {selectedInput === 'Normal' ? <ImageIcon size={16}/> : <Globe size={16}/>}
                                        {selectedInput}
                                    </span>
                                </div>
                                <div className="flex flex-col border-l border-black/10 dark:border-white/10 pl-4">
                                    <span className="text-[10px] text-subtext uppercase">Model</span>
                                    <span className="text-sm font-bold text-Text dark:text-Dark_Text flex items-center gap-2">
                                        {selectedModel === 'ProTypeModel' ? <Crown size={16}/> : <Zap size={16}/>}
                                        {selectedModel}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div
                            onClick={triggerFileSelect}
                            className={`bg-BG_dark dark:bg-Dark_BG_dark group cursor-pointer h-36 md:h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 md:gap-3 transition-all
                            ${hasInvalidFiles ? 'border-red-500/50' : 'border-black/10 dark:border-white/10 hover:border-power dark:hover:border-Dark_power'}
                            `}
                        >
                            <div className="size-14 md:size-18 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CloudUpload size={28} className="md:w-[35px] md:h-[35px] text-subtext dark:text-zinc-400 group-hover:text-power dark:group-hover:text-Dark_power" />
                            </div>
                            <div className="text-center select-none">
                                <h3 className="text-lg md:text-2xl font-bold text-Text dark:text-Dark_Text">Upload Your Image here!</h3>
                                <p className="text-[10px] md:text-xs text-subtext dark:text-zinc-500 mt-1">JPG, PNG (Max 10MB)</p>
                            </div>
                        </div>

                        {files.length > 0 && (
                            <div className="w-full bg-BG_dark dark:bg-Dark_BG_dark py-2 md:py-3 px-2 rounded-xl border border-white/10 max-h-28 md:max-h-32 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {files.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className={`flex items-center gap-2 md:gap-3 text-[10px] p-2 px-3 rounded-lg relative overflow-hidden border
                                        ${item.isValid 
                                            ? 'bg-black/5 dark:bg-white/5 border-transparent' 
                                            : 'bg-red-500/10 border-red-500/50' // ถ้าไม่ผ่านให้ขึ้นสีแดง
                                        }`}
                                    >
                                        {/* Background Progress Bar */}
                                        {item.isValid && (
                                            <div
                                                className={`absolute left-0 top-0 h-full bg-power/20 dark:bg-power/30 transition-all duration-1000 ease-out z-0
                                                ${(isUploading || isCompleted) ? 'w-full' : 'w-0'} 
                                                `}
                                            />
                                        )}

                                        {/* Status Icon */}
                                        <div className="z-10">
                                            {item.isValid ? (
                                                // ถ้าเสร็จแล้วเป็นติ๊กถูก
                                                isCompleted ? <CheckCheck size={14} className="text-power" /> : null
                                            ) : (
                                                // ถ้าไม่ผ่านเป็นเครื่องหมายตกใจ
                                                <AlertCircle size={14} className="text-red-500" />
                                            )}
                                        </div>

                                        <span className={`flex-1 truncate font-mono opacity-70 z-10 ${item.isValid ? 'text-Text dark:text-Dark_Text' : 'text-red-500 font-bold'}`}>
                                            {item.file.name}
                                        </span>

                                        <span className="text-[10px] opacity-50 z-10">
                                            {item.isValid ? `(${(item.file.size / 1024).toFixed(0)} KB)` : item.error || 'Invalid'}
                                        </span>

                                        {!isUploading && !isCompleted && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                                                className="cursor-pointer text-subtext hover:text-red-500 z-10"
                                            >
                                                <CircleX size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

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
                                disabled={files.length === 0 || isUploading || hasInvalidFiles || isCompleted}
                                className={`
                                    cursor-pointer px-6 md:px-8 py-2 rounded-xl text-lg md:text-2xl font-bold transition-all flex items-center gap-2 shadow-lg
                                    ${(files.length > 0 && !isUploading && !hasInvalidFiles && !isCompleted)
                                        ? 'bg-power dark:bg-Dark_power text-black hover:scale-105 shadow-power/20'
                                        : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'}
                                `}
                            >
                                {isUploading ? <Loader2 size={18} className="animate-spin" />
                                : isCompleted ? <span className="flex items-center gap-2"><CheckCheck size={18}/> DONE</span>
                                : hasInvalidFiles ? 'FIX ERROR' // เปลี่ยนคำเตือนปุ่ม
                                : 'CONFIRM'}
                            </button>
                        </div>
                    )}

                    {mode === 'add' && (
                        <div className="mt-4 flex flex-col gap-2">
                             <div className="text-sm font-bold text-Text dark:text-Dark_Text">Summary Check</div>
                             {/* ... (Add Mode UI เหมือนเดิม) ... */}
                            <div className="flex items-center gap-2 mt-1 mb-2">
                                <span className="text-xl md:text-2xl font-bold text-Text dark:text-Dark_Text">Total New Cost :</span>
                                <span className="text-xl md:text-2xl font-bold text-power dark:text-Dark_power">
                                    {files.length > 0 ? totalCost : '??'} Tokens
                                </span>
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={files.length === 0 || isUploading || hasInvalidFiles || isCompleted}
                                className={`
                                    w-full cursor-pointer py-3 rounded-xl text-lg md:text-xl font-bold transition-all flex justify-center items-center gap-2 shadow-lg
                                    ${(files.length > 0 && !isUploading && !hasInvalidFiles && !isCompleted)
                                        ? 'bg-power dark:bg-Dark_power text-black hover:scale-105 shadow-power/20' 
                                        : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'}
                                `}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : isCompleted ? (
                                    <span className="flex items-center gap-2"><CheckCheck size={18}/> DONE</span>
                                ) : hasInvalidFiles ? (
                                    'REMOVE INVALID FILES'
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