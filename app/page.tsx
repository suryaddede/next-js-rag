'use client';

import ChatInterface from '@/components/ChatInterface';
import { ThemeToggle } from '@/components/ThemeToggle';
import Image from 'next/image';

export default function Home() {
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
          <a
            href="/demo"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Integration Demo
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content - Fullscreen */}
      <main className="flex flex-1 flex-col pt-12">
        <ChatInterface className="h-[calc(100vh-48px)]" />
      </main>
    </div>
  );
}
