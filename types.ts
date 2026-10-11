
export interface ContentPart {
    text?: string;
    inlineData?: { data: string; mimeType: string };
}

export interface Content {
    role?: string;
    parts: ContentPart[];
}

export enum Role {
    USER = 'user',
    BOT = 'model',
}

export type MediaType = 'image' | 'video' | 'sound';

export type ActiveEngine = 'Ollama';

export type SubstrateMode = 'discover' | 'modes' | 'finance' | 'patents' | 'sports' | 'academic' | 'shopping' | 'custom';

export interface EngineConfig {
    apiKey: string;
    isActive: boolean;
    endpoint?: string;
}

export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    url: string;
    source: string;
    timestamp: string;
}

export interface SubstrateVantage {
    id: string;
    label: string;
    icon: string;
    description: string;
    instruction: string;
}

export interface CustomSubstrate {
    id: string;
    label: string;
    icon: string;
    instruction: string;
}

export interface NeMoNode {
    id: string;
    name: string;
    status: 'online' | 'deploying' | 'offline' | 'error';
    type: 'asr' | 'nlp' | 'tts' | 'vision' | 'multimodal' | 'thinking';
    targetEngine: ActiveEngine;
    apiKey: string;
    logs: string[];
    metrics: { cpu: number; memory: number; gpu: number; };
}

export interface ModelCapability {
    id: string;
    label: string;
    description: string;
    engines: ActiveEngine[];
}

export interface Message {
    id: string;
    role: Role;
    content: string;
    avatarUrl?: string;
    mediaUrl?: string;
    mediaType?: MediaType;
    thinking?: string; // Metadata for DeepSeek / Gemini reasoning trace
}

export interface Personality {
    id: string;
    name: string;
    description: string;
    systemInstruction: string;
    voiceNameQuery: string;
    voiceName?: string;
    elevenLabsVoiceId?: string;
}

export interface AiSettings {
    temperature: number;
    maxOutputTokens: number;
}

export interface AppSettings {
    ai: AiSettings;
    simulation: { syntropyTarget: number; initialMass: number; initialCoupling: number; };
    personaId: string;
    voiceURI: string | null;
    avatarUrl: string | null;
    visuals: { colorPalette: string; particleDensity: number; fractalComplexity: number; };
    ambientSound: boolean;
    elevenLabsActive: boolean;
    voiceChangerMode: boolean;
    engineConfigs: Record<ActiveEngine, EngineConfig>;
}

export type GeminiHistory = Content[];

export interface SimulationOutput {
    substrate: string;
    time: number;
    stability: number;
    patterns: { [key: string]: number };
    mi_feedback: { mi_loss: number; mass_adjustment: number; coupling_adjustment: number; };
    fields: { matter: number[][]; gauge: number[][]; resonance: number[][]; };
    error?: string;
}

export interface SimulationConfig {
    width: number;
    height: number;
    syntropyTarget: number;
    initialMass: number;
    initialCoupling: number;
}

export interface SimulationState {
    miWeights1: number[][];
    miWeights2: number[][];
    fieldMass: number;
    fieldCoupling: number;
    time: number;
    patterns: SimulationOutput[];
}

export interface SimulationData {
    metrics: {
        stability: number;
        mi_loss: number;
        energy_density: number;
        chaos_metric: number;
        mean_resonance: number;
        mean_matter: number;
        mean_gauge: number;
    };
    parameters: { time: number; mass: number; coupling: number; learningRate: number; };
    fields: { matter: number[][]; gauge: number[][]; resonance: number[][]; };
}

export interface HistoryData {
    time: number;
    stability: number;
    mi_loss: number;
    energy_density: number;
}

export interface BackendAnalysisResult {
    output: number[][];
    pattern_strength: number;
    syntropy_level: number;
    timestamp: string;
    text_length: number;
}

export interface UseSimulationReturn {
    simulationData: SimulationData;
    triggerCycle: (external_data: number[]) => SimulationOutput;
    resetSimulation: () => void;
    startSimulation: () => void;
    stopSimulation: () => void;
    stepSimulation: () => void;
    history: HistoryData[];
    lastOutput: SimulationOutput | null;
}
