


import React, { useState } from 'react';
import { MemoryEntry } from '../types';
import Button from './ui/Button';
import { BrainCircuitIcon, SearchIcon, PlusCircleIcon, TrashIcon, XIcon } from '../constants';

const MemoryItem: React.FC<{ entry: MemoryEntry }> = ({ entry }) => (
  <div className="bg-gray-100 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700/50">
    <p className="text-sm text-gray-800 dark:text-gray-200">{entry.text}</p>
    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex justify-between items-center">
      <span>{new Date(entry.timestamp).toLocaleString()}</span>
      {entry.score !== undefined && (
        <span className="font-mono text-blue-500">Score: {entry.score.toFixed(2)}</span>
      )}
    </div>
  </div>
);

interface MemoryViewerProps {
  memory: MemoryEntry[];
  onAdd: (text: string) => void;
  onQuery: (query: string) => void;
  onClear: () => void;
}

const MemoryViewer: React.FC<MemoryViewerProps> = ({ memory, onAdd, onQuery, onClear }) => {
  const [query, setQuery] = useState('');
  const [newMemoryText, setNewMemoryText] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onQuery(query);
  };
  
  const handleClearSearch = () => {
    setQuery('');
    onQuery(''); // Empty query should reset to show all
  }

  const handleAdd = () => {
    if (newMemoryText.trim()) {
      onAdd(newMemoryText.trim());
      setNewMemoryText('');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all memories? This cannot be undone.')) {
      onClear();
    }
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden">
      <div className="flex-shrink-0 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search memories..."
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            {query && (
                <button type="button" onClick={handleClearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                    <XIcon className="h-3 w-3" />
                </button>
            )}
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 space-y-2">
        {memory.length > 0 ? (
          memory.map(entry => <MemoryItem key={entry.id} entry={entry} />)
        ) : (
          <div className="text-center text-sm text-gray-500 py-10">
            <BrainCircuitIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" />
            <p className="font-semibold">Memory is empty</p>
            <p>The agent will commit memories here, or you can add one manually.</p>
          </div>
        )}
      </div>
      <div className="flex-shrink-0 pt-4 mt-2 border-t border-gray-200 dark:border-gray-700/50 space-y-2">
         <div className="flex gap-2">
            <input
              type="text"
              value={newMemoryText}
              onChange={(e) => setNewMemoryText(e.target.value)}
              placeholder="Add a new memory manually..."
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={handleAdd} variant="secondary" title="Add Memory"><PlusCircleIcon /></Button>
         </div>
        <Button onClick={handleClearAll} variant="ghost" className="w-full !text-red-600 dark:!text-red-400 hover:!bg-red-100 dark:hover:!bg-red-900/40">
          <TrashIcon /> Clear All Memories
        </Button>
      </div>
    </div>
  );
};

export default MemoryViewer;