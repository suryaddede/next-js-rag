'use client';

import React, { useState, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import { Button } from './ui/button';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmbeddableChatPopupProps {
  className?: string;
  title?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  buttonColor?: string;
  maxWidth?: string;
  maxHeight?: string;
}

export default function EmbeddableChatPopup({
  className,
  title = 'Chat Assistant',
  position = 'bottom-right',
  buttonColor = 'bg-blue-600 hover:bg-blue-700',
  maxWidth = '400px',
  maxHeight = '600px',
}: EmbeddableChatPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Close popup when pressing Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  const getPopupPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-20 left-4';
      case 'top-right':
        return 'top-20 right-4';
      case 'top-left':
        return 'top-20 left-4';
      default:
        return 'bottom-20 right-4';
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <div className={`fixed z-50 ${getPositionClasses()}`}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:scale-105',
            buttonColor,
            isOpen && 'scale-90'
          )}
          aria-label="Toggle chat"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <MessageCircle className="h-6 w-6 text-white" />
          )}
        </Button>
      </div>

      {/* Chat Popup */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-40 transition-all duration-300 ease-in-out',
            getPopupPositionClasses(),
            isMinimized ? 'h-12' : '',
            className
          )}
          style={{
            width: maxWidth,
            height: isMinimized ? '48px' : maxHeight,
          }}
        >
          <div className="bg-background h-full w-full overflow-hidden rounded-lg border shadow-2xl">
            {/* Header */}
            <div className="bg-muted/50 flex items-center justify-between border-b px-4 py-2">
              <h3 className="truncate text-sm font-semibold">{title}</h3>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 p-0"
                  aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Interface */}
            {!isMinimized && (
              <div className="h-[calc(100%-48px)]">
                <ChatInterface />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/10 backdrop-blur-sm sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
