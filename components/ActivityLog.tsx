


import React from 'react';
import { ChatSession, Message, ContentPart } from '../types';
import { TerminalIcon, UserIcon, BotIcon, ToolIcon, BrainIcon, ErrorIcon } from '../constants';

const getSimpleContent = (content: string | ContentPart[], maxLength = 80): string => {
    let text = '';
    if (typeof content === 'string') {
        text = content;
    } else {
        text = content.map(p => {
            if (p.type === 'text') return p.content;
            return `[${p.type}]`;
        }).join(' ');
    }
    
    text = text.replace(/\n/g, ' ').replace(/\s+/g, ' ');

    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
};


const LogLine: React.FC<{ message: Message }> = ({ message }) => {
    let Icon;
    let typeText = '';
    let contentText = '';
    let textColor = 'text-gray-400';

    switch (message.role) {
        case 'user':
            Icon = UserIcon;
            typeText = 'USER';
            contentText = getSimpleContent(message.content);
            textColor = 'text-blue-400';
            break;
        case 'assistant':
            Icon = BotIcon;
            typeText = 'ASSISTANT';
            if (message.tool_calls && message.tool_calls.length > 0) {
                contentText = `Requesting ${message.tool_calls.length} tool call(s): ${message.tool_calls.map(t => t.name).join(', ')}`;
            } else {
                contentText = getSimpleContent(message.content);
            }
            textColor = 'text-fuchsia-400';
            break;
        case 'tool':
            Icon = ToolIcon;
            typeText = 'TOOL';
            contentText = `${message.name}: ${getSimpleContent(message.content, 100)}`;
            textColor = 'text-cyan-400';
            break;
        case 'planner':
        case 'reflection':
        case 'thought':
            Icon = BrainIcon;
            typeText = message.role.toUpperCase();
            if (message.plan) {
                contentText = `Generated plan with ${message.plan.steps.length} steps.`;
            } else if (message.reflection) {
                contentText = `Reflected on error, created new plan.`;
            } else {
                contentText = getSimpleContent(message.content);
            }
            textColor = 'text-indigo-400';
            break;
        case 'error':
            Icon = ErrorIcon;
            typeText = 'ERROR';
            contentText = getSimpleContent(message.content);
            textColor = 'text-red-400';
            break;
        case 'system':
             Icon = TerminalIcon;
             typeText = 'SYSTEM';
             contentText = getSimpleContent(message.content);
             textColor = 'text-gray-400';
             break;
        default:
            return null;
    }

    return (
        <div className="flex items-start gap-3 font-mono text-xs py-1">
            <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${textColor}`} />
            <div className="flex-grow">
                <span className={`font-bold mr-2 ${textColor}`}>{typeText}</span>
                <span className="text-gray-300">{contentText}</span>
            </div>
            <span className="text-gray-500">{new Date(Number(message.id.split('-')[0])).toLocaleTimeString()}</span>
        </div>
    );
};


const ActivityLog: React.FC<{ session: ChatSession | null }> = ({ session }) => {
    const logContainerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [session?.messages]);

    if (!session || session.messages.length === 0) {
        return (
            <div className="p-4 text-center text-sm text-gray-500 h-full flex flex-col items-center justify-center">
                <TerminalIcon className="w-10 h-10 mb-2 text-gray-400" />
                <p className="font-semibold">Activity Log</p>
                <p>A raw log of all session events will appear here.</p>
            </div>
        );
    }
    
    const messages = session.messages;

    return (
        <div className="h-full flex flex-col bg-gray-900/50">
            <div ref={logContainerRef} className="flex-grow overflow-y-auto p-3">
                <div className="space-y-1">
                    {messages.map((msg) => (
                        <LogLine key={msg.id} message={msg} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActivityLog;