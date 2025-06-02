import { google, GoogleGenerativeAIProviderOptions } from '@ai-sdk/google';
import { generateText } from 'ai';
import * as cheerio from 'cheerio';

// Define content types and interfaces
export type ContentType = 'pdf' | 'json' | 'html';
type ContentMap = Record<ContentType, string>;

export type UserContent = Array<
  | { type: 'text'; text: string }
  | { type: 'file'; mimeType: string; data: ArrayBuffer | string /* URL */ }
>;

// Configuration constants
const CONTENT_TYPES: Record<string, ContentType> = {
  'application/pdf': 'pdf',
  'application/octet-stream': 'pdf',
  'application/json': 'json',
  'application/vnd.api+json': 'json',
  'text/html': 'html',
};

const MODEL = {
  pdf: 'gemini-2.0-flash',
  json: 'gemini-2.5-flash-preview-05-20',
  html: 'gemini-2.5-flash-preview-05-20',
};

// Prompt templates
const PROMPTS: ContentMap = {
  pdf: `Extract all information from this PDF content and convert it to clean and structured markdown:
1. Preserve headings, lists, table, and document structure using proper markdown header, list, and table syntax
2. Use the following markdown header in a hierarchical manner: #, ##, ###
3. Include essential details while removing irrelevant content
4. Format tables using markdown syntax
5. No additional comments, just the converted content without triple backtick codeblock`,

  json: `Extract all information from this JSON data and convert it to clean markdown table:
1. Convert arrays of objects to markdown tables with proper markdown headers and table syntax
2. Use just one header(#) for title
3. Identify table header and plot the data according to it
4. No additional comments, just the converted content without triple backtick codeblock`,

  html: `Extract all information from this HTML content and convert it to clean and structured markdown:
1. Preserve headings, lists, table, and document structure using proper markdown header, list, and table syntax
2. Use the following markdown header in a hierarchical manner: #, ##, ###
3. Remove irrelevant elements and formatting
4. Exclude navigation, header, and footer elements
5. No additional comments or HTML tags, just the converted content without triple backtick codeblock`,
};

/**
 * Check if the URL is a Google Drive link and convert it to a direct download link.
 * @param url The URL to check and potentially convert
 * @returns The resolved URL (either original or direct Google Drive download link)
 */
function isGoogleDriveUrl(url: string): string {
  if (!url.includes('drive.google.com')) return url;

  const fileId = url.match(/\/d\/([^/]+)/) || url.match(/id=([^&]+)/);
  return fileId
    ? `https://drive.google.com/uc?export=download&id=${fileId[1]}`
    : url;
}

/**
 * Fetch content details from URL, process HTML if necessary.
 * @param initialUrl The URL to fetch content from
 * @returns Object containing content type, resolved URL and text content (if applicable)
 */
async function fetchContent(initialUrl: string): Promise<{
  contentType: ContentType;
  resolvedUrl: string;
  textContent?: string;
}> {
  try {
    const resolvedUrl = isGoogleDriveUrl(initialUrl);
    const response = await fetch(resolvedUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const contentTypeHeader =
      response.headers.get('content-type')?.split(';')[0] || '';
    const determinedContentType = CONTENT_TYPES[contentTypeHeader] || 'html';

    if (determinedContentType === 'html') {
      const textContent = await response.text();
      const $ = cheerio.load(textContent);

      // Remove unwanted elements that are typically irrelevant
      $(
        'script, style, svg, link, header, footer, nav, aside, form, iframe, noscript, meta'
      ).remove();
      $(
        '.ads, .ad-container, .advertisement, .banner, .social-share, .tracking, .cookie-notice, .popup, .modal'
      ).remove();

      // Extract main content from common content containers
      const mainContent = $(
        'main, #main, #content, .main-content, article, .article, .post, .entry'
      ).length
        ? $(
            'main, #main, #content, .main-content, article, .article, .post, .entry'
          )
        : $('body');

      // Clean up whitespace and get the text
      const processedHtml = mainContent.length
        ? mainContent.html() || ''
        : $.html('body');
      return {
        contentType: determinedContentType,
        resolvedUrl,
        textContent: processedHtml,
      };
    } else if (determinedContentType === 'json') {
      const jsonText = await response.text();
      return {
        contentType: determinedContentType,
        resolvedUrl,
        textContent: jsonText,
      };
    } else {
      // PDF
      // For PDF, we pass the URL directly to the AI.
      return { contentType: determinedContentType, resolvedUrl };
    }
  } catch (error) {
    console.error(`Error fetching content details from ${initialUrl}:`, error);
    throw new Error(
      `Failed to fetch content details: ${(error as Error).message}`
    );
  }
}

/**
 * Result of URL to markdown conversion
 */
export interface MarkdownResult {
  /** The converted markdown content */
  markdown: string;
  /** The source URL (resolved, e.g. from Google Drive links) */
  sourceUrl: string;
  /** The type of the content that was converted */
  contentType: ContentType;
}

/**
 * Convert web content from a URL to markdown format using AI
 * @param url The URL of the content to convert (HTML, JSON, or PDF)
 * @returns A promise that resolves to an object containing the markdown content and source URL
 */
export async function convertToMarkdown(url: string): Promise<MarkdownResult> {
  const { contentType, resolvedUrl, textContent } = await fetchContent(url);

  // Prepare content for AI processing based on type
  let userContent: UserContent;

  if (contentType === 'pdf') {
    userContent = [
      { type: 'file', mimeType: 'application/pdf', data: resolvedUrl },
    ];
  } else {
    if (textContent === undefined) {
      throw new Error('Processed HTML content is missing for HTML type.');
    }
    userContent = [{ type: 'text', text: textContent }];
  }

  // Generate markdown with AI
  const { text } = await generateText({
    model: google(MODEL[contentType]),
    system: PROMPTS[contentType],
    messages: [{ role: 'user', content: userContent }],
    temperature: 0.1,
    providerOptions: {
      google: {
        responseModalities: ['TEXT'],
        thinkingConfig: {
          thinkingBudget: 0,
        },
      } satisfies GoogleGenerativeAIProviderOptions,
    },
  });

  return {
    markdown: text,
    sourceUrl: resolvedUrl,
    contentType,
  };
}

export default convertToMarkdown;
