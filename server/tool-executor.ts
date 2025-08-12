/**
 * ===============================================================
 * Gemini Neural Swarm UI - Tool Executor Service
 * ===============================================================
 *
 * This service is responsible for executing all tool calls requested
 * by the Gemini model. It interfaces with E2B sandboxes for secure
 * code execution and manages other tools like memory and UI rendering.
 */
import { GoogleGenAI, Part } from '@google/genai';
import { Sandbox } from '@e2b/sdk';
import path from 'path';
import { Message, Config, Profile, BackendUpdate, ToolCall, CodeEdit, DrawingInstruction, NetworkLogEntry } from '../types';
import { TOOL_NET_MAP } from '../constants';
import { ServerSession } from './session';
import { E2B_API_KEY as E2B_API_KEY_FROM_FILE } from './env';
import { createDiff } from './utils';
import { processApiResponse } from './gemini-handler';
import { createChat, buildFunctionResponseParts } from '../lib/gemini-adapter';

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


async function getSandbox(session: ServerSession, sendUpdate: (update: BackendUpdate) => void): Promise<Sandbox> {
    if (session.sandbox && (session.sandbox as any).isOpen) {
        return session.sandbox;
    }
    
    sendUpdate({ sandboxStatus: 'connecting' });

    const e2bApiKey = process.env.E2B_API_KEY || E2B_API_KEY_FROM_FILE;

    if (!e2bApiKey || e2bApiKey.includes("YOUR_E2B_API_KEY_HERE")) {
        sendUpdate({ sandboxStatus: 'error' });
        throw new Error("E2B_API_KEY is not set. Please add it to your environment variables (recommended) or update the `env.ts` file for local development.");
    }
    
    try {
        const sandbox = await Sandbox.create('base', {
            apiKey: e2bApiKey,
        });
        
        session.sandbox = sandbox;
        sendUpdate({ sandboxStatus: 'connected' });
        return sandbox;
    } catch (e) {
        sendUpdate({ sandboxStatus: 'error' });
        throw e;
    }
}

