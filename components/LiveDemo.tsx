import React from 'react';
import { motion } from 'framer-motion';

interface LiveDemoProps {
  onClose: () => void;
  voiceHook: any;
}

// Fix: Explicitly type component as React.FC to correctly handle 'key' prop in JSX
const VisualizerBar: React.FC<{ height: number }> = ({ height }) => (
    <motion.div 
        animate={{ height: `${Math.max(10, height * 100)}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-4 bg-cyber-cyan rounded-full shadow-[0_0_15px_#00f0ff]"
    />
)

const LiveDemo: React.FC<LiveDemoProps> = ({ onClose, voiceHook }) => {
  const { state, transcript, audioLevel, toggleLanguage, startListening, language } = voiceHook;

  return (
    <div className="w-full h-full flex flex-col items-center justify-end pb-32 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none">
        
        {/* Main Interface (Pointer events enabled here) */}
        <div className="pointer-events-auto flex flex-col items-center gap-8 w-full max-w-2xl px-6">
            
            {/* Visualizer */}
            <div className="h-32 flex items-center gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                    <VisualizerBar key={i} height={state === 'SPEAKING' || state === 'LISTENING' ? Math.random() * (audioLevel + 0.2) : 0.1} />
                ))}
            </div>

            {/* Transcript Area */}
            <div className="min-h-[100px] w-full text-center">
                 <p className="text-cyber-cyan font-mono text-sm uppercase tracking-widest mb-2">
                     {state}
                 </p>
                 <h3 className="text-2xl font-display font-bold text-white text-shadow">
                     {transcript || "Listening for command..."}
                 </h3>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
                 <button 
                    onClick={toggleLanguage}
                    className="w-12 h-12 rounded-full border border-white/20 bg-black/50 text-white font-mono text-xs hover:border-cyber-cyan transition-colors"
                >
                    {language === 'en-US' ? 'EN' : 'AR'}
                </button>
                
                <button 
                    onClick={startListening}
                    className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all ${state === 'LISTENING' ? 'bg-red-500 border-red-500 shadow-[0_0_30px_#ef4444]' : 'bg-cyber-cyan/10 border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-black'}`}
                >
                    <span className="material-symbols-outlined text-4xl">
                        {state === 'LISTENING' ? 'mic_off' : 'mic'}
                    </span>
                </button>

                <button 
                    onClick={onClose}
                    className="w-12 h-12 rounded-full border border-white/20 bg-black/50 text-white hover:border-red-500 hover:text-red-500 transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
        </div>
    </div>
  );
};

export default LiveDemo;