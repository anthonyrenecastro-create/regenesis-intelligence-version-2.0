// Legacy compatibility layer: Re-routed entirely to Gemini Native TTS & Web Audio
// ElevenLabs API has been replaced by Gemini 3 Flash Lite TTS
import { geminiTextToSpeech, generateSoundEffect } from './geminiVoiceService';

/**
 * Converts text to speech using Gemini 3.8 Flash Lite TTS instead of ElevenLabs
 */
export const textToSpeech = async (
    text: string, 
    voiceId: string = 'Kore', 
    _stability?: number
): Promise<HTMLAudioElement> => {
    return geminiTextToSpeech(text, voiceId);
};

export { generateSoundEffect };