export async function* executeSingleTool(name: string, args: any, config: Config, session: ServerSession, profiles: Profile[], ai: GoogleGenAI, sendUpdate: (update: BackendUpdate) => void): AsyncGenerator<BackendUpdate, any, void> {
     try {
        const llmCall = async (prompt: string, model: string = 'gemini-2.5-flash') => {
            const response = await ai.models.generateContent({ model, contents: prompt });
            session.costBudgetEngine.charge(response.usageMetadata?.promptTokenCount || 0, response.usageMetadata?.candidatesTokenCount || 0, `tool:${name}`);
            return response.text;
        };
        
        const sandboxExec = async (cmd: string, timeout: number, sandbox: Sandbox) => {
             const proc = await sandbox.process.start(cmd, { timeout: timeout * 1000 });
             await proc.wait();
             return { stdout: proc.stdout, stderr: proc.stderr, exitCode: proc.exitCode };
        };

        switch(name) {
            case 'search_web': return { results: [{ title: `Mock Result for "${args.query}"`, link: "https://example.com", snippet: "This is a mocked search result snippet."}] };
            case 'wikipedia_search': return { results: [`Article about ${args.query}`, `Another article related to ${args.query}`] };
            case 'wikipedia_summary': return { summary: `This is a mock summary for the Wikipedia article titled "${args.title}".` };

            case 'run_python': return await sandboxExec(`python -c "${args.code.replace(/"/g, '\\"')}"`, args.timeout_sec, await getSandbox(session, sendUpdate));
            case 'run_bash': return await sandboxExec(args.cmd, args.timeout_sec, await getSandbox(session, sendUpdate));
            
            case 'e2b_python': {
                const sandbox = await getSandbox(session, sendUpdate);
                 if (args.packages && Array.isArray(args.packages) && args.packages.length > 0) {
                    const installCmd = `pip install ${args.packages.join(' ')}`;
                    const installProc = await sandbox.process.start(installCmd, { timeout: 300 * 1000 });
                    await installProc.wait();
                    if (installProc.exitCode !== 0) {
                        return { error: `Failed to install packages: ${installProc.stderr}` };
                    }
                }
                return await sandboxExec(`python -c "${args.code.replace(/"/g, '\\"')}"`, args.timeout_sec || 60, sandbox);
            }
            case 'e2b_bash': return await sandboxExec(args.cmd, args.timeout_sec, await getSandbox(session, sendUpdate));
            
            case 'e2b_browser_fetch': {
                const sandbox = await getSandbox(session, sendUpdate);
                const cmd = `node -e "require('playwright').chromium.launch().then(async browser => { const page = await browser.newPage(); await page.goto('${args.url}'); const title = await page.title(); const text = await page.innerText('body'); console.log(JSON.stringify({title, text})); await browser.close(); })"`;
                const proc = await sandbox.process.start(cmd, { timeout: args.timeout_sec * 1000 });
                await proc.wait();
                return JSON.parse(proc.stdout);
            }
            case 'e2b_list_files': return await (await getSandbox(session, sendUpdate)).fs.list(args.path);
            case 'e2b_create_directory': await (await getSandbox(session, sendUpdate)).fs.makeDir(args.path, { recursive: true }); return { success: true, path: args.path };
            case 'e2b_move_file': await (await getSandbox(session, sendUpdate)).fs.move(args.source_path, args.destination_path); return { success: true };
            case 'e2b_delete': await (await getSandbox(session, sendUpdate)).fs.remove(args.path); return { success: true };
            case 'run_tests': {
                const result = await sandboxExec(args.command, 300, await getSandbox(session, sendUpdate));
                const success = result.exitCode === 0;
                return { success, summary: success ? 'All tests passed' : 'Tests failed', details: result.stdout + '\n' + result.stderr };
            }
            
            case 'e2b_write_file': {
                await (await getSandbox(session, sendUpdate)).fs.write(args.path, args.content);
                session.fs.writeFile(args.path, args.content);
                yield { fileSystemTree: session.fs.getTree() };
                return { success: true, path: args.path };
            }
            case 'e2b_read_file': {
                const content = await (await getSandbox(session, sendUpdate)).fs.read(args.path);
                session.fs.writeFile(args.path, content);
                yield { fileSystemTree: session.fs.getTree() };
                return { content };
            }
            case 'edit_file': {
                const oldContent = await (await getSandbox(session, sendUpdate)).fs.read(args.path);
                const editPrompt = `Based on the following instruction, rewrite the provided code file. Output ONLY the full, new content of the file. Do not add any explanation or preamble.\nInstruction: "${args.instructions}"\n---\nFile Path: ${args.path}\n---\nOriginal Content:\n${oldContent}`;
                const newContent = await llmCall(editPrompt, 'gemini-2.5-flash');
                const codeEdit: CodeEdit = { path: args.path, oldContent, newContent, instructions: args.instructions, diff: createDiff(oldContent, newContent), toolCall: { name, args } };
                yield { pendingCodeEdit: codeEdit };
                return { pending: true, message: "Waiting for user approval for code changes." };
            }
            
            case 'render_markdown': yield { previewState: { isOpen: true, type: 'markdown', title: args.title, code: args.markdown_content }}; return { success: true };
            case 'render_p5js_sketch': yield { previewState: { isOpen: true, type: 'p5js', title: args.title, code: args.code }}; return { success: true };
            case 'draw_on_canvas': yield { previewState: { isOpen: true, type: 'drawing', title: args.title, instructions: args.instructions as DrawingInstruction[] }}; return { success: true };
            case 'generate_chart': yield { previewState: { isOpen: true, type: 'chartjs', title: args.title, chartConfig: { type: args.chart_type, data: args.data } }}; return { success: true };
            case 'create_interactive_poll': yield { messages: [{ id: generateId(), role: 'assistant', content: [{ type: 'interactive_poll', question: args.question, options: args.options, content: '' }] }] }; return { success: true };
            case 'generate_3d_text_scene': yield { messages: [{ id: generateId(), role: 'assistant', content: [{ type: 'three_d_scene', ...args }] }] }; return { success: true };
            case 'generate_image': {
                const imageResponse = await ai.models.generateImages({
                    model: 'imagen-3.0-generate-002',
                    prompt: args.prompt,
                    config: { numberOfImages: args.numberOfImages || 1, aspectRatio: args.aspectRatio || '1:1' },
                });
                const base64Image = imageResponse.generatedImages[0].image.imageBytes;
                const imageMessage: Message = {
                    id: generateId(), role: 'assistant', content: `Here is the image for the prompt: "${args.prompt}"`,
                    attachments: [{ mimeType: 'image/png', data: base64Image }]
                };
                yield { messages: [imageMessage] };
                return { success: true, image_generated: true };
            }

            case 'commit_memory': session.memoryEngine.commit(args.text); yield { memory: session.memoryEngine.getAll() }; return { success: true };
            case 'recall_memory': return { memories: session.memoryEngine.query(args.query, args.max_results) };
            
            case 'delegate_task': {
                const delegateProfile = profiles.find(p => p.name === args.agent_name);
                if (!delegateProfile) return { error: `Agent profile not found: ${args.agent_name}` };
            
                const transcript: Message[] = [];
                const subAgentHistory: Message[] = [{ id: generateId(), role: 'user', content: args.task_description }];
                transcript.push(subAgentHistory[0]);

                const subAgentSendUpdate = (update: BackendUpdate) => { if (update.messages) transcript.push(...update.messages); };
                
                const preparedHistory = _prepareHistory(subAgentHistory);
                const chat = createChat(ai, delegateProfile.config, []);
                const responseStream = await chat.sendMessageStream({ message: preparedHistory[0].parts });
                
                const final_answer = await runSubAgentLoop(responseStream, delegateProfile.config, session, subAgentHistory, profiles, ai, subAgentSendUpdate);
                return { success: true, final_answer, transcript };
            }

            case 'code_linter': return await llmCall(`You are a code linter. Analyze this code for errors and style issues. Respond in JSON format: {"lint_results": [{"line": <line_number>, "message": "<lint_message>"}]}.\n\n${args.code}`);
            case 'refactor_code': return await llmCall(`Refactor the following code based on the instruction: "${args.instruction}". Output only the raw, refactored code.\n\n${args.code}`);
            case 'code_reviewer': return await llmCall(`Review the following code. Provide feedback as a JSON array of suggestions: [{"severity": "Critical|Warning|Info", "message": "..."}].\n\n${args.code}`);
            case 'generate_unit_tests': return { result: await llmCall(`Generate unit tests for the following code. Output only the raw test code.\n\nFile: ${args.file_path}\nCode:\n${await session.fs.readFile(args.file_path)}`) };
            case 'code_debugger': return await llmCall(`Simulate debugging this code. Explain the error and suggest a fix. Code:\n${args.code}`);
            
            case 'sort_data': return { result: args.data.sort((a:any, b:any) => (a[args.sort_key] > b[args.sort_key] ? 1 : -1) * (args.order === 'desc' ? -1 : 1)) };
            case 'diff_text': return { result: createDiff(args.text1, args.text2) };
            case 'graph_traverse': {
                const { graph, start_node, method } = args;
                const visited = new Set();
                const path: string[] = [];
                const queue: string[] = [start_node];
                visited.add(start_node);

                while (queue.length > 0) {
                    const node = method === 'dfs' ? queue.pop()! : queue.shift()!;
                    path.push(node);
                    (graph[node] || []).forEach((neighbor: string) => { if (!visited.has(neighbor)) { visited.add(neighbor); queue.push(neighbor); } });
                }
                return { result: path, method };
            }
            
            case 'create_project_scaffold': {
                 const sandbox = await getSandbox(session, sendUpdate);
                 const { project_name, project_type } = args;
                 const templates: Record<string, Record<string, string>> = {
                     'react-vite-ts': {
                         'index.html': '<!DOCTYPE html><html><head><title>React App</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
                         'src/main.tsx': 'import React from "react";\nimport ReactDOM from "react-dom/client";\n\nReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><h1>Hello, React!</h1></React.StrictMode>);',
                         'package.json': '{"name":"react-app","private":true,"version":"0.0.0","type":"module","scripts":{"dev":"vite"},"dependencies":{"react":"^18.2.0","react-dom":"^18.2.0"},"devDependencies":{"@types/react":"^18.2.15","@vitejs/plugin-react":"^4.0.3","vite":"^4.4.5"}}'
                     }
                 };
                 await sandbox.fs.makeDir(project_name, { recursive: true });
                 for (const [filePath, content] of Object.entries(templates[project_type] || {})) {
                     const fullPath = path.join(project_name, filePath);
                     await sandbox.fs.makeDir(path.dirname(fullPath), { recursive: true });
                     await sandbox.fs.write(fullPath, content);
                 }
                 await session.fs.populateFromSandbox(sandbox);
                 yield { fileSystemTree: session.fs.getTree() };
                 return { success: true, project_name };
            }

            case 'execute_sql': {
                if (!session.db) return { error: "Database is not initialized for this session." };
                const results = session.db?.exec(args.query);
                const formatted = results?.map(res => ({ columns: res.columns, values: res.values }));
                return { result: formatted };
            }
            case 'schema_designer': return { result: await llmCall(`Generate a SQL CREATE TABLE statement for: ${args.description}. Output only the SQL.`) };
            case 'visualize_db_schema': return { result: await llmCall(`Convert this SQL to a Mermaid.js graph description. Output only the Mermaid code.\n\n${args.schema_sql}`) };

            case 'sentiment_analyzer': return await llmCall(`Analyze the sentiment of this text. Respond in JSON: {"sentiment": "positive|negative|neutral", "score": <float>}.\n\n${args.text}`);
            case 'text_to_structured_data': return { result: await llmCall(`Extract data from this text based on the JSON schema. Output valid JSON.\n\nSchema:\n${JSON.stringify(args.json_schema)}\n\nText:\n${args.text_content}`) };
            case 'csv_to_json': {
                const lines = args.csv_data.split('\n');
                const header = lines[0].split(',');
                const json = lines.slice(1).map(line => {
                    const values = line.split(',');
                    return header.reduce((obj: any, key, i) => { obj[key] = values[i]; return obj; }, {});
                });
                return { result: json };
            }
            case 'data_analyzer': {
                const data = args.json_data as any[];
                const numericKeys = Object.keys(data[0]).filter(k => typeof data[0][k] === 'number');
                const stats = numericKeys.reduce((acc: any, key) => {
                    const values = data.map(d => d[key]);
                    const sum = values.reduce((s, v) => s + v, 0);
                    acc[key] = { count: values.length, sum: sum, mean: sum / values.length, min: Math.min(...values), max: Math.max(...values) };
                    return acc;
                }, {});
                return { result: stats };
            }
            
            default:
                return { error: `Tool '${name}' is not implemented in the backend.` };
        }

    } catch (e: any) {
        console.error(`Error executing tool ${name}:`, e);
        return { error: e.message };
    }
}


