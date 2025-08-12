


import React from 'react';
import { NetworkLogEntry } from '../types';
import { GlobeIcon, CheckIcon, XIcon, ChevronDownIcon } from '../constants';

const StatusIcon: React.FC<{ status: 'success' | 'error' }> = ({ status }) => {
    if (status === 'success') {
        return <CheckIcon className="h-4 w-4 text-green-500" />;
    }
    return <XIcon className="h-4 w-4 text-red-500" />;
};

const NetworkLogRow: React.FC<{ entry: NetworkLogEntry }> = ({ entry }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    
    return (
        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg text-sm border border-gray-200 dark:border-gray-700/50">
            <div 
                className="flex items-center justify-between p-2 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 font-mono truncate">
                    <StatusIcon status={entry.status} />
                    <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">{entry.toolName}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>{entry.durationMs.toFixed(0)}ms</span>
                    <ChevronDownIcon className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isOpen && (
                <div className="px-3 pb-3 animate-fade-in">
                    <div className="text-xs space-y-2 mt-1 border-t border-gray-200 dark:border-gray-700 pt-2">
                        <div>
                           <p className="font-semibold text-gray-600 dark:text-gray-400">Request:</p>
                           <pre className="p-2 mt-1 bg-gray-200/50 dark:bg-gray-900/50 rounded text-[11px] font-mono overflow-x-auto">
                               {JSON.stringify(entry.request, null, 2)}
                           </pre>
                        </div>
                         <div>
                           <p className="font-semibold text-gray-600 dark:text-gray-400">Response:</p>
                           <pre className="p-2 mt-1 bg-gray-200/50 dark:bg-gray-900/50 rounded text-[11px] font-mono overflow-x-auto">
                               {entry.response}
                           </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const NetworkLog: React.FC<{ networkLog: NetworkLogEntry[] }> = ({ networkLog }) => {
    if (networkLog.length === 0) {
        return (
            <div className="p-4 text-center text-sm text-gray-500 h-full flex flex-col items-center justify-center">
                 <GlobeIcon className="w-10 h-10 mb-2 text-gray-400" />
                <p className="font-semibold">Network Log</p>
                <p>Network-related tool calls will appear here.</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-4">
            <div className="space-y-2">
                {[...networkLog].reverse().map((entry) => (
                    <NetworkLogRow key={entry.id} entry={entry} />
                ))}
            </div>
        </div>
    );
};

export default NetworkLog;