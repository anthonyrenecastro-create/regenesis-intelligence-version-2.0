
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDraggable } from '../hooks/useDraggable';

interface AvatarProps {
    avatarUrl: string | null;
    stability: number;
    isSpeaking?: boolean;
    onClick?: () => void;
    isSyncing?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ avatarUrl, stability, isSpeaking, onClick, isSyncing }) => {
    const { ref, style, handleMouseDown } = useDraggable('avatar-head', { 
        x: Math.round(window.innerWidth / 2 - 88), 
        y: 76 
    });
    
    const [tilt, setTilt] = useState(0);
    const [isBlinking, setIsBlinking] = useState(false);
    const [jitter, setJitter] = useState({ x: 0, y: 0 });
    const [floatOffset, setFloatOffset] = useState(0);
    
    const blinkTimeoutRef = useRef<number | null>(null);
    const frameRef = useRef<number>(0);

    // Subtle floating "breathing" animation
    useEffect(() => {
        let animId: number;
        const animate = () => {
            frameRef.current += 0.015 + (1 - stability) * 0.04;
            setFloatOffset(Math.sin(frameRef.current) * (3 + (1 - stability) * 8));
            animId = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animId);
    }, [stability]);

    // Chaos Jitter logic
    useEffect(() => {
        if (stability > 0.5 && !isSyncing) {
            setJitter({ x: 0, y: 0 });
            return;
        }

        const interval = setInterval(() => {
            const intensity = isSyncing ? 15 : (0.5 - stability) * 8;
            if (Math.random() > 0.7 || isSyncing) {
                setJitter({
                    x: (Math.random() - 0.5) * intensity,
                    y: (Math.random() - 0.5) * intensity
                });
            } else {
                setJitter({ x: 0, y: 0 });
            }
        }, 60);

        return () => clearInterval(interval);
    }, [stability, isSyncing]);

    // Head tilt logic
    useEffect(() => {
        const interval = setInterval(() => {
            const chance = 0.03 + (1 - stability) * 0.2;
            if (Math.random() < chance) {
                const maxTilt = 1.5 + (1 - stability) * 8;
                setTilt((Math.random() - 0.5) * maxTilt * 2);
            } else {
                setTilt(t => t * 0.95);
            }
        }, 1200);
        return () => clearInterval(interval);
    }, [stability]);

    // Blinking logic
    useEffect(() => {
        const triggerBlink = () => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 150);
            const nextBlink = 2000 + stability * 4000 + Math.random() * 3000;
            blinkTimeoutRef.current = window.setTimeout(triggerBlink, nextBlink);
        };
        triggerBlink();
        return () => {
            if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
        };
    }, [stability]);

    const speakModifier = isSpeaking ? 1.08 : 1;
    const glowAlpha = 0.2 + (stability * 0.4) + (isSpeaking ? 0.2 : 0);
    const glowColor = useMemo(() => {
        if (isSyncing) return 'rgba(255, 255, 255, 0.8)';
        if (stability < 0.25) return `rgba(239, 68, 68, ${glowAlpha})`;
        if (stability < 0.5) return `rgba(245, 158, 11, ${glowAlpha})`;
        return `rgba(139, 92, 246, ${glowAlpha})`;
    }, [stability, glowAlpha, isSyncing]);
    
    const compositeTransform = `
        translate(${jitter.x}px, ${jitter.y + floatOffset}px) 
        rotate(${tilt}deg) 
        scale(${speakModifier + (1 - stability) * 0.05 + (isSyncing ? 0.1 : 0)})
    `;

    const glowStyle = {
        boxShadow: `0 0 ${15 * speakModifier}px ${2 * speakModifier}px ${glowColor}, 0 0 ${30 * speakModifier}px ${5 * speakModifier}px ${glowColor}`,
        transform: compositeTransform,
        filter: (stability < 0.3 || isSyncing) ? `brightness(1.5) contrast(1.2) saturate(${isSyncing ? 0 : 1})` : 'none',
        transition: (isSpeaking || isSyncing) ? 'none' : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease-out'
    };

    return (
        <div
            ref={ref}
            style={style}
            onMouseDown={handleMouseDown}
            onClick={onClick}
            className="is-draggable w-44 h-44 rounded-full cursor-move z-50 flex items-center justify-center pointer-events-auto group"
        >
            <div style={glowStyle} className="w-full h-full rounded-full p-1 relative ring-1 ring-white/10">
                <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden relative shadow-inner">
                    {avatarUrl ? (
                         <img src={avatarUrl} alt="AI Avatar" className={`w-full h-full object-cover grayscale-[0.2] ${isSyncing ? 'blur-[1px]' : ''}`} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-black">
                             <svg xmlns="http://www.w3.org/2000/svg" className={`w-16 h-16 transition-colors duration-500 ${stability < 0.3 || isSyncing ? 'text-white' : 'text-violet-400 opacity-60'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M12 8V4H8"></path>
                                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                                <path d="M2 14h2"></path>
                                <path d="M20 14h2"></path>
                                <path d="M15 13v2"></path>
                                <path d="M9 13v2"></path>
                             </svg>
                        </div>
                    )}
                    
                    <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-150 pointer-events-none z-10 border-y border-white/5 ${isBlinking || isSyncing ? 'opacity-100' : 'opacity-0'}`} />
                    
                    {(stability < 0.25 || isSyncing) && (
                        <div className="absolute inset-0 opacity-40 pointer-events-none z-20 mix-blend-screen bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_3px)] animate-pulse" />
                    )}

                    {isSpeaking && (
                        <div className="absolute inset-0 border-4 border-violet-500/10 rounded-full animate-ping" />
                    )}
                </div>
                
                <svg className="absolute -inset-2 w-[calc(100%+1rem)] h-[calc(100%+1rem)] pointer-events-none opacity-30">
                    <circle 
                        cx="50%" cy="50%" r="48%" 
                        fill="none" 
                        stroke={glowColor}
                        strokeWidth="0.5" 
                        strokeDasharray="4 8"
                        className={`animate-[spin_${isSpeaking || isSyncing ? '2s' : '20s'}_linear_infinite]`}
                    />
                </svg>
            </div>
        </div>
    );
};

export default Avatar;
