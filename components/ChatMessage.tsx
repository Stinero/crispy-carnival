




import React, { useState, useEffect, useRef, useMemo } from 'react';
import { marked } from 'marked';
import p5 from 'p5';
import { Message, ToolCall, GroundingMetadata, Plan, ContentPart, TechniquePart, NeuralNetName, Attachment, ThreeDScenePart } from '../types';
import { 
    BotIcon, UserIcon, SearchIcon, ErrorIcon, ToolIcon, CopyIcon, CheckIcon, 
    EditIcon, RefreshCwIcon, Volume2Icon,
    TOOL_NET_MAP, NEURAL_NET_DEFINITIONS, NEURAL_NET_COLORS, SparklesIcon, ChevronDownIcon, BrainIcon, BrainCircuitIcon, DatabaseIcon, GlobeIcon, ZapIcon, PaletteIcon, FolderIcon, ShieldCheckIcon, RouteIcon, PieChartIcon, CheckCircle2, AlertCircle, Info, COMPONENT_ICON_MAP
} from '../constants';
import InteractivePoll from './InteractivePoll';
import EmbeddedPreview from './EmbeddedPreview';


// --- 3D Scene Component ---
interface ThreeDSceneProps {
    text: string;
    textColor: string;
    shape: 'sphere' | 'box' | 'torus';
    rotationSpeed: number;
}

const ThreeDScene: React.FC<ThreeDSceneProps> = ({ text, textColor, shape, rotationSpeed }) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const sketchRef = useRef<p5 | null>(null);

    useEffect(() => {
        if (sketchRef.current) {
            sketchRef.current.remove();
        }

        const sketch = (p: p5) => {
            let font: p5.Font;
            let rotation = 0;
            const size = 150; // Canvas dimensions

            p.preload = () => {
                font = p.loadFont('https://fonts.gstatic.com/s/orbitron/v31/yMJRMIlzdpvBhQQL_Qq7dy0.woff2');
            };

            p.setup = () => {
                p.createCanvas(size, size, p.WEBGL).parent(canvasRef.current!);
                p.textFont(font);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(24);
            };

            p.draw = () => {
                p.background(0, 0, 0, 0); // Transparent background
                rotation += rotationSpeed || 0.01;

                p.push();
                p.noStroke();
                p.fill(textColor || '#FFFFFF');
                p.ambientLight(150);
                p.pointLight(255, 255, 255, 0, 0, 100);
                p.translate(0, 0, 20);
                p.rotateY(rotation * 0.7);
                p.rotateX(-0.2);
                p.text(text, 0, 0);
                p.pop();
                
                p.push();
                p.rotateY(-rotation);
                p.rotateX(rotation * 0.5);
                
                p.stroke(textColor || '#FFFFFF');
                p.strokeWeight(0.5);
                p.noFill();

                switch (shape) {
                    case 'sphere': p.sphere(40); break;
                    case 'box': p.box(60); break;
                    case 'torus': p.torus(35, 15); break;
                }
                p.pop();
            };
        };

        sketchRef.current = new p5(sketch);

        return () => {
            sketchRef.current?.remove();
        };
    }, [text, textColor, shape, rotationSpeed]);

    return (
        <div className="flex items-center justify-center my-3 min-h-[150px]">
            <div ref={canvasRef} style={{ width: 150, height: 150 }} />
        </div>
    );
};

// --- Suggestion Chips Component ---
const SuggestionChips: React.FC<{ suggestions: string[], onSelect: (suggestion: string) => void }> = ({ suggestions, onSelect }) => (
    <div className="mt-4 flex flex-wrap gap-2 animate-slide-in-bottom">
        {suggestions.map((text, i) => (
            <button
                key={i}
                onClick={() => onSelect(text)}
                className="px-4 py-2 bg-space-blue-800/60 border border-space-blue-700 text-sm font-medium text-gray-300 rounded-md hover:bg-accent-cyan/10 hover:text-accent-cyan hover:border-accent-cyan transition-all transform hover:scale-105 active:scale-100"
            >
                {text}
            </button>
        ))}
    </div>
);


