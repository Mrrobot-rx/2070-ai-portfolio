import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Float } from '@react-three/drei';
import * as THREE from 'three';

interface Project {
  id: number;
  title: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
}

const projects: Project[] = [
  { id: 1, title: "NEON CLOUD", type: "SaaS Platform", position: [-2.5, 0, 1], rotation: [0, 0.5, 0] },
  { id: 2, title: "VISION PRO", type: "Spatial UI Kit", position: [2.5, 0.5, 0], rotation: [0, -0.5, 0] },
  { id: 3, title: "CYBER DASH", type: "Analytics", position: [-1.5, -1.5, 2], rotation: [-0.2, 0.3, 0] },
];

export const HolographicGrid: React.FC<{ visible: boolean }> = ({ visible }) => {
  const group = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!group.current) return;
    // Slow orbit
    group.current.rotation.y += 0.001;
  });

  if (!visible) return null;

  return (
    <group ref={group}>
      {projects.map((project) => (
        <Float key={project.id} speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
          <group position={new THREE.Vector3(...project.position)} rotation={new THREE.Euler(...project.rotation)}>
            {/* Holographic Frame */}
            <mesh>
              <planeGeometry args={[2, 1.2]} />
              <meshBasicMaterial color="#06b6d4" wireframe opacity={0.1} transparent side={THREE.DoubleSide} />
            </mesh>
            
            {/* HTML Content */}
            <Html transform occlude distanceFactor={1.5} style={{ pointerEvents: 'none' }}>
              <div className="w-64 p-4 bg-black/80 border border-cyan-500/50 backdrop-blur-xl rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-cyan-400 font-bold text-xs tracking-widest uppercase">{project.type}</span>
                    <span className="text-white/20 text-[10px]">0{project.id}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{project.title}</h3>
                <div className="h-1 w-10 bg-cyan-500 rounded-full"></div>
              </div>
            </Html>
            
            {/* Corner Markers */}
            <mesh position={[0.9, 0.5, 0.01]}>
                <planeGeometry args={[0.2, 0.02]} />
                <meshBasicMaterial color="#06b6d4" />
            </mesh>
            <mesh position={[-0.9, -0.5, 0.01]}>
                <planeGeometry args={[0.2, 0.02]} />
                <meshBasicMaterial color="#06b6d4" />
            </mesh>
          </group>
        </Float>
      ))}
    </group>
  );
};