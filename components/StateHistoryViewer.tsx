


import React, { useState, useMemo, useEffect } from 'react';
import { ChatSession } from '../types';
import Button from './ui/Button';
import { CopyIcon, CheckIcon, FileJsonIcon, RewindIcon } from '../constants';
import JsonTreeView from './JsonTreeView';
import Slider from './ui/Slider';

interface StateHistoryViewerProps {
    session: ChatSession | null;
    onRewindAndFork: (sessionId: string, historyIndex: number) => void;
}

const StateHistoryViewer: React.FC<StateHistoryViewerProps> = ({ session, onRewindAndFork }) => {
    const [copied, setCopied] = useState(false);
    const history = session?.history || [];
    const [historyIndex, setHistoryIndex] = useState(history.length);
    
    // Reset index when session changes or history grows
    useEffect(() => {
        setHistoryIndex(history.length);
    }, [history.length, session?.id]);

    const viewedState = useMemo(() => {
        if (!session) return null;
        // If slider is at the end, show the current session state
        if (historyIndex >= history.length) {
            return session;
        }
        // Otherwise, show the historical state
        return history[historyIndex];
    }, [session, history, historyIndex]);

    const sessionObject = useMemo(() => {
        if (!viewedState) return null;
        try {
            // A deep copy to prevent any accidental mutations if the object is complex
            return JSON.parse(JSON.stringify(viewedState));
        } catch {
            return { error: "Could not parse session state." };
        }
    }, [viewedState]);

    if (!session) {
        return (
             <div className="p-4 text-center text-sm text-gray-500 h-full flex flex-col items-center justify-center">
                 <FileJsonIcon />
                <p className="font-semibold mt-2">Session State</p>
                <p>No active session to display.</p>
            </div>
        );
    }
    
    const handleCopy = () => {
        if (!sessionObject) return;
        const jsonString = JSON.stringify(sessionObject, null, 2);
        navigator.clipboard.writeText(jsonString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const handleRewind = () => {
        if (session && historyIndex < history.length) {
            onRewindAndFork(session.id, historyIndex);
        }
    }

    return (
        <div className="h-full flex flex-col p-4 overflow-hidden">
            <div className="flex-shrink-0 flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">State History</h3>
                <Button onClick={handleCopy} variant="ghost" size="sm">
                    {copied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
                    {copied ? 'Copied' : 'Copy JSON'}
                </Button>
            </div>
            
            <div className="flex-shrink-0 mb-4 bg-gray-100/70 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700/50">
                <Slider
                    label={`History Step (${historyIndex}/${history.length})`}
                    value={historyIndex}
                    min={0}
                    max={history.length}
                    step={1}
                    onChange={(e) => setHistoryIndex(parseInt(e.target.value, 10))}
                />
                <Button
                    onClick={handleRewind}
                    disabled={historyIndex >= history.length}
                    variant="secondary"
                    className="w-full mt-3"
                >
                    <RewindIcon className="w-4 h-4" />
                    Rewind & Fork from this State
                </Button>
            </div>
            
            <div className="flex-grow bg-gray-100 dark:bg-gray-800/50 rounded-lg overflow-auto border border-gray-200 dark:border-gray-700/50 p-3 shadow-inner">
                 {sessionObject ? (
                    <JsonTreeView data={sessionObject} />
                 ) : (
                    <div className="text-xs font-mono text-red-500">Could not render session state.</div>
                 )}
            </div>
        </div>
    );
}

export default StateHistoryViewer;