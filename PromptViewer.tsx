
import React, { useState, useMemo } from 'react';
import { ApiContent } from '../types';
import Button from './ui/Button';
import { CopyIcon, CheckIcon, CodeIcon } from '../constants';
import JsonTreeView from './JsonTreeView';

interface PromptViewerProps {
    prompt: ApiContent[] | null | undefined;
}

const PromptViewer: React.FC<PromptViewerProps> = ({ prompt }) => {
    const [copied, setCopied] = useState(false);

    const promptObject = useMemo(() => {
        if (!prompt || prompt.length === 0) return null;
        try {
            // A deep copy to prevent any accidental mutations if the object is complex
            return JSON.parse(JSON.stringify(prompt));
        } catch {
            return { error: "Could not parse prompt data." };
        }
    }, [prompt]);

    if (!promptObject) {
        return (
             <div className="p-4 text-center text-sm text-gray-500 h-full flex flex-col items-center justify-center">
                 <CodeIcon className="w-10 h-10 mb-2 text-gray-400" />
                <p className="font-semibold mt-2">Last API Prompt</p>
                <p>The raw prompt sent to the Gemini API will appear here after the first message.</p>
            </div>
        );
    }
    
    const handleCopy = () => {
        if (!promptObject) return;
        const jsonString = JSON.stringify(promptObject, null, 2);
        navigator.clipboard.writeText(jsonString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col p-4 overflow-hidden">
            <div className="flex-shrink-0 flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Last API Prompt</h3>
                <Button onClick={handleCopy} variant="ghost" size="sm">
                    {copied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
                    {copied ? 'Copied' : 'Copy JSON'}
                </Button>
            </div>
            
            <div className="flex-grow bg-gray-100 dark:bg-gray-800/50 rounded-lg overflow-auto border border-gray-200 dark:border-gray-700/50 p-3 shadow-inner">
                 {promptObject ? (
                    <JsonTreeView data={promptObject} rootName="prompt" />
                 ) : (
                    <div className="text-xs font-mono text-red-500">Could not render prompt data.</div>
                 )}
            </div>
        </div>
    );
}

export default PromptViewer;