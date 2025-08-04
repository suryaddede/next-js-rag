import { getEncoding } from 'js-tiktoken';

/**
 * Chunking utility for processing markdown content into smaller pieces
 * Based on prototype kb-creation.py logic with token count and header-based splitting
 * Uses js-tiktoken for reliable token counting without WebAssembly dependencies
 */

// Default chunk size - can be overridden by environment variable
const DEFAULT_CHUNK_SIZE = 1000;

/**
 * Represents a chunk of content with metadata
 */
export interface ContentChunk {
  content: string;
  metadata: {
    title: string;
    source: string;
    chunkIndex: number;
    totalChunks: number;
  };
  id: string;
}

/**
 * Simple markdown header splitter based on the prototype logic
 * Splits content based on headers when content exceeds token limit
 */
class SimpleMarkdownHeaderSplitter {
  private headers: Array<{ level: string; name: string }>;
  private stripHeaders: boolean;

  constructor(headers: Array<{ level: string; name: string }>, stripHeaders = false) {
    this.headers = headers;
    this.stripHeaders = stripHeaders;
  }

  splitText(text: string): Array<{ page_content: string }> {
    const chunks: Array<{ page_content: string }> = [];
    
    // Sort headers by level (# before ##)
    const sortedHeaders = [...this.headers].sort((a, b) => a.level.length - b.level.length);
    
    // Create regex pattern for all headers
    const headerPattern = sortedHeaders.map(h => `^${h.level.replace('#', '\\#')}\\s+`).join('|');
    const regex = new RegExp(`(${headerPattern})`, 'gm');
    
    // Split by headers
    const parts = text.split(regex);
    
    let currentChunk = '';
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      // If this part is a header marker, add it to current chunk
      if (sortedHeaders.some(h => part.trim().startsWith(h.level))) {
        if (currentChunk.trim()) {
          chunks.push({ page_content: currentChunk.trim() });
        }
        currentChunk = this.stripHeaders ? '' : part;
      } else {
        currentChunk += part;
      }
    }
    
    // Add the last chunk
    if (currentChunk.trim()) {
      chunks.push({ page_content: currentChunk.trim() });
    }
    
    // If no chunks were created (no headers found), return the original text
    if (chunks.length === 0) {
      chunks.push({ page_content: text });
    }
    
    return chunks;
  }
}

/**
 * Count tokens in text using js-tiktoken (matching prototype logic)
 * @param text The text to count tokens for
 * @returns Number of tokens
 */
function countTokens(text: string): number {
  try {
    const encoding = getEncoding('cl100k_base');
    const tokens = encoding.encode(text);
    const tokenCount = tokens.length;
    // Note: js-tiktoken doesn't require explicit free() call
    return tokenCount;
  } catch (error) {
    console.error('Error counting tokens:', error);
    // Fallback to rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

/**
 * Chunk content using the prototype kb-creation.py logic
 * @param markdownizedContent The markdown content to chunk
 * @param metadata Base metadata for the chunks
 * @param limit Maximum tokens per chunk (defaults to env var or 1000)
 * @returns Array of content chunks
 */
export async function chunkContent(
  markdownizedContent: string,
  metadata: { title: string; source: string },
  limit?: number
): Promise<ContentChunk[]> {
  const chunkLimit = limit || 
    (process.env.CHUNK_SIZE ? parseInt(process.env.CHUNK_SIZE, 10) : DEFAULT_CHUNK_SIZE);

  const numTokens = countTokens(markdownizedContent);
  console.log(`Number of tokens in content: ${numTokens}`);

  // Determine headers based on token count (matching prototype logic)
  const headers = numTokens <= chunkLimit 
    ? [{ level: '#', name: 'Header 1' }]
    : [{ level: '#', name: 'Header 1' }, { level: '##', name: 'Header 2' }];

  const splitter = new SimpleMarkdownHeaderSplitter(headers, false);
  const chunkedContent = splitter.splitText(markdownizedContent);

  const chunks: ContentChunk[] = chunkedContent.map((document, index) => ({
    content: document.page_content,
    metadata: {
      title: metadata.title,
      source: metadata.source,
      chunkIndex: index,
      totalChunks: chunkedContent.length,
    },
    id: `${metadata.title}-${index}`,
  }));

  console.log(`Content split into ${chunks.length} chunks`);
  return chunks;
}

/**
 * Generate a unique document ID based on title and timestamp
 * @param title Document title
 * @returns Unique document ID
 */
export function generateDocumentId(title: string): string {
  const timestamp = Date.now();
  const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50);
  return `doc-${sanitizedTitle}-${timestamp}`;
}
