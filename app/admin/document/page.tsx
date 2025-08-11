'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, FileText } from 'lucide-react';
import { DocumentTable } from '@/components/admin/document/DocumentTable';
import { columns } from '@/components/admin/document/columns';
import { DocumentType } from '@/components/admin/document/columns';
import { DocumentModal } from '@/components/admin/document/DocumentModal';
import { toast } from 'sonner';
import { getCurrentTimestamp } from '@/lib/utils';

// API response types
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

export default function DocumentPage() {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<
    DocumentType | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/document');
      const result: ApiResponse<{
        ids: string[];
        metadatas: Array<Record<string, string>>;
        documents: Array<{ length: number }>;
      }> = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch documents');
      }

      // Group chunks by document title to show only parent documents
      const documentMap = new Map<string, DocumentType>();
      
      result.data?.ids.forEach((id: string, index: number) => {
        const metadata = result.data?.metadatas[index];
        const title = metadata?.title || 'Untitled Document';
        const updatedTimestamp = metadata?.last_update || getCurrentTimestamp();
        
        // Only add if this document title hasn't been added yet
        if (!documentMap.has(title)) {
          // Map content types to more user-friendly names
          const getDisplayType = (contentType: string) => {
            switch (contentType) {
              case 'html':
                return 'webpage';
              case 'pdf':
                return 'PDF';
              case 'json':
                return 'JSON';
              default:
                return 'webpage'; // Default to webpage instead of unknown
            }
          };

          documentMap.set(title, {
            id: title, // Use title as ID for parent document
            title: title,
            type: getDisplayType(metadata?.content_type || 'html'),
            updated: updatedTimestamp,
            url: metadata?.source_url || '',
          } as DocumentType);
        }
      });
      
      const formattedDocs = Array.from(documentMap.values());

      setDocuments(formattedDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to load documents'
      );
      toast.error('Error loading documents', {
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle document addition
  const handleAddDocument = async ({
    title,
    url,
  }: {
    title: string;
    url: string;
    contentType?: string;
  }): Promise<void> => {
    try {
      const response = await fetch('/api/admin/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, url }),
      });

      const result: ApiResponse<DocumentType> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || result.message || 'Failed to add document'
        );
      }

      // Update local state with the returned document
      setDocuments([...documents, result.data!]);

      // Show success toast
      toast.success('Document added', {
        description: `"${title}" has been successfully added.`,
      });
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('Error adding document', {
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
      throw error; // Re-throw to be handled by the modal
    }
  };

  // Function to handle document deletion
  const handleDeleteDocument = async (id: string) => {
    try {
      // Set loading state for this specific document
      setDeletingIds((prev) => [...prev, id]);

      const response = await fetch(
        `/api/admin/document?id=${encodeURIComponent(id)}`,
        {
          method: 'DELETE',
        }
      );

      const result: ApiResponse<void> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || result.message || 'Failed to delete document'
        );
      }

      // Update local state
      setDocuments(documents.filter((doc) => doc.id !== id));

      // Show success toast
      toast.success('Document deleted', {
        description: 'Document has been successfully removed.',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Error deleting document', {
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      // Remove from loading state
      setDeletingIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };
  // Function to handle document editing
  const handleEditDocument = async ({
    title,
    url,
  }: {
    title: string;
    url: string;
    contentType?: string;
  }): Promise<void> => {
    if (!editingDocument) return;

    try {
      const response = await fetch('/api/admin/document', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: editingDocument.id, title, url }),
      });

      const result: ApiResponse<DocumentType> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || result.message || 'Failed to update document'
        );
      }

      // Update local state
      setDocuments(
        documents.map((doc) =>
          doc.id === editingDocument.id ? result.data! : doc
        )
      );

      // Show success toast
      toast.success('Document updated', {
        description: `"${title}" has been successfully updated.`,
      });

      setEditingDocument(undefined);
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Error updating document', {
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
      throw error; // Re-throw to be handled by the modal
    }
  };

  // Function to open the edit modal
  const openEditModal = (document: DocumentType) => {
    setEditingDocument(document);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <Button
          onClick={() => {
            setEditingDocument(undefined);
            setIsModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Document
        </Button>
      </div>

      <Card>
        <div className="p-4">
          {isLoading ? (
            <div className="py-4 text-center">Loading documents...</div>
          ) : error ? (
            <div className="text-destructive py-4 text-center">
              {error}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={fetchDocuments}
              >
                Retry
              </Button>
            </div>
          ) : documents.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <div className="mx-auto max-w-md">
                <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-1 text-lg font-semibold">
                  No documents found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Add your first document to start building your knowledge base.
                </p>
                <Button
                  className="mx-auto"
                  onClick={() => {
                    setEditingDocument(undefined);
                    setIsModalOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first document
                </Button>
              </div>
            </div>
          ) : (
            <DocumentTable
              columns={columns}
              data={documents}
              onEdit={openEditModal}
              onDelete={handleDeleteDocument}
              meta={{ deletingIds }}
            />
          )}
        </div>
      </Card>

      {/* Document Modal */}
      {isModalOpen && (
        <DocumentModal
          document={editingDocument}
          onClose={() => {
            setIsModalOpen(false);
            setEditingDocument(undefined);
          }}
          onSubmit={editingDocument ? handleEditDocument : handleAddDocument}
        />
      )}
    </div>
  );
}
