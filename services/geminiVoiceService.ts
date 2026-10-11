// Gemini Voice & Speech Synthesis Service
// Replaces external third-party TTS with native Gemini 3 Flash Lite TTS
// Ollama-only: no cloud imports

const getGeminiKey = (customKey?: string): string => {
    if (customKey && customKey.trim().length > 0) return customKey.trim();
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
        return import.meta.env.VITE_GEMINI_API_KEY;
    }
    if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
        return process.env.GEMINI_API_KEY;
    }
    return '';
};

// Map legacy ElevenLabs IDs to high quality Gemini Prebuilt Voices
const VOICE_MAP: Record<string, string> = {
    'cgSgSjJ4fMocvsnnyIIL': 'Kore',   // Warm & natural
    '21m00Tcm4TbcDq8BCT5L': 'Zephyr', // Poetic & enigmatic
    'ErXw7NoAyWEnS9n99999': 'Puck',   // Clear & articulate
    'onwK4e9ZLuTAKqWW03F9': 'Fenrir', // Deep & steady
    'EXAVITQu4vr4xnSDxMaL': 'Charon', // Expressive & vibrant
};

const VALID_GEMINI_VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

/**
 * Synthesizes high-fidelity speech using Gemini 3.8 Flash Lite TTS
 */
export const geminiTextToSpeech = async (
    text: string, 
    voiceNameOrId: string = 'Kore', 
    apiKey?: string
): Promise<HTMLAudioElement> => {
    const key = getGeminiKey(apiKey);
    if (!key) {
        throw new Error('Gemini API key required for Gemini Neural Voice.');
    }

    // Resolve voice name
    let selectedVoice = VOICE_MAP[voiceNameOrId] || voiceNameOrId;
    if (!VALID_GEMINI_VOICES.includes(selectedVoice)) {
        selectedVoice = 'Kore';
    }

    // Clean text: strip markdown code blocks and excess punctuation
    const cleanText = text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*#_~]/g, '')
        .trim();

    if (!cleanText) {
        throw new Error('Empty text content for speech synthesis.');
    }

    // Limit length to keep TTS snappy (first 600 characters / natural stopping point)
    let speechInput = cleanText;
    if (speechInput.length > 600) {
        const truncated = speechInput.substring(0, 600);
        const lastSentenceEnd = Math.max(
            truncated.lastIndexOf('. '), 
            truncated.lastIndexOf('! '), 
            truncated.lastIndexOf('? ')
        );
        speechInput = lastSentenceEnd > 200 ? truncated.substring(0, lastSentenceEnd + 1) : truncated + '...';
    }

    const ai = null /* Ollama-only */;

    const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
            {
                role: 'user',
                parts: [{ text: speechInput }]
            }
        ],
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: selectedVoice }
                }
            }
        }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error('No audio payload received from Gemini TTS.');
    }

    const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
    return audio;
};

/**
 * Creates ambient synthesized sound effects without external APIs
 */
export const generateSoundEffect = async (effectType: string = 'resonance'): Promise<HTMLAudioElement> => {
    // Generate programmatic harmonic sound using Web Audio API and return as audio element
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 2.0;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
            const t = i / sampleRate;
            const freq = effectType === 'alert' ? 880 : 432;
            const envelope = Math.exp(-2.5 * t);
            const harmonic = Math.sin(2 * Math.PI * freq * t) * 0.5 + 
                             Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.25;
            channelData[i] = harmonic * envelope;
        }
    }

    // Render buffer to wav blob
    const wavBlob = audioBufferToWavBlob(buffer);
    return new Audio(URL.createObjectURL(wavBlob));
};

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels: Float32Array[] = [];
    let sampleRate = buffer.sampleRate;
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) {
        out.setUint16(pos, data, true);
        pos += 2;
    }
    function setUint32(data: number) {
        out.setUint32(pos, data, true);
        pos += 4;
    }

    // RIFF header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1); // PCM
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
        for (let i = 0; i < numOfChan; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            out.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([out.buffer], { type: 'audio/wav' });
}
