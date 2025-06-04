'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DocumentType } from './columns';

interface DocumentFormProps {
  document?: DocumentType;
  onSubmit: (document: {
    title: string;
    url: string;
    contentType: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

export function DocumentForm({
  document,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
}: DocumentFormProps) {
  const [title, setTitle] = useState(document?.title || '');
  const [url, setUrl] = useState(document?.url || '');
  const [contentType] = useState(document?.type || 'unknown');
  const [titleError, setTitleError] = useState('');
  const [urlError, setUrlError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    let isValid = true;

    if (!title.trim()) {
      setTitleError('Title is required');
      isValid = false;
    } else {
      setTitleError('');
    }
    if (!url.trim()) {
      setUrlError('URL is required');
      isValid = false;
    } else {
      try {
        // Basic URL validation
        new URL(url);
        setUrlError('');
      } catch {
        setUrlError('Please enter a valid URL');
        isValid = false;
      }
    }

    if (isValid) {
      onSubmit({ title, url, contentType });
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{document ? 'Edit Document' : 'Add Document'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        {' '}
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="title">
              Document Title<span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              className={titleError ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {titleError && (
              <p className="text-destructive text-xs">{titleError}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="url">
              Document URL<span className="text-destructive">*</span>
            </label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/document"
              className={urlError ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {urlError && <p className="text-destructive text-xs">{urlError}</p>}
            <p className="text-muted-foreground text-xs">
              Enter the URL of the webpage, PDF, or document you want to add
            </p>
          </div>
        </CardContent>{' '}
        <CardFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onCancel}
            type="button"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>{document ? 'Update' : 'Add'} Document</>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
