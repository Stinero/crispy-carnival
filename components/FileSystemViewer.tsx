


import React, { useState } from 'react';
import { FileSystemNode } from '../types';
import { FolderIcon, FileIcon, RefreshCwIcon, TrashIcon } from '../constants';
import Button from './ui/Button';

const FileTreeNode: React.FC<{
  node: FileSystemNode;
  onSelectFile: (file: FileSystemNode) => void;
  onDelete: (path: string) => Promise<void>;
  selectedPath: string | null;
  level?: number;
}> = ({ node, onSelectFile, onDelete, selectedPath, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = selectedPath === node.path;

  const handleSelect = () => {
    if (node.type === 'directory') {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(node);
    }
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(node.path);
  }

  return (
    <div>
      <div
        onClick={handleSelect}
        className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer text-sm group ${
          isSelected
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
            : 'hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
        }`}
        style={{ paddingLeft: `${level * 1.25 + 0.375}rem` }}
      >
        <div className="flex items-center gap-2 truncate">
          {node.type === 'directory' ? (
            <FolderIcon className="flex-shrink-0 text-yellow-500" />
          ) : (
            <FileIcon className="flex-shrink-0 text-gray-500 dark:text-gray-400" />
          )}
          <span className="truncate">{node.name}</span>
        </div>
        <button 
          onClick={handleDelete}
          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 dark:text-red-400 transition-opacity"
          title={`Delete ${node.type}`}
        >
            <TrashIcon />
        </button>
      </div>
      {node.type === 'directory' && isOpen && node.children && (
        <div>
          {node.children.map(child => (
            <FileTreeNode
              key={child.path}
              node={child}
              onSelectFile={onSelectFile}
              onDelete={onDelete}
              selectedPath={selectedPath}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileSystemViewer: React.FC<{
  fileTree: FileSystemNode[];
  onRefresh: () => Promise<void>;
  onDelete: (path: string) => Promise<void>;
}> = ({ fileTree, onRefresh, onDelete }) => {
  const [selectedFile, setSelectedFile] = useState<FileSystemNode | null>(null);

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden">
      <div className="flex-shrink-0 flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">File Explorer</h3>
        <Button onClick={onRefresh} variant="ghost" size="sm">
          <RefreshCwIcon />
          Refresh
        </Button>
      </div>
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden rounded-lg border border-gray-200/80 dark:border-gray-700/50 shadow-inner">
        <div className="w-full md:w-2/5 h-full overflow-y-auto p-2 bg-gray-100/30 dark:bg-gray-800/30 border-b md:border-b-0 md:border-r border-gray-200/80 dark:border-gray-700/50">
          {fileTree.length > 0 ? (
            fileTree.map(node => (
              <FileTreeNode
                key={node.path}
                node={node}
                onSelectFile={setSelectedFile}
                onDelete={onDelete}
                selectedPath={selectedFile?.path || null}
              />
            ))
          ) : (
            <div className="p-4 text-center text-xs text-gray-500">
              File system is empty.
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          {selectedFile ? (
            <>
              <div className="flex-shrink-0 p-2 text-sm font-semibold bg-gray-100 dark:bg-gray-800/50 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700/50">
                <FileIcon />
                <span className="truncate">{selectedFile.name}</span>
              </div>
              <div className="flex-grow overflow-y-auto">
                <pre className="p-3 text-xs text-gray-800 dark:text-gray-200 font-mono">
                  <code>{selectedFile.content || '(File is empty)'}</code>
                </pre>
              </div>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center text-center text-sm text-gray-500 p-4">
              <div>
                <FolderIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                <p>Select a file to view its content.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileSystemViewer;