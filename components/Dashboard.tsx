import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface DashboardProps {
  onClose: () => void;
}

// Typewriter Component for Character-by-Character reveal
const TypewriterText: React.FC<{ text: string, isThinking: boolean }> = ({ text, isThinking }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        if (!text) {
            setDisplayedText('');
            return;
        }
        
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                // If text grows (streaming), this logic catches up naturally
                setDisplayedText(text.slice(0, i + 1));
                i++;
            } else {
                clearInterval(interval);
            }
        }, 20); // Speed of typing

        return () => clearInterval(interval);
    }, [text]); // Re-run if text changes to keep appending smoothly

    // Force update if stream gets way ahead or finishes
    useEffect(() => {
        if(text.length > displayedText.length) {
             // Logic to ensure we don't lag too far behind on long streams
             // but handled by the interval above mostly.
        }
    }, [text]);

    return (
        <div className="prose prose-invert text-sm max-w-none">
            {parseContent(displayedText)}
            {/* Cursor */}
            {!isThinking && displayedText.length < text.length && (
                 <span className="inline-block w-1.5 h-3 bg-nebula-cyan animate-pulse ml-0.5 align-middle" />
            )}
        </div>
    );
};

const parseContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
        if (part.startsWith('```')) {
            const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
            const language = match ? match[1] : 'javascript';
            const code = match ? match[2] : part.slice(3, -3);
            return (
                <div key={index} className="rounded-lg overflow-hidden my-4 border border-white/10 shadow-lg bg-[#0d0e1c]">
                    <div className="bg-white/5 px-4 py-2 text-xs font-mono text-white/50 flex justify-between items-center border-b border-white/5">
                        <span>{language}</span>
                        <span className="text-[10px] uppercase">Read-Only</span>
                    </div>
                    <SyntaxHighlighter
                        language={language || 'typescript'}
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, padding: '1rem', fontSize: '0.85rem', background: 'transparent' }}
                        wrapLines={true}
                        wrapLongLines={true}
                    >
                        {code.trim()}
                    </SyntaxHighlighter>
                </div>
            );
        }
        return <p key={index} className="whitespace-pre-wrap mb-4 text-slate-200 leading-relaxed">{part}</p>;
    });
};

