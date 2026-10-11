
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useDraggable } from '../hooks/useDraggable';
import type { SubstrateMode, CustomSubstrate, SubstrateVantage } from '../types';

interface SubstrateCircleProps {
    currentMode: SubstrateMode;
    onModeChange: (mode: SubstrateMode) => void;
    customSubstrates: CustomSubstrate[];
    onAddCustom: (sub: CustomSubstrate) => void;
    onOpenFeed: () => void;
    vantages: SubstrateVantage[];
    activeVantage: SubstrateVantage | null;
    onVantageChange: (vantage: SubstrateVantage | null) => void;
    isScanning: boolean;
}

const BASE_MODES: { id: SubstrateMode; icon: string; label: string; color: string }[] = [
    { id: 'discover', icon: '🌐', label: 'Global', color: '#8b5cf6' },
    { id: 'academic', icon: '🎓', label: 'Academic', color: '#3b82f6' },
    { id: 'finance', icon: '📈', label: 'Finance', color: '#10b981' },
    { id: 'patents', icon: '📜', label: 'Patents', color: '#f59e0b' },
    { id: 'sports', icon: '⚽', label: 'Sports', color: '#ef4444' },
    { id: 'shopping', icon: '🛒', label: 'Shopping', color: '#ec4899' },
    { id: 'modes', icon: '🕸️', label: 'Modes', color: '#06b6d4' },
];

