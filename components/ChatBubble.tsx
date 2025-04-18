'use client';

import React, { memo, lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';

// Lazy load ReactMarkdown to improve performance
const ReactMarkdown = lazy(() => import('react-markdown'));

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt?: Date;
}

interface ChatBubbleProps {
  message: ChatMessage;
  className?: string;
}

function ChatBubble({ message, className }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  // Simple content (no need for markdown) for user messages to improve performance
  const renderContent = () => {
    if (isUser || !message.content) {
      return (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      );
    }

    // Only use markdown for assistant messages with content
    if (message.content) {
      return (
        <Suspense
          fallback={
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          }
        >
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </Suspense>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        'flex w-full items-start gap-4 py-4',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
    >
      {!isUser && (
        <Avatar className="bg-primary/10 h-8 w-8 border">
          <AvatarFallback className="bg-primary/10">
            <Bot className="text-primary h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'flex max-w-[80%] flex-col rounded-lg px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        {renderContent()}
      </div>

      {isUser && (
        <Avatar className="bg-primary/10 h-8 w-8 border">
          <AvatarFallback className="bg-secondary/10">
            <User className="text-secondary h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
// with custom equality check to prevent re-rendering when message content hasn't changed
export default memo(ChatBubble, (prevProps, nextProps) => {
  return (
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.role === nextProps.message.role
  );
});
