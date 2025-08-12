



export interface Attachment {
    data: string; // base64 encoded
    mimeType: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  retrievedContext?: {
    uri?: string;
    title?: string;
  };
}

export interface GroundingMetadata {
  webSearchQueries?: string[];
  groundingChunks?: GroundingChunk[];
}

// Represents a tool call requested by the model, stored in state.
export interface ToolCall {
  id?: string; // Optional ID for tracking specific tool calls
  name: string;
  args: Record<string, any>;
}

export type TechniqueName = 'summarize' | 'bullet_points' | 'create_table' | 'code_block' | 'haiku' | 'interactive_poll' | 'card' | 'columns' | 'column' | 'key_value' | 'alert' | 'progress';
export type ContentPartType = 'text' | TechniqueName | 'embedded_preview' | 'three_d_scene' | 'component';

export interface BaseContentPart {
  type: ContentPartType;
  content: string;
}

export interface TextPart extends BaseContentPart {
  type: 'text';
}

export interface TechniquePart extends BaseContentPart {
  type: TechniqueName;
  language?: string; // For code blocks
  question?: string; // For interactive_poll
  options?: string[]; // For interactive_poll
  attributes?: Record<string, string>;
  children?: ContentPart[];
}

export interface EmbeddedPreviewPart extends BaseContentPart {
    type: 'embedded_preview';
    previewType: PreviewType;
}

export interface ThreeDScenePart extends BaseContentPart {
    type: 'three_d_scene';
    textColor: string;
    shape: 'sphere' | 'box' | 'torus';
    rotationSpeed: number;
}

export type ContentPart = TextPart | TechniquePart | EmbeddedPreviewPart | ThreeDScenePart;


export interface PlanStep {
    thought: string;
    tool_name: string;
    args: Record<string, any>;
}

export interface Plan {
    steps: PlanStep[];
}

export type MessageRole = "user" | "assistant" | "system" | "error" | "tool" | "planner" | "reflection" | "thought" | "consciousness";

export interface Message {
  id: string;
  role: MessageRole;
  content: string | ContentPart[]; // Can be simple string or rich content parts
  attachments?: Attachment[];
  groundingMetadata?: GroundingMetadata;
  tool_calls?: ToolCall[]; // For 'assistant' message with tool calls.
  name?: string; // For 'tool' message, the function name.
  plan?: Plan; // For 'planner' message
  reflection?: { original_plan: Plan; error: string; revised_plan: Plan; }; // For 'reflection' message
  consciousness?: { analysis: string; decision: 'proceed' | 'refine' | 'clarify'; original_content: string | ContentPart[]; refined_content?: string | ContentPart[]; }; // For 'consciousness' message
  suggestedReplies?: string[];
}

export interface Config {
  model: string;
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
  systemPrompt: string;
  useJsonMode: boolean;
  jsonSchema: string;
  useGoogleSearch: boolean;
  enabledTools: Record<string, boolean>;
  seed?: number;
  thinkingBudget?: number;
  autoApprove?: boolean;
}

export interface Profile {
  id: string;
  name: string;
  config: Config;
  isDefault?: boolean;
}

export interface ConsentRequest {
    key: string;
    prompt: string;
    toolName: string;
    args: Record<string, any>;
}

export type NeuralNetName = 'CONSCIOUSNESS' | 'PLANNING' | 'MEMORY' | 'EXECUTION' | 'FILE_IO' | 'WEB_SEARCH' | 'SYNTHESIS' | 'CREATIVITY' | 'ORCHESTRATION' | 'NEUTRAL' | 'ALGORITHMS' | 'DATABASE' | 'ANALYTICS';
export type SandboxStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// From @google/genai, simplified for our types
export type ApiPart = { text?: string } | { inlineData?: { mimeType: string; data: string } } | { functionCall?: { name: string; args: Record<string, any>; } } | { functionResponse?: { name: string; response: any; } };
export interface ApiContent { 
    role?: string; 
    parts: ApiPart[]; 
}

export interface CodeEdit {
    path: string;
    oldContent: string;
    newContent: string;
    instructions: string;
    diff: string;
    toolCall: ToolCall;
}

export interface ChatSession {
  id:string;
  title: string;
  messages: Message[];
  activeProfileId: string;
  isLoading: boolean;
  routingProposals: RouteProposal[];
  editingMessage: Message | null;
  history: ChatSession[]; // For time-travel debugging. Using a full ChatSession[] ensures state integrity on undo/rewind.
  gatingLog?: GateDecision[]; // For Gating Debugger
  memory?: MemoryEntry[]; // For Memory Viewer
  pendingConsent: ConsentRequest | null; // For granular consent flow
  pendingPlanForConsent?: Plan | null; // For resuming a plan after a consent request
  pendingPlanApproval?: Plan | null; // For user approval of a full plan
  pendingCodeEdit?: CodeEdit | null; // For user approval of a file edit
  activeNeuralNet?: NeuralNetName;
  lastPrompt?: ApiContent[];
  sandboxStatus?: SandboxStatus;
}

