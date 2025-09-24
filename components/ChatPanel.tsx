import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { SendIcon, BotIcon, UserIcon } from './icons';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  error: string | null;
}

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isModel = message.role === 'model';
    return (
        <div className={`flex items-start gap-3 my-4 animate-fade-in-up ${isModel ? '' : 'flex-row-reverse'}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${isModel ? 'bg-slate-200 border-slate-300' : 'bg-blue-500 border-blue-600'}`}>
              {isModel ? <BotIcon className="w-5 h-5 text-slate-600"/> : <UserIcon className="w-5 h-5 text-white"/>}
            </div>
            <div className={`flex flex-col gap-2 ${isModel ? 'items-start' : 'items-end'}`}>
                {message.parts.map((part, index) => (
                    <div key={index} className={`max-w-xs md:max-w-sm lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${isModel ? 'bg-slate-100 text-gray-800 rounded-bl-lg' : 'bg-blue-500 text-white rounded-br-lg'}`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{part.text}</p>
                        {part.image && <img src={part.image} alt="design update" className="mt-2 rounded-lg border border-slate-200"/>}
                    </div>
                ))}
            </div>
        </div>
    );
};

const LoadingIndicator: React.FC = () => (
    <div className="flex items-start gap-3 my-4 animate-fade-in-up">
        <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center flex-shrink-0">
            <BotIcon className="w-5 h-5 text-slate-600"/>
        </div>
        <div className="max-w-xs px-4 py-3 rounded-2xl rounded-bl-lg bg-slate-100 flex items-center justify-center">
            <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-bg"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-bg" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-bg" style={{ animationDelay: '0.4s' }}></div>
            </div>
        </div>
    </div>
);


export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading, error }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-5 border-b border-slate-200 lg:mt-10">
        <h2 className="text-lg font-bold text-gray-800 tracking-wide">Design Chat</h2>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map((msg, index) => <ChatMessage key={index} message={msg} />)}
        {isLoading && <LoadingIndicator />}
        {error && <p className="text-red-600 text-sm px-4 py-2 bg-red-100 border border-red-200 rounded-lg">{error}</p>}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your design needs..."
            rows={2}
            className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl p-3 pr-14 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 resize-none transition-colors"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};