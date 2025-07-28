'use server';

/**
 * ChromaDB Vector Database Integration
 *
 * This module provides a simple interface to ChromaDB for document storage and retrieval
 * using vector embeddings for semantic search capabilities. It uses the Voyage AI
 * embedding model to convert text into vector representations.
 *
 * @requires VOYAGE_AI_API_KEY environment variable to be set
 */
import { ChromaClient, VoyageAIEmbeddingFunction } from 'chromadb';

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
 * Lazy initialization of the collection to avoid build-time issues
 * This will be called only when the collection is actually needed
 */
let _collection: Promise<any> | null = null; // eslint-disable-line @typescript-eslint/no-explicit-any

function getCollection() {
  if (!_collection) {
    _collection = initializeCollection();
  }
  return _collection;
}

async function initializeCollection() {
  try {
    // Initialize embedding function only when needed
    const embedder = new VoyageAIEmbeddingFunction({
      api_key_env_var: 'VOYAGE_AI_API_KEY',
      model: 'voyage-3-large',
    });

    const collection = await client.getOrCreateCollection({
      name: 'knowledge_base',
      embeddingFunction: embedder,
      configuration: {
        hnsw: {
          space: 'cosine',
        },
      },
    });

    return collection;
  } catch (error) {
    console.error('Failed to initialize ChromaDB collection:', error);
    throw new Error('Failed to initialize ChromaDB collection: ' + error);
  }
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
    const collection = await getCollection();
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
 * Adds or updates a document in the vector database
 *
 * @param document - The text content to be stored and embedded
 * @param metadata - Additional information about the document including title and source URL
 * @param id - Unique identifier for the document
 * @returns Promise that resolves when the document has been upserted
 * @throws Error if the operation fails
 */
export async function upsertDocument(
  document: string,
  metadata: DocumentMetadata,
  id: string
) {
  try {
    const collection = await getCollection();
    await collection.upsert({
      documents: [document],
      metadatas: [metadata],
      ids: [id],
    });
  } catch (error) {
    console.error(`Error upserting document with ID ${id}:`, error);
    throw new Error(`Failed to upsert document with ID: ${id}`);
  }
}

/**
 * Deletes a document from the vector database by its ID
 *
 * @param id - The unique identifier of the document to delete
 * @returns Promise that resolves when the document has been deleted
 * @throws Error if the operation fails
 */
export async function deleteDocument(id: string) {
  try {
    const collection = await getCollection();
    await collection.delete({ ids: [id] });
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
export async function queryDocument(query: string, limit: number = 12) {
  try {
    const collection = await getCollection();
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
