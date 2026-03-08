import React from 'react';
import { CircleX, ScanLine, Crosshair, Coins, Info, Sparkles } from 'lucide-react';
import { PixelSelectionData } from '@/types/type';

interface SelectionPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onProcess: () => void;
    type: string;
    data: PixelSelectionData | null;
}

const SelectionPopup = ({ isOpen, onClose, onProcess, type, data }: SelectionPopupProps) => {
    if (!isOpen || !data) return null;

    const is360 = type === '360_degree';
    const cost = is360 ? 2 : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="bg-Main_BG dark:bg-Dark_Main_BG border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative z-10 scale-100 animate-in zoom-in-95 duration-200">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 cursor-pointer p-1 md:p-2 hover:bg-white/10 rounded-full transition-colors text-Text dark:text-Dark_Text">
                    <CircleX size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-full ${is360 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-power/10 text-power dark:bg-Dark_power/10 dark:text-Dark_power'}`}>
                        {is360 ? <Sparkles size={24} /> : <Crosshair size={24} />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-Text dark:text-white">
                            {is360 ? '360° AI Measure' : 'Point Selected'}
                        </h3>
                        <p className="text-xs text-subtext dark:text-Dark_subtext">Confirm coordinates for processing</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="col-span-2 bg-BG_dark dark:bg-Dark_BG_dark p-3 rounded-xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-subtext dark:text-Dark_subtext text-xs font-bold uppercase">
                            <ScanLine size={14} />
                            <span>Pixel (X, Y)</span>
                        </div>
                        <span className="font-mono text-Text dark:text-white font-bold">{data.x}, {data.y}</span>
                    </div>
                </div>

                {is360 ? (
                    <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                        <Coins size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-yellow-500">Premium Feature</p>
                            <p className="text-[10px] text-subtext dark:text-zinc-400 leading-relaxed">
                                Measuring distance in 360° environment requires complex AI calculation.
                            </p>
                            <p className="text-xs font-bold text-white flex items-center gap-1 mt-1">
                                Cost: <span className="text-yellow-400">{cost} Credits</span>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 flex items-center justify-center gap-2 py-2 bg-green-500/5 rounded-lg border border-green-500/10">
                         <Info size={14} className="text-green-500"/>
                         <span className="text-[10px] text-green-500 font-medium">Standard measurement is Free</span>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="cursor-pointer flex-1 py-3 rounded-xl font-bold text-sm border border-subtext/20 dark:border-Dark_subtext/20 text-subtext dark:text-Dark_subtext hover:bg-white/5 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onProcess}
                        className={`
                            cursor-pointer flex-1 py-3 rounded-xl font-bold text-sm text-black hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg
                            ${is360 
                                ? 'bg-yellow-500 hover:bg-yellow-400 shadow-yellow-500/20' 
                                : 'bg-power hover:bg-power/90 shadow-power/20'
                            }
                        `}
                    >
                        {is360 ? (
                            <>
                                <Coins size={16} />
                                <span>Pay {cost} Credits</span>
                            </>
                        ) : (
                            <>
                                <ScanLine size={16} />
                                <span>Process Free</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectionPopup;