
import React from 'react';
import { PreviewState, BudgetTotals, RightPanelTab, ChatSession, ChargeRecord, FileSystemNode, NetworkLogEntry, MemoryEntry, ApiContent } from '../types';
import AgentTrace from './AgentTrace';
import PreviewDrawer from './PreviewDrawer';
import { ZapIcon, PaletteIcon, FileJsonIcon, DollarSignIcon, BrainCircuitIcon, FolderIcon, GlobeIcon, ShieldCheckIcon, RouteIcon, TerminalIcon, CodeIcon, LayoutDashboardIcon } from '../constants';
import StateHistoryViewer from './StateHistoryViewer';
import CostTracker from './CostTracker';
import FileSystemViewer from './FileSystemViewer';
import NetworkLog from './NetworkLog';
import GatingDebugger from './GatingDebugger';
import MemoryViewer from './MemoryViewer';
import ActivityLog from './ActivityLog';
import PromptViewer from './PromptViewer';
import ProjectViewer from './ProjectViewer';


interface RightPanelProps {
  activeTab: RightPanelTab;
  setActiveTab: (tab: RightPanelTab) => void;
  session: ChatSession | null;
  onRewindAndFork: (sessionId: string, historyIndex: number) => void;
  isAnyToolEnabled: boolean;
  budgetTotals: BudgetTotals;
  costHistory: ChargeRecord[];
  isLoading: boolean;
  previewState: PreviewState;
  setPreviewState: React.Dispatch<React.SetStateAction<PreviewState>>;
  theme: 'light' | 'dark';
  fileSystemTree: FileSystemNode[];
  onRefreshFileSystem: () => Promise<void>;
  onDeleteFile: (path: string) => Promise<void>;
  networkLog: NetworkLogEntry[];
  memory: MemoryEntry[];
  onAddMemory: (text: string) => void;
  onQueryMemory: (query: string) => void;
  onClearMemory: () => void;
  lastPrompt?: ApiContent[] | null;
}

const RightPanel: React.FC<RightPanelProps> = (props) => {
  const tabs = [
    { id: 'agent_trace', name: 'Flow', icon: <RouteIcon className="h-4 w-4" /> },
    { id: 'activity', name: 'Log', icon: <TerminalIcon className="h-4 w-4" /> },
    { id: 'project', name: 'Project', icon: <LayoutDashboardIcon className="h-4 w-4" /> },
    { id: 'prompt', name: 'Prompt', icon: <CodeIcon className="h-4 w-4" /> },
    { id: 'files', name: 'Files', icon: <FolderIcon /> },
    { id: 'gating', name: 'Gating', icon: <ShieldCheckIcon className="h-4 w-4" /> },
    { id: 'memory', name: 'Memory', icon: <BrainCircuitIcon className="h-4 w-4" /> },
    { id: 'network', name: 'Network', icon: <GlobeIcon /> },
    { id: 'preview', name: 'Preview', icon: <PaletteIcon className="h-4 w-4" /> },
    { id: 'state', name: 'State', icon: <FileJsonIcon /> },
    { id: 'cost', name: 'Cost', icon: <DollarSignIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="h-full flex flex-col bg-space-blue-800/50 backdrop-blur-sm text-gray-200 border-l border-space-blue-700/50">
      <div className="flex-shrink-0 border-b border-space-blue-700/50">
        <nav className="grid grid-cols-6 gap-1 p-1.5" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => props.setActiveTab(tab.id as RightPanelTab)}
              className={`
                flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors
                ${props.activeTab === tab.id
                  ? 'bg-space-blue-700 text-accent-cyan shadow-sm'
                  : 'text-gray-400 hover:bg-space-blue-700/50'
                }
              `}
              aria-current={props.activeTab === tab.id ? 'page' : undefined}
              title={tab.name}
            >
              {tab.icon}
              <span className="hidden xl:inline">{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-grow overflow-hidden">
        {props.activeTab === 'agent_trace' && (
          <AgentTrace session={props.session} isLoading={props.isLoading} />
        )}
        {props.activeTab === 'activity' && (
          <ActivityLog session={props.session} />
        )}
        {props.activeTab === 'prompt' && (
            <PromptViewer prompt={props.session?.lastPrompt} />
        )}
        {props.activeTab === 'project' && (
          <ProjectViewer
            fileTree={props.fileSystemTree}
            projectName={props.session?.title || 'Untitled Project'}
          />
        )}
        {props.activeTab === 'gating' && (
            <GatingDebugger gatingLog={props.session?.gatingLog || []} />
        )}
        {props.activeTab === 'network' && (
            <NetworkLog networkLog={props.networkLog} />
        )}
        {props.activeTab === 'files' && (
            <FileSystemViewer 
              fileTree={props.fileSystemTree} 
              onRefresh={props.onRefreshFileSystem}
              onDelete={props.onDeleteFile}
            />
        )}
        {props.activeTab === 'memory' && (
            <MemoryViewer 
              memory={props.memory}
              onAdd={props.onAddMemory}
              onQuery={props.onQueryMemory}
              onClear={props.onClearMemory}
            />
        )}
        {props.activeTab === 'state' && (
            <StateHistoryViewer session={props.session} onRewindAndFork={props.onRewindAndFork} />
        )}
        {props.activeTab === 'cost' && (
            <CostTracker budgetTotals={props.budgetTotals} costHistory={props.costHistory} />
        )}
        {props.activeTab === 'preview' && (
          <PreviewDrawer
            previewState={props.previewState}
            setPreviewState={props.setPreviewState}
            theme={props.theme}
          />
        )}
      </div>
    </div>
  );
};

export default RightPanel;