import React, { useState, useRef } from 'react';
import Modal from './ui/Modal';
import Toggle from './ui/Toggle';
import { PaletteIcon, XIcon, KeyIcon, PlusCircleIcon, TrashIcon, EditIcon, SettingsIcon, DatabaseIcon, LoadIcon, SaveIcon } from '../constants';
import Button from './ui/Button';

type Theme = 'light' | 'dark';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onResetLayout: () => void;
  onExportAllData: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAllData: () => void;
}


const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, theme, setTheme,
  onResetLayout, onExportAllData, onImportData, onClearAllData
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const importFileRef = useRef<HTMLInputElement>(null);
  
  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'data', label: 'Data', icon: DatabaseIcon },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
        <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0 sm:border-r sm:pr-6 border-gray-200 dark:border-gray-700/50">
                <nav className="flex sm:flex-col gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-accent-cyan/10 text-accent-cyan'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            <tab.icon className="h-5 w-5" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="flex-grow min-w-0">
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <div>
                             <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-2">
                                <PaletteIcon className="h-5 w-5 text-accent-cyan" />
                                Appearance
                            </h4>
                             <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                <Toggle
                                label="Dark Mode"
                                enabled={theme === 'dark'}
                                onChange={(enabled) => setTheme(enabled ? 'dark' : 'light')}
                                />
                            </div>
                        </div>
                         <div>
                             <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-2">
                                Layout
                            </h4>
                            <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                                <p className="text-sm text-gray-600 dark:text-gray-300">Reset resizable panel widths to their default.</p>
                                <Button onClick={onResetLayout} variant="secondary">Reset</Button>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'data' && (
                     <div className="space-y-6">
                        <div>
                             <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-2">
                                <SaveIcon className="h-5 w-5 text-accent-cyan" />
                                Export Data
                            </h4>
                            <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                                <p className="text-sm text-gray-600 dark:text-gray-300">Save all chats, profiles, and settings to a JSON file.</p>
                                <Button onClick={onExportAllData} variant="secondary">Export</Button>
                            </div>
                        </div>
                        <div>
                             <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-2">
                                <LoadIcon className="h-5 w-5 text-accent-cyan" />
                                Import Data
                            </h4>
                             <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                                <p className="text-sm text-gray-600 dark:text-gray-300">Load from a backup file. This will overwrite all current data.</p>
                                <Button onClick={() => importFileRef.current?.click()} variant="secondary">Import</Button>
                                <input type="file" ref={importFileRef} onChange={onImportData} accept=".json" className="hidden" />
                            </div>
                        </div>
                         <div className="border-t border-red-500/20 pt-4">
                             <h4 className="font-semibold text-red-500 flex items-center gap-2 mb-2">
                                <TrashIcon className="h-5 w-5" />
                                Danger Zone
                            </h4>
                            <div className="p-4 bg-red-500/10 rounded-lg flex items-center justify-between">
                                <p className="text-sm text-red-700 dark:text-red-300">Permanently delete all chats and profiles.</p>
                                <Button onClick={onClearAllData} variant="secondary" className="!text-red-500 !border-red-500/50 hover:!bg-red-500/20">Clear Data</Button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700/50 flex justify-end">
            <Button onClick={onClose} variant="secondary">
            Close
            </Button>
      </div>
    </Modal>
  );
};

export default SettingsModal;