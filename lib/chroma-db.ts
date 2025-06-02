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
};

/**
 * ChromaDB client instance for interacting with the vector database
 */
const client = new ChromaClient({
  path: 'http://localhost:8000',
});

/**
 * Embedding function that converts text to vector representations using Voyage AI
 * Requires the VOYAGE_AI_API_KEY environment variable to be properly set
 */
const embedder = new VoyageAIEmbeddingFunction({
  api_key_env_var: 'VOYAGE_AI_API_KEY',
  model: 'voyage-3-large',
});

/**
 * Document collection in ChromaDB
 * Uses cosine similarity for nearest neighbor search in the HNSW index
 */
const collection = client
  .getOrCreateCollection({
    name: 'knowledge_base',
    embeddingFunction: embedder,
    configuration: {
      hnsw: {
        space: 'cosine',
      },
    },
  })
  .catch((error) => {
    throw new Error('Failed to initialize ChromaDB collection', error);
  });

/**
 * Retrieves documents from the collection
 *
 * @param limit - Optional maximum number of documents to return (default: undefined, returns all documents)
 * @returns Promise that resolves to an object containing documents, their metadata, and IDs
 * @throws Error if the operation fails
 */
export async function getDocuments(limit?: number) {
  try {
    const result = await (
      await collection
    ).get({
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
 * @returns Promise that resolves when the document has been added
 * @throws Error if the operation fails
 */
export async function addDocument(
  document: string,
  metadata: DocumentMetadata,
  id: string
) {
  try {
    await (
      await collection
    ).upsert({
      documents: [document],
      metadatas: [metadata],
      ids: [id],
    });
  } catch (error) {
    console.error(`Error adding document with ID ${id}:`, error);
    throw new Error(`Failed to add document with ID: ${id}`);
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
    await (await collection).delete({ ids: [id] });
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
    const results = await (
      await collection
    ).query({
      queryTexts: query,
      nResults: limit,
    });
    return results;
  } catch (error) {
    console.error(`Error querying documents with query "${query}":`, error);
    throw new Error(`Failed to query documents with query: ${query}`);
  }
}
