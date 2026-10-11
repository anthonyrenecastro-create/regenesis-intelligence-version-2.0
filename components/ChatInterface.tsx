
import React, { useState, useRef, useEffect } from 'react';
import { Role, Message, MediaType } from '../types';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import Icon from './Icon';
import { processImage, downloadBlob } from '../utils/imageProcessor';

interface ChatInterfaceProps {
    messages: Message[];
    onSend: (userInput: string, file: File | null, mediaTrigger?: MediaType) => void;
    isLoading: boolean;
    systemNotification: string | null;
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    hasSpeechRecognition: boolean;
    avatarUrl: string | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    messages, onSend, isLoading, systemNotification,
    isListening, transcript, startListening, stopListening, hasSpeechRecognition,
    avatarUrl
}) => {
    const [input, setInput] = useState('');
    const [creationMode, setCreationMode] = useState<MediaType | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isTransforming, setIsTransforming] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setInput(transcript); }, [transcript]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

    const handleSendClick = () => {
        if ((input.trim() === '' && !selectedFile) || isLoading) return;
        onSend(input, selectedFile, creationMode || undefined);
        setInput('');
        setCreationMode(null);
        setSelectedFile(null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
    };

    const handleImageTransform = async (format: 'image/jpeg' | 'image/png', size: '1080' | '720' | 'orig') => {
        if (!selectedFile || !selectedFile.type.startsWith('image/')) return;
        
        setIsTransforming(true);
        try {
            const maxWidth = size === 'orig' ? undefined : parseInt(size);
            const blob = await processImage(selectedFile, { 
                maxWidth, 
                format, 
                quality: 0.95 
            });
            const newFile = new File([blob], `transformed_${selectedFile.name.split('.')[0]}.${format.split('/')[1]}`, { type: format });
            setSelectedFile(newFile);
            downloadBlob(blob, newFile.name);
        } catch (e) {
            console.error("Transformation failed", e);
        } finally {
            setIsTransforming(false);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="h-full w-full flex flex-col bg-transparent overflow-hidden border-r border-violet-500/20">
            {systemNotification && (
                <div className="text-center p-2 bg-violet-900/60 text-violet-100 text-[10px] border-b border-violet-500/20 z-10 font-mono tracking-widest uppercase">
                    <span className="animate-pulse">{'>>>'} {systemNotification}</span>
                </div>
            )}
            
            <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-6 custom-scrollbar">
                {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-slate-900/60 backdrop-blur-md border-t border-violet-500/30">
                {/* File Preview & Transform Area */}
                {selectedFile && (
                    <div className="mb-4 p-3 bg-violet-950/40 rounded-xl border border-violet-500/30 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-violet-500/20 rounded-lg text-violet-300">
                                    <Icon name="paperclip" className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-white uppercase tracking-wider truncate max-w-[200px]">{selectedFile.name}</span>
                                    <span className="text-[8px] text-slate-500 font-bold">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB | {selectedFile.type || 'Binary Data'}</span>
                                </div>
                            </div>
                            <button onClick={clearFile} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-500 hover:text-red-400">
                                <Icon name="x-circle" className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Image Specific Transformation Substrate */}
                        {selectedFile.type.startsWith('image/') && (
                            <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2">
                                <span className="text-[7px] font-black text-violet-500 uppercase flex-shrink-0 w-full mb-1">Transform Substrate</span>
                                <button 
                                    onClick={() => handleImageTransform('image/jpeg', '720')}
                                    disabled={isTransforming}
                                    className="px-2 py-1 bg-slate-800/80 hover:bg-violet-600/20 border border-slate-700 rounded text-[8px] font-bold text-slate-400 hover:text-white transition-all uppercase"
                                >
                                    Resize 720p JPG
                                </button>
                                <button 
                                    onClick={() => handleImageTransform('image/png', '1080')}
                                    disabled={isTransforming}
                                    className="px-2 py-1 bg-slate-800/80 hover:bg-violet-600/20 border border-slate-700 rounded text-[8px] font-bold text-slate-400 hover:text-white transition-all uppercase"
                                >
                                    Resize 1080p PNG
                                </button>
                                <button 
                                    onClick={() => handleImageTransform('image/png', 'orig')}
                                    disabled={isTransforming}
                                    className="px-2 py-1 bg-slate-800/80 hover:bg-violet-600/20 border border-slate-700 rounded text-[8px] font-bold text-slate-400 hover:text-white transition-all uppercase"
                                >
                                    To PNG (Lossless)
                                </button>
                            </div>
                        )}
                        
                        {/* Non-image transformation hint */}
                        {['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(selectedFile.type) && (
                            <div className="text-[8px] text-slate-500 italic uppercase">
                                File detected. Intelligence mesh will parse and analyze content upon transmission.
                            </div>
                        )}
                    </div>
                )}

                {/* Manifestation Modes */}
                <div className="flex gap-2 mb-3">
                    {[
                        { id: 'video', label: 'Veo Video', icon: 'video' },
                        { id: 'image', label: 'Manifest Image', icon: 'image' },
                    ].map(btn => (
                        <button 
                            key={btn.id}
                            onClick={() => setCreationMode(creationMode === btn.id ? null : btn.id as MediaType)}
                            className={`flex-1 py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
                                creationMode === btn.id 
                                ? 'bg-violet-600 border-violet-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]' 
                                : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:border-violet-500/50'
                            }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-700 bg-slate-800/40 text-slate-500 hover:border-violet-500/50 transition-all flex items-center justify-center gap-2"
                    >
                        <Icon name="paperclip" className="w-3 h-3" />
                        Attach Substrate
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        className="hidden" 
                        accept="image/*,video/*,audio/*,.pdf,.docx,.xlsx,.xls,.txt" 
                    />
                </div>

                <div className="relative flex items-center bg-black/60 border border-violet-500/30 rounded-2xl focus-within:ring-2 focus-within:ring-violet-500/50 transition-all shadow-2xl">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendClick()}
                        placeholder={creationMode ? `Describe the ${creationMode} to manifest...` : (selectedFile ? "Provide instructions for this file..." : "Convey your resonance...")}
                        className="flex-1 p-4 bg-transparent text-slate-100 placeholder-slate-700 focus:outline-none text-sm font-medium"
                        disabled={isLoading}
                    />
                    <div className="flex items-center pr-3">
                        {hasSpeechRecognition && (
                            <button 
                                onClick={() => isListening ? stopListening() : startListening()} 
                                className={`p-2 rounded-xl transition-colors ${isListening ? 'text-red-500 bg-red-500/10' : 'text-slate-500 hover:text-violet-400 hover:bg-violet-500/10'}`}
                                title="Neural Transcription (STT)"
                            >
                                <Icon name="microphone" className="w-5 h-5"/>
                            </button>
                        )}
                        <button 
                            onClick={handleSendClick} 
                            disabled={isLoading || (!input.trim() && !selectedFile)} 
                            className="p-2 ml-2 bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-50 to-indigo-500 rounded-xl text-white disabled:opacity-30 transition-all shadow-lg"
                        >
                            <Icon name="send" className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
