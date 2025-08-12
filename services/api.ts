
import { Message, Config, Profile, BackendUpdate, FileSystemNode, MemoryEntry, CodeEdit, ChatSession } from '../types';

const API_BASE_URL = 'http://localhost:3001/api'; // Assuming backend runs on this port

export class BackendService {
    private addErrorMessage: (content: string, sessionId?: string) => void;

    constructor(addErrorMessage: (content: string, sessionId?: string) => void) {
        this.addErrorMessage = addErrorMessage;
    }
    
    public interrupt(sessionId: string) {
        // In a real-world scenario, you might have an endpoint to signal interruption.
        // For now, interruption is handled on the client by stopping to read the stream.
        console.log(`Interrupt signal for session ${sessionId}`);
    }

    public async *processUserMessage(messages: Message[], config: Config, sessionId: string, profiles: Profile[]): AsyncGenerator<BackendUpdate> {
        try {
            const response = await fetch(`${API_BASE_URL}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages, config, sessionId, profiles }),
            });

            if (!response.ok || !response.body) {
                const errorText = await response.text();
                this.addErrorMessage(`Backend error: ${response.status} ${errorText}`, sessionId);
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                
                const events = buffer.split('---EVENT_END---');
                buffer = events.pop() || ''; // keep incomplete event data

                for (const event of events) {
                    if (event.trim()) {
                        try {
                            const update: BackendUpdate = JSON.parse(event);
                            yield update;
                        } catch (e) {
                            console.error("Failed to parse stream update:", event, e);
                            this.addErrorMessage(`Received malformed update from server.`, sessionId);
                        }
                    }
                }
            }
        } catch (e: any) {
            console.error("Fetch error:", e);
            this.addErrorMessage(`Failed to connect to backend service. Is it running? Error: ${e.message}`, sessionId);
        }
    }
    
    public async *approveAndApplyCodeEdit(session: ChatSession, approved: boolean, config: Config, profiles: Profile[]): AsyncGenerator<BackendUpdate> {
         if (!session.pendingCodeEdit) return;
         try {
             const response = await fetch(`${API_BASE_URL}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: session.id,
                    action: 'approveCodeEdit',
                    payload: {
                        approved,
                        codeEdit: session.pendingCodeEdit,
                        messages: session.messages,
                        config,
                        profiles,
                    },
                }),
             });
             if (!response.ok || !response.body) { /* ... error handling ... */ return; }
             
             // Stream updates from the response
             const reader = response.body.getReader();
             const decoder = new TextDecoder();
             let buffer = '';
             while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const events = buffer.split('---EVENT_END---');
                buffer = events.pop() || '';
                for (const event of events) {
                    if(event.trim()) yield JSON.parse(event);
                }
             }

         } catch (e: any) {
             this.addErrorMessage(`Failed to apply code edit via backend: ${e.message}`, session.id);
         }
    }


    // The following methods would also be implemented to call backend endpoints
    // For brevity, they are simple placeholders.

    public async *syncFileSystem(sessionId: string): AsyncGenerator<BackendUpdate> {
        // yield* this.postAction(sessionId, 'syncFileSystem', {});
        console.warn("syncFileSystem not fully implemented in client-side service");
        yield { fileSystemTree: [] };
    }

    public async *deleteFile(sessionId: string, path: string): AsyncGenerator<BackendUpdate> {
        // yield* this.postAction(sessionId, 'deleteFile', { path });
        console.warn("deleteFile not fully implemented in client-side service");
    }

    public addMemoryManually(sessionId: string, text: string) {
        console.warn("addMemoryManually not implemented in client-side service");
    }

    public queryMemory(sessionId: string, query: string): MemoryEntry[] | undefined {
        console.warn("queryMemory not implemented in client-side service");
        return undefined;
    }

    public clearMemory(sessionId: string) {
        console.warn("clearMemory not implemented in client-side service");
    }
}