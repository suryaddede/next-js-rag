'use client';

import React, { useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import ChatBubble, { type ChatMessage } from '@/components/ChatBubble';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';

interface ChatInterfaceProps {
  className?: string;
}

export default function ChatInterface({ className }: ChatInterfaceProps) {
  // Use the Vercel AI SDK useChat hook inside the component
  const {
    messages: aiMessages,
    input,
    handleInputChange,
    handleSubmit,
    status,
  } = useChat();

  // Transform AI SDK messages to our ChatMessage format
  const initialMessages: ChatMessage[] = aiMessages.map((msg) => ({
    id: msg.id,
    content: msg.content,
    role: msg.role as 'user' | 'assistant',
    createdAt: new Date(),
  }));

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if the chat is currently in a loading state
  const isProcessing = status === 'streaming' || status === 'submitted';

  // Scroll to bottom when messages or status changes
  useEffect(() => {
    scrollToBottom();
  }, [initialMessages, status]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div
      className={cn(
        'from-background/50 to-background/80 dark:from-background/20 dark:to-background/30 flex h-full flex-col rounded-lg bg-gradient-to-b',
        'border shadow-sm',
        className
      )}
    >
      {/* Messages Area */}
      <div className="flex-1 space-y-1 overflow-y-auto p-4 pb-0">
        {initialMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="max-w-sm text-center">
              <h2 className="mb-2 text-xl font-semibold">
                Welcome to the Chat
              </h2>
              <p className="text-muted-foreground text-sm">
                Ask a question or describe what you want to know, and the AI
                assistant will help you.
              </p>
            </div>
          </div>
        ) : (
          initialMessages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      {/* Input Area */}
      <div className="bg-background/50 border-t p-4 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="bg-background/50 focus-visible:border-ring max-h-[200px] min-h-[60px] w-full resize-none overflow-y-auto break-words whitespace-pre-wrap"
              rows={3}
              autoFocus
              disabled={isProcessing}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0"
            disabled={!input.trim() || isProcessing}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