export async function executeToolCalls(
    toolCalls: ToolCall[], config: Config, session: ServerSession, profiles: Profile[],
    ai: GoogleGenAI, sendUpdate: (update: BackendUpdate) => void
): Promise<{ name: string; result: string }[]> {
    let finalResults: { name: string; result: any }[] = [];
    
    for (const call of toolCalls) {
        if (session.isInterrupted) break;

        sendUpdate({ activeNeuralNet: TOOL_NET_MAP[call.name] || 'EXECUTION' });
        const decision = session.gatingEngine.check(call.name, call.args);
        sendUpdate({ gatingLog: [decision] });
        
        if (decision.allowed) {
            const t0 = Date.now();
            
            let toolResult: any;
            const toolUpdateGenerator = executeSingleTool(call.name, decision.patched_args, config, session, profiles, ai, sendUpdate);
            
            while (true) {
                const iterResult = await toolUpdateGenerator.next();
                if (iterResult.done) {
                    toolResult = iterResult.value;
                    break;
                }
                sendUpdate(iterResult.value);
            }

            const ok = !toolResult.error;
            const status: 'success' | 'error' = ok ? 'success' : 'error';
            const durationMs = Date.now() - t0;
            const networkLogEntry: NetworkLogEntry = { id: generateId(), toolName: call.name, request: call.args, status: status, durationMs, response: JSON.stringify(toolResult), timestamp: new Date().toISOString() };
            session.networkLog.push(networkLogEntry);
            sendUpdate({ networkLog: [networkLogEntry] });

            finalResults.push({ name: call.name, result: toolResult });

        } else if (decision.requires_consent && decision.consent_key && decision.consent_prompt) {
             const consentRequest = { key: decision.consent_key, prompt: decision.consent_prompt, toolName: call.name, args: call.args };
             const pendingPlan = { steps: toolCalls.map(tc => ({ tool_name: tc.name, args: tc.args, thought: '' })) };
             sendUpdate({ pendingConsent: consentRequest, pendingPlanForConsent: pendingPlan });
             return [];
        } else {
             finalResults.push({ name: call.name, result: { error: `Tool call denied by Gating Engine: ${decision.reason}` } });
        }
    }
    
    return finalResults.map(r => ({ name: r.name, result: JSON.stringify(r.result ?? null) }));
}