const MarkdownRenderer: React.FC<{ markdown: string; className?: string }> = ({ markdown, className = '' }) => {
    const [html, setHtml] = useState('');

    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const parsedHtml = await marked.parse(markdown || '', { gfm: true });
                if (isMounted) {
                    setHtml(parsedHtml);
                }
            } catch (e) {
                console.error("Markdown parsing error:", e);
                if (isMounted) {
                    setHtml(`<p class="text-red-500">Error rendering content.</p>`);
                }
            }
        })();

        return () => { isMounted = false; };
    }, [markdown]);
    
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (rootRef.current && html.includes('class="language-mermaid"')) {
            const timeoutId = setTimeout(() => {
                try {
                    window.renderMermaid?.();
                } catch(e) { console.error("Mermaid error:", e); }
            }, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [html]);

    return <div ref={rootRef} className={`prose-custom-styles ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
};

const NET_ICONS: Record<NeuralNetName, React.FC<{className?: string}>> = {
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
    CONSCIOUSNESS: BrainIcon, // Placeholder, might need a dedicated icon
    NEUTRAL: () => <div />,
};

// --- New Rich Component Renderers ---

const renderContentPart = (part: ContentPart): JSX.Element | null => {
    switch (part.type) {
        case 'text':
             return <MarkdownRenderer markdown={part.content} />;
        case 'embedded_preview':
             return <EmbeddedPreview title="" type={part.previewType} code={part.content} />;
        case 'three_d_scene':
            const sceneProps = part as ThreeDScenePart;
            return <ThreeDScene text={sceneProps.content} textColor={sceneProps.textColor} shape={sceneProps.shape} rotationSpeed={sceneProps.rotationSpeed} />;
        case 'summarize':
            return <blockquote className="border-l-2 border-accent-cyan pl-4 italic text-gray-300 my-2"><MarkdownRenderer markdown={part.content} /></blockquote>;
        case 'bullet_points':
            const markdownList = part.content.split('\n').map(item => `- ${item.replace(/^- /, '')}`).join('\n');
            return <MarkdownRenderer markdown={markdownList} />;
        case 'create_table':
            return <MarkdownRenderer markdown={part.content} />;
        case 'code_block':
            const markdownCode = `\`\`\`${(part as TechniquePart).language || ''}\n${part.content}\n\`\`\``;
            return <MarkdownRenderer markdown={markdownCode} />;
        case 'haiku':
             return <p className="italic whitespace-pre-line text-center font-serif text-lg tracking-wider my-2">{part.content}</p>;
        case 'interactive_poll':
            return <InteractivePoll question={(part as TechniquePart).question!} options={(part as TechniquePart).options!} />;
        
        // New rich components
        case 'card': {
            const { title, icon } = (part as TechniquePart).attributes || {};
            const Icon = icon ? COMPONENT_ICON_MAP[icon] : null;
            return (
                 <div className="my-4 rounded-md border border-space-blue-700 bg-space-blue-800/50 overflow-hidden shadow-inner">
                    {title && (
                        <div className="flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-gray-200 bg-space-blue-700/40 border-b border-space-blue-700">
                           {Icon && <Icon className="h-5 w-5 text-accent-cyan" />}
                           <MarkdownRenderer markdown={title} className="!p-0 !my-0" />
                        </div>
                    )}
                    <div className="p-4">{(part as TechniquePart).children?.map((child, i) => <div key={i}>{renderContentPart(child)}</div>)}</div>
                </div>
            );
        }
        case 'columns':
            return <div className="my-2 flex flex-col md:flex-row gap-4">{(part as TechniquePart).children?.map((child, i) => <div key={i} className="flex-1">{renderContentPart(child)}</div>)}</div>;
        case 'column':
            return <div>{(part as TechniquePart).children?.map((child, i) => <div key={i}>{renderContentPart(child)}</div>)}</div>;
        case 'alert': {
            const { type = 'info' } = (part as TechniquePart).attributes || {};
            const styleMap = {
                info: { Icon: Info, classes: 'bg-blue-900/40 border-blue-500/50 text-blue-300' },
                success: { Icon: CheckCircle2, classes: 'bg-green-900/40 border-green-500/50 text-green-300' },
                warning: { Icon: AlertCircle, classes: 'bg-yellow-900/40 border-yellow-500/50 text-yellow-300' },
                error: { Icon: AlertCircle, classes: 'bg-red-900/40 border-red-500/50 text-red-300' },
            };
            const { Icon, classes } = styleMap[type as keyof typeof styleMap] || styleMap.info;
            return (
                <div className={`my-2 p-4 rounded-md border flex gap-3 ${classes}`}>
                    <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>{(part as TechniquePart).children?.map((child, i) => <div key={i}>{renderContentPart(child)}</div>)}</div>
                </div>
            );
        }
        case 'key_value': {
            const { label } = (part as TechniquePart).attributes || {};
            return (
                <div className="my-1.5 flex justify-between items-center text-sm">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-semibold text-gray-200">
                        {(part as TechniquePart).children?.map((child, i) => <span key={i}>{renderContentPart(child)}</span>)}
                    </span>
                </div>
            );
        }
        case 'progress': {
             const { value = '0', label } = (part as TechniquePart).attributes || {};
             const numValue = parseInt(value, 10);
             return (
                <div className="my-3">
                    {label && <label className="text-sm text-gray-400 mb-1 block">{label}</label>}
                    <div className="w-full bg-space-blue-700 rounded-full h-2.5">
                        <div className="bg-accent-cyan h-2.5 rounded-full" style={{ width: `${numValue}%` }}></div>
                    </div>
                </div>
             );
        }
        default:
            return null;
    }
};


