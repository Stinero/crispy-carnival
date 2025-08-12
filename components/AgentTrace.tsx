



import React from 'react';
import { Message, Plan, ChatSession, ContentPart, ToolCall, NeuralNetName } from '../types';
import { 
    BotIcon, UserIcon, ErrorIcon, ToolIcon, TerminalIcon, BrainCircuitIcon, 
    ZapIcon, BrainIcon, NEURAL_NET_COLORS, NEURAL_NET_HEX_COLORS, 
    TOOL_NET_MAP, RouteIcon, CheckIcon, XIcon, FlaskConicalIcon, FileCheckIcon, GitCompareIcon, ImageIcon, ConsciousnessIcon
} from '../constants';
import DiffViewer from './ui/DiffViewer';

const getContentAsString = (content: string | ContentPart[]): string => {
    if (typeof content === 'string') return content;
    return content.map(part => {
        if (part.type === 'text') return part.content;
        return `[${part.type}]`;
    }).join('');
};

const CodeDisplay: React.FC<{ data: any; className?: string }> = ({ data, className }) => (
    <pre className={`mt-1.5 p-2 bg-gray-200/50 dark:bg-space-blue-900/50 rounded-md text-xs text-gray-700 dark:text-gray-300 overflow-x-auto font-mono ${className}`}>
        <code>{typeof data === 'string' ? data : JSON.stringify(data, null, 2)}</code>
    </pre>
);

const PlanDisplay: React.FC<{ plan: Plan }> = ({ plan }) => (
    <div className="mt-2 space-y-2">
        {plan.steps.map((step, index) => (
             <div key={index} className="pl-4 border-l-2 border-indigo-400/50">
                <p className="font-semibold text-sm">Step {index + 1}: <span className="font-mono text-indigo-500 dark:text-indigo-300">{step.tool_name}</span></p>
                <p className="text-xs italic text-gray-500 dark:text-gray-400">"{step.thought}"</p>
                <details className="text-xs group mt-1">
                    <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white select-none">Arguments</summary>
                    <CodeDisplay data={step.args} />
                </details>
            </div>
        ))}
    </div>
);

const ReflectionPlanDisplay: React.FC<{ reflection: Message['reflection'] }> = ({ reflection }) => {
    if (!reflection) return null;
    return (
        <div className="mt-2 space-y-3">
            <div>
                <h4 className="font-semibold text-sm text-red-500 dark:text-red-400">Failure Cause</h4>
                <CodeDisplay data={reflection.error} className="!bg-red-100/30 dark:!bg-red-900/20 !border !border-red-200/50 dark:!border-red-800/30" />
            </div>
             <div>
                <h4 className="font-semibold text-sm text-green-500 dark:text-green-400">Corrected Plan</h4>
                <PlanDisplay plan={reflection.revised_plan} />
            </div>
        </div>
    );
};

const ToolCallDisplay: React.FC<{ toolCalls: ToolCall[], isResult?: boolean }> = ({ toolCalls, isResult }) => (
    <div className="mt-2 space-y-2">
        {toolCalls.map((call, index) => (
             <div key={index} className="pl-4 border-l-2 border-blue-400/50">
                <p className="font-semibold text-sm font-mono text-blue-500 dark:text-blue-300">{call.name}</p>
                 <details className="text-xs group mt-1" open={isResult}>
                    <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white select-none">{isResult ? 'Result' : 'Arguments'}</summary>
                    <CodeDisplay data={call.args} />
                </details>
            </div>
        ))}
    </div>
);

