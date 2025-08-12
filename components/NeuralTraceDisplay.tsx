

import React from 'react';
import { ChatSession, Message, RouteProposal, ToolCall, NeuralNetName } from '../types';
import { 
    TOOL_NET_MAP, NEURAL_NET_DEFINITIONS, NEURAL_NET_COLORS, NEURAL_NET_ORDER, NEURAL_NET_HEX_COLORS,
    BrainCircuitIcon, ZapIcon, GlobeIcon, DatabaseIcon, FolderIcon, PaletteIcon, SparklesIcon, BrainIcon, RouteIcon, PieChartIcon, ConsciousnessIcon
} from '../constants';

interface NeuralTraceDisplayProps {
    session: ChatSession | null;
    isLoading: boolean;
}

const NET_ICONS: Record<NeuralNetName, React.FC<{className?: string}>> = {
    CONSCIOUSNESS: ConsciousnessIcon,
    PLANNING: BrainCircuitIcon,
    MEMORY: DatabaseIcon,
    EXECUTION: ZapIcon,
    FILE_IO: FolderIcon,
    WEB_SEARCH: GlobeIcon,
    SYNTHESIS: SparklesIcon,
    CREATIVITY: PaletteIcon,
    ORCHESTRATION: BrainIcon,
    ALGORITHMS: RouteIcon,
    DATABASE: DatabaseIcon,
    ANALYTICS: PieChartIcon,
    NEUTRAL: () => <div />,
};

const NeuralTraceDisplay: React.FC<NeuralTraceDisplayProps> = ({ session, isLoading }) => {
    
    const activeToolCalls = React.useMemo(() => {
        if (!session) return {};
        const calls: Record<string, ToolCall[]> = {};
        session.messages.forEach(m => {
            if (m.role === 'assistant' && m.tool_calls) {
                m.tool_calls.forEach(tc => {
                    const net = TOOL_NET_MAP[tc.name] || 'ORCHESTRATION';
                    if (!calls[net]) calls[net] = [];
                    calls[net].push(tc);
                });
            }
        });
        return calls;
    }, [session]);
    
    const isNetPulsing = (net: NeuralNetName): boolean => {
        if (!isLoading) return false;
        if (session?.activeNeuralNet === net) return true;
        if (net === 'ORCHESTRATION' && isLoading && !session?.activeNeuralNet) return true;
        
        const isStreaming = session?.messages[session.messages.length - 1]?.role === 'assistant' && session?.messages[session.messages.length - 1]?.content?.length === 0;
        if (isStreaming && net === 'SYNTHESIS') return true;
        
        return false;
    }

    const isNetActive = (net: NeuralNetName): boolean => {
        if (activeToolCalls[net]?.length > 0) return true;
        if (net === 'PLANNING' && (session?.routingProposals?.length ?? 0) > 0) return true;
        return false;
    }

    if (!session || (session.messages.length === 0 && !isLoading)) {
        return (
            <div className="h-full flex items-center justify-center p-4 text-center text-sm text-gray-400">
                <div>
                    <ZapIcon className="w-10 h-10 mx-auto mb-2 text-gray-500" />
                    <p className="font-semibold">Neural Trace</p>
                    <p>Send a message to see the agent's trace here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-2 overflow-y-auto h-full">
            {NEURAL_NET_ORDER.map(netName => {
                const def = NEURAL_NET_DEFINITIONS[netName];
                const colorClass = NEURAL_NET_COLORS[netName];
                const hexColor = NEURAL_NET_HEX_COLORS[netName];
                const isPulsing = isNetPulsing(netName);
                const isActive = isNetActive(netName);
                const NetIcon = NET_ICONS[netName];

                return (
                    <div key={netName} className={`p-3 rounded-lg border transition-all duration-300 ${isActive ? 'bg-space-blue-800 shadow-md border-space-blue-700' : 'bg-transparent border-transparent'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`relative flex-shrink-0 w-8 h-8 flex items-center justify-center ${colorClass}`}>
                                {isPulsing && <div style={{backgroundColor: hexColor, boxShadow: `0 0 15px ${hexColor}`}} className={`absolute inset-0 rounded-full opacity-30 animate-pulse`}></div>}
                                <NetIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-grow">
                                <h4 className={`font-bold font-display ${colorClass}`}>{def.title}</h4>
                                <p className="text-xs text-gray-400">{def.description}</p>
                            </div>
                        </div>

                        {isActive && (
                            <div className="pl-12 mt-2 space-y-2 animate-fade-in text-xs">
                                {netName === 'PLANNING' && session.routingProposals.map((proposal, i) => (
                                    <details key={`proposal-${i}`} className="font-mono rounded-md bg-space-blue-900/50 p-2 border border-space-blue-700/50">
                                        <summary className="cursor-pointer list-inside">
                                            <span className="font-semibold text-indigo-400">Route: </span> {proposal.tool}
                                            <span className="text-gray-400 ml-2">(conf: {proposal.confidence.toFixed(2)})</span>
                                        </summary>
                                        <div className="mt-2 pt-2 border-t border-space-blue-700/50">
                                            <p className="italic text-gray-400 mb-1">"{proposal.reason}"</p>
                                            <pre className="text-[11px] bg-space-blue-900/70 p-1.5 rounded overflow-x-auto">{JSON.stringify(proposal.args, null, 2)}</pre>
                                        </div>
                                    </details>
                                ))}
                                {activeToolCalls[netName]?.map((call, i) => (
                                    <details key={`call-${i}`} className="font-mono rounded-md bg-space-blue-900/50 p-2 border border-space-blue-700/50">
                                        <summary className="cursor-pointer list-inside">
                                            <span className="font-semibold" style={{ color: hexColor }}>Call: </span> {call.name}
                                        </summary>
                                        <div className="mt-2 pt-2 border-t border-space-blue-700/50">
                                             <pre className="text-[11px] bg-space-blue-900/70 p-1.5 rounded overflow-x-auto">{JSON.stringify(call.args, null, 2)}</pre>
                                        </div>
                                    </details>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default NeuralTraceDisplay;
