import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, RoundedBox, Sparkles, Stars, Torus, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Modality } from "@google/genai";

// --- TYPES & THEME ---
interface MrRobotProps {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const THEME = {
    primary: '#06b6d4',    // Cyan
    success: '#10b981',    // Emerald
    warning: '#f59e0b',    // Amber
    danger: '#ef4444',     // Red
    dark: '#050505',
};

type RobotState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';
type Language = 'en-US' | 'ar-DZ';

// --- AUDIO UTILS (Kept simple for brevity in display) ---
const decodeAudioData = (base64String: string, ctx: AudioContext): AudioBuffer => {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const sampleRate = 24000;
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
};

// --- 3D COMPONENT (SIMPLIFIED FOR MODAL CONTEXT) ---
const ProceduralRobot = ({ state }: { state: RobotState }) => {
  const group = useRef<THREE.Group>(null!);
  
  useFrame((stateThree) => {
    const t = stateThree.clock.getElapsedTime();
    if (group.current) {
        group.current.rotation.y = Math.sin(t * 0.5) * 0.2;
        group.current.position.y = Math.sin(t) * 0.1;
    }
  });

  return (
    <group ref={group} scale={1.5}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <RoundedBox args={[1, 1, 1]} radius={0.2} smoothness={4}>
                <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
            </RoundedBox>
            <mesh position={[0, 0, 0.51]}>
                <planeGeometry args={[0.8, 0.4]} />
                <meshBasicMaterial color={state === 'THINKING' ? THEME.warning : state === 'SPEAKING' ? THEME.success : THEME.primary} />
            </mesh>
            <Sparkles count={20} scale={2} color={THEME.primary} />
        </Float>
    </group>
  );
};

// --- MAIN CHAT MODAL COMPONENT ---
const MrRobot: React.FC<MrRobotProps> = ({ isOpen, onOpen, onClose }) => {
  const [inputText, setInputText] = useState('');
  const [state, setState] = useState<RobotState>('IDLE');
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([
      {role: 'ai', text: "Systems Initialized. I am the Sentinel AI. Query me about Salim's architecture, stack, or availability."}
  ]);
  
  const aiClient = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Handle Text Submission
  const handleSubmit = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!inputText.trim()) return;
      
      const userMsg = inputText;
      setInputText('');
      setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
      setState('THINKING');

      const systemPrompt = `You are the Sentinel AI for Salim Samet's portfolio. 
      You are highly technical, precise, and use robotic terminology.
      Salim is a Senior Frontend Engineer specializing in React, Three.js, and GenAI.
      Answer questions about his skills, projects (Neon Cloud, Vision Pro), and experience.
      Keep answers under 50 words. Be cool and futuristic.`;

      try {
        const result = await aiClient.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: userMsg,
            config: { systemInstruction: systemPrompt }
        });
        
        const responseText = result.text || "Data corrupted. Please retry.";
        setMessages(prev => [...prev, {role: 'ai', text: responseText}]);
        setState('IDLE'); // Simple state reset for text mode
      } catch (e) {
          console.error(e);
          setState('IDLE');
          setMessages(prev => [...prev, {role: 'ai', text: "Error: Uplink failed."}]);
      }
  };

  return (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-3xl h-[600px] bg-[#09090b] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col md:flex-row rounded-lg overflow-hidden font-mono"
                >
                    {/* LEFT PANEL: 3D AVATAR */}
                    <div className="w-full md:w-1/3 bg-black/50 border-b md:border-b-0 md:border-r border-white/10 relative">
                        <div className="absolute top-4 left-4 z-10">
                            <h3 className="text-cyan-500 font-bold tracking-widest text-xs">UNIT-01</h3>
                            <p className="text-[10px] text-slate-500 uppercase">Status: {state}</p>
                        </div>
                        <Canvas>
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} />
                            <Suspense fallback={null}>
                                <ProceduralRobot state={state} />
                            </Suspense>
                        </Canvas>
                        {/* Audio Waveform Decoration */}
                        <div className="absolute bottom-8 left-0 w-full px-8 flex justify-between items-end h-8">
                             {[...Array(5)].map((_, i) => (
                                 <div key={i} className={`w-2 bg-cyan-500/50 ${state === 'THINKING' ? 'animate-pulse' : ''}`} style={{ height: `${Math.random() * 100}%` }}></div>
                             ))}
                        </div>
                    </div>

                    {/* RIGHT PANEL: CHAT TERMINAL */}
                    <div className="flex-1 flex flex-col bg-[#050505]">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-cyan-500 text-sm">terminal</span>
                                <span className="text-white text-xs font-bold tracking-widest">COMM_LINK_ESTABLISHED</span>
                            </div>
                            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[85%] p-3 text-xs md:text-sm font-mono leading-relaxed ${
                                        msg.role === 'ai' 
                                        ? 'bg-cyan-900/20 border border-cyan-500/30 text-cyan-100 rounded-tr-xl rounded-bl-xl' 
                                        : 'bg-white/10 border border-white/20 text-white rounded-tl-xl rounded-br-xl'
                                    }`}>
                                        <span className={`block text-[10px] font-bold mb-1 opacity-50 ${msg.role === 'ai' ? 'text-cyan-400' : 'text-slate-400'}`}>
                                            {msg.role === 'ai' ? 'SENTINEL >' : 'USER >'}
                                        </span>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {state === 'THINKING' && (
                                <div className="text-cyan-500 text-xs animate-pulse pl-2">
                                    PROCESSING QUERY...
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/40">
                            <div className="flex items-center gap-2 bg-black border border-white/20 p-2 rounded focus-within:border-cyan-500 transition-colors">
                                <span className="text-cyan-500 font-bold text-lg">›</span>
                                <input 
                                    type="text" 
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Enter command or query..."
                                    className="flex-1 bg-transparent text-white text-sm font-mono focus:outline-none placeholder:text-white/20"
                                    autoFocus
                                />
                                <button type="submit" disabled={!inputText.trim() || state === 'THINKING'} className="text-white/40 hover:text-cyan-400 disabled:opacity-20 transition-colors">
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
  );
}

export default MrRobot;