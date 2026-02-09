// components/viewers/PanoramaImageViewer.tsx
'use client';

import React, { Suspense, useEffect, useMemo } from 'react';
import { Canvas, useThree, ThreeEvent, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { CompassOverlay } from './Compass';
import {ImageViewerProps} from '@/types/type';

const CameraZoomController = () => {
    const { camera, gl } = useThree();
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (camera instanceof THREE.PerspectiveCamera) {
                const fov = camera.fov;
                let newFov = fov + e.deltaY * 0.05;
                newFov = Math.max(5, Math.min(80, newFov));
                camera.fov = newFov;
                camera.updateProjectionMatrix();
            }
        };
        const canvas = gl.domElement;
        canvas.addEventListener('wheel', handleWheel, { passive: false });
        return () => canvas.removeEventListener('wheel', handleWheel);
    }, [camera, gl]);
    return null;
};

const PanoramaSphere = ({
    url, depthUrl, viewMode, isPointerActive, onPixelSelect,
    objects, selectedObjectId
}: ImageViewerProps) => {

    const activeUrl = viewMode === 'normal' ? url : (depthUrl || url);
    const originalTexture = useLoader(THREE.TextureLoader, activeUrl);

    const displayTexture = useMemo(() => {
        if (!selectedObjectId || viewMode !== 'normal') {
            const cloned = originalTexture.clone();
            cloned.needsUpdate = true;
            return cloned;
        }

        const img = originalTexture.image as HTMLImageElement;
        if (!img || (!img.naturalWidth && !img.width)) return originalTexture;

        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);

            const selectedObj = objects.find(obj => obj.id === selectedObjectId);

            if (selectedObj && selectedObj.box) {
                const box = selectedObj.box;
                const x = (box.left / 100) * width;
                const y = (box.top / 100) * height;
                const w = (box.width / 100) * width;
                const h = (box.height / 100) * height;

                let color = '#ef4444';
                if (selectedObj.label === 'person') color = '#22c55e';

                ctx.beginPath();
                ctx.lineWidth = 15;
                ctx.strokeStyle = color;
                ctx.rect(x, y, w, h);
                ctx.stroke();

                const fontSize = 80;
                ctx.font = `bold ${fontSize}px Arial`;
                const text = `${selectedObj.label} (${selectedObj.confidence}%) ${selectedObj.distance}m`;
                const textWidth = ctx.measureText(text).width;
                const textPadding = 20;

                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(x, y - fontSize - textPadding * 2, textWidth + textPadding * 2, fontSize + textPadding * 2);

                ctx.fillStyle = color;
                ctx.fillText(text, x + textPadding, y - textPadding * 1.5);
            }

            const newTexture = new THREE.CanvasTexture(canvas);
            newTexture.needsUpdate = true;
            return newTexture;
        }

        return originalTexture;

    }, [originalTexture, selectedObjectId, viewMode, objects]);


    const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();

        const img = displayTexture.image as HTMLImageElement;

        if (isPointerActive && e.uv && img) {
            const naturalWidth = img.naturalWidth || img.width;
            const naturalHeight = img.naturalHeight || img.height;

            if (!naturalWidth || !naturalHeight) {
                return;
            }

            const u = e.uv.x;
            const v = e.uv.y;

            const pixelX = Math.floor(u * naturalWidth);
            const pixelY = Math.floor((1 - v) * naturalHeight);

            console.log(`Click Pixel: ${pixelX}, ${pixelY}`);

            onPixelSelect({
                x: pixelX,
                y: pixelY
            });
        }
    };

    return (
        <mesh
            onClick={handlePointerDown}
            scale={[-1, 1, 1]}
            rotation={[0, -Math.PI / 2, 0]}
        >
            <sphereGeometry args={[500, 60, 40]} />
            <meshBasicMaterial map={displayTexture} side={THREE.BackSide} />
        </mesh>
    );
};

const PanoramaImageViewer = (props: ImageViewerProps) => {
    return (
        <div className={`w-full h-full relative ${props.isPointerActive ? 'cursor-crosshair' : 'cursor-move'}`}>
            <Canvas camera={{ position: [0, 0, 0.1], fov: 60 }}>
                <Suspense fallback={<Html center className="text-white font-bold">Loading 360...</Html>}>
                    <PanoramaSphere {...props} />
                    <CameraZoomController />
                    <CompassOverlay />
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        enableRotate={!props.isPointerActive}
                        rotateSpeed={-0.5}
                        dampingFactor={0.05}
                        enableDamping={true}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default PanoramaImageViewer;