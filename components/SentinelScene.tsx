import React, { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { RobotAssistant } from './RobotAssistant';
import * as THREE from 'three';
import { RobotState } from '../hooks/useVoiceProcessor';

interface SceneProps {
  aiState: RobotState;
  audioLevel: number;
  view: string;
}

const CameraController = ({ view }: { view: string }) => {
  useFrame((state) => {
    const targetPos = view === 'HOME' ? new THREE.Vector3(0, 0, 6) : 
                      view === 'DASHBOARD' ? new THREE.Vector3(-3, 0, 7) : 
                      new THREE.Vector3(0, 0, 4);

    state.camera.position.lerp(targetPos, 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export const SentinelScene: React.FC<SceneProps> = ({ aiState, audioLevel, view }) => {
  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
        <PerspectiveCamera makeDefault position={[0,0,6]} fov={40} />
        <CameraController view={view} />
        
        <color attach="background" args={['#030014']} />
        <fog attach="fog" args={['#030014', 5, 15]} />

        <Suspense fallback={null}>
            {/* ETHEREAL LIGHTING */}
            <ambientLight intensity={0.5} color="#2e1065" />
            <spotLight 
                position={[5, 5, 5]} 
                angle={0.5} 
                penumbra={1} 
                intensity={20} 
                color="#a855f7" 
            />
            <pointLight position={[-5, -5, -5]} intensity={10} color="#06b6d4" />
            
            {/* Background Elements */}
            <Stars radius={100} depth={50} count={3000} factor={4} saturation={1} fade speed={0.5} />
            
            {/* Main Character */}
            <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
                <RobotAssistant state={aiState} audioLevel={audioLevel} />
            </Float>

            {/* Post Processing for Glass/Glow Look */}
            <EffectComposer disableNormalPass>
                <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.2} radius={0.4} />
                <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
                <Noise opacity={0.02} />
                <Vignette eskil={false} offset={0.1} darkness={0.8} />
            </EffectComposer>
        </Suspense>
    </Canvas>
  );
};