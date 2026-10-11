
import React, { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { Message } from '../types';
import { Role } from '../types';

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === Role.USER;
    const [showThinking, setShowThinking] = useState(false);

    const renderMedia = () => {
        if (!message.mediaUrl) return null;
        if (message.mediaType === 'image') return <img src={message.mediaUrl} className="mt-4 rounded-lg border border-violet-500/30 shadow-2xl max-w-full" alt="Generated" />;
        if (message.mediaType === 'video') return (
            <div className="mt-4 rounded-lg overflow-hidden border border-violet-500/30 shadow-2xl bg-black">
                <video src={message.mediaUrl} controls autoPlay loop className="w-full" />
            </div>
        );
        if (message.mediaType === 'sound') return (
            <div className="mt-4 p-3 bg-violet-900/20 border border-violet-500/30 rounded-lg flex items-center gap-3">
                <div className="p-2 bg-violet-500/20 rounded-full animate-pulse"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></div>
                <audio src={message.mediaUrl} controls className="h-8 flex-1" />
            </div>
        );
        return null;
    };

    const sanitizedHtml = isUser ? '' : DOMPurify.sanitize(marked.parse(message.content) as string);

    return (
        <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-[10px] ${isUser ? 'bg-blue-600/40 border border-blue-400/50' : 'bg-violet-600/40 border border-violet-400/50'}`}>
                {isUser ? 'U' : 'R'}
            </div>
            <div className={`max-w-[85%] ${isUser ? 'text-right' : 'text-left'}`}>
                {message.thinking && !isUser && (
                    <div className="mb-2">
                        <button 
                            onClick={() => setShowThinking(!showThinking)}
                            className="text-[8px] font-black uppercase tracking-widest text-violet-500 hover:text-violet-400 transition-colors flex items-center gap-2 mb-1"
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${showThinking ? 'bg-violet-500' : 'bg-violet-900 animate-pulse'}`} />
                            {showThinking ? 'Collapse Logic Chain' : 'View DeepSeek Cognitive Reasoning Trace'}
                        </button>
                        {showThinking && (
                            <div className="p-3 bg-violet-950/20 border border-violet-500/10 rounded-xl text-[10px] text-violet-300 font-mono italic leading-relaxed animate-in fade-in slide-in-from-top-1">
                                <div className="mb-2 text-[8px] opacity-40 font-black uppercase tracking-widest border-b border-violet-500/10 pb-1">Cognitive Reasoning Trace:</div>
                                {message.thinking}
                            </div>
                        )}
                    </div>
                )}
                
                <div className={`inline-block p-4 rounded-2xl shadow-xl text-sm leading-relaxed ${
                    isUser ? 'bg-blue-600/20 text-slate-100 rounded-tr-none' : 'bg-slate-900/60 text-slate-200 border border-violet-500/10 rounded-tl-none'
                }`}>
                    {isUser ? <p className="whitespace-pre-wrap">{message.content}</p> : <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} className="prose prose-invert prose-sm" />}
                    {renderMedia()}
                </div>
                <div className="mt-1 text-[8px] uppercase tracking-widest text-slate-500 font-mono">{new Date().toLocaleTimeString()}</div>
            </div>
        </div>
    );
};

export default ChatMessage;
