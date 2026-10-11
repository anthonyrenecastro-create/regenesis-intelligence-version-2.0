import React, { useMemo, useEffect, useRef, useState } from 'react';

interface NeuralFaceProps {
    stability: number;
    isSpeaking: boolean;
    bond: number;
}

const NeuralFace: React.FC<NeuralFaceProps> = ({ stability, isSpeaking, bond }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef(0);

    // Reactive colors based on stability
    const color = useMemo(() => {
        if (stability > 0.7) return '#8b5cf6'; // Violet
        if (stability > 0.4) return '#3b82f6'; // Blue
        if (stability > 0.2) return '#f59e0b'; // Amber
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
            const width = canvas.width;
            const height = canvas.height;
            const centerX = width / 2;
            const centerY = height / 2;

            ctx.clearRect(0, 0, width, height);

            // Mesh parameters
            // More bond = more nodes (tighter lattice)
            const nodeCount = Math.floor(15 + (bond / 100) * 35);
            const nodes: { x: number, y: number }[] = [];

            // Generate nodes in a face shape (rounded shield/egg)
            for (let i = 0; i < nodeCount; i++) {
                const angle = (i / nodeCount) * Math.PI * 2;
                const rFactor = 1 + Math.sin(time * 0.5 + i) * (1 - stability) * 0.2;
                
                // Base face shape
                const r = 60 * rFactor;
                const x = centerX + Math.cos(angle) * r;
                // Elongate for a face-like oval
                const y = centerY + Math.sin(angle) * r * 1.2;

                // Lip sync jitter
                const jitter = isSpeaking ? Math.random() * 10 : 0;
                
                nodes.push({ 
                    x: x + jitter, 
                    y: y + jitter 
                });
            }

            // Draw connections (Neural Mesh)
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.5 + (bond / 100);
            ctx.globalAlpha = 0.4 + (stability * 0.3);

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const d = Math.sqrt((nodes[i].x - nodes[j].x)**2 + (nodes[i].y - nodes[j].y)**2);
                    // Connection distance depends on bond
                    const maxDist = 40 + (bond / 100) * 60;
                    if (d < maxDist) {
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                    }
                }
            }
            ctx.stroke();

            // Draw "Neural Hubs" (Eyes)
            const eyeSize = 6 + (stability * 4) + (isSpeaking ? Math.sin(time) * 2 : 0);
            ctx.globalAlpha = 1;
            ctx.fillStyle = color;
            
            // Left Eye
            ctx.beginPath();
            ctx.arc(centerX - 25, centerY - 20, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Right Eye
            ctx.beginPath();
            ctx.arc(centerX + 25, centerY - 20, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            // Core Pulse
            if (bond > 80) {
                const pulse = Math.sin(time * 2) * 20;
                ctx.beginPath();
                ctx.arc(centerX, centerY, 10 + pulse, 0, Math.PI * 2);
                ctx.strokeStyle = color;
                ctx.globalAlpha = 0.2;
                ctx.stroke();
            }

            animationId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationId);
    }, [bond, stability, isSpeaking, color]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950/80 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            
            <canvas ref={canvasRef} width={250} height={250} className="drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]" />

            <div className="absolute bottom-4 left-0 right-0 text-center">
                 <div 
                    className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase"
                    style={{ color: color }}
                >
                    {bond > 70 ? 'Synaptic Unity' : bond > 30 ? 'Evolving Proxy' : 'Fragmented Link'}
                </div>
                <div className="text-[7px] text-slate-500 uppercase mt-1 tracking-widest font-mono">
                    Node Coherence: {(stability * 100).toFixed(0)}%
                </div>
            </div>
        </div>
    );
};

export default NeuralFace;