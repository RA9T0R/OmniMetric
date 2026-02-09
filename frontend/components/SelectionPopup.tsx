import React from 'react';
import { CircleX, ScanLine, Crosshair } from 'lucide-react';
import {PixelSelectionData} from '@/types/type';

interface SelectionPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onProcess: () => void;
    data: PixelSelectionData | null;
}

const SelectionPopup = ({ isOpen, onClose, onProcess, data }: SelectionPopupProps) => {
    if (!isOpen || !data) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-Main_BG dark:bg-Dark_Main_BG border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 cursor-pointer p-1 md:p-2 hover:bg-white/10 rounded-full transition-colors text-Text dark:text-Dark_Text">
                    <CircleX size={20} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-full bg-power/10 text-power dark:bg-Dark_power/10 dark:text-Dark_power">
                        <Crosshair size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-Text dark:text-white">Point Selected</h3>
                        <p className="text-xs text-subtext dark:text-Dark_subtext">Confirm coordinates for AI processing</p>
                    </div>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="col-span-2 bg-BG_dark dark:bg-Dark_BG_dark p-3 rounded-xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-subtext dark:text-Dark_subtext text-xs font-bold uppercase">
                            <ScanLine size={14} />
                            <span>Pixel (X, Y)</span>
                        </div>
                        <span className="font-mono text-Text dark:text-white font-bold">{data.x}, {data.y}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="cursor-pointer flex-1 py-3 rounded-xl font-bold text-sm border border-subtext/20 dark:border-Dark_subtext/20 text-subtext dark:text-Dark_subtext hover:bg-white/5 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onProcess}
                        className="cursor-pointer flex-1 py-3 rounded-xl font-bold text-sm bg-power hover:bg-power/90 text-black hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                        <ScanLine size={16} />
                        Process AI
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectionPopup;