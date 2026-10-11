import React, { useRef, useEffect } from 'react';

interface SystemMonitorProps {
    reports: string[];
}

const SystemMonitor: React.FC<SystemMonitorProps> = ({ reports }) => {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [reports]);

    return (
        <div className="h-full w-full bg-black/60 p-3 font-mono text-xs text-green-400 overflow-y-auto">
            {reports.map((report, index) => (
                <div key={index} className="whitespace-pre-wrap leading-relaxed border-b border-green-800/50 py-1">
                    {`> ${report.replace(/\n/g, '\n  ')}`}
                </div>
            ))}
            <div ref={endRef} />
        </div>
    );
};

export default SystemMonitor;