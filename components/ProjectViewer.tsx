

import React from 'react';
import { FileSystemNode } from '../types';
import { LayoutDashboardIcon, FolderIcon, FileIcon } from '../constants';

const FileNodeDisplay: React.FC<{ node: FileSystemNode, level?: number }> = ({ node, level = 0 }) => {
  const [isOpen, setIsOpen] = React.useState(level < 2); // Auto-expand first two levels
  const isDir = node.type === 'directory';
  const Icon = isDir ? FolderIcon : FileIcon;
  const iconColor = isDir ? 'text-yellow-500' : 'text-gray-400';

  return (
    <div>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center p-1 rounded-md text-sm ${isDir ? 'cursor-pointer' : ''} hover:bg-gray-200/50 dark:hover:bg-gray-800`}
        style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
      >
        <Icon className={`h-4 w-4 mr-2 flex-shrink-0 ${iconColor}`} />
        <span>{node.name}</span>
      </div>
      {isDir && isOpen && node.children && (
        <div>
          {node.children.map(child => <FileNodeDisplay key={child.path} node={child} level={level + 1} />)}
        </div>
      )}
    </div>
  );
};


interface ProjectViewerProps {
  fileTree: FileSystemNode[];
  projectName: string;
}

const ProjectViewer: React.FC<ProjectViewerProps> = ({ fileTree, projectName }) => {
  if (fileTree.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500 h-full flex flex-col items-center justify-center">
        <LayoutDashboardIcon className="w-10 h-10 mb-2 text-gray-400" />
        <p className="font-semibold">Project Dashboard</p>
        <p className="mt-2">No project structure found in the current session.</p>
        <p className="mt-1">Ask the agent to create a new project, for example:</p>
        <code className="mt-3 p-2 bg-gray-800 rounded-md text-xs text-left inline-block">
          create a new react-vite-ts project named '{projectName}'
        </code>
      </div>
    );
  }

  const countNodes = (nodes: FileSystemNode[]): { files: number, dirs: number } => {
    let files = 0;
    let dirs = 0;
    for (const node of nodes) {
      if (node.type === 'directory') {
        dirs++;
        if (node.children) {
          const childCounts = countNodes(node.children);
          files += childCounts.files;
          dirs += childCounts.dirs;
        }
      } else {
        files++;
      }
    }
    return { files, dirs };
  };

  const { files, dirs } = countNodes(fileTree);

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden">
        <div className="flex-shrink-0 flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 truncate">
                Project: {projectName}
            </h3>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                <p className="text-2xl font-bold">{files}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Files</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                <p className="text-2xl font-bold">{dirs}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Directories</p>
            </div>
        </div>
        <div className="flex-grow bg-gray-100 dark:bg-gray-800/50 rounded-lg overflow-auto border border-gray-200 dark:border-gray-700/50 p-3 shadow-inner">
            <p className="text-sm font-semibold mb-2">Project Structure</p>
            <div className="space-y-0.5">
              {fileTree.map(node => <FileNodeDisplay key={node.path} node={node} />)}
            </div>
        </div>
    </div>
  );
};

export default ProjectViewer;