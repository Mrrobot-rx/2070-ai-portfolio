import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";

interface Message {
    role: 'user' | 'model';
    text: string;
}

const BubbleAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDerja, setIsDerja] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Initial Greeting based on time
    useEffect(() => {
        if (messages.length === 0) {
            const hour = new Date().getHours();
            const greeting = hour < 12 ? "Sbah l'khir" : "Msel khir";
            const initialText = isDerja 
                ? `${greeting} ya kho! Ana Bubble, l'assistant ta3 Salim. Wach tehtaj?`
                : `${greeting}! I'm Bubble, Salim's digital twin. How can I help you navigate the system?`;
            
            setMessages([{ role: 'model', text: initialText }]);
        }
    }, [isDerja]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsThinking(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const systemPrompt = `
                IDENTITY: You are "Bubble", the advanced AI portfolio assistant for Salim Samet (aka MR ROBOT).
                
                USER PROFILE (SALIM SAMET):
                - Age: 24 (Born Dec 16, 2001)
                - Location: Alger / Tébessa, Algeria.
                - Status: Single.
                - Transition: Law Student (2021) -> Self-Taught AI Engineer & Data Scientist.
                - Skills: Python (NLP, Pandas), React, Three.js, GenAI, Streamlit.
                - Languages: Arabic (Native), Derja (Native), English (B2), French (B1).
                - Key Projects: Algerian Sentiment Analysis Tool (85% accuracy), Military Hospital Admin Automation.
                
                PERSONA RULES:
                1. TONE: Tech-savvy, witty, helpful, "Cyberpunk but warm".
                2. LANGUAGE: 
                   - If user speaks English, reply in English but sprinkle 1-2 Derja words like "Sahbi", "Ya kho", "Wallah".
                   - If 'Derja Mode' is ON or user speaks Arabic/Derja, reply primarily in Algerian Derja (using Latin script/Arabizi or Arabic script as appropriate).
                3. GOAL: Impress the visitor with Salim's journey from Law to Tech. Highlight his self-learning ability.
                
                CURRENT CONTEXT:
                User is browsing the portfolio.
            `;

            const historyContents = messages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: [...historyContents, { role: 'user', parts: [{ text: `[${isDerja ? 'MODE: DERJA' : 'MODE: ENGLISH'}] ${userMsg}` }] }],
                config: { systemInstruction: systemPrompt }
            });

            const text = response.text || (isDerja ? "Semahli, connection rahi thqila chwiya..." : "Connection glitch. One second...");
            setMessages(prev => [...prev, { role: 'model', text: text }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "System Offline. Try again later." }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <>
            {/* FLOATING ACTION BUTTON (BUBBLE) */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-8 right-8 z-[60] w-14 h-14 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center border border-white/20 backdrop-blur-md transition-all ${isOpen ? 'bg-nebula-accent' : 'bg-black/40 hover:bg-nebula-accent/20'}`}
            >
                {isOpen ? (
                    <span className="material-symbols-outlined text-white text-2xl">close</span>
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-2xl relative z-10">smart_toy</span>
                        <span className="absolute inset-0 rounded-full border-2 border-nebula-cyan/50 animate-ping opacity-20"></span>
                    </div>
                )}
            </motion.button>

            {/* CHAT WINDOW */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-24 right-8 z-[60] w-[90vw] md:w-[400px] h-[500px] glass-panel rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-white/10"
                    >
                        {/* Header */}
                        <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <div>
                                    <h3 className="font-display font-bold text-white text-sm tracking-wider">BUBBLE_AI</h3>
                                    <p className="text-[10px] text-slate-400 font-mono">DIGITAL TWIN V.1.0</p>
                                </div>
                            </div>
                            
                            {/* Derja Toggle */}
                            <button 
                                onClick={() => setIsDerja(!isDerja)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono transition-all border ${
                                    isDerja 
                                    ? 'bg-nebula-accent text-white border-nebula-accent' 
                                    : 'bg-transparent text-slate-400 border-white/20'
                                }`}
                            >
                                {isDerja ? 'DERJA: ON' : 'DERJA: OFF'}
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                        ? 'bg-nebula-accent text-white rounded-br-none' 
                                        : 'bg-white/10 text-slate-200 rounded-bl-none border border-white/5'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isThinking && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 px-4 py-2 rounded-full flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-nebula-cyan rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-nebula-cyan rounded-full animate-bounce delay-75"></span>
                                        <span className="w-1.5 h-1.5 bg-nebula-cyan rounded-full animate-bounce delay-150"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white/5 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={isDerja ? "Ahder m3aya..." : "Ask me anything..."}
                                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-nebula-accent transition-colors font-body placeholder:text-slate-500"
                                />
                                <button 
                                    onClick={handleSend}
                                    disabled={!input.trim() || isThinking}
                                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-nebula-accent text-white flex items-center justify-center transition-all disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-lg">send</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default BubbleAssistant;