async function runSubAgentLoop(
    initialStream: AsyncGenerator<any>, config: Config, session: ServerSession,
    initialHistory: Message[], profiles: Profile[], ai: GoogleGenAI, logUpdate: (update: BackendUpdate) => void
): Promise<string> {
    let currentHistory = [...initialHistory];
    let responseStream = initialStream;

    while (true) {
        let aggregatedText = '';
        let toolCalls: ToolCall[] = [];

        for await (const chunk of responseStream) {
            aggregatedText += chunk.text;
            if (chunk.candidates?.[0]?.content?.parts) {
                for (const part of chunk.candidates[0].content.parts) {
                    if (part.functionCall) toolCalls.push({ name: part.functionCall.name, args: part.functionCall.args, id: generateId() });
                }
            }
        }

        const assistantMessage: Message = { id: generateId(), role: 'assistant', content: aggregatedText, tool_calls: toolCalls.length > 0 ? toolCalls : undefined };
        currentHistory.push(assistantMessage);
        logUpdate({ messages: [assistantMessage] });

        if (!assistantMessage.tool_calls) return aggregatedText;

        const toolResults = await executeToolCalls(assistantMessage.tool_calls, config, session, profiles, ai, logUpdate);
        const toolResultMessages = toolResults.map(tr => ({ id: generateId(), role: 'tool' as const, name: tr.name, content: tr.result }));
        currentHistory.push(...toolResultMessages);
        logUpdate({ messages: toolResultMessages });

        const chat = createChat(ai, config, _prepareHistory(currentHistory));
        responseStream = await chat.sendMessageStream({ message: buildFunctionResponseParts(toolResults) });
    }
}

