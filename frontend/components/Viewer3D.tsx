'use client';

import React, { useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function SphereWithDepth() {
  // 1. โหลดรูปภาพ 2 รูป
  // หมายเหตุ: ตรวจสอบ path รูปภาพให้ถูกต้องว่าอยู่ใน folder public จริงๆ
  const colorMap = useLoader(TextureLoader, '/Images/pano.jpg');
  const displacementMap = useLoader(TextureLoader, '/Images/depth_16bit.png');

  const meshRef = useRef<THREE.Mesh>(null!);

  return (
    <mesh ref={meshRef}>
      {/* 2. สร้างทรงกลม (Geometry) */}
      <sphereGeometry args={[5, 256, 256]} />

      {/* 3. สร้างวัสดุ (Material) พร้อมใส่ Displacement */}
      <meshStandardMaterial
        map={colorMap}
        displacementMap={displacementMap}
        displacementScale={-3.0}
        side={THREE.BackSide}
        roughness={0.5}
      />
    </mesh>
  );
}

export default function Viewer3D() {
  return (
    <div className={'bg-black w-full h-full'}>
      <Canvas camera={{ position: [0, 0, 0.1] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        <SphereWithDepth />

        {/* ✅ แก้ไข 2: เปิดการซูม (enableZoom={true}) */}
        {/* enablePan={false} เพื่อไม่ให้ user เลื่อนจุดศูนย์กลางกล้องหนี */}
        <OrbitControls
            enableZoom={true}
            enablePan={false}
            rotateSpeed={-0.5} // กลับทิศการหมุนเพื่อให้เหมือนเราหันหน้า (Optional)
            minDistance={1}    // ห้ามซูมเข้าใกล้เกินไป
            maxDistance={4}    // ห้ามซูมออกทะลุทรงกลม (รัศมี 5)
        />
      </Canvas>
    </div>
  );
}