import { useState, useEffect, useRef, useCallback } from 'react';
import { geminiTextToSpeech } from '../services/geminiVoiceService';

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
}

export const useSpeech = () => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    useEffect(() => {
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (SpeechRecognitionAPI) {
            setHasSpeechRecognition(true);
            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setTranscript(finalTranscript + interimTranscript);
            };
            
            recognition.onerror = (event: any) => {
                if (event.error === 'no-speech') return;
                setIsListening(false);
            };

            recognition.onend = () => setIsListening(false);
            recognitionRef.current = recognition;
        }

        const loadVoices = () => {
            const synth = window.speechSynthesis;
            if (!synth) return;
            const voices = synth.getVoices();
            if (voices.length > 0) {
                 setAvailableVoices(voices.filter(v => v.lang.startsWith('en-')));
            }
        };

        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
            loadVoices();
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                console.error("Speech recognition start failed:", err);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    const speak = useCallback(async (text: string, voiceNameOrId: string | null = 'Kore', useNeuralVoice: boolean = true, apiKey?: string) => {
        if (!text.trim()) return;

        // Stop any current audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        window.speechSynthesis.cancel();

        setIsSpeaking(true);

        if (useNeuralVoice) {
            try {
                const audio = await geminiTextToSpeech(text, voiceNameOrId || 'Kore', apiKey);
                audioRef.current = audio;
                audio.onended = () => setIsSpeaking(false);
                audio.onerror = () => {
                    console.warn("Gemini audio playback error, falling back to Web Speech");
                    playWebSpeechFallback(text);
                };
                await audio.play();
                return;
            } catch (error) {
                console.warn("Gemini TTS failed, falling back to Web Speech API:", error);
            }
        }

        // Fallback to browser Web Speech API
        playWebSpeechFallback(text);
    }, []);

    const playWebSpeechFallback = (text: string) => {
        try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        } catch {
            setIsSpeaking(false);
        }
    };

    const cancelSpeech = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    return {
        isListening,
        isSpeaking,
        transcript,
        startListening,
        stopListening,
        hasSpeechRecognition,
        speak,
        cancelSpeech,
        availableVoices,
    };
};