const renderRichContent = (content: string | ContentPart[]): React.ReactNode => {
    if (typeof content === 'string') {
        return <MarkdownRenderer markdown={content} />;
    }

    if (!Array.isArray(content) || content.length === 0) {
        return null;
    }
    
    return content.map((part, index) => <div key={index}>{renderContentPart(part)}</div>);
};

const ImageAttachments: React.FC<{ attachments: Attachment[] }> = ({ attachments }) => {
    if (!attachments || attachments.length === 0) return null;

    return (
        <div className="mt-2 flex flex-wrap gap-2">
            {attachments.map((att, index) => (
                <a key={index} href={`data:${att.mimeType};base64,${att.data}`} target="_blank" rel="noopener noreferrer">
                    <img 
                        src={`data:${att.mimeType};base64,${att.data}`} 
                        alt={`Attachment ${index + 1}`}
                        className="max-h-48 max-w-full rounded-lg object-contain border border-space-blue-700/50"
                    />
                </a>
            ))}
        </div>
    );
};

const GroundingInfo: React.FC<{ metadata: GroundingMetadata }> = ({ metadata }) => {
  if (!metadata.groundingChunks || metadata.groundingChunks.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-space-blue-700 pt-3">
      <h4 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
        <SearchIcon />
        Sources
      </h4>
      <div className="flex flex-wrap gap-2">
        {metadata.groundingChunks.map((chunk, index) =>
          chunk.web?.uri ? (
            <a
              key={index}
              href={chunk.web.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-space-blue-700 hover:bg-space-blue-600 text-accent-cyan px-2 py-1 rounded-md transition-colors truncate max-w-xs"
              title={chunk.web.title || chunk.web.uri}
            >
              {chunk.web.title || new URL(chunk.web.uri).hostname}
            </a>
          ) : null
        )}
      </div>
    </div>
  );
};

const ToolCallDisplay: React.FC<{ toolCalls: ToolCall[] }> = ({ toolCalls }) => (
    <div className="my-4 rounded-md bg-space-blue-800/30 border border-accent-cyan/20 overflow-hidden">
        <div className="px-4 py-2 bg-black/20">
          <h4 className="text-sm font-bold text-accent-cyan flex items-center gap-2">
            <ToolIcon />
            Deploying Nets
          </h4>
        </div>
        <div className="p-3 space-y-3">
          {toolCalls.map((call, index) => (
             <div key={index} className="bg-space-blue-900/40 rounded-md p-3 border border-space-blue-700 text-sm">
                 <details>
                     <summary className="font-mono font-semibold text-accent-cyan cursor-pointer select-none flex items-center justify-between">
                         <span>{call.name}</span>
                         <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                     </summary>
                     <pre className="mt-2 p-2 bg-space-blue-800/50 rounded text-xs text-gray-300 overflow-x-auto font-mono">
                         {JSON.stringify(call.args, null, 2)}
                     </pre>
                 </details>
            </div>
          ))}
        </div>
    </div>
);

const PlanDisplay: React.FC<{ plan: Plan, title?: string, color?: string }> = ({ plan, title="Executing Plan", color="accent-cyan" }) => (
    <div className={`my-4 rounded-md border border-${color}/30 overflow-hidden bg-space-blue-800/20`}>
        <div className={`px-4 py-2 bg-black/20`}>
          <h4 className={`text-sm font-bold text-${color} flex items-center gap-2`}>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            {title}
          </h4>
        </div>
        <div className="p-4 relative">
            <div className={`absolute left-7 top-4 bottom-4 w-0.5 bg-${color}/30`}></div>
            {plan.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 relative mb-4 last:mb-0">
                   <div style={{backgroundColor: `var(--${color})`}} className={`flex-shrink-0 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-${color} text-space-blue-900 text-xs font-bold ring-4 ring-space-blue-800`}>{index + 1}</div>
                   <div className="flex-grow pt-0.5">
                     <p className="font-semibold text-gray-200 font-mono text-sm">{step.tool_name}</p>
                     <p className="text-xs italic text-gray-400 mt-0.5">"{step.thought}"</p>
                      <details className="text-xs group mt-1.5">
                        <summary className="cursor-pointer text-gray-400 hover:text-white select-none">Show Arguments</summary>
                        <pre className="mt-1 p-2 bg-space-blue-800/60 rounded text-[11px] text-gray-300 overflow-x-auto font-mono">
                            {JSON.stringify(step.args, null, 2)}
                        </pre>
                      </details>
                   </div>
                </div>
            ))}
        </div>
    </div>
);

