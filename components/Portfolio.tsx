import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PortfolioProps {
  onOpenDashboard: () => void;
  onOpenVoice: () => void;
}

interface Project {
  id: number;
  title: string;
  category: string;
  tech: string[];
  desc: string;
  image: string;
  link?: string;
  status: 'ONLINE' | 'ARCHIVED' | 'SYNTHESIZING' | 'LIVE' | 'BETA' | 'DEV' | 'OFFLINE';
  deepWork?: string; // Content for the "Process" view
}

// --- PROJECT CARD COMPONENT ---
const ProjectCard: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const [showProcess, setShowProcess] = useState(false);

  const getStatusColor = (status: string) => {
      if (status === 'ONLINE' || status === 'LIVE') return 'text-emerald-400 bg-emerald-900/20 border-emerald-500/30';
      if (status === 'BETA' || status === 'SYNTHESIZING') return 'text-amber-400 bg-amber-900/20 border-amber-500/30';
      if (status === 'DEV') return 'text-nebula-cyan bg-cyan-900/20 border-cyan-500/30';
      return 'text-red-400 bg-red-900/20 border-red-500/30';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="group relative w-full glass-panel rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:border-nebula-accent/50 flex flex-col"
    >
      <div className="relative h-48 w-full overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#030014] to-transparent z-10 opacity-80" />
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
        />
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
             <span className="px-3 py-1 text-[10px] font-mono font-bold bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-nebula-highlight uppercase tracking-widest w-fit">
                 {project.category}
             </span>
             <motion.span 
                key={project.status}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`px-3 py-1 text-[10px] font-mono font-bold backdrop-blur-md border rounded-full uppercase tracking-widest w-fit flex items-center gap-2 ${getStatusColor(project.status)}`}
             >
                 <span className={`w-1.5 h-1.5 rounded-full bg-current ${['LIVE', 'ONLINE', 'BETA'].includes(project.status) ? 'animate-pulse' : ''}`} />
                 {project.status}
             </motion.span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 relative z-20 -mt-8">
        <div className="flex justify-between items-end mb-2">
            <h3 className="text-xl font-display font-medium text-white group-hover:text-nebula-accent transition-colors">
                {project.title}
            </h3>
            <div className="flex gap-2">
                <button 
                    onClick={() => setShowProcess(!showProcess)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    title="View Process"
                >
                    <span className="material-symbols-outlined text-sm text-nebula-cyan">
                        {showProcess ? 'close' : 'info'}
                    </span>
                </button>
                {project.link && (
                    <a href={project.link} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-sm text-white">arrow_outward</span>
                    </a>
                )}
            </div>
        </div>
        
        <AnimatePresence mode="wait">
            {showProcess ? (
                <motion.div 
                    key="process"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                >
                    <p className="text-xs text-nebula-cyan font-mono mb-2">// DEEP WORK LOG</p>
                    <p className="text-sm text-slate-300 font-body leading-relaxed mb-4 border-l-2 border-nebula-cyan/30 pl-3">
                        {project.deepWork || "Process data corrupted. Manual override required."}
                    </p>
                </motion.div>
            ) : (
                <motion.div key="desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     <p className="text-sm text-slate-400 font-body leading-relaxed mb-6 line-clamp-3 group-hover:text-slate-200 transition-colors">
                        {project.desc}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="mt-auto flex flex-wrap gap-2">
           {project.tech.map((t) => (
             <span key={t} className="px-2 py-1 text-[10px] font-mono text-nebula-cyan/80 bg-nebula-cyan/5 rounded border border-nebula-cyan/10">
               {t}
             </span>
           ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- TERMINAL COMPONENT ---
const RetroTerminal: React.FC = () => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<string[]>(['> SYSTEM READY. Type "help" for commands.']);
    
    const handleCommand = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const cmd = input.trim().toLowerCase();
            const newHistory = [...history, `> ${input}`];
            
            if (cmd === 'help') {
                newHistory.push('COMMANDS: contact, skills, clear, date');
            } else if (cmd === 'contact') {
                newHistory.push('EMAIL: salimsamet00@gmail.com');
                newHistory.push('PHONE: +213 669 98 97 86');
            } else if (cmd === 'skills') {
                newHistory.push('NLP, Python, React, Three.js, Automation');
            } else if (cmd === 'date') {
                newHistory.push(new Date().toString());
            } else if (cmd === 'clear') {
                setHistory(['> CONSOLE CLEARED']);
                setInput('');
                return;
            } else {
                newHistory.push('ERROR: Command not recognized.');
            }
            
            setHistory(newHistory);
            setInput('');
        }
    };

    return (
        <div className="w-full mt-24 border-t border-white/10 bg-black/40 p-6 font-mono text-xs">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-2 text-nebula-cyan mb-2">
                    <span className="material-symbols-outlined text-sm">terminal</span>
                    <span>ADMIN_CONSOLE_V2</span>
                </div>
                <div className="h-32 overflow-y-auto mb-2 space-y-1 text-slate-400 custom-scrollbar">
                    {history.map((line, i) => (
                        <div key={i}>{line}</div>
                    ))}
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-nebula-highlight">root@mr-robot:~#</span>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleCommand}
                        className="flex-1 bg-transparent focus:outline-none text-white"
                        autoFocus
                    />
                </div>
            </div>
        </div>
    );
};

// --- MAIN PORTFOLIO COMPONENT ---
const Portfolio: React.FC<PortfolioProps> = ({ onOpenDashboard, onOpenVoice }) => {
    const [filter, setFilter] = useState('ALL');
    const [projects] = useState<Project[]>([
        { 
            id: 1, 
            title: "ALGERIAN SENTIMENT", 
            category: "AI/NLP", 
            status: 'LIVE', 
            tech: ["Python", "Streamlit", "NLP", "Pandas"], 
            desc: "Interactive web app analyzing emotions in Algerian Arabic dialect (Derja) with 85% accuracy.", 
            image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800",
            link: "https://algerian-sentiment-ggnh57jracm8pq3dxyccvj.streamlit.app/",
            deepWork: "Curated a dataset of 200+ labeled comments. Implemented custom text preprocessing for Arabizi and Arabic script to handle dialect nuances."
        },
        { 
            id: 2, 
            title: "HOSPITAL AUTOMATION", 
            category: "DATA", 
            status: 'ARCHIVED', 
            tech: ["Python", "Excel", "Automation"], 
            desc: "Automated administrative workflows for a military hospital, reducing data entry time by 40%.", 
            image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
            deepWork: "Identified bottlenecks in patient record archiving. Wrote Python scripts to parse legacy formats and unify databases."
        },
        { 
            id: 3, 
            title: "AETHER PORTFOLIO", 
            category: "WEB", 
            status: 'ONLINE', 
            tech: ["React", "Three.js", "GenAI", "Tailwind"], 
            desc: "Spatial portfolio featuring a conversational AI assistant and 3D environment.", 
            image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
            deepWork: "Integrated Google Gemini API for the 'Bubble' assistant. Optimized Three.js rendering for mobile devices."
        },
        { 
            id: 4, 
            title: "LEGAL DB SYSTEM", 
            category: "DATA", 
            status: 'DEV', 
            tech: ["SQL", "React", "Node"], 
            desc: "Concept for a searchable database of Algerian legal texts, bridging my Law background with Tech.", 
            image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
            deepWork: "Structuring schema for complex legal citations and bilingual (Arabic/French) search indexing."
        }
    ]);

    const filteredProjects = projects.filter(p => filter === 'ALL' || (p.category.includes(filter) ? true : false));
    const tabs = ['ALL', 'AI/NLP', 'WEB', 'DATA'];

    return (
        <main className="w-full h-full overflow-y-auto custom-scrollbar relative z-20 bg-transparent selection:bg-nebula-accent selection:text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-display font-medium tracking-widest text-white">MR. ROBOT</h1>
                    <span className="text-[10px] font-mono text-nebula-accent tracking-[0.4em]">SALIM SAMET</span>
                </div>
                <nav className="flex gap-4">
                    <button 
                        onClick={onOpenDashboard} 
                        className="glass-panel px-6 py-2 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2 group"
                    >
                        <span className="w-2 h-2 rounded-full bg-nebula-accent group-hover:animate-pulse"></span>
                        <span className="text-xs font-mono text-white tracking-widest hidden md:block">AETHER_LINK</span>
                    </button>
                    <button 
                        onClick={onOpenVoice} 
                        className="w-10 h-10 glass-panel rounded-full flex items-center justify-center hover:bg-white/10 transition-all hover:scale-110"
                    >
                        <span className="material-symbols-outlined text-lg text-white">mic</span>
                    </button>
                </nav>
            </header>

            <div className="max-w-7xl mx-auto px-6 md:px-12 pt-36 pb-20">
                
                {/* Hero Section */}
                <section className="min-h-[60vh] flex flex-col justify-center mb-24 relative">
                     <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 1 }}
                        className="relative z-10"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-nebula-accent/30 bg-nebula-accent/10 mb-6">
                            <span className="w-1.5 h-1.5 bg-nebula-highlight rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-mono text-nebula-highlight uppercase tracking-widest">Available for Work</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-8xl font-display font-bold text-white mb-2 leading-[0.9] tracking-tighter">
                            SALIM SAMET
                        </h1>
                        <h2 className="text-2xl md:text-4xl font-mono font-light mb-8 text-transparent bg-clip-text bg-gradient-to-r from-nebula-accent via-white to-nebula-cyan">
                            AI ENGINEER & DATA SCIENTIST
                        </h2>
                        
                        <div className="max-w-2xl border-l-2 border-nebula-accent/30 pl-6 space-y-4">
                            <p className="text-lg text-slate-300 font-body font-light leading-relaxed">
                                From <strong>Law</strong> to <strong>Algorithms</strong>. I build intelligent systems that bridge linguistic gaps.
                                Specializing in <strong>NLP</strong> for low-resource languages (Derja) and automating complex workflows.
                            </p>
                            <div className="flex gap-4 text-xs font-mono text-slate-500">
                                <span><i className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-1"/>ALGIERS / TEBESSA</span>
                                <span><i className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-1"/>24 YEARS OLD</span>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-wrap gap-4">
                            <a href="mailto:salimsamet00@gmail.com" className="px-8 py-4 bg-white text-black rounded-full font-bold font-mono text-sm tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                CONTACT ME
                            </a>
                            <a href="https://github.com/Mrrobot-rx" target="_blank" rel="noreferrer" className="px-8 py-4 glass-panel text-white rounded-full font-bold font-mono text-sm tracking-widest hover:bg-white/10 transition-colors">
                                GITHUB
                            </a>
                        </div>
                    </motion.div>
                </section>

                {/* Projects Section */}
                <section id="projects" className="relative mb-32">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                         <h2 className="text-4xl font-display font-medium text-white">DEPLOYMENTS</h2>
                         
                         <div className="flex gap-2 bg-white/5 p-1 rounded-full backdrop-blur-md border border-white/10 mt-6 md:mt-0 overflow-x-auto max-w-full">
                            {tabs.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className="relative px-6 py-2 rounded-full text-xs font-mono font-bold tracking-widest transition-all focus:outline-none"
                                    style={{ color: filter === t ? '#fff' : 'rgba(255,255,255,0.5)' }}
                                >
                                    {filter === t && (
                                        <motion.div 
                                            layoutId="activeFilter"
                                            className="absolute inset-0 bg-nebula-accent rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10">{t}</span>
                                </button>
                            ))}
                         </div>
                    </div>

                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        <AnimatePresence>
                            {filteredProjects.map((p, i) => (
                                <ProjectCard key={p.id} project={p} index={i} />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </section>

                {/* Experience / Timeline */}
                <section className="mb-32">
                    <h2 className="text-3xl font-display font-medium text-white mb-12">TRAJECTORY</h2>
                    <div className="relative border-l border-white/10 ml-4 space-y-12">
                        
                        {/* Item 1 */}
                        <div className="relative pl-12">
                            <span className="absolute -left-[5px] top-2 w-2.5 h-2.5 bg-nebula-cyan rounded-full shadow-[0_0_10px_#06b6d4]"></span>
                            <span className="text-xs font-mono text-nebula-cyan mb-1 block">2024 - PRESENT</span>
                            <h3 className="text-xl text-white font-bold">Independent AI Researcher & Dev</h3>
                            <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
                                Focusing on NLP for Algerian dialects. Built sentiment analysis tools achieving 85% accuracy. Deepening knowledge in Generative AI agents.
                            </p>
                        </div>

                        {/* Item 2 */}
                        <div className="relative pl-12">
                             <span className="absolute -left-[5px] top-2 w-2.5 h-2.5 bg-purple-500 rounded-full"></span>
                            <span className="text-xs font-mono text-purple-400 mb-1 block">2023 - 2024</span>
                            <h3 className="text-xl text-white font-bold">Admin Assistant - Military Hospital</h3>
                            <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
                                Staoueli, Alger. Identified workflow inefficiencies and self-taught Python automation to streamline archival data entry.
                            </p>
                        </div>

                         {/* Item 3 */}
                         <div className="relative pl-12">
                             <span className="absolute -left-[5px] top-2 w-2.5 h-2.5 bg-slate-600 rounded-full"></span>
                            <span className="text-xs font-mono text-slate-500 mb-1 block">2019 - 2021</span>
                            <h3 className="text-xl text-white font-bold">Law Studies & Transition</h3>
                            <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
                                Larbi Tebessi University. Realized passion lay in logic systems rather than legal systems. Began self-directed path in Technology.
                            </p>
                        </div>

                    </div>
                </section>

            </div>
            
            {/* RETRO FOOTER */}
            <RetroTerminal />
        </main>
    );
};

export default Portfolio;