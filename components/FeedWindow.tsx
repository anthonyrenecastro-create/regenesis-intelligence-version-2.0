
import React from 'react';
import type { NewsItem, SubstrateMode } from '../types';

interface FeedWindowProps {
    mode: SubstrateMode;
    items: NewsItem[];
    isLoading: boolean;
    onRefresh: () => void;
}

const FeedWindow: React.FC<FeedWindowProps> = ({ mode, items, isLoading, onRefresh }) => {
    return (
        <div className="w-full h-full flex flex-col bg-slate-950/90 text-slate-100 font-mono">
            <div className="p-3 border-b border-white/10 bg-black/40 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{mode} LIVE STREAM</span>
                </div>
                <button 
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-30"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isLoading ? 'animate-spin' : ''}><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
                {isLoading && items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4">
                        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Synching with Web Mesh</span>
                    </div>
                ) : items.length > 0 ? (
                    items.map((item) => (
                        <div key={item.id} className="group p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-violet-500/5 hover:border-violet-500/30 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[8px] font-black uppercase text-violet-400 bg-violet-400/10 px-1.5 py-0.5 rounded tracking-widest">{item.source}</span>
                                <span className="text-[7px] text-slate-600 font-bold">{item.timestamp}</span>
                            </div>
                            <h4 className="text-[12px] font-black leading-tight text-white group-hover:text-violet-300 transition-colors mb-2">
                                {item.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2 mb-3">
                                {item.summary}
                            </p>
                            <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[8px] font-black uppercase text-slate-500 hover:text-violet-400 transition-colors"
                            >
                                TRANSMISSION LINK
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            </a>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-10 text-center gap-4">
                        <div className="text-[10px] text-slate-600 uppercase tracking-widest font-black">Substrate Mesh Silent</div>
                        <div className="text-[8px] text-slate-500 uppercase leading-relaxed max-w-[200px]">
                            Provision a <span className="text-violet-400">Gemini</span> or <span className="text-violet-400">DeepSeek</span> key in System Settings to enable live Google Search grounding and real-time transmissions.
                        </div>
                        <div className="w-16 h-px bg-white/10" />
                        <div className="text-[7px] text-violet-900 uppercase font-black tracking-tighter">Awaiting Handshake</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedWindow;