const ReflectionDisplay: React.FC<{ reflection: Message['reflection'] }> = ({ reflection }) => {
    if (!reflection) return null;
    return (
         <div className="my-4 rounded-md border border-yellow-400/30 overflow-hidden bg-space-blue-800/20">
            <div className="px-4 py-2 bg-black/20">
                <h4 className="text-sm font-bold text-yellow-400 flex items-center gap-2">
                    <BrainIcon className="h-5 w-5" />
                    Reflection & Self-Correction
                </h4>
            </div>
            <div className="p-4 space-y-4">
                <div>
                    <h5 className="font-semibold text-red-400 mb-1">Encountered Error:</h5>
                    <pre className="p-2 bg-red-900/30 rounded text-xs text-red-300 font-mono border border-red-700/50">
                        {reflection.error}
                    </pre>
                </div>
                <details>
                    <summary className="font-semibold text-gray-400 cursor-pointer text-sm">Show Failed Plan</summary>
                    <PlanDisplay plan={reflection.original_plan} title="Failed Plan" color="red-500" />
                </details>
                 <div>
                    <h5 className="font-semibold text-accent-lime mb-1">Revised Plan:</h5>
                    <PlanDisplay plan={reflection.revised_plan} title="Corrected Plan" color="accent-lime" />
                </div>
            </div>
        </div>
    );
};

