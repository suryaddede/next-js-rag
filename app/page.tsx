'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import type { ChatMessage } from '@/components/ChatBubble';
import { ThemeToggle } from '@/components/ThemeToggle';
import Image from 'next/image';

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle sending a new message
  const handleSendMessage = async (content: string) => {
    // Add user message to the chat
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content,
      role: 'user',
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // In a real app, you would call your RAG API here
      // For demo purposes, simulate a delay and response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create an assistant message
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: `This is a simulated RAG response to: "${content}"\n\nIn a real implementation, this would fetch answers from your vector database or other knowledge source.`,
        role: 'assistant',
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="dark:bg-background flex min-h-screen flex-col font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="bg-background/90 fixed top-0 right-0 left-0 z-10 flex items-center justify-between border-b px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={80}
            height={16}
            priority
          />
          <h1 className="hidden text-lg font-semibold sm:inline-block">
            RAG Chat Interface
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content - Fullscreen */}
      <main className="flex flex-1 flex-col pt-12">
        <ChatInterface
          initialMessages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          className="h-[calc(100vh-48px)]"
        />
      </main>
    </div>
  );
}
