


import React from 'react';
import { GateDecision } from '../types';
import { ShieldCheckIcon, CheckIcon, XIcon, ChevronDownIcon, WandIcon } from '../constants';
import JsonTreeView from './JsonTreeView';

const StatusIcon: React.FC<{ decision: GateDecision }> = ({ decision }) => {
    if (decision.allowed) {
        return <CheckIcon className="h-4 w-4 text-green-500" />;
    }
    if (decision.requires_consent) {
        return <WandIcon className="h-4 w-4 text-yellow-500" />;
    }
    return <XIcon className="h-4 w-4 text-red-500" />;
};

const getStatusText = (decision: GateDecision) => {
    if (decision.allowed) return "Allowed";
    if (decision.requires_consent) return "Consent Required";
    return "Denied";
}

const GatingLogRow: React.FC<{ entry: GateDecision }> = ({ entry }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    
    return (
        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg text-sm border border-gray-200 dark:border-gray-700/50">
            <div 
                className="flex items-center justify-between p-2 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 font-mono truncate">
                    <StatusIcon decision={entry} />
                    <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">{entry.tool_name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className={`font-semibold ${entry.allowed ? 'text-green-500' : 'text-red-500'}`}>{getStatusText(entry)}</span>
                    <ChevronDownIcon className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isOpen && (
                <div className="px-3 pb-3 animate-fade-in">
                    <div className="text-xs space-y-2 mt-1 border-t border-gray-200 dark:border-gray-700 pt-2">
                        <p className="text-gray-600 dark:text-gray-400"><span className="font-semibold">Reason:</span> {entry.reason}</p>
                        {entry.warnings.length > 0 && (
                            <p className="text-yellow-600 dark:text-yellow-400"><span className="font-semibold">Warnings:</span> {entry.warnings.join(', ')}</p>
                        )}
                        <div>
                           <p className="font-semibold text-gray-600 dark:text-gray-400">Full Decision:</p>
                           <div className="p-2 mt-1 bg-gray-200/50 dark:bg-gray-900/50 rounded text-[11px] font-mono overflow-x-auto">
                               <JsonTreeView data={entry} rootName="decision" />
                           </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const GatingDebugger: React.FC<{ gatingLog: GateDecision[] }> = ({ gatingLog }) => {
    if (gatingLog.length === 0) {
        return (
            <div className="p-4 text-center text-sm text-gray-500 h-full flex flex-col items-center justify-center">
                 <ShieldCheckIcon className="w-10 h-10 mb-2 text-gray-400" />
                <p className="font-semibold">Gating Debugger</p>
                <p>Tool execution attempts and policy decisions will appear here.</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-4">
            <div className="space-y-2">
                {[...gatingLog].reverse().map((entry) => (
                    <GatingLogRow key={entry.id} entry={entry} />
                ))}
            </div>
        </div>
    );
};

export default GatingDebugger;