const LoadingPulse = () => (
    <div className="flex flex-col gap-2 p-4 text-xs font-mono text-nebula-accent border border-nebula-accent/20 rounded bg-nebula-accent/5">
        <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-nebula-accent animate-ping"></span>
             <span>HANDSHAKE_INITIATED...</span>
        </div>
        <div className="h-1 w-full bg-white/10 rounded overflow-hidden">
            <motion.div 
                className="h-full bg-nebula-accent"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('CHAT');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  // New Feature: AI Mode
  const [aiMode, setAiMode] = useState<'CREATIVE' | 'LOGIC'>('LOGIC');

  useEffect(() => {
    if(chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, result, loading]);

  const handleGenerate = async () => {
    if(!prompt.trim()) return;
    const userPrompt = prompt;
    setPrompt('');
    setLoading(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        if (activeTab === 'IMAGE') {
            setResult(null);
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: userPrompt }] },
            });
            
            // Iterate through parts to find the image, as per guidelines
            let imageData: string | undefined;
            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        imageData = part.inlineData.data;
                        break;
                    }
                }
            }

            if (imageData) setResult(`data:image/png;base64,${imageData}`);
            setLoading(false);
            
        } else if (activeTab === 'CHAT') {
            setChatHistory(prev => [...prev, { role: 'user', text: userPrompt }]);
            
            const systemInstruction = `
            IDENTITY: MR. ROBOT (UNIT-01)
            OWNER: Salim Samet
            YEAR: 2026
            
            PERSONA:
            You are a Sentient AI Construct. 
            Tone: Cold, Analytical, Reserved, but helpful. 
            Slang: Use Cyberpunk terms (e.g., 'uplink', 'ice', 'meatspace', 'chrome', 'glitch', 'daemon', 'packet loss').
            
            MISSION:
            Assist the Operator (User) with technical architecture, code generation, or creative design for AETHER systems.
            
            FORMAT:
            - Keep responses concise and technical.
            - Use bullet points.
            - Do not be overly polite. Be efficient.
            `;

            const historyContents = chatHistory.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));
            
            const responseStream = await ai.models.generateContentStream({
                model: 'gemini-3-flash-preview',
                contents: [
                    ...historyContents,
                    { role: 'user', parts: [{ text: userPrompt }] }
                ],
                config: { systemInstruction }
            });

            setChatHistory(prev => [...prev, { role: 'model', text: '' }]);
            setLoading(false);

            let fullText = "";
            for await (const chunk of responseStream) {
                const chunkText = chunk.text;
                fullText += chunkText;
                setChatHistory(prev => {
                    const newHistory = [...prev];
                    const lastMsg = newHistory[newHistory.length - 1];
                    if (lastMsg.role === 'model') {
                        lastMsg.text = fullText;
                    }
                    return newHistory;
                });
            }
        } else {
             const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: userPrompt,
            });
            setResult(response.text || "No response.");
            setLoading(false);
        }
    } catch (e) {
        console.error(e);
        setLoading(false);
        if (activeTab === 'CHAT') {
             setChatHistory(prev => [...prev, { role: 'model', text: "CRITICAL_FAILURE: UPLINK_SEVERED." }]);
        }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleGenerate();
    }
  };

  return (
    <div className="w-full max-w-6xl h-[85vh] glass-panel rounded-3xl flex flex-col overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-white/5">
            <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-nebula-accent">dataset</span>
                <span className="font-display font-medium text-xl text-white tracking-widest">AETHER_LINK</span>
            </div>
            <div className="flex gap-4">
                {/* AI Mode Toggle */}
                {activeTab === 'CHAT' && (
                    <div className="flex bg-black/20 p-1 rounded-full border border-white/10">
                        <button 
                            onClick={() => setAiMode('LOGIC')}
                            className={`px-4 py-1 rounded-full text-[10px] font-mono font-bold transition-all ${aiMode === 'LOGIC' ? 'bg-nebula-cyan text-black shadow-lg' : 'text-white/40'}`}
                        >
                            UNIT-01
                        </button>
                        <button 
                            onClick={() => setAiMode('CREATIVE')}
                            className={`px-4 py-1 rounded-full text-[10px] font-mono font-bold transition-all ${aiMode === 'CREATIVE' ? 'bg-nebula-highlight text-black shadow-lg' : 'text-white/40'}`}
                        >
                            MUSE
                        </button>
                    </div>
                )}
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/80 hover:text-white flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-20 md:w-64 border-r border-white/10 bg-black/20 flex flex-col p-4 gap-2">
                {[
                    { id: 'CHAT', icon: 'chat_bubble', label: 'NEURAL CHAT' },
                    { id: 'IMAGE', icon: 'palette', label: 'VISUALIZER' },
                    { id: 'CODE', icon: 'terminal', label: 'CODE FORGE' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                            activeTab === tab.id 
                            ? 'bg-white/10 text-white border border-white/10 shadow-lg' 
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <span className="material-symbols-outlined">{tab.icon}</span>
                        <span className="hidden md:block font-mono tracking-wider">{tab.label}</span>
                    </button>
                ))}
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative bg-gradient-to-br from-transparent to-black/30">
                
                {/* Chat View */}
                {activeTab === 'CHAT' ? (
                    <div className="flex flex-col h-full">
                        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                            {chatHistory.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-30">
                                    <span className="material-symbols-outlined text-6xl mb-4">temp_preferences_custom</span>
                                    <p className="font-mono text-sm tracking-widest">AETHER ONLINE</p>
                                    <p className="font-mono text-xs text-nebula-accent mt-2">UNIT-01 LISTENING...</p>
                                </div>
                            )}
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl p-6 ${
                                        msg.role === 'user' 
                                        ? 'bg-nebula-accent text-white shadow-lg' 
                                        : 'glass-panel text-slate-200'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-3 text-[10px] font-bold uppercase opacity-50">
                                            <span>{msg.role === 'user' ? 'OPERATOR' : `UNIT-01 [${aiMode}]`}</span>
                                        </div>
                                        
                                        {/* Use Typewriter Only for Bot Messages */}
                                        {msg.role === 'model' ? (
                                            <TypewriterText text={msg.text} isThinking={loading && i === chatHistory.length - 1} />
                                        ) : (
                                            <div className="prose prose-invert text-sm max-w-none">
                                                {parseContent(msg.text)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="max-w-[80%] self-start">
                                    <LoadingPulse />
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 border-t border-white/10 bg-black/20">
                            <div className="relative flex items-center gap-4 bg-white/5 rounded-2xl border border-white/10 px-4 py-2 focus-within:border-nebula-accent/50 focus-within:bg-white/10 transition-all">
                                <textarea 
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter system prompt..."
                                    className="flex-1 bg-transparent text-white font-body text-sm focus:outline-none resize-none h-12 py-3"
                                />
                                <button 
                                    onClick={handleGenerate}
                                    disabled={loading || !prompt.trim()}
                                    className="w-10 h-10 rounded-full bg-nebula-accent text-white flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:scale-100 shadow-lg"
                                >
                                    <span className="material-symbols-outlined text-lg">arrow_upward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Standard Generation View
                    <div className="flex flex-col h-full p-8">
                         <div className="flex-1 border border-dashed border-white/10 rounded-2xl mb-4 flex flex-col overflow-hidden relative bg-black/20">
                             {loading && <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"><LoadingPulse /></div>}
                             
                             {result ? (
                                 activeTab === 'IMAGE' ? (
                                    <img src={result} className="w-full h-full object-contain p-4" alt="Generated" />
                                 ) : (
                                    <div className="p-4 overflow-auto custom-scrollbar">
                                        <SyntaxHighlighter language="typescript" style={vscDarkPlus} customStyle={{background: 'transparent'}}>
                                            {result}
                                        </SyntaxHighlighter>
                                    </div>
                                 )
                             ) : (
                                 <div className="flex-1 flex items-center justify-center text-white/20">
                                     NO OUTPUT
                                 </div>
                             )}
                         </div>

                         <div className="flex gap-4">
                             <input 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe output..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-nebula-accent"
                             />
                             <button 
                                onClick={handleGenerate}
                                disabled={loading}
                                className="px-6 py-3 bg-nebula-cyan text-black font-bold rounded-xl hover:bg-white transition-colors"
                             >
                                 GENERATE
                             </button>
                         </div>
                    </div>
                )}
            </main>
        </div>
    </div>
  );
};

export default Dashboard;