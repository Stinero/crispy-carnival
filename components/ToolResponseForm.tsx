


import React, { useState } from 'react';
import { ToolCall } from '../types';
import Button from './ui/Button';
import { ToolIcon, WandIcon } from '../constants';

interface ToolResponseFormProps {
  toolCalls: ToolCall[];
  onSubmit: (results: { name: string; result: string }[]) => void;
  isLoading: boolean;
}

const ToolResponseForm: React.FC<ToolResponseFormProps> = ({ toolCalls, onSubmit, isLoading }) => {
  const [results, setResults] = useState<Record<string, string>>({});

  const handleResultChange = (name: string, value: string) => {
    setResults(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(isLoading) return;

    const formattedResults = toolCalls.map(tc => ({
      name: tc.name,
      result: results[tc.name] || JSON.stringify({error: "No result provided by user."})
    }));
    onSubmit(formattedResults);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl my-4 p-5 border border-indigo-500/30 space-y-4 max-w-3xl mx-auto animate-slide-in-up backdrop-blur-sm shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
      <div className="text-center">
        <h3 className="font-semibold text-xl text-indigo-600 dark:text-indigo-300 flex items-center justify-center gap-2">
            <WandIcon className="h-5 w-5" /> Manual Tool Execution
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">The model requests results for the following tool calls.</p>
      </div>
      
      <div className="space-y-4">
        {toolCalls.map((toolCall, index) => (
          <div key={index} className="bg-space-blue-900/40 p-4 rounded-lg border border-space-blue-700">
              <div className="font-mono text-base text-accent-cyan flex items-center gap-2">
                  <ToolIcon />
                  <span className="font-bold text-gray-200">{toolCall.name}</span>
              </div>
              <div className="mt-2 space-y-2">
                <div>
                  <label className="text-xs font-medium text-gray-400">Arguments:</label>
                  <pre className="mt-1 p-2 bg-space-blue-800/50 rounded text-xs text-gray-300 overflow-x-auto font-mono">
                      {JSON.stringify(toolCall.args, null, 2)}
                  </pre>
                </div>
                 <div>
                  <label className="text-xs font-medium text-gray-400">Result:</label>
                  <textarea
                      value={results[toolCall.name] || ''}
                      onChange={(e) => handleResultChange(toolCall.name, e.target.value)}
                      placeholder={`Enter JSON result for ${toolCall.name}...`}
                      rows={4}
                      className="mt-1 w-full bg-space-blue-700/80 text-gray-200 border border-space-blue-600 rounded-md p-2 text-sm font-mono focus:ring-2 focus:ring-accent-cyan focus:outline-none"
                      disabled={isLoading}
                  />
                </div>
              </div>
          </div>
        ))}
      </div>
      <Button type="submit" disabled={isLoading} variant="primary" className="w-full !py-3 !text-base !bg-indigo-600 hover:!bg-indigo-700 focus:!ring-indigo-500">
        {isLoading ? 'Submitting...' : 'Submit Tool Results'}
      </Button>
    </form>
  );
};
export default ToolResponseForm;