
import React from 'react';
import { useDraggable } from '../hooks/useDraggable';

interface WindowProps {
    id: string;
    title: string;
    children: React.ReactNode;
    className?: string;
    initialPosition: { x: number, y: number };
    onClose?: () => void;
}

const Window: React.FC<WindowProps> = ({ id, title, children, className, initialPosition, onClose }) => {
    const { ref, style, handleMouseDown } = useDraggable(id, initialPosition);

    return (
        <div 
            ref={ref} 
            style={style} 
            className={`is-draggable bg-black/75 backdrop-blur-2xl rounded-xl shadow-2xl shadow-indigo-950/60 ring-1 ring-violet-500/30 flex flex-col z-40 resizable-window border border-violet-500/20 ${className}`}
        >
            <div
                onMouseDown={handleMouseDown}
                className="h-10 bg-slate-900/80 rounded-t-xl flex-shrink-0 flex items-center justify-between px-3 cursor-move border-b border-violet-800/40 relative select-none"
            >
                <div className="flex items-center gap-1.5 z-10">
                    <button 
                        type="button"
                        onClick={onClose}
                        title={onClose ? "Close Window" : undefined}
                        className={`w-2.5 h-2.5 rounded-full bg-rose-500/60 border border-rose-400/80 transition-transform ${onClose ? 'hover:scale-125 cursor-pointer hover:bg-rose-500' : ''}`}
                    />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40 border border-amber-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 border border-emerald-500/60" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <h3 className="text-[10px] font-black text-slate-300 tracking-[0.25em] uppercase font-mono truncate px-12">{title}</h3>
                </div>
                <div className="w-6 h-1 flex items-center justify-end opacity-40">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                </div>
            </div>
            <div className="flex-grow overflow-hidden flex flex-col relative">
                {children}
                {/* Visual Resize Handle (Filament) */}
                <div className="absolute bottom-0 right-0 w-3 h-3 pointer-events-none opacity-40">
                    <div className="w-full h-full border-r-2 border-b-2 border-violet-500 rounded-br-[4px]" />
                </div>
            </div>
        </div>
    );
};

export default Window;
