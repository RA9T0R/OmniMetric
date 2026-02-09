import React from 'react';
import { CircleX, MapPin, Ruler, CheckCircle2 } from 'lucide-react';

interface MeasurementResult {
    distance: number;
    unit: string;
    x: number;
    y: number;
}

interface MeasurementResultPopupProps {
    isOpen: boolean;
    onClose: () => void;
    data: MeasurementResult | null;
}

const MeasurementResultPopup = ({ isOpen, onClose, data }: MeasurementResultPopupProps) => {
    if (!isOpen || !data) return null;

    return (
        <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-Main_BG dark:bg-zinc-900 border border-power/20 p-6 rounded-3xl shadow-[0_0_50px_rgba(34,197,94,0.15)] max-w-sm w-full relative transform scale-100 transition-all">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 cursor-pointer p-2 hover:bg-white/5 rounded-full transition-colors text-subtext hover:text-white">
                    <CircleX size={20} />
                </button>

                <div className="flex justify-center mb-4">
                    <div className="size-16 rounded-full bg-power/10 flex items-center justify-center border border-power/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                        <CheckCircle2 size={32} className="text-power" />
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-1">Measurement Complete</h3>
                    <p className="text-xs text-subtext">AI has calculated the distance successfully.</p>
                </div>

                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 mb-6">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-2 text-subtext text-xs font-bold uppercase tracking-wider">
                            <Ruler size={14} className="text-power" />
                            <span>Distance</span>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-black text-white tracking-tight">{data.distance}</span>
                            <span className="text-xs font-bold text-power ml-1">{data.unit}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2 text-subtext text-xs font-bold uppercase tracking-wider">
                            <MapPin size={14} className="text-zinc-500" />
                            <span>Coordinates</span>
                        </div>
                        <span className="font-mono text-xs text-zinc-400 bg-white/5 px-2 py-1 rounded">
                            X: {data.x}, Y: {data.y}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="cursor-pointer w-full py-3.5 rounded-xl font-bold text-sm bg-power hover:bg-power/90 text-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-power/20"
                >
                    Done
                </button>
            </div>
        </div>
    );
};

export default MeasurementResultPopup;