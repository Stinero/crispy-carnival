

import React, { useState, useEffect, useRef } from 'react';
import { ChatSession } from '../types';
import { XIcon, PlusCircleIcon } from '../constants';

interface ChatTabsProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onCloseSession: (sessionId: string) => void;
  onUpdateTitle: (sessionId: string, newTitle: string) => void;
}

const ChatTab: React.FC<{
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onClose: (e: React.MouseEvent) => void;
  onUpdateTitle: (newTitle: string) => void;
}> = ({ session, isActive, onSelect, onClose, onUpdateTitle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(session.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = () => {
    setIsEditing(false);
    if (title.trim()) {
      onUpdateTitle(title.trim());
    } else {
      setTitle(session.title); // revert if empty
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setTitle(session.title);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);
  
  useEffect(() => {
    if(!isEditing) {
      setTitle(session.title);
    }
  }, [session.title, isEditing])

  return (
    <div
      onClick={onSelect}
      onDoubleClick={() => setIsEditing(true)}
      className={`
        relative flex items-center justify-between pl-4 pr-3 pt-2 pb-1.5 text-sm font-medium
        max-w-48 transition-all duration-200 group cursor-pointer border-t-2 rounded-t-md
        ${isActive
          ? 'bg-space-blue-900 border-accent-cyan text-white shadow-[0_0_15px_rgba(0,255,255,0.2)]'
          : 'bg-space-blue-800/40 border-transparent text-gray-400 hover:bg-space-blue-800/80 hover:text-gray-200'
        }
      `}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-transparent outline-none ring-1 ring-accent-cyan rounded px-1 w-full"
        />
      ) : (
        <span className="truncate pr-4" title={session.title}>
          {session.title}
        </span>
      )}

      <button
        onClick={onClose}
        className={`
          absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity
          ${isActive ? 'text-gray-400 hover:bg-space-blue-700' : 'text-gray-400 hover:bg-space-blue-700'}
        `}
        aria-label="Close tab"
      >
        <XIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

const ChatTabs: React.FC<ChatTabsProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onCloseSession,
  onUpdateTitle,
}) => {
  return (
    <div className="flex-shrink-0 bg-space-blue-800/60 backdrop-blur-sm flex items-end px-2 gap-1 border-b border-space-blue-700/50">
      {sessions.map(session => (
        <ChatTab
          key={session.id}
          session={session}
          isActive={session.id === activeSessionId}
          onSelect={() => onSelectSession(session.id)}
          onClose={(e) => {
            e.stopPropagation();
            onCloseSession(session.id);
          }}
          onUpdateTitle={(newTitle) => onUpdateTitle(session.id, newTitle)}
        />
      ))}
      <button
        onClick={onNewSession}
        className="p-2 mb-px text-gray-400 hover:text-accent-cyan rounded-md hover:bg-space-blue-800/60 transition-colors"
        title="New Chat"
      >
        <PlusCircleIcon />
      </button>
    </div>
  );
};

export default ChatTabs;