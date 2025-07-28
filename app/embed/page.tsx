'use client';

import EmbeddableChatPopup from '@/components/EmbeddableChatPopup';
import ClientProviders from '@/components/ClientProviders';

export default function EmbedPage() {
  return (
    <ClientProviders>
      <EmbeddableChatPopup
        title="RAG Assistant"
        position="bottom-right"
        buttonColor="bg-blue-600 hover:bg-blue-700"
        maxWidth="450px"
        maxHeight="650px"
      />
    </ClientProviders>
  );
}
