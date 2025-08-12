

import React, { useState, useEffect, useMemo } from 'react';
import { 
    TrashIcon, 
    SaveIcon, 
    CopyIcon, 
    SunIcon, 
    MoonIcon, 
    MenuIcon, 
    SandboxIcon,
    SearchIcon
} from '../constants';

type Theme = 'light' | 'dark';

interface Command {
    name: string;
    action: () => void;
    icon: React.ReactNode;
    keywords?: string;
    disabled?: boolean;
}

interface CommandPaletteProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onReset: () => void;
    onSaveSession: () => void;
    onToggleSidebar: () => void;
    onToggleSandbox: () => void;
    onCopyLastResponse: () => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ 
    isOpen, 
    setIsOpen, 
    onReset, 
    onSaveSession, 
    onToggleSidebar, 
    onToggleSandbox, 
    onCopyLastResponse, 
    theme,
    setTheme
}) => {
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    const commands: Command[] = useMemo(() => [
        { name: 'Toggle Theme', action: () => setTheme(theme === 'dark' ? 'light' : 'dark'), icon: theme === 'dark' ? <SunIcon /> : <MoonIcon />, keywords: 'dark light mode appearance' },
        { name: 'Clear Chat', action: onReset, icon: <TrashIcon />, keywords: 'reset delete new' },
        { name: 'Save Chat JSON', action: onSaveSession, icon: <SaveIcon />, keywords: 'export download' },
        { name: 'Copy Last Response', action: onCopyLastResponse, icon: <CopyIcon />, keywords: 'clipboard assistant' },
        { name: 'Toggle Sidebar', action: onToggleSidebar, icon: <MenuIcon />, keywords: 'settings panel' },
        { name: 'Toggle Dev Panel', action: onToggleSandbox, icon: <SandboxIcon />, keywords: 'e2b panel trace' },
    ], [theme, onReset, onSaveSession, onCopyLastResponse, onToggleSidebar, onToggleSandbox, setTheme]);
    
    const filteredCommands = useMemo(() => {
        if (!query) return commands;
        return commands.filter(cmd => 
            cmd.name.toLowerCase().includes(query.toLowerCase()) || 
            cmd.keywords?.toLowerCase().includes(query.toLowerCase())
        );
    }, [query, commands]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setActiveIndex(0);
        }
    }, [isOpen]);
    
    useEffect(() => {
        setActiveIndex(0);
    }, [query]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(i => (i + 1) % filteredCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(i => (i - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if(filteredCommands[activeIndex] && !filteredCommands[activeIndex].disabled) {
                    filteredCommands[activeIndex].action();
                    setIsOpen(false);
                }
            } else if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredCommands, activeIndex, setIsOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
            <div className="relative w-full max-w-lg transform rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 transition-all">
                <div className="flex items-center border-b border-gray-200 dark:border-gray-700 p-3 gap-3">
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder="Type a command or search..."
                        className="w-full bg-transparent focus:outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>
                <ul className="p-2 max-h-[60vh] overflow-y-auto">
                    {filteredCommands.length > 0 ? (
                        filteredCommands.map((cmd, index) => (
                        <li
                            key={cmd.name}
                            onClick={() => {
                                if (cmd.disabled) return;
                                cmd.action();
                                setIsOpen(false);
                            }}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`flex items-center justify-between p-3 rounded-lg text-sm cursor-pointer ${
                                cmd.disabled ? 'opacity-50 !cursor-not-allowed' : 'hover:bg-none'
                            } ${
                                index === activeIndex 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-500/10'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={index === activeIndex ? 'text-white' : 'text-gray-400 dark:text-gray-500'}>{cmd.icon}</span>
                                {cmd.name}
                            </div>
                        </li>
                    ))
                    ) : (
                        <li className="p-4 text-center text-sm text-gray-500">No commands found.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default CommandPalette;