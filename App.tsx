

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { marked } from 'marked';
import { Message, Config, ToolCall, PreviewState, Profile, BudgetTotals, CacheStats, ChatSession, ChargeRecord, RightPanelTab, Plan, ContentPart, PreviewType, BackendUpdate, FileSystemNode, NetworkLogEntry, NeuralNetName, GateDecision, MemoryEntry, Attachment, ApiContent, CodeEdit, SandboxStatus } from './types';
import { DEFAULT_PROFILES } from './constants';
import { generateId } from './lib/utils';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import ChatHeader from './components/ChatHeader';
import CommandPalette from './components/CommandPalette';
import ResizablePanels from './components/ResizablePanels';
import RightPanel from './components/RightPanel';
import ChatTabs from './components/ChatTabs';
import { NotifierProvider, useNotifier } from './hooks/useNotifier';
import { BackendService } from './services/api';
import { parseContent } from './lib/parser';
import ConsentModal from './components/ConsentModal';
import SettingsModal from './components/SettingsModal';

type Theme = 'light' | 'dark';

const SESSIONS_STORAGE_KEY = 'gemini-chat-sessions-v10-serverside';
const LAYOUT_STORAGE_KEY = 'gemini-chat-layout-v3-responsive';
const THEME_STORAGE_KEY = 'gemini-chat-theme';

const createNewSession = (title: string, profileId?: string): ChatSession => ({
    id: generateId(),
    title: title,
    messages: [],
    activeProfileId: profileId || DEFAULT_PROFILES[0].id,
    isLoading: false,
    routingProposals: [],
    editingMessage: null,
    history: [],
    gatingLog: [],
    memory: [],
    pendingConsent: null,
    pendingPlanForConsent: null,
    pendingPlanApproval: null,
    pendingCodeEdit: null,
    activeNeuralNet: 'NEUTRAL',
    lastPrompt: [],
    sandboxStatus: 'disconnected',
});

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);
  return matches;
};


const loadInitialState = () => {
    try {
        const savedSessionsJSON = localStorage.getItem(SESSIONS_STORAGE_KEY);
        if (savedSessionsJSON) {
            const data = JSON.parse(savedSessionsJSON);
            if (data.sessions && data.activeSessionId && data.profiles) {
                const hydratedSessions = data.sessions.map((s: any) => ({
                    ...createNewSession(''),
                    ...s,
                    history: s.history || [],
                    gatingLog: s.gatingLog || [],
                    memory: s.memory || [],
                    activeNeuralNet: s.activeNeuralNet || s.activeChakra || 'NEUTRAL',
                    lastPrompt: s.lastPrompt || [],
                    pendingPlanForConsent: s.pendingPlanForConsent || s.pendingPlan || null,
                    sandboxStatus: s.sandboxStatus || 'disconnected',
                }));
                return { ...data, sessions: hydratedSessions };
            }
        }
    } catch (e) {
        console.error("Failed to load session from localStorage", e);
    }
    const firstSession = createNewSession('Chat 1');
    return {
        sessions: [firstSession],
        activeSessionId: firstSession.id,
        profiles: DEFAULT_PROFILES,
    };
};


const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        resolve(result.substring(result.indexOf(',') + 1));
    };
    reader.onerror = error => reject(error);
});


