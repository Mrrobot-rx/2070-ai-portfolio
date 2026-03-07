import React, { useState } from 'react';
import { SentinelScene } from './components/SentinelScene';
import Portfolio from './components/Portfolio';
import Dashboard from './components/Dashboard';
import LiveDemo from './components/LiveDemo';
import BubbleAssistant from './components/BubbleAssistant';
import { useVoiceProcessor } from './hooks/useVoiceProcessor';
import { AnimatePresence, motion } from 'framer-motion';

type ViewState = 'HOME' | 'DASHBOARD' | 'VOICE_MODE';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');

  // Command Handler for Voice
  const handleVoiceCommand = (cmd: string) => {
    console.log("Voice Command:", cmd);
    if (cmd === 'dashboard') setView('DASHBOARD');
    if (cmd === 'home') setView('HOME');
    if (cmd === 'voice') setView('VOICE_MODE');
  };

  const voice = useVoiceProcessor(handleVoiceCommand);

  return (
    <div className="relative w-full h-screen bg-cyber-black text-white overflow-hidden selection:bg-nebula-cyan/30 selection:text-black font-body">
      
      {/* 1. BACKGROUND LAYER: THE SENTINEL */}
      <div className="fixed inset-0 z-0">
        <SentinelScene 
          aiState={voice.state} 
          audioLevel={voice.audioLevel}
          view={view}
        />
      </div>

      {/* 2. FOREGROUND LAYER: CONTENT */}
      <AnimatePresence mode="wait">
        
        {/* PORTFOLIO VIEW */}
        {view === 'HOME' && (
          <motion.div 
            key="home"
            className="absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
          >
            <Portfolio 
              onOpenDashboard={() => setView('DASHBOARD')} 
              onOpenVoice={() => setView('VOICE_MODE')}
            />
          </motion.div>
        )}

        {/* DASHBOARD VIEW (Floating OS Window) */}
        {view === 'DASHBOARD' && (
          <motion.div 
            key="dashboard"
            className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <Dashboard onClose={() => setView('HOME')} />
          </motion.div>
        )}

        {/* VOICE MODE (Immersive Overlay) */}
        {view === 'VOICE_MODE' && (
          <motion.div
            key="voice"
            className="absolute inset-0 z-50"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <LiveDemo onClose={() => setView('HOME')} voiceHook={voice} />
          </motion.div>
        )}

      </AnimatePresence>

      {/* 3. PERSISTENT AI ASSISTANT ("BUBBLE") */}
      <BubbleAssistant />

      {/* 4. PERSISTENT HUD (Heads Up Display) */}
      <div className="fixed bottom-0 left-0 w-full p-6 z-40 pointer-events-none flex justify-between items-end mix-blend-difference">
        <div className="flex flex-col gap-1">
           <div className="text-[10px] font-mono text-nebula-cyan uppercase tracking-widest">System Status</div>
           <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${voice.state === 'IDLE' ? 'bg-emerald-500' : 'bg-nebula-accent animate-pulse'}`}></div>
             <span className="text-xs font-mono text-white/80">
               {voice.state === 'IDLE' ? 'OPERATIONAL' : 'PROCESSING...'}
             </span>
           </div>
        </div>
        <div className="text-right hidden md:block">
           <div className="text-[10px] font-mono text-white/50">SECURE CONNECTION</div>
           <div className="text-xs font-mono text-white">LATENCY: 4ms</div>
        </div>
      </div>

    </div>
  );
};

export default App;