// FIX: Import React to resolve the 'Cannot find namespace 'React'.' error.
import React, { useState, useCallback, useRef, useEffect } from 'react';

export function useDraggable(id: string, initialPosition: { x: number, y: number }) {
    const isDraggingRef = useRef(false);
    const posRef = useRef({ dx: 0, dy: 0 });
    const elRef = useRef<HTMLDivElement | null>(null);

    const [position, setPosition] = useState(() => {
        try {
            const saved = localStorage.getItem(`draggable-pos-${id}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Validate that position is within current viewport boundaries
                if (
                    typeof parsed.x === 'number' &&
                    typeof parsed.y === 'number' &&
                    parsed.x >= -20 &&
                    parsed.x < window.innerWidth - 60 &&
                    parsed.y >= 40 &&
                    parsed.y < window.innerHeight - 60
                ) {
                    return parsed;
                }
            }
        } catch (e) { /* ignore */ }
        return initialPosition;
    });

    // Listen for custom alignment events to smoothly snap to calculated coordinates
    useEffect(() => {
        const handleAlign = (e: Event) => {
            const customEvent = e as CustomEvent<{ positions?: Record<string, { x: number, y: number }> }>;
            const positions = customEvent.detail?.positions;
            if (positions && positions[id]) {
                setPosition(positions[id]);
                try {
                    localStorage.setItem(`draggable-pos-${id}`, JSON.stringify(positions[id]));
                } catch (err) { /* ignore */ }
            } else if (initialPosition) {
                setPosition(initialPosition);
                try {
                    localStorage.setItem(`draggable-pos-${id}`, JSON.stringify(initialPosition));
                } catch (err) { /* ignore */ }
            }
        };

        window.addEventListener('regenesis-align-layout', handleAlign);
        return () => window.removeEventListener('regenesis-align-layout', handleAlign);
    }, [id, initialPosition]);
    
    useEffect(() => {
       try {
           localStorage.setItem(`draggable-pos-${id}`, JSON.stringify(position));
       } catch (err) { /* ignore */ }
    }, [position, id]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        // Only drag with left mouse button, and not on inputs/buttons inside the handle
        if (e.button !== 0 || (e.target as HTMLElement).closest('button, input, select, textarea')) {
            return;
        }

        if (elRef.current) {
            isDraggingRef.current = true;
            const rect = elRef.current.getBoundingClientRect();
            posRef.current.dx = e.clientX - rect.left;
            posRef.current.dy = e.clientY - rect.top;
            
            // Bring to front
            document.querySelectorAll('.is-draggable').forEach(el => (el as HTMLElement).style.zIndex = '50');
            elRef.current.style.zIndex = '51';
        }
    }, []);
    
    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDraggingRef.current && elRef.current) {
            let x = e.clientX - posRef.current.dx;
            let y = e.clientY - posRef.current.dy;
            
            // Boundary constraints: ensure window stays on screen and below top bar
            const maxX = Math.max(0, window.innerWidth - 60);
            const maxY = Math.max(0, window.innerHeight - 60);
            x = Math.max(-20, Math.min(maxX, x));
            y = Math.max(50, Math.min(maxY, y)); // keep below top bar (50px)
            
            setPosition({ x, y });
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return {
        ref: elRef,
        style: {
            position: 'absolute' as const,
            left: `${position.x}px`,
            top: `${position.y}px`,
            transition: isDraggingRef.current ? 'none' : 'left 0.35s cubic-bezier(0.16, 1, 0.3, 1), top 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        },
        handleMouseDown,
        position,
        setPosition,
    };
}