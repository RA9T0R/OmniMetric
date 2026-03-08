import React, { useState, useRef, useEffect } from 'react';
import { ImageViewerProps } from '@/types/type';

const NormalImageViewer = ({
    url,
    viewMode,
    depthUrl,
    objects,
    selectedObjectId,
    isPointerActive,
    onObjectClick,
    onPixelSelect
}: ImageViewerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const [imageRect, setImageRect] = useState({ width: 0, height: 0, top: 0, left: 0 });

    const updateImageRect = () => {
        const container = containerRef.current;
        const img = imgRef.current;

        if (container && img && img.naturalWidth) {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            const imgRatio = img.naturalWidth / img.naturalHeight;
            const containerRatio = containerWidth / containerHeight;

            let finalWidth, finalHeight;

            if (containerRatio > imgRatio) {
                finalHeight = containerHeight;
                finalWidth = finalHeight * imgRatio;
            } else {
                finalWidth = containerWidth;
                finalHeight = finalWidth / imgRatio;
            }

            setImageRect({
                width: finalWidth,
                height: finalHeight,
                top: (containerHeight - finalHeight) / 2,
                left: (containerWidth - finalWidth) / 2,
            });
        }
    };

    useEffect(() => {
        window.addEventListener('resize', updateImageRect);
        return () => window.removeEventListener('resize', updateImageRect);
    }, []);

    const handleImageLoad = () => {
        updateImageRect();
    };

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isPointerActive || !imgRef.current) return;

        const rect = e.currentTarget.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const scaleX = imgRef.current.naturalWidth / rect.width;
        const scaleY = imgRef.current.naturalHeight / rect.height;

        onPixelSelect({
            x: Math.round(x * scaleX),
            y: Math.round(y * scaleY),
        });
    };

    const activeUrl = viewMode === 'normal' ? url : (depthUrl || url);

    return (
        <div ref={containerRef} className={`relative w-full h-full bg-black flex items-center justify-center overflow-hidden ${isPointerActive ? 'cursor-crosshair' : 'cursor-default'}`}>

            <img
                ref={imgRef}
                src={activeUrl}
                alt="Project View"
                className="w-full h-full object-contain select-none pointer-events-none" // ปิด interaction ที่รูปโดยตรง
                onLoad={handleImageLoad}
            />

            <div
                className="absolute z-10"
                style={{
                    width: imageRect.width,
                    height: imageRect.height,
                    top: imageRect.top,
                    left: imageRect.left,
                }}
                onClick={handleImageClick}
            >
                {viewMode === 'normal' && objects.map((obj) => {
                    if (obj.id !== selectedObjectId) return null;
                    if (!obj.box) return null;

                    let borderColor = 'border-red-500';
                    let bgColor = 'bg-red-500/20';
                    if (obj.label === 'person') { borderColor = 'border-green-400'; bgColor = 'bg-green-400/20'; }

                    return (
                        <div
                            key={obj.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onObjectClick(obj.id);
                            }}
                            className={`absolute border-2 cursor-pointer transition-all duration-200 hover:bg-opacity-40 ${borderColor} ${bgColor}`}
                            style={{
                                top: `${obj.box.top}%`,
                                left: `${obj.box.left}%`,
                                width: `${obj.box.width}%`,
                                height: `${obj.box.height}%`,
                                boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                            }}
                        >
                            <div className={`absolute -top-7 -left-0.5 text-white text-xs font-bold px-2 py-1 rounded-t-md flex items-center gap-2 ${borderColor.replace('border', 'bg')}`}>
                                <span>{obj.label}</span>
                                <span className="bg-black/20 px-1 rounded text-[10px]">{obj.confidence}%</span>
                                <span className="bg-white/20 px-1 rounded text-[10px]">{obj.distance}m</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default NormalImageViewer;