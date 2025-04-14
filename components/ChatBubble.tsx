'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt?: Date;
}

interface ChatBubbleProps {
  message: ChatMessage;
  isLoading?: boolean;
  className?: string;
}

export default function ChatBubble({
  message,
  isLoading = false,
  className,
}: ChatBubbleProps) {
  const isUser = message.role === 'user';

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
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {isLoading && message.role === 'assistant' && (
          <div className="mt-2 flex items-center gap-1">
            <span
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-75"
              style={{ animationDelay: '0ms' }}
            ></span>
            <span
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-75"
              style={{ animationDelay: '150ms' }}
            ></span>
            <span
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-75"
              style={{ animationDelay: '300ms' }}
            ></span>
          </div>
        )}
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
