// Model Gateway — Ollama-only (local, no cloud APIs)
// Ollama-only: no cloud AI imports
import type { ActiveEngine, GeminiHistory, AiSettings, SubstrateMode, CustomSubstrate, NewsItem, SubstrateVantage, EngineConfig } from '../types';

const cleanAndParseJson = (text: string) => {
    const sanitizedText = text.replace(/\[\d+\]/g, "");
    const start = sanitizedText.indexOf('[');
    if (start === -1) return null;
    let end = -1;
    const lastBrace = sanitizedText.lastIndexOf('}');
    if (lastBrace !== -1) {
        end = sanitizedText.indexOf(']', lastBrace);
    }
    if (end === -1) end = sanitizedText.lastIndexOf(']');
    if (end === -1 || end <= start) return null;
    let jsonStr = sanitizedText.substring(start, end + 1);
    jsonStr = jsonStr
        .replace(/}\s*{/g, '},{')
        .replace(/]\s*\[/g, '],[')
        .replace(/,\s*]/g, ']')
        .replace(/,\s*}/g, '}')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        .trim();
    try {
        return JSON.parse(jsonStr);
    } catch {
        try {
            return JSON.parse(jsonStr.replace(/(\w+):/g, '"$1":'));
        } catch {
            return null;
        }
    }
};

// Default fallback items when offline or prior to provisioning keys
const getCuratedSubstrateNews = (mode: SubstrateMode): NewsItem[] => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const defaults: Record<string, NewsItem[]> = {
        discover: [
            { id: '1', title: 'Local Inference Mesh Online', summary: 'Ollama local model serving active with real-time inference.', url: 'https://deepmind.google/technologies/gemini/', source: 'Cortex Feed', timestamp: now },
            { id: '2', title: 'SNN Syntropy Optimization', summary: 'Spiking neural network manifold stabilized at optimal coupling coefficients.', url: '#', source: 'Bio-SNN Core', timestamp: now },
            { id: '3', title: 'Google Search Grounding Link', summary: 'Live real-time web retrieval pipeline online for instantaneous world fact verification.', url: '#', source: 'Search Mesh', timestamp: now },
        ],
        finance: [
            { id: '1', title: 'Decentralized Liquidity Matrix', summary: 'Automated market making pools shifting toward zero-slippage invariant curves.', url: '#', source: 'DeFi Terminal', timestamp: now },
            { id: '2', title: 'Macro Yield Spread Compression', summary: 'Treasury curve re-steepening signals algorithmic risk-parity reallocation.', url: '#', source: 'Macro Pulse', timestamp: now },
        ],
        patents: [
            { id: '1', title: 'Neuromorphic Optical Chip Architecture', summary: 'New patent filings demonstrate sub-picosecond synaptic optical switching.', url: '#', source: 'USPTO Radar', timestamp: now },
        ],
        academic: [
            { id: '1', title: 'Non-equilibrium Thermodynamic Memory', summary: 'Preprint details reversible computation using microfluidic cellular automata.', url: '#', source: 'arXiv Quantum', timestamp: now },
        ]
    };
    return defaults[mode] || defaults.discover;
};

// Fetch substrate news (curated offline feed)
export const fetchSubstrateNews = async (
    mode: SubstrateMode,
    keys?: any,
    vantage?: SubstrateVantage
): Promise<NewsItem[]> => {
    // Ollama-only: use curated offline substrate news (no live web retrieval)
    return getCuratedSubstrateNews(mode);
};

export const fetchSubstrateVantages = async (): Promise<SubstrateVantage[]> => {
    // Ollama-only: return empty (vantages require cloud AI)
    return [];
};

const validateApiKey = (engine: ActiveEngine, key: string): { valid: boolean; message?: string } => {
    // Ollama-only: no API key needed (local)
    return { valid: true };
};

export const sendMessageToUniversalEngine = async (
    engine: ActiveEngine,
    message: string,
    history: GeminiHistory,
    settings: AiSettings,
    systemInstruction: string,
    engineConfigs: Record<ActiveEngine, EngineConfig>,
    mode: SubstrateMode = 'discover',
    customSubs: CustomSubstrate[] = [],
    activeVantage?: SubstrateVantage,
    inlineData?: { data: string, mimeType: string } | null
) => {
    let domainFocus = `MODE_ACTIVE: ${mode.toUpperCase()}. `;
    if (activeVantage) {
        domainFocus += `VANTAGE_LOCKED: ${activeVantage.label}. LOGIC_MESH: ${activeVantage.instruction}`;
    }

    const finalSystem = `${systemInstruction}\n\n[SUBSTRATE_ORCHESTRATION_CONTEXT]:\n${domainFocus}\nACTIVE_ENGINE: ${engine}`;

    async function* engineStream() {
        const key = engineConfigs[engine]?.apiKey;
        // Ollama-only: no API key required

        // ==========================================
        // OLLAMA ENGINE (Local)
        // ==========================================
        if (engine === 'Ollama') {
            try {
                const endpoint = `${key || 'http://localhost:11434'}/api/chat`;
                const body = {
                    model: 'llama3',
                    messages: [
                        { role: 'system', content: finalSystem },
                        ...history.map(h => ({
                            role: h.role === 'model' ? 'assistant' : 'user',
                            content: h.parts[0]?.text || ''
                        })),
                        { role: 'user', content: message }
                    ],
                    stream: false
                };

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (!response.ok) {
                    throw new Error(`Ollama error (${response.status})`);
                }

                const result = await response.json();
                const text = result.message?.content || '';
                if (!text) throw new Error("Ollama returned an empty response.");
                yield { text };
                return;
            } catch (err: any) {
                console.error("[Ollama] Error:", err);
                yield { text: `[OLLAMA_FAULT]: Ensure Ollama is running locally at http://localhost:11434 with 'ollama run llama3'.` };
                return;
            }
        }
    }

    return engineStream();
};
