import React from 'react';

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-2 my-2 ml-12">
        <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0s]"></div>
        <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></div>
        <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></div>
        <span className="text-[10px] text-violet-400 font-mono ml-2 uppercase tracking-tighter animate-pulse">Processing Resonance</span>
    </div>
);

export default TypingIndicator;