const ThinkingIndicator = () => {
    const icons = [BrainCircuitIcon, ZapIcon, GlobeIcon, DatabaseIcon];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(prev => (prev + 1) % icons.length);
        }, 300);
        return () => clearInterval(interval);
    }, []);

    const Icon = icons[index];

    return (
        <div className="flex items-center gap-3 text-gray-400/80">
            <Icon className="w-5 h-5 text-accent-cyan animate-pulse" />
            <span className="font-semibold text-sm">Thinking...</span>
        </div>
    )
}

const MessageActions: React.FC<{ message: Message, onCopy: () => void, onRegenerate: () => void, onEdit: () => void, onTextToSpeech: (text: string) => void }> = ({ message, onCopy, onRegenerate, onEdit, onTextToSpeech }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        onCopy();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const getContentAsString = (content: string | ContentPart[]): string => {
        if (typeof content === 'string') return content;
        return content.map(p => {
            if (p.type === 'text' || p.type === 'three_d_scene') return p.content;
            if ((p as TechniquePart).children) return getContentAsString((p as TechniquePart).children!);
            return p.content || '';
        }).join(' ');
    };
    
    const ttsSupported = 'speechSynthesis' in window;

    return (
        <div className="absolute top-0 -translate-y-1/2 mt-1 flex items-center gap-1 rounded-md border bg-space-blue-800 border-space-blue-700 shadow-lg p-1 opacity-20 group-hover:opacity-100 transition-opacity duration-200">
            {message.role === 'user' && (
                <button onClick={onEdit} className="p-1.5 rounded hover:bg-space-blue-700 text-gray-400" title="Edit"><EditIcon /></button>
            )}
            {message.role === 'assistant' && getContentAsString(message.content) && (
                 <>
                    <button onClick={onRegenerate} className="p-1.5 rounded hover:bg-space-blue-700 text-gray-400" title="Regenerate"><RefreshCwIcon /></button>
                    {ttsSupported && (
                        <button onClick={() => onTextToSpeech(getContentAsString(message.content))} className="p-1.5 rounded hover:bg-space-blue-700 text-gray-400" title="Read aloud"><Volume2Icon className="h-4 w-4" /></button>
                    )}
                </>
            )}
            <button onClick={handleCopy} className="p-1.5 rounded hover:bg-space-blue-700 text-gray-400" title="Copy">
                {copied ? <CheckIcon className="text-accent-lime" /> : <CopyIcon />}
            </button>
        </div>
    );
};

