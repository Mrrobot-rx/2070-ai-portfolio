import { useState, useEffect, useRef, useCallback } from 'react';

export type Language = 'en-US' | 'ar-DZ';
export type RobotState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';

interface VoiceHook {
  state: RobotState;
  transcript: string;
  language: Language;
  audioLevel: number;
  toggleLanguage: () => void;
  startListening: () => void;
  speak: (text: string) => void;
}

export const useVoiceProcessor = (onCommand: (cmd: string) => void): VoiceHook => {
  const [state, setState] = useState<RobotState>('IDLE');
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState<Language>('en-US');
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const animationFrameRef = useRef<number>();

  // Audio Level Loop Simulation
  useEffect(() => {
    const updateAudioLevel = () => {
        if (state === 'SPEAKING' || state === 'LISTENING') {
            const simulatedVolume = Math.random() * 0.8; 
            setAudioLevel(simulatedVolume);
        } else {
            setAudioLevel(prev => Math.max(0, prev - 0.1));
        }
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };
    updateAudioLevel();
    return () => cancelAnimationFrame(animationFrameRef.current!);
  }, [state]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (recognitionRef.current) try { recognitionRef.current.abort(); } catch(e) {}

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'ar-DZ' ? 'ar-SA' : 'en-US';
    }
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => {
      const newLang = prev === 'en-US' ? 'ar-DZ' : 'en-US';
      speak(newLang === 'en-US' ? "Language set to English." : "Lougha mbedla lel darja.");
      return newLang;
    });
  }, []);

  const processIntent = async (text: string) => {
    setState('THINKING');
    const lowerText = text.toLowerCase();
    
    setTimeout(() => {
        if (lowerText.match(/dashboard|studio|create/)) {
            onCommand('dashboard');
            speak("Opening Neural Studio.");
        } else if (lowerText.match(/home|back|return/)) {
            onCommand('home');
            speak("Returning to main view.");
        } else {
            speak("Command acknowledged.");
        }
    }, 1000);
  };

  const speak = (text: string) => {
    if (!synthesisRef.current) return;
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; 
    utterance.pitch = 0.8;
    utterance.onstart = () => setState('SPEAKING');
    utterance.onend = () => setState('IDLE');
    synthesisRef.current.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    if (state === 'LISTENING') {
        recognitionRef.current.stop();
        setState('IDLE');
        return;
    }

    try {
        recognitionRef.current.start();
        setState('LISTENING');
        setTranscript('');
    } catch (e) {
        setState('IDLE');
    }

    recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processIntent(text);
    };
    recognitionRef.current.onend = () => {
        if (state === 'LISTENING') setState('IDLE');
    };
  };

  return { state, transcript, language, audioLevel, toggleLanguage, startListening, speak };
};