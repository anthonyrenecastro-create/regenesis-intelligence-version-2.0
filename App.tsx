
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSimulation } from './hooks/useSimulation';
import { useSpeech } from './hooks/useSpeech';
import { generateImage, generateVideo } from './services/geminiService';
import { sendMessageToUniversalEngine, fetchSubstrateNews, fetchSubstrateVantages } from './services/modelGate';
import { analyzeText } from './services/backendService';
import type { Message, AppSettings, GeminiHistory, MediaType, ActiveEngine, SubstrateMode, CustomSubstrate, NewsItem, SubstrateVantage, EngineConfig, NeMoNode } from './types';
import { Role } from './types';
import { CHAT_HISTORY_KEY, SETTINGS_KEY, PERSONAS, BOND_KEY, CUSTOM_SUB_KEY, NEMO_NODES_KEY } from './constants';
import { stripMarkdown } from './utils/textUtils';
import { parsePdf, parseDocx, parseXlsx, fileToBase64, isVisualFile } from './utils/fileParser';

import ChatInterface from './components/ChatInterface';
import SimulationVisualizer from './components/SimulationVisualizer';
import SettingsPanel from './components/SettingsPanel';
import Avatar from './components/Avatar';
import MetricsPanel from './components/MetricsPanel';
import Window from './components/Window';
import NeuralHub from './components/NeuralHub';
import SubstrateCircle from './components/SubstrateCircle';
import FeedWindow from './components/FeedWindow';
import TopHeader from './components/TopHeader';

// Load API keys from environment variables (if available)
const getEnvApiKey = (key: string): string => {
    return import.meta.env[key] || '';
};

const DEFAULT_ENGINE_CONFIGS: Record<ActiveEngine, EngineConfig> = {
    Ollama: { apiKey: '', isActive: true },
};

