




import React, { useState } from 'react';
import { Config, Message, Profile } from '../types';
import Button from './ui/Button';
import Slider from './ui/Slider';
import Toggle from './ui/Toggle';
import Modal from './ui/Modal';
import { SlidersIcon, TerminalIcon, SparklesIcon, ChevronDownIcon, ResetIcon, UndoIcon, SaveIcon, LoadIcon, BookmarkIcon, PlusCircleIcon, TrashIcon, CommandIcon, BrainIcon, WandIcon, KeyIcon, ZapIcon } from '../constants';
import { ALL_TOOLS } from '../tools';
import { AVAILABLE_MODELS } from '../constants';

interface AccordionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-space-blue-800/30 rounded-lg border border-space-blue-700/50 overflow-hidden transition-all shadow-sm">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 text-left group" aria-expanded={isOpen}>
                <div className="flex items-center gap-3">
                    <span className="text-accent-cyan">{icon}</span>
                    <h2 className="font-semibold text-gray-100">{title}</h2>
                </div>
                <ChevronDownIcon className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-gray-400`} />
            </button>
            {isOpen && <div className="p-4 pt-2 space-y-4 animate-fade-in">{children}</div>}
        </div>
    );
}

interface SidebarProps {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
  onResetSession: () => void;
  onUndo: () => void;
  onSaveSession: () => void;
  onLoadSession: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  historyLength: number;
  profiles: Profile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onSaveProfile: (name: string) => void;
  onUpdateProfile: () => void;
  onDeleteProfile: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    config, setConfig, onResetSession, onUndo, onSaveSession, onLoadSession, isLoading, historyLength,
    profiles, activeProfileId, onSelectProfile, onSaveProfile, onUpdateProfile, onDeleteProfile,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const handleConfigChange = (key: keyof Config, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };
  
  const handleNumericConfigChange = (key: keyof Config, value: string) => {
     handleConfigChange(key, parseFloat(value));
  };

  const handleToolToggle = (toolName: string, enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      enabledTools: {
        ...prev.enabledTools,
        [toolName]: enabled,
      }
    }));
  };

  const handleSaveNewProfile = () => {
    if (newProfileName.trim()) {
      onSaveProfile(newProfileName.trim());
      setIsSaveModalOpen(false);
      setNewProfileName('');
    }
  };

  const handleDeleteCurrentProfile = () => {
    onDeleteProfile(activeProfileId);
    setIsDeleteModalOpen(false);
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId);

  return (
    <>
    <div className="w-full h-full flex flex-col p-4 text-gray-200 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-3 font-display">
        <CommandIcon className="h-7 w-7 text-accent-cyan" />
        Controls
      </h1>
      
      <div className="space-y-4 flex-grow">
        <Accordion title="Profiles" icon={<BookmarkIcon />} defaultOpen={true}>
            <div className="space-y-3">
            <div>
                <label htmlFor="profile-select" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Active Profile
                </label>
                <select 
                    id="profile-select"
                    value={activeProfileId} 
                    onChange={(e) => onSelectProfile(e.target.value)}
                    className="w-full bg-space-blue-700/80 text-gray-200 border border-space-blue-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-accent-cyan focus:border-accent-cyan focus:outline-none"
                >
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.name}{p.isDefault ? ' (Default)' : ''}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <Button 
                    onClick={onUpdateProfile}
                    disabled={activeProfile?.isDefault || isLoading}
                    variant="secondary" 
                    size="sm"
                    title={activeProfile?.isDefault ? "Cannot update a default profile" : "Update current profile"}
                >
                    <SaveIcon /> Update
                </Button>
                <Button 
                    onClick={() => setIsSaveModalOpen(true)}
                    disabled={isLoading}
                    variant="secondary"
                    size="sm"
                    title="Save current settings as a new profile"
                >
                    <PlusCircleIcon /> Save As
                </Button>
                <Button 
                    onClick={() => setIsDeleteModalOpen(true)}
                    disabled={activeProfile?.isDefault || isLoading}
                    variant="ghost" 
                    size="sm"
                    className="!text-red-400 hover:!bg-red-900/40"
                    title={activeProfile?.isDefault ? "Cannot delete a default profile" : "Delete current profile"}
                >
                    <TrashIcon /> Delete
                </Button>
            </div>
            </div>
        </Accordion>

        <Accordion title="Parameters" icon={<SlidersIcon />}>
           <div>
              <label htmlFor="model-select" className="block text-sm font-medium text-gray-300 mb-1.5">Model</label>
              <select
                id="model-select"
                value={config.model}
                onChange={(e) => handleConfigChange('model', e.target.value)}
                className="w-full bg-space-blue-700/80 text-gray-200 border border-space-blue-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-accent-cyan focus:border-accent-cyan focus:outline-none"
              >
                  {AVAILABLE_MODELS.map(model => <option key={model} value={model}>{model}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1 pl-1">Note: some models may have different capabilities or access rules.</p>
           </div>
          <Slider
            label="Temperature"
            min={0} max={2.0} step={0.1}
            value={config.temperature}
            onChange={(e) => handleNumericConfigChange('temperature', e.target.value)}
          />
          <Slider
            label="Top-P"
            min={0} max={1.0} step={0.05}
            value={config.topP}
            onChange={(e) => handleNumericConfigChange('topP', e.target.value)}
          />
          <Slider
            label="Top-K"
            min={1} max={40} step={1}
            value={config.topK}
            onChange={(e) => handleNumericConfigChange('topK', e.target.value)}
          />
          <Slider
            label="Max Tokens"
            min={1} max={8192} step={1}
            value={config.maxOutputTokens}
            onChange={(e) => handleNumericConfigChange('maxOutputTokens', e.target.value)}
          />
        </Accordion>
        
        <Accordion title="System Prompt" icon={<BrainIcon className="h-5 w-5" />}>
          <textarea
            value={config.systemPrompt}
            onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
            rows={6}
            className="w-full bg-space-blue-700/80 text-gray-200 border border-space-blue-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-accent-cyan focus:border-accent-cyan focus:outline-none font-mono"
            placeholder="Enter system prompt..."
          />
        </Accordion>
        
        <Accordion title="Developer" icon={<ZapIcon />}>
            <Toggle
                label="Auto-Approve"
                enabled={config.autoApprove ?? false}
                onChange={(val) => handleConfigChange('autoApprove', val)}
            />
            <p className="text-xs text-gray-400 -mt-2 pl-1">
                Automatically approve all plans, code edits, and sensitive tool usage. Use with caution.
            </p>
        </Accordion>

        <Accordion title="Advanced Tunings" icon={<WandIcon />}>
            <div>
                <label htmlFor="seed-input" className="flex justify-between text-sm font-medium text-gray-300 mb-1.5">
                    <span>Seed</span>
                </label>
                <input
                    id="seed-input"
                    type="number"
                    placeholder="Optional"
                    value={config.seed ?? ''}
                    onChange={(e) => handleConfigChange('seed', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    className="w-full bg-space-blue-700/80 text-gray-200 border border-space-blue-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-accent-cyan focus:border-accent-cyan focus:outline-none"
                />
            </div>
            <Slider
                label="Thinking Budget"
                min={0}
                max={config.maxOutputTokens}
                step={1}
                value={config.thinkingBudget ?? 0}
                onChange={(e) => handleConfigChange('thinkingBudget', parseInt(e.target.value, 10))}
            />
            <p className="text-xs text-gray-400 -mt-3 pl-1">
                For gemini-2.5-flash. Set to 0 to disable thinking.
            </p>
        </Accordion>

        <Accordion title="Tools & Modes" icon={<SparklesIcon />}>
          <Toggle
            label="Google Search"
            enabled={config.useGoogleSearch}
            onChange={(val) => handleConfigChange('useGoogleSearch', val)}
          />
          
          <div className="space-y-3 pt-3 mt-3 border-t border-space-blue-700/50">
            <p className="text-sm font-medium text-gray-300">Function Calling</p>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {ALL_TOOLS.map(tool => (
                <Toggle
                  key={tool.name}
                  label={tool.name}
                  enabled={config.enabledTools[tool.name] ?? false}
                  onChange={(val) => handleToolToggle(tool.name, val)}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-space-blue-700/50">
            <Toggle
              label="JSON Mode"
              enabled={config.useJsonMode}
              onChange={(val) => handleConfigChange('useJsonMode', val)}
            />
          </div>
          {config.useJsonMode && (
             <div className="pt-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    JSON Schema (optional)
                </label>
                <textarea
                    value={config.jsonSchema}
                    onChange={(e) => handleConfigChange('jsonSchema', e.target.value)}
                    rows={8}
                    className="w-full bg-space-blue-700/80 text-gray-200 border border-space-blue-600 rounded-md p-2 text-sm font-mono focus:ring-2 focus:ring-accent-cyan focus:border-accent-cyan focus:outline-none"
                    placeholder='Enter JSON schema...'
                />
             </div>
          )}
        </Accordion>
      </div>

      <div className="mt-6 flex-shrink-0">
        <h2 className="text-md font-semibold text-gray-100 mb-2 px-1">Active Chat</h2>
        <div className="grid grid-cols-2 gap-2">
            <Button onClick={onResetSession} disabled={isLoading} variant="ghost"><ResetIcon /> Reset</Button>
            <Button onClick={onUndo} disabled={isLoading || historyLength === 0} variant="ghost"><UndoIcon /> Undo</Button>
            <Button onClick={onSaveSession} disabled={isLoading} variant="ghost"><SaveIcon /> Save</Button>
            <Button onClick={() => fileInputRef.current?.click()} disabled={isLoading} variant="ghost"><LoadIcon /> Load</Button>
            <input type="file" ref={fileInputRef} onChange={onLoadSession} accept=".json" className="hidden" />
        </div>
      </div>
    </div>
    <Modal
      isOpen={isSaveModalOpen}
      onClose={() => setIsSaveModalOpen(false)}
      title="Save New Profile"
    >
        <label htmlFor="profile-name" className="block text-sm font-medium text-gray-300">Profile Name</label>
        <input
          type="text"
          id="profile-name"
          value={newProfileName}
          onChange={(e) => setNewProfileName(e.target.value)}
          placeholder="e.g., 'Code Review Assistant'"
          className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-accent-cyan focus:ring-accent-cyan sm:text-sm bg-gray-700"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSaveNewProfile()}
        />
      <div className="mt-5 sm:mt-6 grid grid-flow-row-dense grid-cols-2 gap-3">
        <Button variant="primary" onClick={handleSaveNewProfile} disabled={!newProfileName.trim()}>
          Save
        </Button>
        <Button variant="secondary" onClick={() => setIsSaveModalOpen(false)}>
          Cancel
        </Button>
      </div>
    </Modal>
    <Modal
      isOpen={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      title="Delete Profile"
    >
        <p className="text-sm text-gray-400">
          Are you sure you want to delete the profile "{activeProfile?.name}"? This action cannot be undone.
        </p>
      <div className="mt-5 sm:mt-6 grid grid-flow-row-dense grid-cols-2 gap-3">
        <Button
          variant="primary"
          className="!bg-red-600 hover:!bg-red-700 focus:!ring-red-500"
          onClick={handleDeleteCurrentProfile}
        >
          Delete
        </Button>
        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
          Cancel
        </Button>
      </div>
    </Modal>
    </>
  );
};

export default Sidebar;