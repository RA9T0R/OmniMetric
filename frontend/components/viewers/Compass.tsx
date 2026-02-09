import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export const CompassOverlay = () => {
    const { camera } = useThree();
    const dialRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLSpanElement>(null);

    useFrame(() => {
        if (!dialRef.current || !labelRef.current) return;
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);

        const theta = Math.atan2(dir.x, dir.z);
        const rawDeg = theta * (180 / Math.PI);
        const compassHeading = (180 - rawDeg) % 360;

        dialRef.current.style.transform = `rotate(${-compassHeading}deg)`;

        const heading = Math.round(compassHeading);
        let bearing = 'N';

        if (heading > 22.5 && heading <= 67.5) bearing = 'NE';
        else if (heading > 67.5 && heading <= 112.5) bearing = 'E';
        else if (heading > 112.5 && heading <= 157.5) bearing = 'SE';
        else if (heading > 157.5 && heading <= 202.5) bearing = 'S';
        else if (heading > 202.5 && heading <= 247.5) bearing = 'SW';
        else if (heading > 247.5 && heading <= 292.5) bearing = 'W';
        else if (heading > 292.5 && heading <= 337.5) bearing = 'NW';

        labelRef.current.innerText = `${heading}° ${bearing}`;
    });

    return (
        <Html
            as='div'
            fullscreen
            style={{ pointerEvents: 'none', zIndex: 10 }}
        >
            <div className="absolute top-5 right-5 flex flex-col items-center gap-2">
                <div className="relative w-16 h-16 rounded-full bg-black/60 border border-white/20 backdrop-blur-md shadow-xl flex items-center justify-center">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20">
                         <div className="w-0 h-0 border-l-4 border-r-4 border-b-[6px] border-l-transparent border-r-transparent border-b-red-500 drop-shadow-md"></div>
                    </div>

                    <div ref={dialRef} className="w-full h-full relative will-change-transform">

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-white/10"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-px bg-white/10"></div>

                        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white drop-shadow-sm">N</span>
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/70">S</span>
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/70">E</span>
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/70">W</span>

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full opacity-80"></div>
                    </div>
                </div>

                <div className="bg-Dark_BG_dark backdrop-blur-md px-3 py-1 rounded-md border border-white/10 shadow-lg min-w-[60px] text-center">
                    <span ref={labelRef} className="text-xs font-mono font-bold text-white tracking-wide">
                        0° N
                    </span>
                </div>
            </div>
        </Html>
    );
};