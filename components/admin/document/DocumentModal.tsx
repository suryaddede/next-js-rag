'use client';

import React, { useState, useEffect } from 'react';
import { DocumentForm } from './DocumentForm';
import { DocumentType } from './columns';

interface DocumentModalProps {
  document?: DocumentType;
  onClose: () => void;
  onSubmit: (document: {
    title: string;
    url: string;
    contentType: string;
  }) => Promise<void>;
  isProcessing?: boolean;
  error?: string;
}

export function DocumentModal({
  document,
  onClose,
  onSubmit,
  isProcessing = false,
  error,
}: DocumentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(error);

  // Reset error when modal opens with new document
  useEffect(() => {
    setErrorMessage(error);
  }, [document, error]);
  const handleSubmit = async (data: {
    title: string;
    url: string;
    contentType: string;
  }) => {
    try {
      setIsLoading(true);
      setErrorMessage(undefined);
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error in document submission:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <DocumentForm
          document={document}
          onCancel={onClose}
          onSubmit={handleSubmit}
          isLoading={isLoading || isProcessing}
          error={errorMessage}
        />
      </div>
    </div>
  );
}
