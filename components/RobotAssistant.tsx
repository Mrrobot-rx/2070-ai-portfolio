import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Icosahedron, Octahedron, Torus, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { RobotState } from '../hooks/useVoiceProcessor';

interface RobotProps {
  state: RobotState;
  audioLevel: number;
}

export const RobotAssistant: React.FC<RobotProps> = ({ state, audioLevel }) => {
  const coreRef = useRef<THREE.Group>(null!);
  const outerRingRef = useRef<THREE.Group>(null!);
  const innerRingRef = useRef<THREE.Group>(null!);
  
  // Smoothing audio level
  const currentLevel = useRef(0);

  const materials = useMemo(() => ({
    glass: new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        roughness: 0,
        metalness: 0.1,
        transmission: 1,
        thickness: 0.5,
        ior: 1.5,
        clearcoat: 1
    }),
    core: new THREE.MeshBasicMaterial({
        color: '#a855f7',
        wireframe: true,
        transparent: true,
        opacity: 0.3
    }),
    glow: new THREE.MeshBasicMaterial({
        color: state === 'LISTENING' ? '#ef4444' : state === 'SPEAKING' ? '#22d3ee' : '#a855f7',
        toneMapped: false
    })
  }), [state]);

  useFrame((threeState, delta) => {
    currentLevel.current = THREE.MathUtils.lerp(currentLevel.current, audioLevel, 0.1);
    
    // Core Rotation
    if (coreRef.current) {
        coreRef.current.rotation.x += delta * 0.2;
        coreRef.current.rotation.y += delta * 0.3;
        // Pulse scale based on audio
        const scale = 1 + currentLevel.current * 0.8;
        coreRef.current.scale.setScalar(scale);
    }

    // Rings Rotation
    if (outerRingRef.current) {
        outerRingRef.current.rotation.z -= delta * 0.1;
        outerRingRef.current.rotation.x += delta * 0.05;
    }
    if (innerRingRef.current) {
        innerRingRef.current.rotation.z += delta * 0.2;
        innerRingRef.current.rotation.y += delta * 0.1;
        // Expansion on speaking
        const ringScale = state === 'SPEAKING' ? 1.2 + currentLevel.current : 1;
        innerRingRef.current.scale.setScalar(THREE.MathUtils.lerp(innerRingRef.current.scale.x, ringScale, 0.1));
    }
  });

  return (
    <group>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            {/* CENTRAL CRYSTAL CORE */}
            <group ref={coreRef}>
                <Octahedron args={[0.5]} material={materials.glass} />
                <Icosahedron args={[0.3]} material={materials.glow} />
                <Sparkles count={20} scale={1.2} size={2} speed={0.4} opacity={0.5} color={state === 'SPEAKING' ? '#22d3ee' : '#a855f7'} />
            </group>

            {/* ORBITAL RINGS */}
            <group ref={innerRingRef}>
                <Torus args={[0.8, 0.02, 16, 100]} material={materials.glass} />
                <Torus args={[0.8, 0.005, 16, 100]} material={materials.glow} />
            </group>

            <group ref={outerRingRef} rotation={[Math.PI / 2, 0, 0]}>
                <Torus args={[1.2, 0.01, 16, 100]} material={materials.glass} />
                <group rotation={[0, 0, Math.PI / 4]}>
                     <mesh position={[1.2, 0, 0]}>
                        <sphereGeometry args={[0.05]} />
                        <meshBasicMaterial color={materials.glow.color} />
                     </mesh>
                </group>
            </group>

            {/* DATA PARTICLES */}
            <Sparkles count={50} scale={3} size={1} speed={0.2} opacity={0.2} color="#ffffff" />
        </Float>
    </group>
  );
};