const DEFAULT_SETTINGS: AppSettings = {
    ai: { temperature: 0.8, maxOutputTokens: 2048 },
    simulation: { syntropyTarget: 0.5, initialMass: 1.0, initialCoupling: 0.1 },
    personaId: 'default',
    voiceURI: null,
    avatarUrl: null,
    visuals: { colorPalette: 'violet', particleDensity: 0.6, fractalComplexity: 0.4 },
    ambientSound: true,
    elevenLabsActive: true,
    voiceChangerMode: false,
    engineConfigs: DEFAULT_ENGINE_CONFIGS,
};

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>(() => {
        const saved = localStorage.getItem(CHAT_HISTORY_KEY);
        return saved ? JSON.parse(saved) : [];
    });
    const [settings, setSettings] = useState<AppSettings>(() => {
        const saved = localStorage.getItem(SETTINGS_KEY);
        const parsedSettings = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
        
        // Merge environment API keys with saved settings (env keys take precedence if not already set)
        const mergedConfigs = { ...DEFAULT_ENGINE_CONFIGS };
        Object.keys(mergedConfigs).forEach((engine) => {
            const engineKey = engine as ActiveEngine;
            const savedConfig = parsedSettings.engineConfigs?.[engineKey];
            const envConfig = DEFAULT_ENGINE_CONFIGS[engineKey];
            
            // Use saved key if it exists and is not empty, otherwise use env key
            mergedConfigs[engineKey] = {
                apiKey: (savedConfig?.apiKey && savedConfig.apiKey.length > 0) 
                    ? savedConfig.apiKey 
                    : envConfig.apiKey,
                isActive: savedConfig?.isActive !== undefined 
                    ? savedConfig.isActive 
                    : (envConfig.apiKey.length > 0)
            };
        });
        
        return {
            ...DEFAULT_SETTINGS,
            ...parsedSettings,
            engineConfigs: mergedConfigs
        };
    });
    const [bond, setBond] = useState<number>(() => {
        const saved = localStorage.getItem(BOND_KEY);
        return saved ? parseFloat(saved) : 50;
    });
    const [customSubstrates, setCustomSubstrates] = useState<CustomSubstrate[]>(() => {
        const saved = localStorage.getItem(CUSTOM_SUB_KEY);
        return saved ? JSON.parse(saved) : [];
    });
    const [nemoNodes, setNemoNodes] = useState<NeMoNode[]>(() => {
        const saved = localStorage.getItem(NEMO_NODES_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    const [activeEngine, setActiveEngine] = useState<ActiveEngine>('Ollama');
    const [activeSubstrate, setActiveSubstrate] = useState<SubstrateMode>('discover');
    const [activeVantage, setActiveVantage] = useState<SubstrateVantage | null>(null);
    const [discoveredVantages, setDiscoveredVantages] = useState<SubstrateVantage[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [systemNotification, setSystemNotification] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [isAvatarVisible, setIsAvatarVisible] = useState(true);
    const [isSubstrateVisible, setIsSubstrateVisible] = useState(true);
    const [isTelemetryOpen, setIsTelemetryOpen] = useState(true);
    const [isHubOpen, setIsHubOpen] = useState(true);
    const [isFeedOpen, setIsFeedOpen] = useState(false);
    const [identitySyncing, setIdentitySyncing] = useState(false);
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

    const handleAlignLayout = useCallback(() => {
        const W = window.innerWidth;
        const H = window.innerHeight;
        const telemetryH = Math.min(420, Math.max(300, (H - 96) * 0.52));

        const positions: Record<string, { x: number, y: number }> = {
            'chat-hub': { x: 24, y: 68 },
            'avatar-head': { x: Math.round(W / 2 - 88), y: 76 },
            'substrate-circle': { x: Math.round(W / 2 - 200), y: Math.max(280, H - 440) },
            'telemetry-window': { x: Math.max(24, W - 364), y: 68 },
            'neural-connectivity-hub': { x: Math.max(24, W - 364), y: Math.round(68 + telemetryH + 12) },
            'feed-window': { x: Math.min(W - 400, 480), y: 68 },
        };

        Object.entries(positions).forEach(([key, pos]) => {
            try {
                localStorage.setItem(`draggable-pos-${key}`, JSON.stringify(pos));
            } catch (e) { /* ignore */ }
        });

        window.dispatchEvent(new CustomEvent('regenesis-align-layout', { detail: { positions } }));

        setIsChatOpen(true);
        setIsAvatarVisible(true);
        setIsSubstrateVisible(true);
        setIsTelemetryOpen(true);
        setIsHubOpen(true);

        setSystemNotification("Interface layout aligned to viewport grid");
        setTimeout(() => setSystemNotification(null), 2500);
    }, []);
    
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [isNewsLoading, setIsNewsLoading] = useState(false);

    const { simulationData, triggerCycle, resetSimulation } = useSimulation({
        ...settings.simulation,
        width: 50, height: 50,
    });

    const { isListening, isSpeaking, transcript, startListening, stopListening, hasSpeechRecognition, speak, cancelSpeech, availableVoices } = useSpeech();

    const selectedPersona = PERSONAS.find(p => p.id === settings.personaId) || PERSONAS[0];

    useEffect(() => { localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages)); }, [messages]);
    useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);
    useEffect(() => { localStorage.setItem(BOND_KEY, bond.toString()); }, [bond]);
    useEffect(() => { localStorage.setItem(CUSTOM_SUB_KEY, JSON.stringify(customSubstrates)); }, [customSubstrates]);
    useEffect(() => { localStorage.setItem(NEMO_NODES_KEY, JSON.stringify(nemoNodes)); }, [nemoNodes]);

    // Force synchronize Nemo Nodes to Engine Configs
    useEffect(() => {
        let hasChanges = false;
        const newConfigs = { ...settings.engineConfigs };
        
        nemoNodes.forEach(node => {
            if (node.status === 'online' && node.apiKey) {
                if (newConfigs[node.targetEngine]?.apiKey !== node.apiKey) {
                    newConfigs[node.targetEngine] = {
                        apiKey: node.apiKey,
                        isActive: true
                    };
                    hasChanges = true;
                }
            }
        });

        if (hasChanges) {
            setSettings(prev => ({ ...prev, engineConfigs: newConfigs }));
        }
    }, [nemoNodes]);

    // Force identity matrix sync effect
    useEffect(() => {
        setIdentitySyncing(true);
        const timer = setTimeout(() => setIdentitySyncing(false), 800);
        return () => clearTimeout(timer);
    }, [settings.personaId, activeEngine]);

    const handleGenerateAvatar = async (prompt: string) => {
        setIsGeneratingAvatar(true);
        setSystemNotification("Manifesting Neural Avatar...");
        try {
            const avatarUrl = await generateImage(
                `Hyper-realistic cybernetic humanoid head, ${prompt}, abstract holographic data particles, glowing eyes, cinematic lighting, 8k, majestic portal background style.`,
                ''
            );
            setSettings(prev => ({ ...prev, avatarUrl }));
        } catch (error) {
            setSystemNotification("Avatar manifestation failed.");
        } finally {
            setIsGeneratingAvatar(false);
            setSystemNotification(null);
        }
    };

    const refreshFeed = useCallback(async () => {
        setIsNewsLoading(true);
        const news = await fetchSubstrateNews(
            activeSubstrate, 
            {
                geminiKey: '',
                deepSeekKey: ''
            }, 
            activeVantage || undefined
        );
        setNewsItems(news);
        setIsNewsLoading(false);
    }, [activeSubstrate, activeVantage]);

    const performSubstrateScan = useCallback(async (mode: SubstrateMode) => {
        setIsScanning(true);
        setDiscoveredVantages([]);
        const discovered = await fetchSubstrateVantages();
        setDiscoveredVantages(discovered);
        setIsScanning(false);
    }, []);

    useEffect(() => {
        performSubstrateScan(activeSubstrate);
        if (['finance', 'academic', 'sports', 'shopping'].includes(activeSubstrate)) {
            setIsFeedOpen(true);
        }
    }, [activeSubstrate, performSubstrateScan]);

    useEffect(() => {
        if (isFeedOpen) refreshFeed();
    }, [activeSubstrate, activeVantage, isFeedOpen, refreshFeed]);

    const handleSend = async (userInput: string, file: File | null, mediaTrigger?: MediaType) => {
        if (isLoading) return;
        setIsLoading(true);
        cancelSpeech();
        
        try {
            let processedMessage = userInput;
            let inlineData: any = null;

            if (file) {
                setSystemNotification(`Analyzing Substrate Data: ${file.name}...`);
                const lowerName = file.name.toLowerCase();
                
                // Document Parsing
                if (lowerName.endsWith('.pdf')) processedMessage += `\n\n[CONTENT_PDF]: ${await parsePdf(file)}`;
                else if (lowerName.endsWith('.docx')) processedMessage += `\n\n[CONTENT_DOCX]: ${await parseDocx(file)}`;
                else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) processedMessage += `\n\n[CONTENT_EXCEL]: ${await parseXlsx(file)}`;
                
                // Visual Substrate Handshake (Images & Video like MPEG/JPEG)
                if (isVisualFile(file)) {
                    const base64 = await fileToBase64(file);
                    inlineData = { data: base64, mimeType: file.type };
                    processedMessage += `\n\n[VISUAL_CORTEX_HANDSHAKE]: User provided visual substrate (${file.name}) for neural inspection.`;
                }
            }

            if (!mediaTrigger) {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: Role.USER, content: userInput || (file ? `Analyze ${file.name}` : "...") }]);
            }

            if (mediaTrigger) {
                setSystemNotification(`Manifesting ${mediaTrigger} in ${activeSubstrate} domain...`);
                let url = mediaTrigger === 'video' 
                    ? await generateVideo(userInput, setSystemNotification) 
                    : await generateImage(userInput);
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: Role.BOT,
                    content: `Neural manifestation of "${userInput}" complete. Substrate vantage synchronized.`,
                    mediaUrl: url,
                    mediaType: mediaTrigger
                }]);
            } else {
                setSystemNotification(`Substrate focus: ${activeSubstrate.toUpperCase()} via ${activeEngine}...`);
                const analysis = await analyzeText(processedMessage);
                triggerCycle(analysis.output.flat());
                
                const history: GeminiHistory = messages.slice(-10).map(m => ({
                    role: m.role === Role.BOT ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }));

                const stream = await sendMessageToUniversalEngine(
                    activeEngine,
                    processedMessage,
                    history,
                    settings.ai,
                    selectedPersona.systemInstruction,
                    settings.engineConfigs,
                    activeSubstrate,
                    customSubstrates,
                    activeVantage || undefined,
                    inlineData
                );

                let fullBotResponse = '';
                let thinkingTrace = '';
                const botMessageId = (Date.now() + 1).toString();
                setMessages(prev => [...prev, { id: botMessageId, role: Role.BOT, content: '' }]);

                for await (const chunk of stream) {
                    if (chunk.text) {
                        fullBotResponse += chunk.text;
                        // Ollama: no thinking trace
                        setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, content: fullBotResponse, thinking: thinkingTrace } : m));
                    }
                }

                setBond(prev => Math.max(0, Math.min(100, prev + 1.5)));
                speak(
                    stripMarkdown(fullBotResponse), 
                    selectedPersona.voiceName || selectedPersona.elevenLabsVoiceId || 'Kore', 
                    settings.elevenLabsActive,
                    ''
                );
            }
        } catch (error: any) {
            setSystemNotification(`Neural Conflict: ${error?.message || 'Link failed.'}`);
            setMessages(prev => prev.filter(m => m.content !== ''));
        } finally {
            setIsLoading(false);
            setSystemNotification(null);
        }
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black text-slate-100 font-sans">
            <SimulationVisualizer 
                fieldData={simulationData.fields.resonance} 
                stability={simulationData.metrics.stability} 
                energy={simulationData.metrics.energy_density} 
                visuals={settings.visuals} 
            />

            {/* Top Navigation Bar with App Name, Status, and Layout Controls */}
            <TopHeader
                activeEngine={activeEngine}
                onEngineChange={setActiveEngine}
                selectedPersona={selectedPersona}
                stability={simulationData.metrics.stability}
                bond={bond}
                isSpeaking={isSpeaking}
                onAlignLayout={handleAlignLayout}
                onOpenSettings={() => setIsSettingsOpen(true)}
                isChatOpen={isChatOpen}
                onToggleChat={() => setIsChatOpen(!isChatOpen)}
                isAvatarVisible={isAvatarVisible}
                onToggleAvatar={() => setIsAvatarVisible(!isAvatarVisible)}
                isSubstrateVisible={isSubstrateVisible}
                onToggleSubstrate={() => setIsSubstrateVisible(!isSubstrateVisible)}
                isTelemetryOpen={isTelemetryOpen}
                onToggleTelemetry={() => setIsTelemetryOpen(!isTelemetryOpen)}
                isHubOpen={isHubOpen}
                onToggleHub={() => setIsHubOpen(!isHubOpen)}
                isFeedOpen={isFeedOpen}
                onToggleFeed={() => setIsFeedOpen(!isFeedOpen)}
                neuralVoiceActive={settings.elevenLabsActive}
            />

            {/* Notification Toast */}
            {systemNotification && (
                <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full bg-slate-900/90 border border-violet-400/50 shadow-[0_0_25px_rgba(139,92,246,0.5)] backdrop-blur-xl text-violet-200 text-xs font-mono font-semibold flex items-center gap-2 pointer-events-auto transition-all animate-in fade-in slide-in-from-top-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>{systemNotification}</span>
                </div>
            )}
            
            <div className="relative z-10 w-full h-full pt-14 p-4 pointer-events-none">
                {/* Center Column: Interactive Planetary Substrate Orb */}
                {isSubstrateVisible && (
                    <SubstrateCircle 
                        currentMode={activeSubstrate} 
                        onModeChange={setActiveSubstrate} 
                        customSubstrates={customSubstrates}
                        onAddCustom={(sub) => setCustomSubstrates([...customSubstrates, sub])}
                        onOpenFeed={() => setIsFeedOpen(!isFeedOpen)}
                        vantages={discoveredVantages}
                        activeVantage={activeVantage}
                        onVantageChange={setActiveVantage}
                        isScanning={isScanning}
                    />
                )}

                {/* Left Column: Chat Node Window */}
                {isChatOpen && (
                    <Window 
                        id="chat-hub" 
                        title={`${selectedPersona.name.toUpperCase()} NODE`} 
                        initialPosition={{ x: 24, y: 68 }} 
                        className="w-[440px] max-w-[calc(100vw-48px)] h-[calc(100vh-84px)] max-h-[840px] min-h-[480px] pointer-events-auto"
                        onClose={() => setIsChatOpen(false)}
                    >
                        <ChatInterface 
                            messages={messages} onSend={handleSend} isLoading={isLoading} 
                            systemNotification={systemNotification} isListening={isListening} transcript={transcript} 
                            startListening={startListening} stopListening={stopListening} 
                            hasSpeechRecognition={hasSpeechRecognition} avatarUrl={settings.avatarUrl}
                        />
                    </Window>
                )}

                {/* Center Column: Floating Holographic Avatar */}
                {isAvatarVisible && (
                    <Avatar 
                        avatarUrl={settings.avatarUrl} 
                        stability={simulationData.metrics.stability} 
                        isSpeaking={isSpeaking} 
                        onClick={() => setIsSettingsOpen(true)} 
                        isSyncing={identitySyncing} 
                    />
                )}
                
                {/* Right Column: Telemetry Hub */}
                {isTelemetryOpen && (
                    <Window 
                        id="telemetry-window" 
                        title="TELEMETRY HUB" 
                        initialPosition={{ x: Math.max(24, window.innerWidth - 364), y: 68 }} 
                        className="w-[340px] max-w-[calc(100vw-48px)] h-[calc((100vh-100px)*0.52)] min-h-[300px] max-h-[440px] pointer-events-auto"
                        onClose={() => setIsTelemetryOpen(false)}
                    >
                        <MetricsPanel 
                            persona={selectedPersona} 
                            stability={simulationData.metrics.stability} 
                            chaos={simulationData.metrics.chaos_metric} 
                            bond={bond}
                            messages={messages}
                            nemoNodes={nemoNodes}
                            onNodeUpdate={setNemoNodes}
                        />
                    </Window>
                )}

                {/* Center-Right Column: Live Stream Feed */}
                {isFeedOpen && (
                    <Window 
                        id="feed-window" 
                        title={`${activeSubstrate.toUpperCase()} TRANSMISSION`} 
                        initialPosition={{ x: Math.min(window.innerWidth - 400, 480), y: 68 }} 
                        className="w-[380px] max-w-[calc(100vw-48px)] h-[calc(100vh-84px)] max-h-[840px] min-h-[480px] pointer-events-auto"
                        onClose={() => setIsFeedOpen(false)}
                    >
                        <FeedWindow 
                            mode={activeSubstrate} 
                            items={newsItems} 
                            isLoading={isNewsLoading} 
                            onRefresh={refreshFeed} 
                        />
                    </Window>
                )}

                {/* Right Column: Substrate Orchestrator (Neural Connectivity Hub) */}
                {isHubOpen && (
                    <Window 
                        id="neural-connectivity-hub" 
                        title="SUBSTRATE ORCHESTRATOR" 
                        initialPosition={{ 
                            x: Math.max(24, window.innerWidth - 364), 
                            y: Math.round(68 + Math.min(420, (window.innerHeight - 96) * 0.52) + 12) 
                        }} 
                        className="w-[340px] max-w-[calc(100vw-48px)] h-[calc((100vh-100px)*0.44)] min-h-[260px] max-h-[360px] pointer-events-auto"
                        onClose={() => setIsHubOpen(false)}
                    >
                        <NeuralHub 
                            stability={simulationData.metrics.stability} 
                            bond={bond}
                            isSpeaking={isSpeaking}
                            activeEngine={activeEngine}
                            onEngineChange={setActiveEngine}
                            engineConfigs={settings.engineConfigs}
                        />
                    </Window>
                )}
            </div>

            {/* Settings Drawer / Modal */}
            {isSettingsOpen && (
                <SettingsPanel 
                    settings={settings} onChange={setSettings} onClose={() => setIsSettingsOpen(false)} 
                    onResetSimulation={resetSimulation} availableVoices={availableVoices} 
                    onGenerateAvatar={handleGenerateAvatar} isGeneratingAvatar={isGeneratingAvatar} 
                />
            )}
        </div>
    );
};

export default App;
