import React, { useRef, useEffect } from 'react';

interface SimulationVisualizerProps {
    fieldData: number[][];
    stability: number;
    energy: number;
    visuals: {
        colorPalette: string;
        particleDensity: number;
        fractalComplexity: number;
    };
}

const SimulationVisualizer: React.FC<SimulationVisualizerProps> = ({ fieldData, stability, energy, visuals }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const draw = () => {
            frameRef.current += 0.005 + (energy * 0.02);
            const { width, height } = canvas;
            const centerX = width / 2;
            const centerY = height / 2;
            const time = frameRef.current;

            // Fade background slowly for trail effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = 'lighter';

            // Base Colors based on "Majestic Portal" request
            const blueHue = 190;   // Electric Blue
            const violetHue = 270; // Luminescent Violet
            
            // Modulation from simulation data
            const resonanceAvg = fieldData.length > 0 ? fieldData.flat().reduce((a, b) => a + Math.abs(b), 0) / fieldData.flat().length : 0.1;

            // Draw concentric geometric rings
            const ringCount = 8;
            for (let i = 0; i < ringCount; i++) {
                const radius = (width * 0.1) + (i * 60) + (Math.sin(time + i) * 20 * resonanceAvg);
                const rotation = time * (i % 2 === 0 ? 1 : -1) * (0.2 + stability * 0.5);
                
                ctx.beginPath();
                ctx.lineWidth = 1 + (energy * 3);
                ctx.strokeStyle = `hsla(${i % 2 === 0 ? violetHue : blueHue}, 80%, 60%, ${0.1 + stability * 0.2})`;
                
                // Draw a polygon (sacred geometry)
                const sides = 3 + i;
                for (let s = 0; s <= sides; s++) {
                    const angle = (s / sides) * Math.PI * 2 + rotation;
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;
                    if (s === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            // Draw Swirling Portal Particles
            const particleCount = Math.floor(150 * visuals.particleDensity);
            for (let i = 0; i < particleCount; i++) {
                const angle = (i / particleCount) * Math.PI * 2 + time * 0.5;
                const distance = (Math.sin(time * 0.3 + i) * 0.5 + 0.5) * (width * 0.5);
                const x = centerX + Math.cos(angle * (1 + i * 0.001)) * distance;
                const y = centerY + Math.sin(angle * (1 + i * 0.001)) * distance;

                const size = 1 + (resonanceAvg * 5) + (Math.random() * 2);
                const hue = Math.random() > 0.5 ? blueHue : violetHue;
                
                ctx.fillStyle = `hsla(${hue}, 90%, 70%, ${0.3 + resonanceAvg})`;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();

                // Add "Glow"
                if (Math.random() > 0.95) {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = `hsla(${hue}, 100%, 50%, 0.8)`;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }

            // Draw central "Core" of radiance
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.3);
            gradient.addColorStop(0, `hsla(${violetHue}, 100%, 40%, ${0.2 + energy * 0.3})`);
            gradient.addColorStop(0.5, `hsla(${blueHue}, 100%, 40%, ${0.1 + energy * 0.2})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, width * 0.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalCompositeOperation = 'source-over';
            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [fieldData, stability, energy, visuals]);

    return (
        <div className="absolute inset-0 z-0 bg-black overflow-hidden">
            <canvas 
                ref={canvasRef} 
                className="w-full h-full object-cover" 
                style={{ filter: 'blur(2px) contrast(1.2) brightness(1.1)' }}
            />
            {/* Dark vignette to keep UI readable */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>
        </div>
    );
};

export default SimulationVisualizer;