interface ChatMessageProps {
  message: Message;
  isLastInGroup: boolean;
  onCopyMessage: (message: Message) => void;
  onRegenerate: (messageId: string) => void;
  onStartEdit: (message: Message) => void;
  onTextToSpeech: (text: string) => void;
  onSendMessage: (message: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLastInGroup, onCopyMessage, onRegenerate, onStartEdit, onTextToSpeech, onSendMessage }) => {

  const isUser = message.role === 'user';
  const isError = message.role === 'error';
  const isTool = message.role === 'tool';
  const isSystem = message.role === 'system';
  const isPlanner = message.role === 'planner';
  const isReflection = message.role === 'reflection';
  const isThought = message.role === 'thought';
  const isConsciousness = message.role === 'consciousness';
  
  const contentAsString = Array.isArray(message.content) ? message.content.map(p => p.content).join('') : message.content;

  if (isThought || isConsciousness) {
    // These are handled by the AgentTrace component and shouldn't appear as bubbles
    return null;
  }

  if (isTool) {
    return (
      <div className="my-2 mx-auto max-w-3xl text-xs animate-slide-in-bottom">
        <div className="bg-space-blue-800/60 rounded-md p-2.5 border border-space-blue-700/50">
          <div className="font-mono text-accent-cyan flex items-center gap-2 mb-1.5">
            <ToolIcon />
            <span className="font-bold">Net Result:</span> {message.name}
          </div>
          <pre className="p-2 bg-space-blue-900/30 rounded text-gray-200 overflow-x-auto font-mono text-[11px]">
            <code>{contentAsString}</code>
          </pre>
        </div>
      </div>
    );
  }

  if (isSystem) {
      return (
          <div className="my-4 text-center text-xs text-gray-400 animate-fade-in flex items-center justify-center gap-2">
            <div className="w-full h-px bg-space-blue-700/50"></div>
            <span className="whitespace-nowrap flex items-center gap-1.5">
                <ShieldCheckIcon className="h-4 w-4" />
                {contentAsString}
            </span>
            <div className="w-full h-px bg-space-blue-700/50"></div>
          </div>
      )
  }

  const wrapperClasses = `flex items-start gap-3 md:gap-4 animate-slide-in-bottom group relative mt-1 first:mt-0`;
  
  const bubbleClasses = `w-full max-w-xl md:max-w-2xl rounded-lg px-4 py-3 relative border ${
    isUser
      ? `bg-gradient-to-br from-accent-cyan/20 to-accent-cyan/5 border-accent-cyan/30 text-white`
      : isError
      ? `bg-red-900/30 border-red-500/50 text-red-200`
      : `bg-space-blue-800/70 border-space-blue-700 text-gray-200`
  }`;

  const icon = isUser ? (
    <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-space-blue-700 to-space-blue-800 rounded-md text-accent-cyan glow-cyan shadow-lg"><UserIcon /></div>
  ) : isError ? (
    <div className="w-8 h-8 flex items-center justify-center bg-red-800 rounded-md text-red-200"><ErrorIcon /></div>
  ) : (
    <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-space-blue-700 to-space-blue-800 rounded-md text-accent-magenta glow-magenta shadow-lg"><BotIcon /></div>
  );

  return (
    <div className={wrapperClasses}>
      {!isUser && (
        <div className={`flex-shrink-0 self-end transition-opacity duration-300 ${isLastInGroup ? 'opacity-100' : 'opacity-0'}`}>
          {icon}
        </div>
      )}
      <div className={`${bubbleClasses} ${isUser ? 'ml-auto' : 'mr-auto'}`}>
        <div className={`absolute ${isUser ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'} top-1/2 -translate-y-1/2`}>
            <MessageActions 
                message={message} 
                onCopy={() => onCopyMessage(message)}
                onRegenerate={() => onRegenerate(message.id)}
                onEdit={() => onStartEdit(message)}
                onTextToSpeech={onTextToSpeech}
            />
        </div>
        <div>
          {isError ? <span className="font-semibold">Error: </span> : null}
          {renderRichContent(message.content)}
          {message.attachments && <ImageAttachments attachments={message.attachments} />}
          {isPlanner && message.plan && (
             <PlanDisplay plan={message.plan} />
          )}
          {isReflection && message.reflection && (
             <ReflectionDisplay reflection={message.reflection} />
          )}
          {message.role === 'assistant' && contentAsString.length === 0 && !message.tool_calls && !message.plan && (
             <ThinkingIndicator />
          )}
        </div>
        {message.groundingMetadata && <GroundingInfo metadata={message.groundingMetadata} />}
        {message.tool_calls && <ToolCallDisplay toolCalls={message.tool_calls} />}
        {message.suggestedReplies && message.suggestedReplies.length > 0 && (
            <SuggestionChips suggestions={message.suggestedReplies} onSelect={onSendMessage} />
        )}
      </div>
      {isUser && (
          <div className={`flex-shrink-0 self-end transition-opacity duration-300 ${isLastInGroup ? 'opacity-100' : 'opacity-0'}`}>
            {icon}
          </div>
      )}
    </div>
  );
};

export default ChatMessage;