const AppCore = () => {
    const initialState = useMemo(loadInitialState, []);
    const [sessions, setSessions] = useState<ChatSession[]>(initialState.sessions);
    const [activeSessionId, setActiveSessionId] = useState<string>(initialState.activeSessionId);
    const [profiles, setProfiles] = useState<Profile[]>(initialState.profiles);
    
    const backendServiceRef = useRef<BackendService | null>(null);
    const { notify } = useNotifier();

    const leftPanelIsDrawer = useMediaQuery('(max-width: 1023px)');
    const rightPanelIsDrawer = useMediaQuery('(max-width: 767px)');
    
    const [isLeftPanelOpen, setLeftPanelOpen] = useState(!leftPanelIsDrawer);
    const [isRightPanelOpen, setRightPanelOpen] = useState(!rightPanelIsDrawer);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('agent_trace');

    const activeSession = useMemo(() => {
        return sessions.find(s => s.id === activeSessionId) || sessions[0];
    }, [sessions, activeSessionId]);
    
    const setSessionState = useCallback((sessionId: string, updater: (session: ChatSession) => Partial<ChatSession>) => {
        setSessions(prev => {
            return prev.map(s => {
                if (s.id === sessionId) {
                    const updates = updater(s);
                    const oldStateForHistory = { ...s, history: [], gatingLog: [], memory: [], lastPrompt: [] };
                    const newState = { ...s, ...updates };
                    
                    const updatedFields = Object.keys(updates);
                    const isMinorUpdate = updatedFields.every(k => ['history', 'gatingLog', 'memory', 'isLoading', 'activeNeuralNet', 'lastPrompt', 'pendingPlanApproval', 'pendingCodeEdit', 'sandboxStatus'].includes(k));
                    
                    if(!isMinorUpdate) {
                       newState.history = [...(s.history || []), oldStateForHistory];
                    }

                    return newState;
                }
                return s;
            });
        });
    }, []);
    
    const addMessage = useCallback((sessionId: string, message: Message) => {
        setSessionState(sessionId, s => ({ messages: [...s.messages, message] }));
    }, [setSessionState]);

    const addErrorMessage = useCallback((content: string, sessionId?: string) => {
        const id = sessionId || activeSessionId;
        if (id) {
            addMessage(id, { id: generateId(), role: 'error', content });
            setSessionState(id, s => ({ isLoading: false, activeNeuralNet: 'NEUTRAL', sandboxStatus: 'error' }));
            notify(content, 'error');
        }
    }, [activeSessionId, addMessage, setSessionState, notify]);
    
    const processBackendUpdates = useCallback(async function* (sessionId: string, updateGenerator: AsyncGenerator<BackendUpdate>) {
        for await (const update of updateGenerator) {
            const { previewState, fileSystemTree, networkLog, gatingLog, memory, ...sessionUpdate } = update;

            if (Object.keys(sessionUpdate).length > 0) {
                 setSessionState(sessionId, (s) => {
                    const existingMessages = new Map(s.messages.map(m => [m.id, m]));
                    if (sessionUpdate.messages) {
                        sessionUpdate.messages.forEach(m => existingMessages.set(m.id, m));
                    }
                    
                    return { 
                        ...sessionUpdate,
                        messages: Array.from(existingMessages.values()),
                    };
                });
            }
    
            if(previewState) setPreviewState(previewState);
            if(fileSystemTree) setFileSystemTree(fileSystemTree);
            if(networkLog) setNetworkLog(prev => [...prev, ...networkLog]);
            if(gatingLog) setSessionState(sessionId, (s) => ({ gatingLog: [...(s.gatingLog || []), ...gatingLog] }));
            if(memory) setMemory(memory);

            yield;
        }
    }, [setSessionState]);

    useEffect(() => {
        backendServiceRef.current = new BackendService(addErrorMessage);
        // On initial load, try to fetch stats from backend.
        // updateBackendStats(); 
    }, [addErrorMessage]);

    useEffect(() => {
        if (!marked) return;
        const renderer = new marked.Renderer();
        renderer.link = ({ href, title, text }) => `<a href="${href || ''}" title="${title || ''}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        renderer.listitem = (item: any) => {
            const text = item.text;
            const taskListItemRegex = /^(<input.*type="checkbox"[^>]*>)/;
            const match = text.match(taskListItemRegex);
            if (match) return `<li class="task-list-item">${match[1]} <span>${text.substring(match[1].length)}</span></li>`;
            return `<li>${text}</li>`;
        };
        renderer.checkbox = (checked) => `<input type="checkbox" disabled ${checked ? 'checked' : ''}> `;
        marked.setOptions({
            gfm: true,
            breaks: true,
            highlight: (code, lang) => {
                const language = (window as any).hljs.getLanguage(lang) ? lang : 'plaintext';
                return (window as any).hljs.highlight(code, { language, ignoreIllegals: true }).value;
            },
            renderer,
        } as any);
    }, []);

    const activeProfile = useMemo(() => {
        const profile = profiles.find(p => p.id === activeSession?.activeProfileId);
        return profile || profiles.find(p => p.isDefault) || profiles[0];
    }, [profiles, activeSession]);

    const config = useMemo(() => activeProfile.config, [activeProfile]);

    const setConfig = useCallback((value: React.SetStateAction<Config>) => {
        setProfiles(currentProfiles =>
            currentProfiles.map(p => {
                if (p.id === activeProfile.id) {
                    const newConfig = typeof value === 'function' ? value(p.config) : value;
                    return { ...p, config: newConfig };
                }
                return p;
            })
        );
    }, [activeProfile.id]);

    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || 'dark');
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    
    const [previewState, setPreviewState] = useState<PreviewState>({ isOpen: false, type: 'p5js', title: '', code: '', instructions: [] });
    const [fileSystemTree, setFileSystemTree] = useState<FileSystemNode[]>([]);
    const [networkLog, setNetworkLog] = useState<NetworkLogEntry[]>([]);
    const [memory, setMemory] = useState<MemoryEntry[]>([]);
    
    const [budgetTotals, setBudgetTotals] = useState<BudgetTotals>({ prompt_tokens: 0, completion_tokens: 0, cost_usd: 0 });
    const [costHistory, setCostHistory] = useState<ChargeRecord[]>([]);
    
    const updateBackendStats = useCallback(() => {
        // This function will be needed if we add a stats endpoint to the backend
    }, []);
    
    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCommandPaletteOpen(open => !open);
            } else if (e.key === 'Escape' && activeSession?.editingMessage) {
                e.preventDefault();
                setSessionState(activeSession.id, () => ({ editingMessage: null }));
            } else if (e.key === 'Escape' && activeSession?.pendingConsent) {
                 e.preventDefault();
                 setSessionState(activeSession.id, () => ({ pendingConsent: null, isLoading: false }));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeSession, setSessionState]);

    useEffect(() => {
        try {
            const sessionData = JSON.stringify({ sessions, activeSessionId, profiles });
            localStorage.setItem(SESSIONS_STORAGE_KEY, sessionData);
        } catch (e) { console.error("Failed to save sessions to localStorage", e); }
    }, [sessions, activeSessionId, profiles]);


    const handleSendMessage = useCallback(async (userInput: string, imageFile?: File | null) => {
        if (activeSession?.isLoading || (!userInput.trim() && !imageFile) || !backendServiceRef.current) {
            return;
        }
        
        const sessionId = activeSessionId;
        let attachments: Attachment[] | undefined = undefined;
        if (imageFile) {
            try { attachments = [{ data: await fileToBase64(imageFile), mimeType: imageFile.type }]; }
            catch (error) { addErrorMessage('Failed to read image file.', sessionId); return; }
        }
        const userMessage: Message = { id: generateId(), role: 'user' as const, content: userInput, attachments };
        
        setSessionState(sessionId, (s) => ({ isLoading: true, messages: [...s.messages, userMessage], routingProposals: [] }));

        try {
            const updateGenerator = backendServiceRef.current.processUserMessage(
                [...activeSession.messages, userMessage], config, sessionId, profiles
            );
            for await (const _ of processBackendUpdates(sessionId, updateGenerator)) {}
        } catch (e: any) { addErrorMessage(`Error: ${e.message}`, sessionId);
        } finally {
            if (!activeSession?.pendingConsent && !activeSession?.pendingPlanApproval && !activeSession?.pendingCodeEdit) {
              setSessionState(sessionId, () => ({ isLoading: false }));
            }
            updateBackendStats();
        }
    }, [activeSession, config, profiles, processBackendUpdates, updateBackendStats, addErrorMessage, setSessionState]);
    
    const handleConsentResponse = useCallback(async (granted: boolean) => {
        if (!backendServiceRef.current || !activeSession?.pendingConsent) return;
        const sessionId = activeSessionId;
        const consentKey = activeSession.pendingConsent.key;
        setSessionState(sessionId, () => ({ pendingConsent: null, isLoading: true }));
        if (!granted) {
            setSessionState(sessionId, () => ({ isLoading: false, activeNeuralNet: 'NEUTRAL' }));
            notify('Tool execution cancelled by user.', 'info');
            return;
        }
        // This flow needs to be adapted for a client-server architecture
        addErrorMessage("Consent flow not fully implemented for server-side execution yet.", sessionId);
        setSessionState(sessionId, () => ({ isLoading: false }));

    }, [activeSession, addErrorMessage, setSessionState, notify]);
    
    const handlePlanApproval = useCallback(async (plan: Plan) => {
        if (!backendServiceRef.current || !activeSession) return;
        // This flow needs to be adapted for a client-server architecture
        addErrorMessage("Plan approval flow not fully implemented for server-side execution yet.", activeSession.id);

    }, [activeSession, addErrorMessage]);

    const handlePlanCancel = useCallback(() => {
        if (!activeSession) return;
        setSessionState(activeSessionId, () => ({ pendingPlanApproval: null }));
        addMessage(activeSessionId, { id: generateId(), role: 'system', content: 'Plan execution cancelled by user.' });
    }, [activeSessionId, setSessionState, addMessage, activeSession]);
    
    const handleCodeEditApproval = useCallback(async (approved: boolean) => {
        if (!backendServiceRef.current || !activeSession?.pendingCodeEdit) return;
        const sessionId = activeSessionId;
        try {
            const updateGenerator = backendServiceRef.current.approveAndApplyCodeEdit(activeSession, approved, config, profiles);
            for await (const _ of processBackendUpdates(sessionId, updateGenerator)) {}
        } catch (e: any) { addErrorMessage(`Error applying code edit: ${e.message}`, sessionId);
        } finally {
            if (!activeSession?.pendingConsent && !activeSession?.pendingPlanApproval && !activeSession?.pendingCodeEdit) {
                setSessionState(sessionId, () => ({ isLoading: false }));
            }
            updateBackendStats();
        }
    }, [activeSession, config, profiles, processBackendUpdates, addErrorMessage, setSessionState, updateBackendStats]);

    const handleSaveEdit = async (newContent: string) => {
        if (!activeSession?.editingMessage || !backendServiceRef.current) return;
        const editMsgIndex = activeSession.messages.findIndex(m => m.id === activeSession.editingMessage!.id);
        if (editMsgIndex === -1) return;
        
        const newMessages = activeSession.messages.slice(0, editMsgIndex);
        setSessionState(activeSessionId, () => ({ messages: newMessages, editingMessage: null, history: activeSession.history }));
        await handleSendMessage(newContent, null);
    };
    
    // --- Auto-Approval Logic ---
    useEffect(() => {
        if (activeSession?.pendingPlanApproval && config.autoApprove && !activeSession.isLoading) {
            notify("Auto-approving plan...", "info");
            handlePlanApproval(activeSession.pendingPlanApproval);
        }
    }, [activeSession?.pendingPlanApproval, config.autoApprove, activeSession?.isLoading, handlePlanApproval, notify]);

    useEffect(() => {
        if (activeSession?.pendingCodeEdit && config.autoApprove && !activeSession.isLoading) {
            notify("Auto-approving code edit...", "info");
            handleCodeEditApproval(true);
        }
    }, [activeSession?.pendingCodeEdit, config.autoApprove, activeSession?.isLoading, handleCodeEditApproval, notify]);

    useEffect(() => {
        if (activeSession?.pendingConsent && config.autoApprove && !activeSession.isLoading) {
            notify("Auto-granting tool consent...", "info");
            handleConsentResponse(true);
        }
    }, [activeSession?.pendingConsent, config.autoApprove, activeSession?.isLoading, handleConsentResponse, notify]);
    

    const handleStartEdit = (message: Message) => setSessionState(activeSessionId, () => ({ editingMessage: message }));
    
    const handleRegenerate = useCallback(async (assistantMessageId: string) => {
        if (!activeSession || activeSession.isLoading || !backendServiceRef.current) return;
        const { messages, id: sessionId } = activeSession;
        
        const assistantMsgIndex = messages.findIndex(m => m.id === assistantMessageId);
        if (assistantMsgIndex < 1) return;

        let lastUserMsgIndex = -1;
        for (let i = assistantMsgIndex - 1; i >= 0; i--) {
            if (messages[i].role === 'user') {
                lastUserMsgIndex = i;
                break;
            }
        }
        if (lastUserMsgIndex === -1) return;
        
        const messagesToReplay = messages.slice(0, lastUserMsgIndex + 1);
        
        setSessionState(sessionId, () => ({ messages: messagesToReplay, isLoading: true, routingProposals: [] }));
        
        try {
            const updateGenerator = backendServiceRef.current.processUserMessage(
                messagesToReplay,
                config,
                sessionId,
                profiles
            );
            for await (const _ of processBackendUpdates(sessionId, updateGenerator)) {}
        } catch (e: any) {
            addErrorMessage(`Error on regenerate: ${e.message}`, sessionId);
        } finally {
            if (!activeSession?.pendingConsent && !activeSession?.pendingPlanApproval && !activeSession?.pendingCodeEdit) {
              setSessionState(sessionId, () => ({ isLoading: false }));
            }
            updateBackendStats();
        }
    }, [activeSession, config, profiles, setSessionState, processBackendUpdates, addErrorMessage, updateBackendStats]);
    
    const handleNewSession = () => {
        const newSession = createNewSession(`Chat ${sessions.length + 1}`, activeProfile.id);
        setSessions([...sessions, newSession]);
        setActiveSessionId(newSession.id);
        setFileSystemTree([]);
        setNetworkLog([]);
        setMemory([]);
        updateBackendStats();
        notify('New chat created', 'success');
    };
    
    const handleCloseSession = (sessionId: string) => {
        setSessions(prev => {
            if (prev.length === 1) { notify("Cannot close the last chat tab.", 'error'); return prev; }
            const newSessions = prev.filter(s => s.id !== sessionId);
            if (activeSessionId === sessionId) setActiveSessionId(newSessions[0].id);
            return newSessions;
        });
    };
    
    const handleUpdateSessionTitle = (sessionId: string, title: string) => { setSessionState(sessionId, () => ({ title })); }
    const handleResetSession = () => {
        const defaultProfile = profiles.find(p => p.isDefault) || profiles[0];
        setSessionState(activeSessionId, () => createNewSession(activeSession.title, defaultProfile.id));
        setFileSystemTree([]);
        setNetworkLog([]);
        setMemory([]);
        updateBackendStats();
        notify('Chat has been reset.', 'info');
    };

    const handleUndo = useCallback(() => {
        setSessions(prev =>
            prev.map(s => {
                if (s.id === activeSessionId) {
                    if (!s.history || s.history.length === 0) return s;
                    const lastState = s.history[s.history.length - 1];
                    const newHistory = s.history.slice(0, -1);
                    return { ...lastState, history: newHistory };
                }
                return s;
            })
        );
        notify('Last action undone.', 'info');
    }, [activeSessionId, notify]);

    const handleRewindAndFork = useCallback((sessionId: string, historyIndex: number) => {
        const originalSession = sessions.find(s => s.id === sessionId);
        if (!originalSession || !originalSession.history || historyIndex >= originalSession.history.length) {
            notify("Cannot fork: invalid history point.", 'error');
            return;
        }

        const stateToRestore = originalSession.history[historyIndex];

        const forkedSession: ChatSession = {
            ...stateToRestore,
            id: generateId(),
            title: `${originalSession.title} (forked at step ${historyIndex})`,
            history: originalSession.history.slice(0, historyIndex),
        };
        
        setSessions(prev => [...prev, forkedSession]);
        setActiveSessionId(forkedSession.id);
        notify(`Chat forked from a previous state.`, 'success');

    }, [sessions, notify]);

    const handleSaveSession = () => {
        const data = JSON.stringify({ messages: activeSession.messages, activeProfileId: activeSession.activeProfileId }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${activeSession.title.replace(/\s/g, '_')}-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        notify('Session saved successfully!', 'success');
    };

    const handleLoadSession = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const loadedData = JSON.parse(event.target?.result as string);
                if (!loadedData.messages || !loadedData.activeProfileId) {
                    throw new Error("Invalid session file format.");
                }
                
                const newSession = createNewSession(file.name.replace(/\.json$/, ''));
                
                const loadedSession: ChatSession = {
                    ...newSession,
                    messages: loadedData.messages,
                    activeProfileId: loadedData.activeProfileId,
                };

                setSessions(prev => [...prev, loadedSession]);
                setActiveSessionId(loadedSession.id);
                setFileSystemTree([]);
                setNetworkLog([]);
                setMemory([]);
                updateBackendStats();
                notify('Session loaded successfully!', 'success');
            } catch (err: any) {
                notify(`Error loading session: ${err.message}`, 'error');
            } finally {
                if (e.target) e.target.value = '';
            }
        };
        reader.readAsText(file);
    };
    
    const handleRefreshFileSystem = useCallback(async () => {
        if (backendServiceRef.current) {
            const updateGenerator = backendServiceRef.current.syncFileSystem(activeSessionId);
            for await (const _ of processBackendUpdates(activeSessionId, updateGenerator)) {}
            notify('File system synced', 'info');
        }
    }, [activeSessionId, processBackendUpdates, notify]);
    
    const handleDeleteFile = useCallback(async (path: string) => {
         if (backendServiceRef.current) {
            if (!window.confirm(`Are you sure you want to delete "${path}"?`)) return;
            const updateGenerator = backendServiceRef.current.deleteFile(activeSessionId, path);
            for await (const _ of processBackendUpdates(activeSessionId, updateGenerator)) {}
            notify(`Deleted "${path}"`, 'success');
        }
    }, [activeSessionId, processBackendUpdates, notify]);

    const handleAddMemory = (text: string) => { backendServiceRef.current?.addMemoryManually(activeSessionId, text); updateBackendStats(); notify('Memory added.', 'success'); };
    const handleQueryMemory = (query: string) => { const results = backendServiceRef.current?.queryMemory(activeSessionId, query); if(results) setMemory(results); notify(`Searched memory for "${query}".`, 'info'); };
    const handleClearMemory = () => { backendServiceRef.current?.clearMemory(activeSessionId); updateBackendStats(); notify('Memory cleared.', 'info'); };
    
    const handleResetLayout = () => {
        localStorage.removeItem(LAYOUT_STORAGE_KEY);
        notify('Panel layout reset. The page will now reload.', 'info');
        setTimeout(() => window.location.reload(), 2000);
    };

    const handleExportAllData = () => {
        try {
            const dataToSave = {
                version: 'v10-serverside',
                sessions,
                activeSessionId,
                profiles,
                theme,
            };
            const data = JSON.stringify(dataToSave, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `gemini_swarm_ui_backup_${new Date().toISOString()}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
            notify('All data exported successfully!', 'success');
        } catch (err: any) {
            notify(`Error exporting data: ${err.message}`, 'error');
        }
    };

    const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm("Are you sure you want to import this file? This will overwrite ALL current chats and profiles. This action cannot be undone.")) {
            if (e.target) e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const loadedData = JSON.parse(event.target?.result as string);
                
                if (!loadedData.sessions || !loadedData.profiles) {
                    throw new Error("Invalid data file format. Missing required fields.");
                }
                
                setSessions(loadedData.sessions);
                setActiveSessionId(loadedData.activeSessionId || loadedData.sessions[0]?.id);
                setProfiles(loadedData.profiles);
                setTheme(loadedData.theme || 'dark');
                
                notify('Data imported successfully! The app will now reload.', 'success');
                setTimeout(() => window.location.reload(), 2000);

            } catch (err: any) {
                notify(`Error importing data: ${err.message}`, 'error');
            } finally {
                if (e.target) e.target.value = '';
            }
        };
        reader.readAsText(file);
    };
    
    const handleClearAllData = () => {
         if (window.confirm("DANGER: Are you sure you want to permanently delete ALL chats and profiles? This action cannot be undone.")) {
            localStorage.removeItem(SESSIONS_STORAGE_KEY);
            notify('All data cleared. The app will now reload.', 'info');
            setTimeout(() => window.location.reload(), 1500);
         }
    };


    const getContentAsString = (message: Message): string => {
        let text = Array.isArray(message.content) ? message.content.map(p => p.content).join(' ') : message.content;
        if(message.attachments) text = `[Image Attached] ${text}`;
        return text;
    }
    const handleCopyMessage = (message: Message) => { navigator.clipboard.writeText(getContentAsString(message)); notify('Copied to clipboard!', 'success'); }
    const handleCopyLastResponse = () => {
        const lastAssistantMessage = [...(activeSession?.messages || [])].reverse().find(m => m.role === 'assistant' && getContentAsString(m));
        if (lastAssistantMessage) handleCopyMessage(lastAssistantMessage);
    };
    const handleTextToSpeech = (text: string) => { if ('speechSynthesis' in window) { const u = new SpeechSynthesisUtterance(text); speechSynthesis.speak(u); } else { notify("TTS not supported.", 'error'); } };
    const handleStopGeneration = useCallback(() => { backendServiceRef.current?.interrupt(activeSessionId); setSessionState(activeSessionId, () => ({ isLoading: false, activeNeuralNet: 'NEUTRAL' })); notify('Generation stopped', 'info'); }, [activeSessionId, setSessionState, notify]);
    

    return (
        <>
            <div className="flex h-screen font-sans bg-space-blue-900 overflow-hidden relative">
                <ResizablePanels
                    isLeftPanelOpen={isLeftPanelOpen} setLeftPanelOpen={setLeftPanelOpen}
                    isRightPanelOpen={isRightPanelOpen} setRightPanelOpen={setRightPanelOpen}
                    leftPanel={
                        <Sidebar
                            config={config} setConfig={setConfig} onResetSession={handleResetSession} onUndo={handleUndo} onSaveSession={handleSaveSession} onLoadSession={handleLoadSession}
                            isLoading={activeSession?.isLoading ?? false} historyLength={activeSession?.history?.length ?? 0} profiles={profiles} activeProfileId={activeSession?.activeProfileId ?? ''}
                            onSelectProfile={(id) => setSessionState(activeSessionId, () => ({ activeProfileId: id }))}
                            onSaveProfile={(name) => {
                                const newProfile = { id: generateId(), name, config, isDefault: false };
                                setProfiles(p => [...p, newProfile]);
                                setSessionState(activeSessionId, () => ({ activeProfileId: newProfile.id }));
                                notify(`Profile "${name}" saved!`, 'success');
                            }}
                            onUpdateProfile={() => { setProfiles(p => p.map(prof => prof.id === activeProfile.id ? { ...prof, config } : prof)); notify(`Profile "${activeProfile.name}" updated!`, 'success'); }}
                            onDeleteProfile={(id) => {
                                setProfiles(p => p.filter(prof => prof.id !== id));
                                const defaultProfile = profiles.find(p => p.isDefault) || profiles[0];
                                setSessionState(activeSessionId, () => ({ activeProfileId: defaultProfile.id }));
                                notify(`Profile deleted!`, 'info');
                            }}
                        />
                    }
                    centerPanel={
                        <div className="flex-1 flex flex-col h-screen bg-space-blue-900 overflow-hidden">
                            <ChatHeader onToggleLeftPanel={() => setLeftPanelOpen(v => !v)} onToggleRightPanel={() => setRightPanelOpen(v => !v)} onToggleCommandPalette={() => setIsCommandPaletteOpen(true)}
                                onToggleSettings={() => setIsSettingsModalOpen(true)}
                                isRightPanelOpen={isRightPanelOpen} theme={theme} setTheme={setTheme}
                                activeNeuralNet={activeSession?.activeNeuralNet ?? 'NEUTRAL'} 
                                sessionTitle={activeSession?.title ?? 'Chat'}
                                sandboxStatus={activeSession?.sandboxStatus ?? 'disconnected'}
                             />
                            <ChatTabs sessions={sessions} activeSessionId={activeSessionId} onSelectSession={setActiveSessionId} onNewSession={handleNewSession} onCloseSession={handleCloseSession} onUpdateTitle={handleUpdateSessionTitle} />
                            <ChatWindow
                                session={activeSession} onToolResponse={() => {}} onCopyMessage={handleCopyMessage} onRegenerate={handleRegenerate} onStartEdit={handleStartEdit} onTextToSpeech={handleTextToSpeech}
                                profiles={profiles} onSelectProfile={(id) => setSessionState(activeSessionId, () => ({ activeProfileId: id }))} onSendMessage={handleSendMessage}
                                onPlanApproved={handlePlanApproval} onPlanCancelled={handlePlanCancel} onCodeEditApproved={handleCodeEditApproval}
                            />
                             <MessageInput onSendMessage={handleSendMessage} isLoading={activeSession?.isLoading ?? false} editingMessage={activeSession?.editingMessage ?? null} onSaveEdit={handleSaveEdit} onCancelEdit={() => setSessionState(activeSessionId, () => ({ editingMessage: null }))} onStopGeneration={handleStopGeneration} />
                        </div>
                    }
                    rightPanel={
                       <RightPanel
                            activeTab={rightPanelTab} setActiveTab={setRightPanelTab} session={activeSession} onRewindAndFork={handleRewindAndFork}
                            isAnyToolEnabled={Object.values(config.enabledTools).some(Boolean)} budgetTotals={budgetTotals} costHistory={costHistory} isLoading={activeSession?.isLoading ?? false}
                            previewState={previewState} setPreviewState={setPreviewState} theme={theme} fileSystemTree={fileSystemTree} onRefreshFileSystem={handleRefreshFileSystem} onDeleteFile={handleDeleteFile}
                            networkLog={networkLog} memory={memory} onAddMemory={handleAddMemory} onQueryMemory={handleQueryMemory} onClearMemory={handleClearMemory}
                        />
                    }
                />
            </div>
            <CommandPalette isOpen={isCommandPaletteOpen} setIsOpen={setIsCommandPaletteOpen}
                onReset={handleResetSession} onSaveSession={handleSaveSession} onToggleSidebar={() => setLeftPanelOpen(v => !v)} onToggleSandbox={() => setRightPanelOpen(v => !v)}
                onCopyLastResponse={handleCopyLastResponse} theme={theme} setTheme={setTheme} />
            <SettingsModal 
                isOpen={isSettingsModalOpen} 
                onClose={() => setIsSettingsModalOpen(false)}
                theme={theme}
                setTheme={setTheme}
                onResetLayout={handleResetLayout}
                onExportAllData={handleExportAllData}
                onImportData={handleImportData}
                onClearAllData={handleClearAllData}
            />
            {activeSession?.pendingConsent && <ConsentModal request={activeSession.pendingConsent} onResponse={handleConsentResponse} />}
        </>
    );
};

const App = () => (<NotifierProvider><AppCore /></NotifierProvider>);
export default App;