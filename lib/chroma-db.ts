'use server';

/**
 * ChromaDB Vector Database Integration
 *
 * This module provides a simple interface to ChromaDB for document storage and retrieval
 * using vector embeddings for semantic search capabilities. It uses the Voyage AI
 * embedding model to convert text into vector representations.
 * 
 * Updated to match kb-creation.py prototype logic
 *
 * @requires VOYAGE_AI_API_KEY environment variable to be set
 */
import { ChromaClient, VoyageAIEmbeddingFunction, Collection } from 'chromadb';
import { chunkContent, generateDocumentId } from './chunking';

/**
 * DocumentMetadata type definition
 * Specifies the structure of metadata associated with documents in the database
 */
export type DocumentMetadata = {
  title: string;
  content_type: string;
  source_url: string;
  last_update: string;
};

/**
 * ChromaDB client instance for interacting with the vector database
 */
const client = new ChromaClient({
  path: process.env.CHROMA_URL || 'http://localhost:8000',
});

/**
 * Initialize embedding function (matching prototype kb-creation.py logic)
 */
function initializeEmbeddingFunction() {
  return new VoyageAIEmbeddingFunction({
    api_key_env_var: 'VOYAGE_AI_API_KEY',
    model: process.env.EMBEDDING_MODEL || 'voyage-3-large'
  });
}

/**
 * Get collection with proper initialization (matching prototype logic)
 */
async function getCollection(chromaClient: ChromaClient, embeddingFunction: VoyageAIEmbeddingFunction): Promise<Collection> {
  const collection = await chromaClient.getOrCreateCollection({
    name: 'knowledge_base',
    embeddingFunction: embeddingFunction,
    configuration: { 
      hnsw: { space: 'cosine' }
    }
  });
  
  return collection;
}

/**
 * Lazy initialization to maintain compatibility
 */
let _collectionCache: Promise<Collection> | null = null;
let _embeddingFunctionCache: VoyageAIEmbeddingFunction | null = null;

async function getCollectionInstance(): Promise<Collection> {
  if (!_collectionCache) {
    _embeddingFunctionCache = initializeEmbeddingFunction();
    _collectionCache = getCollection(client, _embeddingFunctionCache);
  }
  return _collectionCache;
}

/**
 * Retrieves documents from the collection
 *
 * @param limit - Optional maximum number of documents to return (default: undefined, returns all documents)
 * @returns Promise that resolves to an object containing documents, their metadata, and IDs
 * @throws Error if the operation fails
 */
export async function getDocuments(limit?: number) {
  try {
    const collection = await getCollectionInstance();
    const result = await collection.get({
      limit: limit,
    });
    return result;
  } catch (error) {
    console.error('Error retrieving documents:', error);
    throw new Error('Failed to retrieve documents from the collection');
  }
}

/**
 * Store content function matching prototype kb-creation.py logic
 * @param markdownizedContent The markdown content to store
 * @param metadata Metadata object with title and source
 * @param collection ChromaDB collection instance
 */
async function storeContent(markdownizedContent: string, metadata: { title: string; source: string }, collection: Collection) {
  const chunkedContent = await chunkContent(markdownizedContent, metadata);
  
  for (let i = 0; i < chunkedContent.length; i++) {
    const document = chunkedContent[i];
    const metadatas = {
      title: metadata.title,
      source: metadata.source,
    };
    
    await collection.upsert({
      documents: [document.content],
      metadatas: [metadatas],
      ids: [`${metadata.title}-${i}`],
    });
  }

  console.log(`Successfully stored ${metadata.title}`);
  return {
    documentId: `${metadata.title}`,
    chunksStored: chunkedContent.length,
    chunks: chunkedContent.map((c, i) => ({ id: `${metadata.title}-${i}`, size: c.content.length })),
  };
}

/**
 * Adds or updates a document in the vector database with intelligent chunking
 * Updated to use prototype logic
 *
 * @param document - The text content to be stored and embedded
 * @param metadata - Additional information about the document including title and source URL
 * @param id - Unique identifier for the document (optional, will be generated if not provided)
 * @returns Promise that resolves when the document has been upserted
 * @throws Error if the operation fails
 */
export async function upsertDocument(
  document: string,
  metadata: DocumentMetadata,
  id?: string
) {
  try {
    const collection = await getCollectionInstance();
    
    // Generate ID if not provided
    const documentId = id || generateDocumentId(metadata.title);
    
    // Delete existing chunks for this document first to avoid orphaned chunks
    if (id) {
      try {
        await deleteDocumentChunks(id);
      } catch {
        // Continue if deletion fails (document might not exist)
        console.warn(`No existing chunks found for document ${id}`);
      }
    }

    // Use the prototype store_content logic
    const result = await storeContent(document, {
      title: metadata.title,
      source: metadata.source_url,
    }, collection);

    return {
      documentId,
      chunksStored: result.chunksStored,
      chunks: result.chunks,
    };
  } catch (error) {
    console.error(`Error upserting document with ID ${id}:`, error);
    throw new Error(`Failed to upsert document with ID: ${id}`);
  }
}

/**
 * Deletes all chunks belonging to a document by finding chunks with matching document title prefix
 *
 * @param documentId - The document ID or title prefix
 * @returns Promise that resolves when all chunks have been deleted
 * @throws Error if the operation fails
 */
async function deleteDocumentChunks(documentId: string) {
  try {
    const collection = await getCollectionInstance();
    
    // Get all documents to find matching chunks
    const allDocs = await collection.get();
    
    // Find all chunk IDs that belong to this document (based on title prefix)
    const chunkIdsToDelete: string[] = [];
    
    if (allDocs.ids) {
      for (let i = 0; i < allDocs.ids.length; i++) {
        const id = allDocs.ids[i];
        // Match chunks that start with the document title or exact document ID
        if (id.startsWith(documentId) || id === documentId) {
          chunkIdsToDelete.push(id);
        }
      }
    }
    
    // Delete all found chunk IDs
    if (chunkIdsToDelete.length > 0) {
      await collection.delete({ ids: chunkIdsToDelete });
      console.log(`Deleted ${chunkIdsToDelete.length} chunks for document ${documentId}`);
    }
  } catch (error) {
    console.error(`Error deleting chunks for document ${documentId}:`, error);
    throw new Error(`Failed to delete chunks for document: ${documentId}`);
  }
}

/**
 * Deletes a document from the vector database by its ID
 * Handles both single documents and chunked documents
 *
 * @param id - The unique identifier of the document to delete
 * @returns Promise that resolves when the document has been deleted
 * @throws Error if the operation fails
 */
export async function deleteDocument(id: string) {
  try {
    // Delete all chunks that match this document ID/title
    await deleteDocumentChunks(id);
    
    console.log(`Successfully deleted document and all associated chunks: ${id}`);
  } catch (error) {
    console.error(`Error deleting document with ID ${id}:`, error);
    throw new Error(`Failed to delete document with ID: ${id}`);
  }
}

/**
 * Performs a semantic search query against the document collection
 *
 * @param query - The search text to find semantically similar documents for
 * @param limit - Maximum number of results to return (default: 5)
 * @returns Promise that resolves to the query results containing matching documents,
 *          their metadata, and relevance scores
 * @throws Error if the operation fails
 */
export async function queryDocument(
  query: string | string[],
  limit: number = 7
) {
  try {
    const collection = await getCollectionInstance();
    const results = await collection.query({
      queryTexts: query,
      nResults: limit,
    });
    return results;
  } catch (error) {
    console.error(`Error querying documents with query "${query}":`, error);
    throw new Error(`Failed to query documents with query: ${query}`);
  }
}
