'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, ExternalLink, Code2 } from 'lucide-react';
import EmbeddableChatPopup from '@/components/EmbeddableChatPopup';

export default function DemoPage() {
  const [copiedText, setCopiedText] = useState<string>('');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const jsWidgetCode = `<script src="http://localhost:3000/chat-widget.js"></script>`;

  const customConfigCode = `<script>
window.RAGChatWidget.init({
    baseUrl: 'http://localhost:3000',
    position: 'bottom-right',
    buttonColor: '#059669',
    title: 'Support Chat',
    maxWidth: '400px',
    maxHeight: '600px'
});
</script>
<script src="http://localhost:3000/chat-widget.js"></script>`;

  const iframeCode = `<iframe 
    src="http://localhost:3000/embed" 
    style="position: fixed; bottom: 0; right: 0; width: 100vw; height: 100vh; border: none; pointer-events: none; z-index: 1000;"
    onload="this.style.pointerEvents='auto'">
</iframe>`;

  const phpCode = `<?php
$page_title = "My PHP Page";
?>
<!DOCTYPE html>
<html>
<head>
    <title><?php echo $page_title; ?></title>
</head>
<body>
    <h1>Welcome to my site</h1>
    
    <!-- Your PHP content here -->
    
    <!-- Chat Widget -->
    <script src="http://localhost:3000/chat-widget.js"></script>
</body>
</html>`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            RAG Chat Widget Integration
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Easy integration of AI-powered chat into your PHP webpages. Choose
            your preferred method below.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Method 1: JavaScript Widget */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <Code2 className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold">
                Method 1: JavaScript Widget
              </h2>
            </div>
            <p className="mb-4 text-gray-600">
              Recommended approach. Lightweight and customizable.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">Basic Integration:</h3>
                <div className="overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-white">
                  <pre>{jsWidgetCode}</pre>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyToClipboard(jsWidgetCode, 'basic')}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copiedText === 'basic' ? 'Copied!' : 'Copy Code'}
                </Button>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">
                  With Custom Configuration:
                </h3>
                <div className="overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-white">
                  <pre>{customConfigCode}</pre>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyToClipboard(customConfigCode, 'custom')}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copiedText === 'custom' ? 'Copied!' : 'Copy Code'}
                </Button>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
              <h4 className="mb-2 font-semibold text-green-800">✅ Pros:</h4>
              <ul className="space-y-1 text-sm text-green-700">
                <li>• Highly customizable</li>
                <li>• Lightweight (single script tag)</li>
                <li>• Easy positioning options</li>
                <li>• Can be destroyed/recreated</li>
              </ul>
            </div>
          </Card>

          {/* Method 2: iframe */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <ExternalLink className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-semibold">
                Method 2: Direct iframe
              </h2>
            </div>
            <p className="mb-4 text-gray-600">
              Simple iframe embedding for basic integration.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">iframe Code:</h3>
                <div className="overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-white">
                  <pre>{iframeCode}</pre>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyToClipboard(iframeCode, 'iframe')}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copiedText === 'iframe' ? 'Copied!' : 'Copy Code'}
                </Button>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 font-semibold text-blue-800">
                ℹ️ Considerations:
              </h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Simpler implementation</li>
                <li>• Less customization options</li>
                <li>• Fixed positioning</li>
                <li>• Good for quick testing</li>
              </ul>
            </div>
          </Card>
        </div>

        {/* PHP Example */}
        <Card className="mb-8 p-6">
          <h2 className="mb-4 text-2xl font-semibold">
            PHP Integration Example
          </h2>
          <p className="mb-4 text-gray-600">
            Here&apos;s how to integrate the chat widget into a PHP page:
          </p>
          <div className="overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-white">
            <pre>{phpCode}</pre>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => copyToClipboard(phpCode, 'php')}
          >
            <Copy className="mr-2 h-4 w-4" />
            {copiedText === 'php' ? 'Copied!' : 'Copy PHP Code'}
          </Button>
        </Card>

        {/* Live Demo */}
        <Card className="p-6">
          <h2 className="mb-4 text-2xl font-semibold">🚀 Live Demo</h2>
          <p className="mb-4 text-gray-600">
            You can test the chat widget right now! Look for the blue chat
            button in the bottom-right corner of this page.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Button asChild>
              <a href="/embed" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Embed Page
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="/integration-example.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                HTML Example
              </a>
            </Button>
          </div>
        </Card>

        {/* Setup Instructions */}
        <Card className="mt-8 p-6">
          <h2 className="mb-4 text-2xl font-semibold">📋 Setup Instructions</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                1
              </div>
              <div>
                <h3 className="font-semibold">Deploy your Next.js app</h3>
                <p className="text-gray-600">
                  Host this application on your server or a platform like
                  Vercel.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                2
              </div>
              <div>
                <h3 className="font-semibold">Update the domain</h3>
                <p className="text-gray-600">
                  Replace{' '}
                  <code className="rounded bg-gray-100 px-2 py-1">
                    localhost:3000
                  </code>{' '}
                  with your actual domain in the code examples above.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                3
              </div>
              <div>
                <h3 className="font-semibold">Add to your PHP pages</h3>
                <p className="text-gray-600">
                  Copy and paste the integration code into your PHP pages.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                4
              </div>
              <div>
                <h3 className="font-semibold">Test and customize</h3>
                <p className="text-gray-600">
                  Test the integration and customize the appearance as needed.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Live Chat Widget for Demo */}
      <EmbeddableChatPopup
        title="Demo Chat Assistant"
        position="bottom-right"
        buttonColor="bg-blue-600 hover:bg-blue-700"
        maxWidth="450px"
        maxHeight="650px"
      />
    </div>
  );
}
