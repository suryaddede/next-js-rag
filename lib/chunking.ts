import { getEncoding } from 'js-tiktoken';

/**
 * Chunking utility for processing markdown content into smaller pieces
 * Advanced hybrid approach:
 * 1. First split by markdown headings to preserve document structure.
 * 2. Recursively split oversized sections using a list of separators (paragraph, line, space, char).
 * 3. Enforce token-based max size with configurable overlap.
 * 4. Uses js-tiktoken for token counting (no WASM issues).
 */

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

/** Token counter using js-tiktoken */
function countTokens(text: string): number {
  try {
    const encoding = getEncoding('cl100k_base');
    return encoding.encode(text).length;
  } catch (error) {
    console.error('Error counting tokens:', error);
    return Math.ceil(text.length / 4);
  }
}

/**
 * Utility: hard slice a long text by tokens with overlap
 */
function sliceByTokens(text: string, maxTokens: number, overlapTokens: number): string[] {
  const enc = getEncoding('cl100k_base');
  const tokenIds = enc.encode(text);
  const chunks: string[] = [];
  let start = 0;
  while (start < tokenIds.length) {
    const end = Math.min(start + maxTokens, tokenIds.length);
    const windowIds = tokenIds.slice(start, end);
    chunks.push(enc.decode(windowIds));
    if (end === tokenIds.length) break;
    start = end - overlapTokens; // step forward with overlap
    if (start < 0) start = 0;
  }
  return chunks;
}

/**
 * Recursive splitter: tries separators in order; if still too big, falls back to token slicing
 */
function recursiveSplit(
  text: string,
  maxTokens: number,
  overlapTokens: number,
  separators: string[],
  out: string[]
) {
  if (!text.trim()) return;
  if (countTokens(text) <= maxTokens) {
    out.push(text.trim());
    return;
  }
  if (separators.length === 0) {
    const slices = sliceByTokens(text, maxTokens, overlapTokens);
    slices.forEach(s => out.push(s.trim()));
    return;
  }
  const [sep, ...rest] = separators;
  // If separator not present, move to next
  if (sep && !text.includes(sep)) {
    recursiveSplit(text, maxTokens, overlapTokens, rest, out);
    return;
  }
  const parts = sep ? text.split(sep) : [text];
  if (parts.length === 1) {
    recursiveSplit(text, maxTokens, overlapTokens, rest, out);
    return;
  }
  let buffer = '';
  for (let i = 0; i < parts.length; i++) {
    const candidate = buffer ? buffer + (sep || '') + parts[i] : parts[i];
    if (countTokens(candidate) > maxTokens && buffer) {
      recursiveSplit(buffer, maxTokens, overlapTokens, rest, out);
      buffer = parts[i];
    } else {
      buffer = candidate;
    }
  }
  if (buffer) recursiveSplit(buffer, maxTokens, overlapTokens, rest, out);
}

/**
 * Extract top-level sections by markdown headings (#, ##, ### ...) retaining the heading with its body
 */
function splitByHeadings(markdown: string): { heading: string; body: string }[] {
  const lines = markdown.split(/\n/);
  const sections: { heading: string; body: string }[] = [];
  let currentHeading = 'Document Start';
  let buffer: string[] = [];
  const headingRegex = /^(#{1,6})\s+/;
  for (const line of lines) {
    if (headingRegex.test(line)) {
      if (buffer.length) {
        sections.push({ heading: currentHeading, body: buffer.join('\n').trim() });
      }
      currentHeading = line.trim();
      buffer = [];
    } else {
      buffer.push(line);
    }
  }
  if (buffer.length) sections.push({ heading: currentHeading, body: buffer.join('\n').trim() });
  return sections.length ? sections : [{ heading: 'Document', body: markdown }];
}

/**
 * Main advanced chunker
 */
export async function chunkContent(
  markdownizedContent: string,
  metadata: { title: string; source: string },
  limit?: number
): Promise<ContentChunk[]> {
  const chunkLimitTokens = limit || (process.env.CHUNK_SIZE ? parseInt(process.env.CHUNK_SIZE, 10) : 2000);
  const overlapTokens = process.env.CHUNK_OVERLAP ? parseInt(process.env.CHUNK_OVERLAP, 10) : 200;

  const totalTokens = countTokens(markdownizedContent);
  console.log(`[chunking] Total tokens for "${metadata.title}": ${totalTokens}`);
  console.log(`[chunking] Using max ${chunkLimitTokens} tokens with ${overlapTokens} overlap.`);

  // Step 1: structural split by headings
  const sections = splitByHeadings(markdownizedContent);

  // Step 2: recursively process each section
  const rawChunks: string[] = [];
  const separators = ['\n\n', '\n', ' ', ''];
  for (const section of sections) {
    const sectionText = `${section.heading}\n${section.body}`.trim();
    recursiveSplit(sectionText, chunkLimitTokens, overlapTokens, separators, rawChunks);
  }

  // Step 3: Deduplicate accidental empties & trim
  const cleaned = rawChunks.map(c => c.trim()).filter(c => c);

  // Step 4: Re-index & build metadata
  const chunks: ContentChunk[] = cleaned.map((content, index) => ({
    content,
    metadata: {
      title: metadata.title,
      source: metadata.source,
      chunkIndex: index,
      totalChunks: cleaned.length,
    },
    id: `${metadata.title}-${index}`,
  }));

  console.log(`[chunking] Produced ${chunks.length} chunks.`);
  return chunks;
}

/** Generate a unique document ID */
export function generateDocumentId(title: string): string {
  const timestamp = Date.now();
  const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50);
  return `doc-${sanitizedTitle}-${timestamp}`;
}
