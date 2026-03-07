import React, { useState, useMemo } from 'react';

interface UIProps {
  currentSection: string;
  onNavigate: (section: string) => void;
  onOpenDashboard: () => void;
  aiState: string;
}

// --- MOCK DATA FOR PROJECTS ---
const PROJECTS = [
  { 
    id: 1, 
    title: 'NEON CLOUD', 
    category: 'SaaS', 
    tech: ['React', 'Node.js', 'WebRTC'], 
    status: 'LIVE', 
    desc: 'Distributed cloud asset management system with realtime collaboration.',
    image: 'https://images.unsplash.com/photo-1558494949-efc025793ad4?auto=format&fit=crop&q=80&w=2000'
  },
  { 
    id: 2, 
    title: 'VISION PRO UI', 
    category: 'Design System', 
    tech: ['Figma', 'Tailwind'], 
    status: 'BETA', 
    desc: 'Spatial computing interface kit for next-gen headsets.',
    image: 'https://images.unsplash.com/photo-1616353071855-2c045c4458ae?auto=format&fit=crop&q=80&w=2000'
  },
  { 
    id: 3, 
    title: 'SENTINEL CORE', 
    category: 'AI', 
    tech: ['Three.js', 'GenAI', 'Python'], 
    status: 'DEV', 
    desc: '3D Embodied conversational agent with voice synthesis.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=2000'
  },
  { 
    id: 4, 
    title: 'HYPER GRID', 
    category: 'SaaS', 
    tech: ['Next.js', 'WebGL'], 
    status: 'LIVE', 
    desc: 'High-performance data visualization dashboard for fintech.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000'
  }
];

