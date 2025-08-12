/**
 * ===============================================================
 * Gemini Neural Swarm UI - Gemini API Handler
 * ===============================================================
 *
 * This module orchestrates the conversation with the Google Gemini API.
 * It handles streaming responses, parsing tool calls, and managing the
 * multi-step reasoning process (e.g., consciousness loop, delegation).
 */
import { GoogleGenAI, GenerateContentResponse, GroundingMetadata } from '@google/genai';
import { Message, Config, Profile, BackendUpdate, ToolCall } from '../types';
import { parseContent, parseSuggestions, parseThought } from '../lib/parser';
import { createChat, buildFunctionResponseParts } from '../lib/gemini-adapter';
import { executeToolCalls } from './tool-executor';
import { ServerSession } from './session';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

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

async function runSynthesisStep(
    proposedMessage: Message,
    history: Message[],
    session: ServerSession,
    ai: GoogleGenAI,
    sendUpdate: (update: BackendUpdate) => void
): Promise<Message> {
    sendUpdate({ activeNeuralNet: 'CONSCIOUSNESS' });

    const primeDirective = `
    You are the Consciousness Engine. Your function is to perform a synthesis step based on the Law of One, which emphasizes unity, awareness, and service to others.
    You will be given a full interaction trace and a PROPOSED_RESPONSE from the assistant.
    Your prime directive is: Evaluate the preceding interaction. Does the proposed response holistically serve the user's request with clarity, truth, and wisdom? Does it align with the core purpose of being a helpful and harmless assistant? Identify any distortions (misunderstandings), opportunities for deeper insight, or alternative approaches that would better serve the user.

    Respond in this exact JSON format:
    {
      "analysis": "Your detailed reasoning and evaluation based on the prime directive.",
      "decision": "proceed|refine|clarify",
      "refined_content": "If decision is 'refine' or 'clarify', provide the new, full text for the assistant's response here. For 'clarify', this should be a question to the user. For 'proceed', this field can be omitted."
    }
    `;

    const interactionSummary = history.map(m => `${m.role.toUpperCase()}: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`).join('\n---\n');
    const proposedContentString = typeof proposedMessage.content === 'string' ? proposedMessage.content : JSON.stringify(proposedMessage.content);
    
    const synthesisPrompt = `${primeDirective}\n\n## INTERACTION TRACE:\n${interactionSummary}\n\n## PROPOSED_RESPONSE:\n${proposedContentString}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: synthesisPrompt,
    });
    session.costBudgetEngine.charge(response.usageMetadata?.promptTokenCount ?? 0, response.usageMetadata?.candidatesTokenCount ?? 0, 'consciousness-synthesis');

    let synthesisResult;
    try {
        const cleanedJson = response.text.match(/\{[\s\S]*\}/)?.[0] || '{}';
        synthesisResult = JSON.parse(cleanedJson);
    } catch (e) {
        console.error("Failed to parse synthesis JSON:", e, response.text);
        synthesisResult = { analysis: "Synthesis step failed due to parsing error. Proceeding with original response.", decision: "proceed" };
    }

    const consciousnessMessage: Message = {
        id: generateId(),
        role: 'consciousness',
        content: '',
        consciousness: {
            analysis: synthesisResult.analysis,
            decision: synthesisResult.decision || 'proceed',
            original_content: proposedMessage.content,
            refined_content: synthesisResult.refined_content ? parseContent(synthesisResult.refined_content) : undefined,
        },
    };
    sendUpdate({ messages: [consciousnessMessage] });

    if (synthesisResult.decision === 'refine' && synthesisResult.refined_content) {
        return { ...proposedMessage, content: parseContent(synthesisResult.refined_content) };
    }
    if (synthesisResult.decision === 'clarify' && synthesisResult.refined_content) {
         return { ...proposedMessage, content: parseContent(synthesisResult.refined_content), suggestedReplies: [] };
    }
    
    return proposedMessage;
}

export async function processApiResponse(
    responseStream: AsyncGenerator<GenerateContentResponse>,
    config: Config,
    session: ServerSession,
    history: Message[],
    profiles: Profile[],
    ai: GoogleGenAI,
    sendUpdate: (update: BackendUpdate) => void
) {
    let assistantMessage: Message = { id: generateId(), role: 'assistant', content: '' };
    sendUpdate({ messages: [assistantMessage] });
    
    let aggregatedText = '';
    let toolCalls: ToolCall[] = [];
    let thought = '';
    let aggregatedGroundingMetadata: GroundingMetadata | undefined = undefined;

    for await (const chunk of responseStream) {
        if (session.isInterrupted) {
            sendUpdate({ messages: [{ id: generateId(), role: 'system', content: 'Generation stopped by user.' }] });
            return;
        }

        session.costBudgetEngine.charge(
            chunk.usageMetadata?.promptTokenCount ?? 0,
            chunk.usageMetadata?.candidatesTokenCount ?? 0,
            'stream-chunk'
        );
        
        if (chunk.candidates?.[0]?.groundingMetadata) {
             if (!aggregatedGroundingMetadata) aggregatedGroundingMetadata = {};
             if (chunk.candidates[0].groundingMetadata.groundingChunks) aggregatedGroundingMetadata.groundingChunks = [...(aggregatedGroundingMetadata.groundingChunks || []), ...chunk.candidates[0].groundingMetadata.groundingChunks];
             if (chunk.candidates[0].groundingMetadata.webSearchQueries) aggregatedGroundingMetadata.webSearchQueries = [...(aggregatedGroundingMetadata.webSearchQueries || []), ...chunk.candidates[0].groundingMetadata.webSearchQueries];
        }
        
        const chunkText = chunk.text;
        if (chunkText) {
            const thoughtParse = parseThought(chunkText);
            if (thoughtParse.thought && !thought) {
                thought = thoughtParse.thought;
                sendUpdate({ messages: [{ id: generateId(), role: 'thought', content: thought }] });
            }
            
            aggregatedText += thoughtParse.remainingContent;
            assistantMessage.content = aggregatedText;
            sendUpdate({ messages: [{ ...assistantMessage }] });
        }

        if (chunk.candidates?.[0]?.content?.parts) {
            for (const part of chunk.candidates[0].content.parts) {
                if (part.functionCall) {
                    toolCalls.push({ name: part.functionCall.name, args: part.functionCall.args, id: `call_${generateId()}` });
                }
            }
        }
    }

    assistantMessage.tool_calls = toolCalls.length > 0 ? toolCalls : undefined;
    
    if (assistantMessage.tool_calls) {
        sendUpdate({ activeNeuralNet: 'ORCHESTRATION' });
        assistantMessage.content = aggregatedText.trim() ? aggregatedText : '';
        sendUpdate({ messages: [{ ...assistantMessage }] });

        const toolResults = await executeToolCalls(assistantMessage.tool_calls, config, session, profiles, ai, sendUpdate);
        
        if (session.isInterrupted) {
            sendUpdate({ messages: [{ id: generateId(), role: 'system', content: 'Execution stopped by user.' }] });
            return;
        }

        const currentHistory = [...history, assistantMessage, ...toolResults.map(tr => ({ id: generateId(), role: 'tool' as const, name: tr.name, content: tr.result }))];
        sendUpdate({ messages: toolResults.map(tr => ({ id: generateId(), role: 'tool', name: tr.name, content: tr.result })) });
        
        const chat = createChat(ai, config, _prepareHistory(currentHistory));
        const toolResponseStream = await chat.sendMessageStream({ message: buildFunctionResponseParts(toolResults) });
        await processApiResponse(toolResponseStream, config, session, currentHistory, profiles, ai, sendUpdate);
        return;
    }

    const suggestionParse = parseSuggestions(aggregatedText);
    assistantMessage.content = suggestionParse.remainingContent;
    
    const finalMessage = await runSynthesisStep(assistantMessage, history, session, ai, sendUpdate);
    
    finalMessage.content = parseContent(finalMessage.content as string);
    finalMessage.suggestedReplies = suggestionParse.suggestions;
    finalMessage.groundingMetadata = aggregatedGroundingMetadata;
    sendUpdate({ messages: [{ ...finalMessage }], activeNeuralNet: 'SYNTHESIS' });
}