export async function approveAndApplyCodeEdit(payload: any, session: ServerSession, ai: GoogleGenAI, sendUpdate: (update: BackendUpdate) => void) {
    const { approved, codeEdit, messages, config, profiles } = payload;
    sendUpdate({ pendingCodeEdit: null });
    if (!codeEdit) return;

    if (!approved) {
        sendUpdate({ messages: [{ id: generateId(), role: 'system', content: `Code edit to ${codeEdit.path} was declined by the user.` }]});
        return;
    }

    const sandbox = await getSandbox(session, sendUpdate);
    await sandbox.fs.write(codeEdit.path, codeEdit.newContent);
    session.fs.writeFile(codeEdit.path, codeEdit.newContent);
    
    sendUpdate({ 
        messages: [{ id: generateId(), role: 'system', content: `Applied approved changes to ${codeEdit.path}.` }],
        fileSystemTree: session.fs.getTree()
    });
    
    const toolResults: Part[] = [{ functionResponse: { name: codeEdit.toolCall.name, response: { success: true, path: codeEdit.path } } }];
    const currentMessages = [...messages, { id: generateId(), role: 'system', content: `User approved code edit for ${codeEdit.path}` }];
    const chat = createChat(ai, config, _prepareHistory(currentMessages));
    const responseStream = await chat.sendMessageStream({ message: toolResults });
    await processApiResponse(responseStream, config, session, currentMessages, profiles, ai, sendUpdate);
}

export async function syncFileSystem(session: ServerSession, sendUpdate: (update: BackendUpdate) => void) {
    const sandbox = await getSandbox(session, sendUpdate);
    await session.fs.populateFromSandbox(sandbox);
    sendUpdate({ fileSystemTree: session.fs.getTree() });
}