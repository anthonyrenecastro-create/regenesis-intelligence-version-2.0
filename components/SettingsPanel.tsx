import React, { useState } from 'react';
import type { AppSettings, ActiveEngine } from '../types';
import Icon from './Icon';
import { PERSONAS } from '../constants';

interface SettingsPanelProps {
    settings: AppSettings;
    onChange: (newSettings: AppSettings) => void;
    onClose: () => void;
    onResetSimulation: () => void;
    availableVoices: SpeechSynthesisVoice[];
    onGenerateAvatar: (prompt: string) => void;
    isGeneratingAvatar: boolean;
}

const COLOR_PALETTES = [
    { id: 'violet', name: 'Violet' },
    { id: 'cyan', name: 'Cyan' },
    { id: 'amber', name: 'Amber' },
    { id: 'green', name: 'Green' },
    { id: 'crimson', name: 'Crimson' },
];

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; description: string; }> = 
({ label, value, min, max, step, onChange, description }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-1">{label} <span className="font-bold text-violet-300">{value}</span></label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
        />
        <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
);

const Select: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; description?: string; }> =
({ label, value, onChange, children, description }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className="w-full p-2 bg-slate-800 border border-slate-600 text-slate-200 rounded-md focus:ring-2 focus:ring-violet-500 focus:outline-none"
        >
            {children}
        </select>
         {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
    </div>
);

const Toggle: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void; description: string; }> = 
({ label, enabled, onChange, description }) => (
    <div className="mb-4">
        <div className="flex items-center justify-between">
            <div>
                <label className="block text-sm font-medium text-slate-300">{label}</label>
                <p className="text-xs text-slate-400 mt-1">{description}</p>
            </div>
            <button
                onClick={() => onChange(!enabled)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-violet-600' : 'bg-slate-700'}`}
                aria-pressed={enabled}
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    </div>
);


const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange, onClose, onResetSimulation, availableVoices, onGenerateAvatar, isGeneratingAvatar }) => {
    
    const [avatarPrompt, setAvatarPrompt] = useState('');
    const [showApiKeys, setShowApiKeys] = useState(false);

    const handleAiChange = (key: keyof AppSettings['ai'], value: number) => {
        onChange({ ...settings, ai: { ...settings.ai, [key]: value } });
    };

    const handleSimChange = (key: keyof AppSettings['simulation'], value: number) => {
        onChange({ ...settings, simulation: { ...settings.simulation, [key]: value } });
    };

    const handleVisualsChange = (key: keyof AppSettings['visuals'], value: string | number) => {
        onChange({ ...settings, visuals: { ...settings.visuals, [key]: value } });
    };

    const handleToggleChange = (key: 'ambientSound' | 'elevenLabsActive', value: boolean) => {
        onChange({ ...settings, [key]: value });
    };

    const handleApiKeyChange = (engine: ActiveEngine, newKey: string) => {
        onChange({
            ...settings,
            engineConfigs: {
                ...settings.engineConfigs,
                [engine]: {
                    ...settings.engineConfigs[engine],
                    apiKey: newKey,
                    isActive: newKey.length > 0
                }
            }
        });
    };

    const handlePersonaChange = (id: string) => {
        const persona = PERSONAS.find(p => p.id === id);
        if (persona) {
            const bestVoice = availableVoices.find(v => v.name.toLowerCase().includes(persona.voiceNameQuery)) 
                              || availableVoices.find(v => v.lang.startsWith('en-'))
                              || null;
            onChange({ ...settings, personaId: id, voiceURI: bestVoice?.voiceURI || null });
        }
    }

    const selectedPersona = PERSONAS.find(p => p.id === settings.personaId) || PERSONAS[0];

    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-20" onClick={onClose} aria-hidden="true"></div>
            <div 
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-slate-900/80 backdrop-blur-md rounded-lg shadow-2xl shadow-indigo-900/50 ring-1 ring-violet-500/30 z-30 overflow-hidden"
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-title"
            >
                <div className="p-6 border-b border-violet-800/60 flex justify-between items-center">
                    <h2 id="settings-title" className="text-xl font-semibold text-slate-100">System Config</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close settings">
                        <Icon name="x-circle" className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-violet-300 border-b border-violet-700/50 pb-2 mb-4">Identity Matrix</h3>
                         <Select
                            label="Active Persona"
                            value={settings.personaId}
                            onChange={(e) => handlePersonaChange(e.target.value)}
                            description={selectedPersona.description}
                        >
                            {PERSONAS.map(persona => (
                                <option key={persona.id} value={persona.id}>{persona.name}</option>
                            ))}
                        </Select>

                        <Toggle
                            label="Neural Voice (Gemini TTS)"
                            enabled={settings.elevenLabsActive}
                            onChange={(val) => handleToggleChange('elevenLabsActive', val)}
                            description="Use high-fidelity Gemini neural speech synthesis (gemini-3.8-flash-lite-tts) for responses."
                        />
                    </div>

                     <div className="mb-6">
                        <h3 className="text-lg font-medium text-violet-300 border-b border-violet-700/50 pb-2 mb-4">Avatar Manifestation</h3>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-20 h-20 rounded-full bg-slate-800 ring-2 ring-violet-500 flex-shrink-0 overflow-hidden">
                                {settings.avatarUrl && <img src={settings.avatarUrl} alt="Current Avatar" className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-grow">
                                <textarea 
                                    rows={2}
                                    value={avatarPrompt}
                                    onChange={(e) => setAvatarPrompt(e.target.value)}
                                    placeholder="Visual traits..."
                                    className="w-full p-2 bg-slate-800 border border-slate-600 text-slate-200 rounded-md focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none text-sm"
                                />
                                 <button
                                    onClick={() => onGenerateAvatar(avatarPrompt)}
                                    disabled={isGeneratingAvatar || !avatarPrompt}
                                    className="mt-2 w-full px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-md shadow-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                                >
                                    {isGeneratingAvatar ? 'Materializing...' : 'Re-Materialize'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-violet-300 border-b border-violet-700/50 pb-2 mb-4">Field Visuals</h3>
                        <Select
                            label="Spectrum"
                            value={settings.visuals.colorPalette}
                            onChange={(e) => handleVisualsChange('colorPalette', e.target.value)}
                        >
                            {COLOR_PALETTES.map(palette => (
                                <option key={palette.id} value={palette.id}>{palette.name}</option>
                            ))}
                        </Select>
                        <Slider
                            label="Grain Density"
                            value={settings.visuals.particleDensity}
                            min={0.1} max={1} step={0.1}
                            onChange={(e) => handleVisualsChange('particleDensity', parseFloat(e.target.value))}
                            description="Particle count in the background field."
                        />
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-violet-300 border-b border-violet-700/50 pb-2 mb-4">AI Cognition</h3>
                        <Slider
                            label="Temperature"
                            value={settings.ai.temperature}
                            min={0} max={1} step={0.1}
                            onChange={(e) => handleAiChange('temperature', parseFloat(e.target.value))}
                            description="Creative freedom vs. logical focus."
                        />
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-violet-300 border-b border-violet-700/50 pb-2 mb-4">Neural Keys</h3>
                        <p className="text-xs text-slate-400 mb-3">Configure API keys for external cognitive engines. Keys are stored locally.</p>
                        
                        {(['Ollama'] as ActiveEngine[]).map(engine => (
                            <div key={engine} className="mb-3">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-slate-300">{engine}</label>
                                    <span className="text-[10px] text-violet-400 font-mono">
                                        'Local Host (Ollama)'
                                    </span>
                                </div>
                                <input
                                    type={engine === 'Ollama' ? "text" : (showApiKeys ? "text" : "password")}
                                    value={settings.engineConfigs[engine]?.apiKey || ''}
                                    onChange={(e) => handleApiKeyChange(engine, e.target.value)}
                                    placeholder="http://localhost:11434"
                                    className="w-full p-2 bg-slate-800 border border-slate-600 text-slate-200 rounded-md focus:ring-2 focus:ring-violet-500 focus:outline-none text-sm font-mono"
                                />
                            </div>
                        ))}
                        
                        <button
                            onClick={() => setShowApiKeys(!showApiKeys)}
                            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                        >
                            <Icon name={showApiKeys ? "eye-off" : "eye"} className="w-4 h-4" />
                            {showApiKeys ? 'Hide' : 'Show'} Keys
                        </button>
                    </div>

                    <div className="pt-4">
                         <button
                            onClick={onResetSimulation}
                            className="w-full px-4 py-3 border border-rose-500/50 text-rose-400 hover:bg-rose-500/10 font-bold rounded-md transition-all uppercase tracking-widest text-xs"
                         >
                            Reset Field Substrate
                         </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SettingsPanel;