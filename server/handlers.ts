/**
 * ===============================================================
 * Gemini Neural Swarm UI - API Request Handlers
 * ===============================================================
 *
 * This module contains the core logic for handling incoming API requests.
 */
import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { getOrCreateServerSession } from './session';
import { processApiResponse } from './gemini-handler';
import { approveAndApplyCodeEdit, syncFileSystem } from './tool-executor';
import { Message, Config, Profile, BackendUpdate } from '../types';
import { createChat } from '../lib/gemini-adapter';

function _prepareHistory(messages: Message[]) {
    return messages.map(msg => {
        const parts: any[] = [];
        if (msg.attachments) {
            msg.attachments.forEach(att => parts.push({ inlineData: { mimeType: att.mimeType, data: att.data } }));
        }
        if (typeof msg.content === 'string') {
            if (msg.content) parts.push({ text: msg.content });
        } else if (Array.isArray(msg.content)) {
            const textContent = msg.content.map(p => p.content).join('\n');
            if (textContent) parts.push({ text: textContent });
        }

        if (msg.tool_calls) {
            msg.tool_calls.forEach(tc => parts.push({ functionCall: { name: tc.name, args: tc.args } }));
        }
        if (msg.role === 'tool' && msg.name) {
            try {
                 parts.push({ functionResponse: { name: msg.name, response: JSON.parse(msg.content as string) } });
            } catch (e) {
                 parts.push({ functionResponse: { name: msg.name, response: { error: 'Could not parse tool output', data: msg.content } } });
            }
        }
        if (parts.length === 0 && (msg.role === 'user' || msg.role === 'assistant')) {
             parts.push({ text: '' });
        }

        if (parts.length > 0) {
             return {
                role: msg.role === 'assistant' ? 'model' : msg.role,
                parts,
            };
        }
        return null;

    }).filter(c => c && c.role !== 'error' && c.role !== 'system' && c.role !== 'planner' && c.role !== 'reflection' && c.role !== 'thought' && c.role !== 'consciousness');
}


export async function handleMessage(req: Request, res: Response) {
    const { messages, config, sessionId, profiles } = (req as any).body as {
        messages: Message[];
        config: Config;
        sessionId: string;
        profiles: Profile[];
    };

    if (!process.env.GEMINI_API_KEY) {
        return (res as any).status(500).json({ error: "GEMINI_API_KEY is not set on the server." });
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const serverSession = await getOrCreateServerSession(sessionId);
    serverSession.isInterrupted = false;

    const sendUpdate = (update: BackendUpdate) => {
        if ((res as any).writableEnded) return;
        (res as any).write(JSON.stringify(update) + '---EVENT_END---');
    };

    (res as any).setHeader('Content-Type', 'application/octet-stream');
    (res as any).setHeader('Cache-Control', 'no-cache');
    (res as any).setHeader('Connection', 'keep-alive');

    try {
        const history = _prepareHistory(messages);
        sendUpdate({ lastPrompt: history });
        
        const chat = createChat(ai, config, history.slice(0, -1));
        const lastPart = history[history.length - 1].parts;
        const responseStream = await chat.sendMessageStream({ message: lastPart });

        await processApiResponse(responseStream, config, serverSession, messages, profiles, ai, sendUpdate);
    } catch (e: any) {
        console.error("Error in handleMessage:", e);
        sendUpdate({ messages: [{id: generateId(), role: 'error', content: e.message }] });
    } finally {
        (res as any).end();
    }
}

export async function handleAction(req: Request, res: Response) {
    const { sessionId, action, payload } = (req as any).body;
    const session = await getOrCreateServerSession(sessionId);
    
    if (!session) return (res as any).status(404).json({ error: "Session not found" });

    if (!process.env.GEMINI_API_KEY) {
        return (res as any).status(500).json({ error: "GEMINI_API_KEY is not set on the server." });
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const sendUpdate = (update: BackendUpdate) => {
        if ((res as any).writableEnded) return;
        (res as any).write(JSON.stringify(update) + '---EVENT_END---');
    };
    
    (res as any).setHeader('Content-Type', 'application/octet-stream');

    try {
        switch (action) {
            case 'approveCodeEdit':
                await approveAndApplyCodeEdit(payload, session, ai, sendUpdate);
                break;
            case 'syncFileSystem':
                await syncFileSystem(session, sendUpdate);
                break;
            // Add other actions here
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    } catch (e: any) {
         console.error(`Error in /api/action/${action}:`, e);
         sendUpdate({ messages: [{id: generateId(), role: 'error', content: e.message }] });
    } finally {
        (res as any).end();
    }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}