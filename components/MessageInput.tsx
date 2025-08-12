import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, MicIcon, PaperclipIcon, XIcon, StopIcon } from '../constants';
import Button from './ui/Button';
import { Message } from '../types';

interface MessageInputProps {
  onSendMessage: (message: string, image?: File | null) => void;
  isLoading: boolean;
  editingMessage: Message | null;
  onSaveEdit: (newContent: string) => void;
  onCancelEdit: () => void;
  onStopGeneration: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading, editingMessage, onSaveEdit, onCancelEdit, onStopGeneration }) => {
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!editingMessage;

  const [isRecognizing, setIsRecognizing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsRecognizing(true);
      recognitionRef.current.onend = () => setIsRecognizing(false);
      recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecognizing(false);
      };
      recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev ? `${prev} ${transcript}` : transcript);
      };
    }
    
    return () => {
        if(recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };
  }, []);

  const toggleRecognition = () => {
    if (isRecognizing) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };


  useEffect(() => {
    if (isEditing && editingMessage) {
        const content = editingMessage.content;
        if (typeof content === 'string') {
            setInput(content);
        } else {
            // This is a fallback for the unlikely event that a message with complex
            // content is being edited. It mirrors the stringification for copy.
            setInput(content.map(p => p.content).join(''));
        }
        textareaRef.current?.focus();
        // Adjust height after content is set
        setTimeout(() => {
             if (textareaRef.current) {
                const el = textareaRef.current;
                el.style.height = 'auto';
                const maxHeight = 160;
                el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
            }
        }, 0);
    } else {
        setInput('');
    }
  }, [editingMessage]);

  useEffect(() => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = 'auto';
      // Use scrollHeight to set the height, but max out at a certain point
      const maxHeight = 160; // Corresponds to max-h-40
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || imageFile) && !isLoading) {
        if(isEditing) {
            onSaveEdit(input.trim());
        } else {
            onSendMessage(input.trim(), imageFile);
        }
        setInput('');
        setImageFile(null);
        setImagePreviewUrl(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
    // Reset file input to allow selecting the same file again
    if(e.target) e.target.value = '';
  };
  
  const removeImage = () => {
      setImageFile(null);
      setImagePreviewUrl(null);
  };

  return (
    <div className="bg-space-blue-900/80 backdrop-blur-sm p-3 border-t border-space-blue-700/50">
      <div className="max-w-4xl mx-auto">
        {isEditing && (
            <div className="text-sm text-gray-400 mb-2 px-3 flex justify-between items-center">
                <span>Editing message...</span>
                <span className="text-xs">Press <kbd className="font-sans font-semibold text-gray-400 border border-gray-600 rounded px-1.5 py-0.5">Esc</kbd> to cancel.</span>
            </div>
        )}
        <div className="rounded-xl border border-space-blue-700 bg-space-blue-800/50 focus-within:border-accent-cyan focus-within:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all duration-300">
            {imagePreviewUrl && (
                 <div className="p-2 border-b border-space-blue-700/50">
                    <div className="relative inline-block">
                        <img src={imagePreviewUrl} alt="Preview" className="h-24 rounded-lg object-cover" />
                        <button 
                            onClick={removeImage} 
                            className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 text-white hover:bg-red-500 transition-colors"
                            aria-label="Remove image"
                        >
                            <XIcon className="h-3 w-3"/>
                        </button>
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-end space-x-2 p-1.5">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <Button type="button" onClick={() => fileInputRef.current?.click()} variant="ghost" className="!rounded-full !p-2.5 text-gray-400" disabled={isLoading || isEditing} aria-label="Attach image">
                <PaperclipIcon className="h-6 w-6" />
            </Button>
            <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={imageFile ? "Describe the image..." : "Type a message or use the microphone..."}
                className="flex-1 p-2.5 bg-transparent resize-none focus:outline-none text-gray-200 placeholder:text-gray-500 text-base max-h-40"
                rows={1}
                disabled={isLoading}
            />
            {recognitionRef.current && (
                <Button type="button" onClick={toggleRecognition} variant="ghost" className={`!rounded-full !p-2.5 ${isRecognizing ? 'text-accent-cyan glow-cyan animate-pulse-fast' : 'text-gray-400'}`} disabled={isLoading} aria-label="Use microphone">
                    <MicIcon className="h-6 w-6" />
                </Button>
            )}
             {isLoading ? (
                <Button 
                    type="button" 
                    onClick={onStopGeneration} 
                    size="lg" 
                    className="!rounded-lg !p-3 !bg-red-500 hover:!bg-red-600 focus:!ring-red-500 text-white"
                    aria-label="Stop generation"
                >
                    <StopIcon className="h-5 w-5"/>
                </Button>
            ) : (
                <Button type="submit" disabled={!input.trim() && !imageFile} size="lg" className="!rounded-lg !p-3">
                    <SendIcon />
                </Button>
            )}
            </form>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;