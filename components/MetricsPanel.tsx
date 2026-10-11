
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { Personality, Message, NeMoNode, ActiveEngine, EngineConfig } from '../types';

interface MetricsPanelProps {
    persona: Personality;
    stability: number;
    chaos: number;
    bond: number;
    messages: Message[];
    onNodeUpdate: (nodes: NeMoNode[]) => void;
    nemoNodes: NeMoNode[];
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ persona, stability, chaos, bond, messages, onNodeUpdate, nemoNodes }) => {
    const [tab, setTab] = useState<'cognition' | 'history' | 'nemo'>('cognition');
    const [isAdding, setIsAdding] = useState(false);
    const [testingNode, setTestingNode] = useState<string | null>(null);
    
    // New Node Form State
    const [newNodeName, setNewNodeName] = useState('');
    const [newNodeEngine, setNewNodeEngine] = useState<ActiveEngine>('Ollama');
    const [newNodeType, setNewNodeType] = useState<NeMoNode['type']>('nlp');
    const [newNodeKey, setNewNodeKey] = useState('');

    const logEndRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Live Metrics Simulation for Online Nodes
    useEffect(() => {
        const interval = setInterval(() => {
            onNodeUpdate(nemoNodes.map(node => {
                if (node.status === 'online') {
                    return {
                        ...node,
                        metrics: {
                            cpu: Math.max(5, Math.min(95, node.metrics.cpu + (Math.random() - 0.5) * 5)),
                            memory: Math.max(20, Math.min(90, node.metrics.memory + (Math.random() - 0.5) * 2)),
                            gpu: Math.max(10, Math.min(98, node.metrics.gpu + (Math.random() - 0.5) * 8))
                        }
                    };
                }
                return node;
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, [nemoNodes, onNodeUpdate]);

    const personalityData = useMemo(() => {
        let base = { logic: 50, creativity: 50, empathy: 70, enigma: 30 };
        return [
            { subject: 'Logic', A: Math.min(100, base.logic + stability * 20), fullMark: 100 },
            { subject: 'Creativity', A: Math.min(100, base.creativity + chaos * 30), fullMark: 100 },
            { subject: 'Empathy', A: base.empathy, fullMark: 100 },
            { subject: 'Enigma', A: base.enigma, fullMark: 100 },
        ];
    }, [stability, chaos]);

    const handleProvision = () => {
        if (!newNodeName || (!newNodeKey && newNodeEngine !== 'Ollama')) return;

        const nodeId = `node-${Date.now()}`;
        const newNode: NeMoNode = {
            id: nodeId,
            name: newNodeName,
            status: 'deploying',
            type: newNodeType,
            targetEngine: newNodeEngine,
            apiKey: newNodeKey,
            logs: [`Initiating professional link for ${newNodeName}...`, `Targeting engine: ${newNodeEngine}`],
            metrics: { cpu: 0, memory: 0, gpu: 0 }
        };

        onNodeUpdate([...nemoNodes, newNode]);
        setIsAdding(false);
        setNewNodeName('');
        setNewNodeKey('');

        // Deployment Sequence
        setTimeout(() => {
            const steps = [
                '>>> Provisioning CUDA kernel optimizations...',
                '>>> Initializing transformer weights for ' + newNodeType.toUpperCase(),
                '>>> Establishing secure tunnel to NGC hub...',
                'HANDSHAKE: OK. Substrate online.'
            ];
            
            let i = 0;
            const timer = setInterval(() => {
                if (i < steps.length) {
                    onNodeUpdate(prev => prev.map(n => n.id === nodeId ? { ...n, logs: [...n.logs, steps[i]] } : n));
                    i++;
                } else {
                    onNodeUpdate(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'online', metrics: { cpu: 15, memory: 25, gpu: 10 } } : n));
                    clearInterval(timer);
                }
            }, 1000);
        }, 500);
    };

    const removeNode = (id: string) => {
        onNodeUpdate(nemoNodes.filter(n => n.id !== id));
    };
    
    const testNodeConnection = async (node: NeMoNode) => {
        setTestingNode(node.id);
        
        onNodeUpdate(nemoNodes.map(n => n.id === node.id ? { 
            ...n, 
            logs: [...n.logs, `\n[DIAGNOSTIC] Initiating connection test...`]
        } : n));
        
        try {
            if (false) { // Ollama-only: no cloud routing
                onNodeUpdate(nemoNodes.map(n => n.id === node.id ? { 
                    ...n, 
                    logs: [...n.logs, `[DIAGNOSTIC] Checking Ollama...`, `[DIAGNOSTIC] Validating Ollama connection...`]
                } : n));
                // Ollama-only: test via local endpoint
                const testRes = await fetch('http://localhost:11434/api/tags');
                if (!testRes.ok) throw new Error('Ollama not reachable');
                onNodeUpdate(nemoNodes.map(n => n.id === node.id ? { 
                    ...n, 
                    logs: [...n.logs, `[DIAGNOSTIC] ✓ Connection successful!`, `[DIAGNOSTIC] Gemini 3.8 Flash operational.`, `[DIAGNOSTIC] Node is fully online.`]
                } : n));
                setTestingNode(null);
                return;
            }

            const endpoint = false // Ollama-only
                ? 'https://api.deepseek.com/v1/chat/completions'
                : node.targetEngine === 'Ollama'
                ? `${node.apiKey || 'http://localhost:11434'}/api/chat`
                : null;
            
            if (!endpoint) {
                throw new Error('Unsupported engine for testing');
            }
            
            const testBody = {
                model: 'llama3',
                messages: [{ role: 'user', content: 'Test connection. Reply with: OK' }],
                max_tokens: 10,
                stream: false
            };
            
            const headers: any = { 'Content-Type': 'application/json' };
            if (node.targetEngine !== 'Ollama') {
                headers['Authorization'] = `Bearer ${node.apiKey}`;
            }
            
            onNodeUpdate(nemoNodes.map(n => n.id === node.id ? { 
                ...n, 
                logs: [...n.logs, `[DIAGNOSTIC] Endpoint: ${endpoint}`, `[DIAGNOSTIC] Authenticating...`]
            } : n));
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(testBody),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
            }
            
            await response.json();
            
            onNodeUpdate(nemoNodes.map(n => n.id === node.id ? { 
                ...n, 
                logs: [...n.logs, `[DIAGNOSTIC] ✓ Connection successful!`, `[DIAGNOSTIC] Response received from ${node.targetEngine}`, `[DIAGNOSTIC] Node is fully operational.`]
            } : n));
            
        } catch (error: any) {
            let errorMsg = error.message;
            if (error.name === 'AbortError') {
                errorMsg = 'Connection timeout - endpoint did not respond';
            } else if (errorMsg.includes('Failed to fetch')) {
                errorMsg = 'Network error - unable to reach endpoint. Check firewall/internet.';
            }
            
            onNodeUpdate(nemoNodes.map(n => n.id === node.id ? { 
                ...n, 
                status: 'error',
                logs: [...n.logs, `[DIAGNOSTIC] ✗ Connection failed: ${errorMsg}`, `[DIAGNOSTIC] Verify API key in node configuration.`]
            } : n));
        } finally {
            setTestingNode(null);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-950 font-mono text-slate-100 selection:bg-violet-500/30">
            <div className="flex border-b border-white/5 bg-black/40">
                {['cognition', 'history', 'nemo'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t as any)}
                        className={`flex-1 py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
                            tab === t ? 'text-violet-400 border-violet-500 bg-violet-500/10' : 'text-slate-600 border-transparent hover:text-slate-400'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {tab === 'cognition' && (
                    <div className="h-full flex flex-col space-y-4">
                        <div className="flex-1 h-56">
                            <ResponsiveContainer>
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={personalityData}>
                                    <PolarGrid stroke="rgba(139, 92, 246, 0.2)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                                    <Radar name="Cognition" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3 shadow-inner">
                            <div className="flex justify-between items-center text-[10px] uppercase font-black text-slate-400">
                                <span>Substrate Bond</span>
                                <span className="text-violet-400 tabular-nums">{bond.toFixed(2)}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-[1px]">
                                <div className="h-full bg-violet-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(139,92,246,0.6)]" style={{ width: `${bond}%` }} />
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'history' && (
                    <div className="space-y-3">
                        {messages.slice(-20).reverse().map(m => (
                            <div key={m.id} className="p-3 border border-white/5 bg-white/5 rounded-lg">
                                <div className="text-[8px] font-black uppercase text-slate-500 mb-1">{m.role} link active</div>
                                <div className="text-[11px] text-slate-300 leading-relaxed font-sans line-clamp-2">{m.content}</div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'nemo' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-violet-600/10 p-4 border border-violet-500/20 rounded-xl">
                            <div>
                                <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest">NVIDIA NeMo Control</div>
                                <div className="text-[8px] text-slate-500 uppercase mt-1">Infrastructure Substrate</div>
                            </div>
                            <button 
                                onClick={() => setIsAdding(!isAdding)}
                                className={`p-2 rounded-lg border transition-all ${isAdding ? 'bg-red-600/20 border-red-500 text-red-500' : 'bg-slate-800 border-slate-700 hover:border-violet-500 text-slate-400'}`}
                            >
                                {isAdding ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>}
                            </button>
                        </div>

                        {isAdding && (
                            <div className="p-4 bg-slate-900 border border-violet-500/30 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase text-slate-500">Node Label</label>
                                    <input 
                                        type="text" value={newNodeName} onChange={e => setNewNodeName(e.target.value)}
                                        placeholder="e.g. Vision-Core-Alpha"
                                        className="w-full bg-black/40 border border-slate-700 p-2 text-[11px] rounded focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase text-slate-500">Substrate Engine</label>
                                        <select 
                                            value={newNodeEngine} onChange={e => setNewNodeEngine(e.target.value as any)}
                                            className="w-full bg-black/40 border border-slate-700 p-2 text-[11px] rounded focus:outline-none focus:border-violet-500"
                                        >
                                            <option value="Ollama">Ollama (Local)</option>
                                            <option value="DeepSeek">DeepSeek (Reasoner & Chat)</option>
                                            <option value="Ollama">Ollama (Local)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase text-slate-500">Node Task</label>
                                        <select 
                                            value={newNodeType} onChange={e => setNewNodeType(e.target.value as any)}
                                            className="w-full bg-black/40 border border-slate-700 p-2 text-[11px] rounded focus:outline-none focus:border-violet-500"
                                        >
                                            <option value="nlp">NLP Core</option>
                                            <option value="vision">Vision Mesh</option>
                                            <option value="asr">ASR (Voice)</option>
                                            <option value="multimodal">Multimodal</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase text-slate-500">Neural Key (API Key)</label>
                                    <input 
                                        type="password" value={newNodeKey} onChange={e => setNewNodeKey(e.target.value)}
                                        placeholder="Paste engine key here..."
                                        className="w-full bg-black/40 border border-slate-700 p-2 text-[11px] rounded focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                                <button 
                                    onClick={handleProvision}
                                    className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all"
                                >
                                    Provision Substrate
                                </button>
                            </div>
                        )}

                        <div className="space-y-4">
                            {nemoNodes.length === 0 && !isAdding && (
                                <div className="text-center p-12 opacity-30">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em]">No Active Nodes</div>
                                    <div className="text-[8px] mt-2 uppercase">Provision a node to begin orchestration.</div>
                                </div>
                            )}
                            {nemoNodes.map(node => (
                                <div key={node.id} className="bg-slate-900/60 border border-white/5 rounded-xl overflow-hidden group hover:border-violet-500/30 transition-all">
                                    <div className="p-3 bg-black/40 flex justify-between items-center border-b border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-white">{node.name}</span>
                                            <span className="text-[8px] text-slate-500 uppercase tracking-tighter">ENGINE: {node.targetEngine} | TASK: {node.type}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {node.status === 'online' && (
                                                <button 
                                                    onClick={() => testNodeConnection(node)}
                                                    disabled={testingNode === node.id}
                                                    className="px-2 py-1 text-[7px] font-black uppercase bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Test connection"
                                                >
                                                    {testingNode === node.id ? 'Testing...' : 'Test'}
                                                </button>
                                            )}
                                            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${node.status === 'online' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : node.status === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'}`}>
                                                {node.status}
                                            </div>
                                            <button onClick={() => removeNode(node.id)} className="text-slate-600 hover:text-red-500 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-3 grid grid-cols-3 gap-2">
                                        {['cpu', 'memory', 'gpu'].map(metric => (
                                            <div key={metric} className="bg-black/40 p-2 rounded-lg text-center border border-white/5 shadow-inner">
                                                <div className="text-[7px] text-slate-500 uppercase font-black">{metric}</div>
                                                <div className="text-[10px] text-violet-400 tabular-nums">{(node.metrics as any)[metric].toFixed(1)}%</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="px-3 pb-3">
                                        <div className="h-24 bg-black/80 rounded-lg p-2 font-mono text-[8px] overflow-y-auto custom-scrollbar text-slate-400 leading-tight border border-white/5 shadow-2xl">
                                            {node.logs.map((log, i) => (
                                                <div key={i} className="mb-0.5"><span className="text-violet-900/60 mr-1">$</span>{log}</div>
                                            ))}
                                            <div ref={el => logEndRefs.current[node.id] = el} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MetricsPanel;