const SubstrateCircle: React.FC<SubstrateCircleProps> = ({ 
    currentMode, 
    onModeChange, 
    customSubstrates, 
    onAddCustom,
    onOpenFeed,
    vantages,
    activeVantage,
    onVantageChange,
    isScanning
}) => {
    const { ref, style, handleMouseDown } = useDraggable('substrate-circle', { 
        x: Math.round(window.innerWidth / 2 - 200), 
        y: Math.max(280, window.innerHeight - 440) 
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [newIcon, setNewIcon] = useState('🧠');

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const allModes = useMemo(() => [
        ...BASE_MODES,
        ...customSubstrates.map(s => ({ id: 'custom' as SubstrateMode, icon: s.icon, label: s.label, color: '#64748b' }))
    ], [customSubstrates]);

    const filteredModes = allModes.filter(m => m.label.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleCreate = () => {
        if (!newLabel) return;
        onAddCustom({
            id: `custom-${Date.now()}`,
            label: newLabel,
            icon: newIcon,
            instruction: `Focus all intelligence on the specialized domain of ${newLabel}. Prioritize depth in this specific substrate.`
        });
        setNewLabel('');
        setIsAdding(false);
    };

    // Calculate dynamic radii based on container size
    const baseRadius = Math.min(dimensions.width, dimensions.height) / 2;
    const outerRadius = baseRadius * 0.72;
    const innerRadius = baseRadius * 0.42;

    return (
        <div 
            ref={ref} 
            style={style} 
            className="is-draggable pointer-events-auto z-[60]"
        >
            <div 
                ref={containerRef}
                style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
                className="relative bg-slate-950/60 backdrop-blur-3xl border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(139,92,246,0.3)] transition-all duration-300 resize overflow-hidden min-w-[300px] min-h-[300px]"
            >
                <div 
                    onMouseDown={handleMouseDown}
                    className="absolute inset-0 cursor-move rounded-full z-0"
                />

                <div className="z-10 text-center px-4 w-1/3 flex flex-col items-center pointer-events-auto">
                    {!isAdding ? (
                        <>
                            <div className="absolute top-[15%] animate-bounce opacity-40">
                                {isScanning && <div className="text-[8px] text-violet-400 font-black tracking-[0.2em]">NEURAL SCAN IN PROGRESS</div>}
                            </div>
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search Links..."
                                className="w-full bg-transparent border-b border-white/20 text-[9px] text-white text-center focus:outline-none focus:border-violet-500 transition-colors placeholder:text-slate-600 uppercase font-black"
                            />
                            <div className="mt-2 text-[7px] text-violet-400 font-black uppercase tracking-[0.2em] opacity-80 flex items-center gap-1">
                                Substrate Link
                                <button 
                                    onClick={onOpenFeed}
                                    className="p-1 hover:text-white transition-all hover:scale-125"
                                    title="Open Live News Feed"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
                                </button>
                            </div>
                            <div className="text-[16px] font-black text-white uppercase mt-1 tracking-tighter truncate max-w-full drop-shadow-[0_0_12px_rgba(139,92,246,0.8)]">
                                {currentMode}
                            </div>
                            <div className="text-[8px] text-slate-500 uppercase mt-1 font-bold">
                                {activeVantage ? `VANTAGE: ${activeVantage.label}` : 'BROAD_VIEW'}
                            </div>
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="mt-4 px-2 py-1 rounded bg-violet-600/20 hover:bg-violet-600/40 text-violet-400 text-[8px] font-black uppercase tracking-widest border border-violet-500/30 transition-all"
                            >
                                + New Custom
                            </button>
                        </>
                    ) : (
                        <div className="w-full space-y-3 p-3 bg-black/60 rounded-xl border border-white/10">
                            <input 
                                type="text" 
                                value={newLabel} 
                                onChange={(e) => setNewLabel(e.target.value)}
                                placeholder="Engine Label..."
                                className="w-full bg-slate-900/80 border border-white/10 p-2 text-[10px] text-white text-center rounded focus:outline-none focus:border-violet-500"
                            />
                             <div className="flex gap-2 justify-center">
                                {['🧪', '🧠', '💼', '🔭', '📡', '⚡'].map(i => (
                                    <button key={i} onClick={() => setNewIcon(i)} className={`p-1.5 rounded transition-all ${newIcon === i ? 'bg-violet-500 scale-125' : 'bg-white/5 hover:bg-white/10'}`}>{i}</button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleCreate} className="flex-1 bg-violet-600 hover:bg-violet-500 text-[9px] py-2 rounded font-black transition-colors">LINK</button>
                                <button onClick={() => setIsAdding(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-[9px] py-2 rounded font-black transition-colors">VOID</button>
                            </div>
                        </div>
                    )}
                </div>

                {filteredModes.map((mode, index) => {
                    const angle = (index / filteredModes.length) * Math.PI * 2;
                    const x = Math.cos(angle) * outerRadius;
                    const y = Math.sin(angle) * outerRadius;
                    const isActive = currentMode === mode.id;

                    return (
                        <button
                            key={`${mode.id}-${index}`}
                            onClick={() => {
                                onModeChange(mode.id);
                                onVantageChange(null);
                            }}
                            className={`absolute w-12 h-12 rounded-full border flex items-center justify-center text-lg transition-all duration-300 hover:scale-150 hover:z-20 pointer-events-auto ${
                                isActive 
                                ? 'bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.8)]' 
                                : 'bg-slate-900/90 border-white/10 text-white hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] opacity-40 hover:opacity-100'
                            }`}
                            style={{ transform: `translate(${x}px, ${y}px)` }}
                        >
                            <span className="relative z-10">{mode.icon}</span>
                        </button>
                    );
                })}

                {vantages.map((vantage, index) => {
                    const angle = (index / vantages.length) * Math.PI * 2 - Math.PI / 2;
                    const x = Math.cos(angle) * innerRadius;
                    const y = Math.sin(angle) * innerRadius;
                    const isActive = activeVantage?.id === vantage.id;

                    return (
                        <button
                            key={vantage.id}
                            onClick={() => onVantageChange(isActive ? null : vantage)}
                            className={`absolute w-9 h-9 rounded-full border flex items-center justify-center text-sm transition-all duration-500 hover:scale-125 z-20 pointer-events-auto ${
                                isActive 
                                ? 'bg-violet-500 border-violet-300 text-white shadow-[0_0_20px_rgba(139,92,246,0.9)]' 
                                : 'bg-slate-800/80 border-violet-500/20 text-slate-300 hover:border-violet-400'
                            }`}
                            style={{ transform: `translate(${x}px, ${y}px)` }}
                            title={vantage.description}
                        >
                            <span className="relative z-10">{vantage.icon}</span>
                        </button>
                    );
                })}

                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <circle cx="50%" cy="50%" r="35%" fill="none" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="0.5" strokeDasharray="2 10" className="animate-[spin_40s_linear_infinite]" />
                    <circle cx="50%" cy="50%" r="22%" fill="none" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1" strokeDasharray="5 5" className="animate-[spin_20s_linear_infinite_reverse]" />
                    {vantages.map((_, i) => (
                        <line 
                            key={`v-${i}`}
                            x1="50%" y1="50%" 
                            x2={`${50 + 22 * Math.cos((i / vantages.length) * Math.PI * 2 - Math.PI / 2)}%`} 
                            y2={`${50 + 22 * Math.sin((i / vantages.length) * Math.PI * 2 - Math.PI / 2)}%`} 
                            stroke="rgba(139, 92, 246, 0.3)" 
                            strokeWidth="0.5"
                            className="animate-pulse"
                        />
                    ))}
                    {isScanning && (
                        <circle cx="50%" cy="50%" r="45%" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" className="animate-ping" />
                    )}
                </svg>

                {/* Resize Handle for UI feedback */}
                <div className="absolute bottom-4 right-4 w-4 h-4 pointer-events-none opacity-40">
                    <div className="w-full h-full border-r-2 border-b-2 border-violet-500 rounded-br-[4px]" />
                </div>
            </div>
        </div>
    );
};

export default SubstrateCircle;
