import type { Metadata } from 'next';
import '../globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Chat Assistant - Embed',
  description: 'Embeddable chat assistant for web integration',
  robots: 'noindex, nofollow', // Prevent indexing of embed page
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Allow embedding in iframes */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="frame-ancestors *;"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
