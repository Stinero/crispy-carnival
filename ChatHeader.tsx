
import React from 'react';
import Button from './ui/Button';
import { MenuIcon, CommandIcon, SunIcon, MoonIcon, BrainCircuitIcon, SettingsIcon } from '../constants';
import { NeuralNetName } from '../types';
import { NeuralSwarmVisualizer } from './NeuralSwarmVisualizer';

type Theme = 'light' | 'dark';

// --- ChatHeader Component Definition ---
interface ChatHeaderProps {
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  onToggleCommandPalette: () => void;
  onToggleSettings: () => void;
  isRightPanelOpen: boolean;
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  activeNeuralNet: NeuralNetName;
  sessionTitle: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onToggleLeftPanel, 
  onToggleRightPanel, 
  onToggleCommandPalette,
  onToggleSettings,
  isRightPanelOpen,
  theme,
  setTheme,
  activeNeuralNet,
  sessionTitle
}) => {
  const devPanelButtonClasses = `
    transition-all
    ${isRightPanelOpen 
        ? '!text-accent-cyan !bg-accent-cyan/10' 
        : 'text-gray-400'
    }
  `;
  
  return (
    <div className="flex-shrink-0 bg-space-blue-800/50 backdrop-blur-lg border-b border-space-blue-700/50 p-2 flex items-center justify-between h-20 z-20">
      <div className="flex items-center gap-2">
        <Button onClick={onToggleLeftPanel} variant="ghost" className="lg:hidden" aria-label="Toggle sidebar">
          <MenuIcon />
        </Button>
        <div className="flex items-center justify-center w-24 h-full">
            <NeuralSwarmVisualizer activeNet={activeNeuralNet} />
        </div>
        <h2 className="font-display font-bold text-xl text-white hidden sm:block truncate">{sessionTitle}</h2>
      </div>
      <div className="flex items-center gap-1">
        <Button onClick={onToggleCommandPalette} variant="secondary">
           <CommandIcon />
           <span className="hidden sm:inline">Commands</span>
           <kbd className="hidden sm:inline-block ml-2 text-xs font-sans font-semibold text-gray-500 border border-gray-600 rounded px-1.5 py-0.5">⌘K</kbd>
        </Button>
        
        <Button onClick={onToggleRightPanel} variant="ghost" className={devPanelButtonClasses}>
          <BrainCircuitIcon />
          <span className="hidden sm:inline">Dev Panel</span>
        </Button>
        
        <Button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
          variant="ghost"
          className="!px-2"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </Button>
        
        <Button 
          onClick={onToggleSettings}
          variant="ghost"
          className="!px-2"
          aria-label="Open settings"
        >
          <SettingsIcon />
        </Button>

      </div>
    </div>
  );
};

export default ChatHeader;