export const UIOverlay: React.FC<UIProps> = ({ currentSection, onNavigate, onOpenDashboard, aiState }) => {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'ALL') return PROJECTS;
    return PROJECTS.filter(p => 
      p.category.toUpperCase() === activeFilter || 
      p.tech.some(t => t.toUpperCase() === activeFilter)
    );
  }, [activeFilter]);

  const navItems = [
    { id: 'hero', label: '01 // HOME' },
    { id: 'skills', label: '02 // CAPABILITIES' },
    { id: 'projects', label: '03 // DEPLOYMENTS' },
    { id: 'contact', label: '04 // COMMS' },
  ];

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 md:p-8 font-mono select-none overflow-hidden">
      
      {/* --- DECORATIVE HUD CORNERS --- */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-xl pointer-events-none"></div>
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-xl pointer-events-none"></div>
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-xl pointer-events-none"></div>
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-cyan-500/50 rounded-br-xl pointer-events-none"></div>

      {/* --- TOP HEADER (TACTICAL BAR) --- */}
      <header className="flex justify-between items-start pointer-events-auto bg-black/40 backdrop-blur-md p-4 border-b border-white/10 relative">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            SALIM SAMET 
            <span className="text-[10px] bg-cyan-900/50 text-cyan-400 px-2 py-0.5 border border-cyan-500/30 rounded">SYS.ADMIN</span>
          </h1>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400 uppercase tracking-widest">
             <span className="flex items-center gap-2">
                 <span className={`size-1.5 rounded-full ${aiState === 'IDLE' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                 AI CORE: {aiState}
             </span>
             <span>|</span>
             <span>BUILD V.2026.4</span>
          </div>
        </div>

        <nav className="hidden md:flex gap-1 bg-black/60 p-1 rounded border border-white/10">
            {navItems.map((item) => (
                <button 
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`px-4 py-2 text-xs font-bold tracking-widest transition-all clip-path-slant ${
                        currentSection === item.id 
                        ? 'bg-cyan-600 text-black' 
                        : 'text-cyan-500/60 hover:text-cyan-400 hover:bg-white/5'
                    }`}
                    style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}
                >
                    {item.label}
                </button>
            ))}
        </nav>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col justify-center items-center relative w-full h-full pointer-events-auto overflow-y-auto custom-scrollbar">
         
         {/* HERO SECTION */}
         {currentSection === 'hero' && (
            <div className="text-center space-y-6 max-w-4xl animate-in zoom-in duration-300">
                <div className="inline-block border border-cyan-500/30 bg-cyan-900/10 px-4 py-1 rounded-full text-cyan-400 text-xs font-bold tracking-[0.3em] mb-4">
                    AVAILABLE FOR DEPLOYMENT
                </div>
                <h2 className="text-7xl md:text-9xl font-black text-white leading-[0.8] tracking-tighter mix-blend-difference">
                    FUTURE <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">ENGINEER</span>
                </h2>
                <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto">
                    Merging high-fidelity 3D graphics with robust frontend architecture.
                </p>
                <div className="flex justify-center gap-4 mt-8">
                    <button onClick={onOpenDashboard} className="group relative px-8 py-4 bg-cyan-600 hover:bg-cyan-500 transition-all text-black font-bold text-sm tracking-widest overflow-hidden">
                        <span className="relative z-10 flex items-center gap-2">
                            INITIATE DASHBOARD
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
                    </button>
                </div>
            </div>
         )}
         
         {/* SKILLS SECTION */}
         {currentSection === 'skills' && (
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-10 duration-500">
                {['REACT ARCHITECTURE', 'THREE.JS / WEBGL', 'GEN-AI INTEGRATION', 'SYSTEM DESIGN'].map((skill, i) => (
                    <div key={skill} className="bg-black/60 border border-white/10 p-6 flex flex-col gap-4 group hover:border-cyan-500/50 transition-colors relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-cyan-500">memory</span>
                        </div>
                        <span className="text-4xl font-black text-white/10 group-hover:text-cyan-500/20 transition-colors">0{i+1}</span>
                        <h3 className="text-cyan-400 font-bold text-lg tracking-wider">{skill}</h3>
                        <div className="w-full bg-white/5 h-1">
                            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 h-full w-[85%] group-hover:w-[100%] transition-all duration-1000"></div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Advanced proficiency protocols loaded. System optimized for high-performance rendering and logic.
                        </p>
                    </div>
                ))}
            </div>
         )}

         {/* PROJECTS SECTION (WITH FILTERING) */}
         {currentSection === 'projects' && (
             <div className="w-full max-w-6xl h-full flex flex-col pt-10 pb-20 animate-in fade-in duration-500">
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-4 mb-8 pb-4 border-b border-white/10">
                    <span className="text-xs text-slate-500 font-bold uppercase mr-4">Filter Protocols:</span>
                    {['ALL', 'SAAS', 'AI', 'REACT', 'THREE.JS'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-3 py-1 text-xs font-bold border transition-all ${
                                activeFilter === filter 
                                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' 
                                : 'border-white/10 text-slate-500 hover:border-white/30 hover:text-white'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2 pb-20">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="group relative bg-black/40 border border-white/10 hover:border-cyan-500/50 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-300 flex flex-col md:flex-row h-48 overflow-hidden">
                            {/* Image Side */}
                            <div className="w-full md:w-48 relative overflow-hidden shrink-0">
                                <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0" />
                                <div className="absolute inset-0 bg-cyan-900/20 mix-blend-overlay"></div>
                            </div>
                            
                            {/* Content Side */}
                            <div className="p-6 flex flex-col justify-between flex-1 relative">
                                {/* Decor line */}
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none"></div>

                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                            project.status === 'LIVE' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400'
                                        }`}>
                                            [{project.status}]
                                        </span>
                                        <span className="text-xs text-cyan-700 font-bold">ID-{project.id.toString().padStart(3, '0')}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-2">{project.title}</h3>
                                    <p className="text-sm text-slate-400 line-clamp-2">{project.desc}</p>
                                </div>
                                
                                <div className="flex gap-2 mt-4">
                                    {project.tech.map(t => (
                                        <span key={t} className="text-[10px] text-cyan-500/70 border border-cyan-900/50 px-1.5 py-0.5">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
         )}

         {/* CONTACT SECTION */}
         {currentSection === 'contact' && (
             <div className="max-w-2xl w-full bg-black/60 border border-white/10 p-10 relative overflow-hidden animate-in slide-in-from-right duration-300">
                 {/* Scanning Line Animation */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-[scan_3s_ease-in-out_infinite]"></div>
                 
                 <h2 className="text-4xl font-black text-white mb-8">ESTABLISH UPLINK</h2>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-cyan-500 uppercase">Signal Source (Email)</label>
                        <a href="mailto:Salimsamet00@gmail.com" className="block text-xl text-white hover:text-cyan-400 transition-colors border-b border-white/10 pb-2">
                            Salimsamet00@gmail.com
                        </a>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-cyan-500 uppercase">Frequency (Phone)</label>
                        <a href="tel:+213669989786" className="block text-xl text-white hover:text-cyan-400 transition-colors border-b border-white/10 pb-2">
                            +213 669 98 97 86
                        </a>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button className="flex-1 py-4 border border-white/20 hover:bg-white/5 hover:border-cyan-500 text-sm font-bold tracking-widest transition-all">
                        TRANSMIT DATA
                    </button>
                    <button className="flex-1 py-4 bg-cyan-600 text-black hover:bg-cyan-500 text-sm font-bold tracking-widest transition-all">
                        DOWNLOAD CV
                    </button>
                 </div>
             </div>
         )}
      </main>

      {/* --- BOTTOM FOOTER (SYSTEM STATUS) --- */}
      <footer className="flex justify-between items-end pointer-events-auto border-t border-white/5 pt-4 bg-black/20 backdrop-blur-sm">
         <div className="text-[10px] text-slate-500 font-mono leading-tight">
            SYSTEM: ONLINE <br/>
            LATENCY: 12ms <br/>
            SECURE CONNECTION ESTABLISHED
         </div>
         <div className="flex gap-6">
            <a href="#" className="text-white/20 hover:text-cyan-400 font-bold text-xs uppercase tracking-widest transition-colors">GitHub_V.2</a>
            <a href="#" className="text-white/20 hover:text-cyan-400 font-bold text-xs uppercase tracking-widest transition-colors">LinkedIn_Net</a>
         </div>
      </footer>

      <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};