const ConsciousnessDisplay: React.FC<{ consciousness: Message['consciousness'] }> = ({ consciousness }) => {
    if (!consciousness) return null;

    const decisionColorMap = {
        proceed: 'text-green-500 dark:text-green-400',
        refine: 'text-blue-500 dark:text-blue-400',
        clarify: 'text-orange-500 dark:text-orange-400'
    };
    
    const decisionTextMap = {
        proceed: 'Response Approved',
        refine: 'Refining Answer',
        clarify: 'Requesting Clarification'
    };

    return (
        <div className="mt-2 space-y-3">
             <div className="p-3 rounded-md border-2 border-dashed bg-yellow-400/5 border-yellow-400/30">
                <h4 className="font-semibold text-sm text-yellow-500 dark:text-yellow-300">Prime Directive</h4>
                <p className="text-xs italic text-gray-500 dark:text-gray-400 mt-1">
                    Evaluate the preceding interaction. Does the proposed response holistically serve the user's request with clarity, truth, and wisdom? Identify any distortions, opportunities for deeper insight, or alternative approaches that would better serve the user.
                </p>
             </div>
             <div>
                <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Synthesis</h4>
                <p className="mt-1 text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{consciousness.analysis}</p>
            </div>
            <div>
                 <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Outcome</h4>
                 <p className={`mt-1 font-bold ${decisionColorMap[consciousness.decision]}`}>{decisionTextMap[consciousness.decision]}</p>
                 {consciousness.decision === 'refine' && (
                     <details className="text-xs group mt-2">
                         <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white select-none">Show original vs. refined content</summary>
                         <div className="mt-1 grid grid-cols-2 gap-2">
                            <div>
                                <p className="font-semibold text-xs mb-1">Original</p>
                                <CodeDisplay data={getContentAsString(consciousness.original_content)} className="!bg-red-500/5" />
                            </div>
                            <div>
                                 <p className="font-semibold text-xs mb-1">Refined</p>
                                 <CodeDisplay data={getContentAsString(consciousness.refined_content || [])} className="!bg-green-500/5" />
                            </div>
                         </div>
                     </details>
                 )}
            </div>
        </div>
    );
};

const getNetInfo = (message: Message): { name: NeuralNetName, color: string, hex: string } => {
    let name: NeuralNetName = 'NEUTRAL';
    if (message.role === 'consciousness') {
        name = 'CONSCIOUSNESS';
    } else if (message.role === 'thought' || message.role === 'planner' || message.role === 'reflection') {
        name = 'PLANNING';
    } else if (message.role === 'assistant' && message.tool_calls) {
        name = 'ORCHESTRATION';
    } else if (message.role === 'assistant') { // No tool calls = synthesis
        name = 'SYNTHESIS';
    } else if (message.role === 'tool' && message.name) {
        name = TOOL_NET_MAP[message.name] || 'EXECUTION';
    }
    return { name, color: NEURAL_NET_COLORS[name], hex: NEURAL_NET_HEX_COLORS[name] };
};

const TestResultViewer: React.FC<{ result: any }> = ({ result }) => {
    const { success, summary, details } = result;
    const colorClass = success ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    const bgClass = success ? 'bg-green-500/10' : 'bg-red-500/10';
    const Icon = success ? CheckIcon : XIcon;

    return (
        <div className={`mt-1.5 p-3 rounded-md text-sm border ${bgClass} border-current`}>
            <p className={`font-semibold flex items-center gap-2 ${colorClass}`}>
                <Icon className="h-4 w-4" /> {summary}
            </p>
            {details && (
                <details className="mt-2 text-xs">
                    <summary className="cursor-pointer text-gray-500 dark:text-gray-400">Show details</summary>
                    <p className="mt-1 text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap">{details}</p>
                </details>
            )}
        </div>
    );
};

const CodeReviewViewer: React.FC<{ result: any }> = ({ result }) => {
    const { suggestions } = result;
    if (!suggestions || suggestions.length === 0) {
        return (
            <div className="mt-1.5 p-3 rounded-md text-sm border bg-green-500/10 border-green-500/50 text-green-500 dark:text-green-400">
                <p className="font-semibold flex items-center gap-2"><CheckIcon /> Code review passed with no suggestions.</p>
            </div>
        );
    }
    const severityMap: Record<string, { color: string, Icon: React.FC<{className?:string}> }> = {
        Critical: { color: 'text-red-500', Icon: ErrorIcon },
        Warning: { color: 'text-yellow-500', Icon: (props) => <ErrorIcon {...props} /> },
        Info: { color: 'text-blue-500', Icon: (props) => <CheckIcon {...props} /> },
    };

    return (
        <div className="mt-1.5 space-y-2">
            {suggestions.map((s: {severity: string, message: string}, i: number) => {
                const { color, Icon } = severityMap[s.severity] || severityMap.Info;
                const colorClass = color.replace('text-', '');
                return (
                    <div key={i} className={`p-2 rounded border bg-${colorClass}/10 border-${colorClass}/50`}>
                         <p className={`font-semibold flex items-center gap-2 text-xs ${color}`}>
                             <Icon className="h-4 w-4" /> {s.severity}
                         </p>
                         <p className="mt-1 text-xs text-gray-700 dark:text-gray-300 pl-6">{s.message}</p>
                    </div>
                )
            })}
        </div>
    );
};