export interface DrawingInstruction {
  shape: 'rect' | 'circle' | 'line' | 'text';
  x: number;
  y: number;
  // for rect
  width?: number;
  height?: number;
  // for circle
  radius?: number;
  // for line
  x2?: number;
  y2?: number;
  // for text
  text?: string;
  font?: string;
  // common
  fill?: string;
  stroke?: string;
  lineWidth?: number;
}

export type RightPanelTab = 'agent_trace' | 'gating' | 'network' | 'files' | 'memory' | 'state' | 'cost' | 'preview' | 'activity' | 'prompt' | 'project';

export type PreviewType = 'p5js' | 'drawing' | 'markdown' | 'html' | 'chartjs';
export interface PreviewState {
  isOpen: boolean;
  title: string;
  type: PreviewType;
  code?: string; // for p5js, markdown, html
  instructions?: DrawingInstruction[]; // for drawing
  chartConfig?: any; // for chartjs
}

export interface FileSystemNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileSystemNode[];
    content?: string;
}


// ---------- Notification System Types ----------
export type NotificationType = 'success' | 'error' | 'info';
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

// ---------- Network Log Types ----------
export interface NetworkLogEntry {
    id: string;
    toolName: string;
    request: Record<string, any>;
    status: 'success' | 'error';
    durationMs: number;
    timestamp: string;
    response: string;
}


// ---------- Gating and Routing Engine Types ----------

export enum SafetyLevel {
    SAFE = "safe",
    SENSITIVE = "sensitive",
    ADMIN = "admin",
}

export interface GlobalPolicy {
    allow_safety_levels: SafetyLevel[];
    require_consent_for_sensitive: boolean;
    require_consent_for_admin: boolean;
    tool_allowlist?: string[];
    tool_denylist?: string[];
    network_enabled: boolean;
    domain_allowlist?: string[];
    domain_denylist?: string[];
    clamp_args: boolean;
    max_timeout_sec: number;
    remember_consent: boolean;
}

export interface ToolRule {
    name: string;
    enabled: boolean;
    safety: SafetyLevel;
    required_envs: string[];
    required_deps: string[];
    network: boolean;
    allowed_domains?: string[];
    blocked_domains?: string[];
    rpm_limit?: number;
    cooldown_sec: number;
    arg_limits: Record<string, any>;
}

export interface GateDecision {
    id: string;
    timestamp: string;
    tool_name: string;
    args: Record<string, any>;
    allowed: boolean;
    requires_consent: boolean;
    reason: string;
    warnings: string[];
    patched_args: Record<string, any>;
    retry_after_sec: number;
    consent_key?: string;
    consent_prompt?: string;
    meta: Record<string, any>;
}

export interface RouteProposal {
    tool: string;
    args: Record<string, any>;
    confidence: number;
    reason: string;
}

export class ConsentStore {
    private _granted: Set<string>;
    constructor() {
        this._granted = new Set();
    }
    private static _key(tool: string, domain?: string | null): string {
        return `${tool}::${domain || '*'}`;
    }
    grant(tool: string, domain?: string | null): void {
        this._granted.add(ConsentStore._key(tool, domain));
    }
    check(tool: string, domain?: string | null): boolean {
        return this._granted.has(ConsentStore._key(tool, domain));
    }
}

// ---------- Engines Plus Types ----------
export interface BudgetTotals {
    prompt_tokens: number;
    completion_tokens: number;
    cost_usd: number;
}

export interface ChargeRecord {
    at: string;
    prompt_tokens: number;
    completion_tokens: number;
    cost_usd: number;
    label?: string;
}

export interface CacheStats {
    hits: number;
    misses: number;
    sets: number;
    evictions: number;
    entries: number;
}

export interface CallSpec {
    name: string;
    fn: () => Promise<{ result: any, fromCache: boolean }>;
    toolCall: ToolCall;
}

export interface CallOutcome {
    name: string;
    ok: boolean;
    duration_sec: number;
    result: any;
    error?: string;
    fromCache: boolean;
}

export interface MemoryEntry {
    id: string;
    timestamp: string;
    text: string;
    // In a real system, this would be a vector and the score would be a cosine similarity.
    // Here we just simulate it for the UI.
    score?: number; 
}

export interface BackendUpdate {
    messages?: Message[];
    isLoading?: boolean;
    routingProposals?: RouteProposal[];
    previewState?: PreviewState;
    fileSystemTree?: FileSystemNode[];
    networkLog?: NetworkLogEntry[];
    gatingLog?: GateDecision[];
    memory?: MemoryEntry[];
    pendingConsent?: ConsentRequest | null;
    pendingPlanForConsent?: Plan | null;
    pendingPlanApproval?: Plan | null;
    pendingCodeEdit?: CodeEdit | null;
    activeNeuralNet?: NeuralNetName;
    lastPrompt?: ApiContent[];
    sandboxStatus?: SandboxStatus;
}

declare global {
  interface Window {
    renderMermaid: () => void;
  }
}