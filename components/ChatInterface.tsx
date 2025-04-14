'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import ChatBubble, { type ChatMessage } from '@/components/ChatBubble';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';

interface ChatInterfaceProps {
  initialMessages?: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  className?: string;
}

export default function ChatInterface({
  initialMessages = [],
  onSendMessage,
  isLoading = false,
  className,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update messages when initialMessages changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Scroll to bottom when messages or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!input.trim() || isLoading) return;

    // Call the parent handler with the message content
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
        {messages.length === 0 ? (
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
          messages.map((message, index) => (
            <ChatBubble
              key={message.id}
              message={message}
              isLoading={
                isLoading &&
                index === messages.length - 1 &&
                message.role === 'assistant'
              }
            />
          ))
        )}

        {/* Show loading indicator when waiting for the first response */}
        {isLoading && messages.length === 0 && (
          <ChatBubble
            message={{
              id: 'loading',
              content: '',
              role: 'assistant',
            }}
            isLoading={true}
          />
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>{' '}
      {/* Input Area */}
      <div className="bg-background/50 border-t p-4 backdrop-blur-sm">
        {' '}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            {' '}
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="bg-background/50 focus-visible:border-ring max-h-[200px] min-h-[60px] w-full resize-none overflow-y-auto break-words whitespace-pre-wrap"
              rows={3}
              autoFocus
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0"
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
