

import React, { useRef, useEffect } from 'react';
import { Message, ToolCall, Profile, Plan, ContentPart, ChatSession } from '../types';
import ChatMessage from './ChatMessage';
import ToolResponseForm from './ToolResponseForm';
import { BotIcon, SparklesIcon } from '../constants';
import Button from './ui/Button';
import PlanApprovalCard from './PlanApprovalCard';
import CodeEditApprovalCard from './CodeEditApprovalCard';

const WelcomeScreen: React.FC<{ profiles: Profile[], onSelectProfile: (id: string) => void }> = ({ profiles, onSelectProfile }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in relative overflow-hidden">
         {/* Background Glows */}
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-accent-cyan/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-accent-magenta/10 rounded-full filter blur-3xl animate-pulse [animation-delay:2s]"></div>

        <div className="relative bg-space-blue-800/50 p-8 sm:p-12 rounded-2xl shadow-2xl backdrop-blur-lg border border-space-blue-700/50 max-w-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-accent-cyan to-accent-magenta rounded-full flex items-center justify-center shadow-lg animate-pulse-fast">
                <SparklesIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mt-8 text-white font-display">Neural Swarm UI</h1>
            <p className="text-md sm:text-lg mt-3 text-gray-300">Your intelligent partner for creativity and development.</p>
            <div className="mt-8">
                <p className="text-md text-gray-200 mb-4">Select a profile to begin:</p>
                <div className="flex flex-wrap justify-center gap-3">
                    {profiles.map(p => (
                        <Button key={p.id} onClick={() => onSelectProfile(p.id)} variant="secondary" size="lg" className="!text-base">
                            {p.name}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    </div>
);


interface ChatWindowProps {
  session: ChatSession | null;
  onToolResponse: (results: { name: string; result: string }[]) => void;
  onCopyMessage: (message: Message) => void;
  onRegenerate: (messageId: string) => void;
  onStartEdit: (message: Message) => void;
  onTextToSpeech: (text: string) => void;
  profiles: Profile[];
  onSelectProfile: (id: string) => void;
  onSendMessage: (message: string) => void;
  onPlanApproved: (plan: Plan) => void;
  onPlanCancelled: () => void;
  onCodeEditApproved: (approved: boolean) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
    session,
    onToolResponse, 
    onCopyMessage, 
    onRegenerate,
    onStartEdit,
    onTextToSpeech,
    profiles,
    onSelectProfile,
    onSendMessage,
    onPlanApproved,
    onPlanCancelled,
    onCodeEditApproved,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.messages, session?.isLoading]);
  
  if (!session) {
      return (
      <div className="flex-1 overflow-y-auto bg-space-blue-900">
        <div className="flex items-center justify-center h-full text-gray-500">Loading Session...</div>
      </div>
    );
  }
  
  const { messages, isLoading } = session;

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-space-blue-900">
          <WelcomeScreen profiles={profiles} onSelectProfile={onSelectProfile}/>
      </div>
    );
  }

  const lastMessage = messages[messages.length - 1];
  const pendingToolCalls =
    lastMessage?.role === 'assistant' &&
    lastMessage.tool_calls &&
    lastMessage.tool_calls.length > 0;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 bg-space-blue-900">
      <div className="space-y-4 max-w-4xl mx-auto">
        {messages.map((msg, index) => {
            const nextMessage = messages[index + 1];
            const isLastInGroup = !nextMessage || nextMessage.role !== msg.role;

            return (
              <ChatMessage
                key={msg.id} 
                message={msg} 
                isLastInGroup={isLastInGroup}
                onCopyMessage={onCopyMessage}
                onRegenerate={onRegenerate}
                onStartEdit={onStartEdit}
                onTextToSpeech={onTextToSpeech}
                onSendMessage={onSendMessage}
              />
            );
        })}
         {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex items-start gap-4 animate-slide-in-bottom mt-1 first:mt-0">
            <div className="w-8 h-8 flex items-center justify-center bg-space-blue-700 rounded-md text-accent-magenta self-end glow-magenta shadow-lg">
                <BotIcon />
            </div>
            <div className="max-w-2xl rounded-lg px-4 py-3 bg-space-blue-800/70 border border-space-blue-700">
                <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-5 h-5 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin"></div>
                     <span className="font-semibold text-sm">Evaluating...</span>
                </div>
            </div>
          </div>
        )}
        {pendingToolCalls && !isLoading && (
            <ToolResponseForm
                toolCalls={lastMessage.tool_calls as ToolCall[]}
                onSubmit={onToolResponse}
                isLoading={isLoading}
            />
        )}
        {session.pendingPlanApproval && !isLoading && (
            <PlanApprovalCard
                plan={session.pendingPlanApproval}
                onApprove={onPlanApproved}
                onCancel={onPlanCancelled}
            />
        )}
        {session.pendingCodeEdit && !isLoading && (
            <CodeEditApprovalCard
                codeEdit={session.pendingCodeEdit}
                onResponse={onCodeEditApproved}
            />
        )}
      </div>
    </div>
  );
};

export default ChatWindow;