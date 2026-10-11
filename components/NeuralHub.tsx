
import React, { useMemo, useEffect, useRef, useState } from 'react';
import type { ActiveEngine, ModelCapability, EngineConfig } from '../types';

interface NeuralHubProps {
    stability: number;
    bond: number;
    isSpeaking: boolean;
    activeEngine: ActiveEngine;
    onEngineChange: (engine: ActiveEngine) => void;
    engineConfigs: Record<ActiveEngine, EngineConfig>;
}

const CAPABILITIES: ModelCapability[] = [
    { id: 'local', label: 'Local Inference', description: 'Private on-device inference via Ollama. No cloud, no keys.', engines: ['Ollama'] },
    { id: 'reasoning', label: 'Reasoning Substrate', description: 'Local model reasoning for analysis and code.', engines: ['Ollama'] },
    { id: 'code', label: 'Logic Mesh', description: 'Algorithmic synthesis and technical inspection via local model.', engines: ['Ollama'] },
    { id: 'local', label: 'Air-Gapped Node', description: 'Routes processing to local hardware (Ollama) for offline privacy.', engines: ['Ollama'] },
];

const ENGINES: ActiveEngine[] = ['Ollama'];

const NeuralHub: React.FC<NeuralHubProps> = ({ stability, bond, isSpeaking, activeEngine, onEngineChange, engineConfigs }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef(0);
    const [hoveredCap, setHoveredCap] = useState<string | null>(null);

    const color = useMemo(() => {
        if (stability > 0.7) return '#8b5cf6'; // Violet
        if (stability > 0.4) return '#3b82f6'; // Blue
        return '#ef4444'; // Red
    }, [stability]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationId: number;
        const draw = () => {
            frameRef.current += 0.05;
            const time = frameRef.current;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const nodeCount = Math.floor(15 + (bond / 100) * 30);
            const nodes: { x: number, y: number }[] = [];
            for (let i = 0; i < nodeCount; i++) {
                const angle = (i / nodeCount) * Math.PI * 2;
                const r = 40 * (1 + Math.sin(time * 0.4 + i) * (1 - stability) * 0.15);
                nodes.push({ x: centerX + Math.cos(angle) * r, y: centerY + Math.sin(angle) * r + (isSpeaking ? Math.random() * 5 : 0) });
            }
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = 0.2 + (bond / 250);
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const d = Math.sqrt((nodes[i].x - nodes[j].x)**2 + (nodes[i].y - nodes[j].y)**2);
                    if (d < 60) { ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); }
                }
            }
            ctx.stroke();
            animationId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animationId);
    }, [bond, stability, isSpeaking, color]);

    return (
        <div className="w-full h-full flex flex-col bg-slate-950/95 text-slate-100 overflow-hidden font-mono border-l border-white/5">
            <div className="h-32 flex flex-col items-center justify-center relative bg-gradient-to-b from-violet-900/30 via-transparent to-transparent">
                <canvas ref={canvasRef} width={160} height={120} className="drop-shadow-[0_0_20px_rgba(139,92,246,0.6)]" />
                <div className="absolute top-2 left-3">
                    <div className="text-[7px] text-slate-500 uppercase tracking-widest">Neural Bond</div>
                    <div className="text-[12px] font-black text-violet-400">{bond.toFixed(1)}%</div>
                </div>
                <div className="absolute top-2 right-3 text-right">
                    <div className="text-[7px] text-slate-500 uppercase tracking-widest">Active Brain</div>
                    <div className="text-[10px] font-black text-white">{activeEngine}</div>
                </div>
            </div>

            <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                <div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-3 flex justify-between">
                        <span>Cognitive Substrates</span>
                        <span className="text-violet-500 animate-pulse">● Active</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                        {ENGINES.map(engine => {
                            const config = engineConfigs[engine];
                            const isLinked = config && config.apiKey && config.apiKey.length > 5;
                            
                            return (
                                <button
                                    key={engine}
                                    onClick={() => onEngineChange(engine)}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                                        activeEngine === engine 
                                        ? 'bg-violet-600/20 border-violet-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]' 
                                        : 'bg-slate-900/40 border-slate-800 text-slate-600 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${activeEngine === engine ? 'bg-violet-400 animate-pulse' : isLinked ? 'bg-violet-900' : 'bg-slate-800'}`} />
                                        <span className={`text-[10px] font-bold tracking-tight ${isLinked ? 'text-slate-200' : 'text-slate-700'}`}>{engine}</span>
                                    </div>
                                    <span className={`text-[7px] font-black tracking-tighter ${isLinked ? 'text-violet-500' : 'text-slate-800'}`}>{isLinked ? 'LINKED' : 'VOID'}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 relative">
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-3">Intelligence Pathways</div>
                    <div className="grid grid-cols-2 gap-2">
                        {CAPABILITIES.map(cap => (
                            <div 
                                key={cap.id} 
                                onMouseEnter={() => setHoveredCap(cap.id)}
                                onMouseLeave={() => setHoveredCap(null)}
                                className="relative group"
                            >
                                <div className={`h-14 flex flex-col items-center justify-center rounded-lg border text-[8px] font-black uppercase text-center p-2 transition-all cursor-help ${hoveredCap === cap.id ? 'bg-violet-500/20 border-violet-400 text-violet-300' : 'bg-slate-900/40 border-slate-800 text-slate-600'}`}>
                                    <div className="mb-1 text-[10px]">{cap.id === 'creative' ? '👁️' : cap.id === 'search' ? '🌐' : cap.id === 'nemotron' ? '⚙️' : cap.id === 'code' ? '🧠' : '🏠'}</div>
                                    {cap.label}
                                </div>
                                {hoveredCap === cap.id && (
                                    <div className="fixed md:absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-[280px] md:w-56 bg-slate-900/95 backdrop-blur-xl border border-violet-500/50 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[200] animate-in fade-in zoom-in-95 slide-in-from-bottom-4">
                                        <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                                            {cap.label}
                                        </div>
                                        <div className="text-[9px] text-slate-300 leading-relaxed font-sans font-medium mb-3 italic">
                                            "{cap.description}"
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {cap.engines.map(eng => (
                                                <span key={eng} className="text-[7px] bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded uppercase font-black text-violet-500">{eng}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="p-3 bg-black/40 border-t border-white/5">
                <div className="text-[8px] text-slate-500 uppercase tracking-[0.2em] leading-tight text-center">
                    Cognitive Routing: LOCAL_OLLAMA_ACTIVE
                </div>
            </div>
        </div>
    );
};

export default NeuralHub;