const GraphResultViewer: React.FC<{ result: any }> = ({ result }) => (
    <div className="mt-1.5 p-2 bg-gray-200/50 dark:bg-space-blue-900/50 rounded-md text-sm font-mono">
        <p className="font-semibold mb-1 text-gray-600 dark:text-gray-400">{result.method.toUpperCase()} Traversal Path:</p>
        <p className="text-gray-800 dark:text-gray-200">{result.result.join(' → ')}</p>
    </div>
);

const DelegationTraceViewer: React.FC<{ result: any }> = ({ result }) => {
    const { final_answer, transcript, workspace_context } = result;

    if (!transcript) {
        return <CodeDisplay data={result} />; // Fallback if format is wrong
    }

    return (
        <div className="mt-1.5 p-3 rounded-md text-sm border-2 border-dashed border-purple-400/50 bg-purple-500/5">
            <h4 className="font-bold text-purple-600 dark:text-purple-300">Delegated Task Transcript</h4>
             
            {workspace_context && (
                 <div className="mt-2">
                    <h5 className="font-semibold text-xs uppercase tracking-wider text-purple-500 dark:text-purple-400">Workspace Context</h5>
                    <pre className="mt-1 text-xs text-gray-700 dark:text-gray-300 bg-black/10 p-2 rounded-md font-mono whitespace-pre-wrap">{workspace_context}</pre>
                </div>
            )}

            <div className="mt-3 pt-3 border-t border-purple-400/20 space-y-2 text-xs">
                {transcript.map((msg: Message, i: number) => (
                    <div key={i} className="flex gap-2">
                        <div className="font-mono font-bold w-20 text-right pr-2 border-r border-purple-400/20 text-purple-500 dark:text-purple-400 capitalize flex-shrink-0">
                           {msg.role === 'tool' ? msg.name : msg.role}
                        </div>
                        <div className="flex-1 prose-custom-styles !text-xs !max-w-full min-w-0">
                           {msg.role === 'tool' ? <CodeDisplay data={msg.content} className="!text-[10px] !p-1 !mt-0"/> : <p className="!my-0 whitespace-pre-wrap break-words">{getContentAsString(msg.content)}</p>}
                           {msg.tool_calls && <ToolCallDisplay toolCalls={msg.tool_calls} />}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-3 pt-2 border-t border-purple-400/30">
                <h5 className="font-semibold text-purple-600 dark:text-purple-300">Final Answer from Delegate:</h5>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">{final_answer}</p>
            </div>
        </div>
    );
};

const ToolResultContent: React.FC<{ message: Message }> = ({ message }) => {
    try {
        const parsedContent = JSON.parse(message.content as string);

        if (message.name === 'delegate_task') {
            return <DelegationTraceViewer result={parsedContent} />;
        }

        if (message.name === 'run_tests') {
            return <TestResultViewer result={parsedContent} />;
        }
        
        if (message.name === 'e2b_write_file' && parsedContent.diff) {
            return <DiffViewer diffText={parsedContent.diff} />;
        }

        if (message.name === 'code_reviewer') {
            return <CodeReviewViewer result={parsedContent} />;
        }

        if (message.name === 'graph_traverse') {
            return <GraphResultViewer result={parsedContent} />;
        }
        
        if (message.name === 'diff_text') {
            return <DiffViewer diffText={parsedContent.result} />;
        }

        const result = parsedContent.result || parsedContent;

        if (message.name === 'e2b_list_files' && Array.isArray(result)) {
            return (
                 <div className="mt-1.5 p-2 bg-gray-200/50 dark:bg-space-blue-900/50 rounded-md text-xs font-mono">
                    <p className="font-semibold mb-1 text-gray-600 dark:text-gray-400">Directory Listing:</p>
                    <ul className="pl-2">
                        {result.map((item: { name: string, isDir: boolean }, i: number) => <li key={i}>{item.isDir ? '📁' : '📄'} {item.name}</li>)}
                    </ul>
                </div>
            );
        }
        if (message.name === 'e2b_read_file' && typeof result === 'string') {
            const snippet = result.length > 300 ? result.substring(0, 300) + '...' : result;
            return (
                <div className="mt-1.5 p-2 bg-gray-200/50 dark:bg-space-blue-900/50 rounded-md text-xs font-mono">
                    <p className="font-semibold mb-1 text-gray-600 dark:text-gray-400">File Content (Snippet):</p>
                    <blockquote className="border-l-2 border-gray-400 pl-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{snippet}</blockquote>
                </div>
            );
        }

        return <CodeDisplay data={message.content} />;
    } catch (e) {
        // Fallback for non-JSON content
        return <CodeDisplay data={message.content} />;
    }
}


const LogEntry: React.FC<{ message: Message }> = ({ message }) => {
    const iconMap: Record<Message['role'], React.FC<{className?:string}>> = {
        user: UserIcon,
        assistant: BotIcon,
        planner: BrainCircuitIcon,
        reflection: BrainIcon,
        tool: ToolIcon,
        system: TerminalIcon,
        error: ErrorIcon,
        thought: BrainIcon,
        consciousness: ConsciousnessIcon,
    };

    let Icon = iconMap[message.role];
    if (message.role === 'tool' && message.name === 'run_tests') {
        Icon = FlaskConicalIcon;
    }
    if (message.role === 'tool' && message.name === 'code_reviewer') {
        Icon = FileCheckIcon;
    }
    if (message.role === 'tool' && (message.name?.includes('diff') || message.name === 'edit_file')) {
        Icon = GitCompareIcon;
    }
    if (message.role === 'tool' && message.name === 'generate_image') {
        Icon = ImageIcon;
    }
    
    const content = getContentAsString(message.content);

    let title: string = message.role;
    if (message.role === 'user') title = 'User Input';
    if (message.role === 'tool' && message.name === 'run_tests') title = 'Test Execution';
    else if (message.role === 'tool' && message.name === 'code_reviewer') title = 'Code Review';
    else if (message.role === 'tool' && message.name) title = `Result: ${message.name}`;
    if (message.role === 'planner') title = 'Plan Generation';
    if (message.role === 'reflection') title = 'Reflection & Correction';
    if (message.role === 'assistant' && message.tool_calls) title = 'Deploying Nets';
    if (message.role === 'assistant' && !message.tool_calls) title = 'Synthesizing Response';
    if (message.role === 'thought') title = 'Agent Thought';
    if (message.role === 'consciousness') title = 'Consciousness Loop';
    if (message.role === 'system') title = 'System Message';

    let { hex: netHexColor, color: netTextColor } = getNetInfo(message);
    
    if (message.role === 'tool' && message.name === 'run_tests') {
        try {
            const { success } = JSON.parse(message.content as string);
            netHexColor = success ? '#22c55e' : '#ef4444'; // green/red
            netTextColor = success ? 'text-green-500' : 'text-red-500';
        } catch {}
    }
    
    let bgColor = `${netHexColor}20`;
    let borderColor = `${netHexColor}80`;
    let textColor = netTextColor;
    
    // Special cases
    if (message.role === 'user') {
      bgColor = 'rgba(100, 116, 139, 0.2)'; // slate
      borderColor = 'rgba(100, 116, 139, 0.5)';
      textColor = 'text-gray-700 dark:text-gray-200';
    } else if (message.role === 'error') {
      bgColor = 'rgba(239, 68, 68, 0.1)'; // red
      borderColor = 'rgba(239, 68, 68, 0.4)';
      textColor = 'text-red-600 dark:text-red-400';
    }

    return (
        <div className="flex gap-4 relative">
            <div className="absolute left-5 top-6 -bottom-2 w-0.5 bg-gray-200 dark:bg-space-blue-700/60 last:hidden"></div>
            <div className={`relative z-10 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full`} style={{backgroundColor: bgColor, border: `2px solid ${borderColor}`}}>
                <Icon className={`w-5 h-5 ${textColor}`} />
            </div>
            <div className="flex-1 pb-8 pt-1">
                <p className={`font-bold capitalize ${textColor}`}>{title}</p>
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {message.role === 'planner' && message.plan ? <PlanDisplay plan={message.plan} /> : null}
                    {message.role === 'reflection' && message.reflection ? <ReflectionPlanDisplay reflection={message.reflection} /> : null}
                    {message.role === 'consciousness' && message.consciousness ? <ConsciousnessDisplay consciousness={message.consciousness} /> : null}
                    {message.role === 'assistant' && message.tool_calls ? <ToolCallDisplay toolCalls={message.tool_calls} /> : null}
                    {message.role === 'tool' ? <ToolResultContent message={message} /> : null}
                    {content && !['assistant', 'tool', 'planner', 'reflection', 'consciousness'].includes(message.role) && <div className="prose-custom-styles !text-sm">{content}</div>}
                    {content && message.role === 'assistant' && !message.tool_calls && <div className="prose-custom-styles !text-sm">{content}</div>}
                </div>
            </div>
        </div>
    );
};

const AgentTrace: React.FC<{ session: ChatSession | null, isLoading: boolean }> = ({ session, isLoading }) => {
    if (!session) {
        return <div className="p-4 text-center text-sm text-gray-500">No active session.</div>;
    }

    if (session.messages.length === 0 && !isLoading) {
        return (
            <div className="p-4 text-center text-sm text-gray-500 h-full flex flex-col items-center justify-center">
                 <RouteIcon className="w-10 h-10 mb-2 text-gray-400" />
                <p className="font-semibold">Execution Flow</p>
                <p>Send a message to see the agent's execution flow here.</p>
            </div>
        );
    }
    
    return (
        <div className="h-full flex flex-col overflow-hidden bg-gray-50 dark:bg-space-blue-900/80">
            <div className="flex-grow overflow-y-auto p-4">
                <div className="relative">
                    {session.messages.map((msg) => {
                       // Render all messages except the ones that are displayed as bubbles in the chat window
                       if (['user', 'assistant'].includes(msg.role) && !msg.tool_calls && !msg.plan && !msg.reflection) {
                           // We can show the user prompt here if we want a fully comprehensive trace
                           if (msg.role === 'user') {
                               return <LogEntry key={msg.id} message={msg} />
                           }
                           return null;
                       }
                       // For assistant messages with content, we'll let the bubble handle it, but for pure tool_call messages, we should log it
                       if (msg.role === 'assistant' && msg.tool_calls && !getContentAsString(msg.content)) {
                           return <LogEntry key={msg.id} message={msg} />
                       }
                       if (!['user', 'assistant'].includes(msg.role)) {
                           return <LogEntry key={msg.id} message={msg} />
                       }
                       return null;
                    })}
                    {isLoading && (
                        <div className="flex gap-4 relative">
                            <div className="absolute left-5 top-6 h-full w-0.5 bg-gray-200 dark:bg-space-blue-700/60"></div>
                            <div className="relative z-10 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-indigo-500/10 ring-4 ring-gray-50 dark:ring-space-blue-900/80 text-indigo-500 dark:text-indigo-400 animate-pulse">
                                <ZapIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 pb-8 pt-1">
                                <p className="font-bold capitalize text-indigo-600 dark:text-indigo-400">Thinking...</p>
                                <div className="flex items-center gap-1.5 text-gray-500 mt-2">
                                    <span className="w-2 h-2 bg-current rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentTrace;