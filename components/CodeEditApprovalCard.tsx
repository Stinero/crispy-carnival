

import React from 'react';
import { CodeEdit } from '../types';
import Button from './ui/Button';
import { GitCompareIcon, CheckIcon, XIcon } from '../constants';
import DiffViewer from './ui/DiffViewer';

interface CodeEditApprovalCardProps {
    codeEdit: CodeEdit;
    onResponse: (approved: boolean) => void;
}

const getLanguageFromPath = (path: string): string => {
    const extension = path.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'js': case 'jsx': return 'javascript';
        case 'ts': case 'tsx': return 'typescript';
        case 'py': return 'python';
        case 'json': return 'json';
        case 'css': return 'css';
        case 'scss': return 'scss';
        case 'html': return 'xml'; // xml for html highlighting
        case 'md': return 'markdown';
        case 'sh': return 'bash';
        case 'sql': return 'sql';
        default: return 'plaintext';
    }
};

const CodeEditApprovalCard: React.FC<CodeEditApprovalCardProps> = ({ codeEdit, onResponse }) => {
    const language = getLanguageFromPath(codeEdit.path);
    return (
        <div className="bg-gradient-to-br from-gray-500/10 to-blue-500/10 rounded-xl my-4 p-5 border border-gray-500/30 space-y-4 max-w-4xl mx-auto animate-slide-in-up backdrop-blur-sm shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
            <div className="text-center">
                <h3 className="font-semibold text-xl text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
                    <GitCompareIcon className="h-6 w-6" />
                    Approve Code Changes
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">The agent wants to apply the following changes to <code className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded-md">{codeEdit.path}</code>.</p>
            </div>
            
            <div className="space-y-3 bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700/50 max-h-96 overflow-y-auto">
                <p className="text-xs italic text-gray-500 dark:text-gray-400">Instruction: "{codeEdit.instructions}"</p>
                <DiffViewer diffText={codeEdit.diff} language={language} />
            </div>
            
            <div className="flex justify-end gap-3">
                <Button onClick={() => onResponse(false)} variant="secondary"><XIcon /> Decline</Button>
                <Button onClick={() => onResponse(true)} variant="primary" className="!bg-green-600 hover:!bg-green-700 focus:!ring-green-500">
                   <CheckIcon /> Approve & Apply
                </Button>
            </div>
        </div>
    );
};

export default CodeEditApprovalCard;