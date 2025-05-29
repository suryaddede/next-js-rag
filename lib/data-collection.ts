import { generateText, CoreMessage } from 'ai';
import { google } from '@ai-sdk/google';
import * as cheerio from 'cheerio';
// import dotenv from "dotenv";
import { processRemotePdf } from './pdf-handler';

// Load environment variables
// dotenv.config();

// Make sure we have the API key
// const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
// if (!GOOGLE_API_KEY) {
//   console.warn("Warning: No Google API key found. Set GOOGLE_GENERATIVE_AI_API_KEY in your .env file");
// }

interface FetchAndProcessOptions {
  url: string;
  title: string; // Used for potential future use, like naming output files
}

interface ProcessedData {
  markdown: string;
  sourceUrl: string;
  title: string;
}

/**
 * Fetches data from a URL, processes it, and converts it to Markdown.
 * @param options - The options for fetching and processing data.
 * @returns A promise that resolves to the processed data in Markdown format.
 */
export async function fetchAndProcessData(
  options: FetchAndProcessOptions
): Promise<ProcessedData> {
  const { url, title } = options;

  let determinedContentType: 'html' | 'pdf' | 'json' = 'html'; // Default to html
  let rawContent: Buffer | string;

  try {
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for ${url}`);
    }

    const responseUrl = response.url; // Get the final URL after redirects
    const httpContentType =
      response.headers.get('content-type')?.toLowerCase() || '';

    if (
      httpContentType.includes('application/pdf') ||
      responseUrl.includes('drive.google.com')
    ) {
      if (responseUrl.includes('drive.google.com')) {
        // Handle Google Drive links specifically
        const driveIdMatch = responseUrl.match(/\/d\/([^/]+)/);
        if (driveIdMatch) {
          const driveId = driveIdMatch[1];
          // Construct the direct download URL for Google Drive
          const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${driveId}`;
          console.log(
            `Attempting to download Google Drive file: ${directDownloadUrl}`
          );
          try {
            const driveResponse = await fetch(directDownloadUrl, {
              redirect: 'follow',
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
              },
            });
            if (!driveResponse.ok) {
              throw new Error(
                `Failed to fetch Google Drive file: ${driveResponse.status}`
              );
            }
            const buffer = Buffer.from(await driveResponse.arrayBuffer());
            // Check if buffer has content
            if (buffer.length === 0) {
              throw new Error('Downloaded file is empty');
            }
            determinedContentType = 'pdf';
            rawContent = buffer;
            console.log(
              `Successfully downloaded Google Drive PDF (${buffer.length} bytes)`
            );
          } catch (error) {
            console.error('Error downloading from Google Drive:', error);
            throw new Error(
              `Failed to download from Google Drive: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        } else {
          throw new Error('Invalid Google Drive URL format.');
        }
      } else {
        // Handle regular PDF URLs
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length === 0) {
          throw new Error('Downloaded PDF is empty');
        }
        determinedContentType = 'pdf';
        rawContent = buffer;
        console.log(`Successfully downloaded PDF (${buffer.length} bytes)`);
      }
    } else if (
      httpContentType.includes('application/json') ||
      httpContentType.includes('application/vnd.api+json')
    ) {
      determinedContentType = 'json';
      rawContent = await response.text();
    } else {
      determinedContentType = 'html';
      rawContent = await response.text();
    }

    let extractedText: string | Buffer;

    if (determinedContentType === 'html') {
      const $ = cheerio.load(rawContent as string);
      // Remove unwanted elements
      $(
        'script, style, svg, link, header, footer, nav, aside, form, iframe, noscript'
      ).remove();
      // Optionally, extract text from specific main content areas if identifiable
      // For now, we'll take the whole body's text or the root if body is not present
      extractedText = $('body').length ? $('body').text() : $.text();
      extractedText = extractedText.replace(/\s\s+/g, ' ').trim(); // Clean up whitespace
    } else {
      extractedText = rawContent; // PDF and JSON content are passed as is
    }

    let systemInstruction = '';

    if (determinedContentType === 'pdf') {
      systemInstruction = `Extract all information from this PDF content and convert it to clean and structured markdown:
1. Preserve headings, lists, table, and document structure using proper markdown header, list, and table syntax.
2. Use the following markdown header in a hierarchical manner: #, ##, ###.
3. Include essential details while removing irrelevant content.
4. Format tables using markdown syntax.
5. No additional comments, just the converted content without triple backtick codeblock.`;
    } else if (determinedContentType === 'json') {
      systemInstruction = `Extract all information from this JSON data and convert it to clean markdown table:
1. Convert arrays of objects to markdown tables with proper markdown headers and table syntax.
2. Use just one header (#) for title.
3. Identify table header and plot the data according to it.
4. No additional comments, just the converted content without triple backtick codeblock.`;
    } else {
      // HTML
      systemInstruction = `Extract all information from this HTML content and convert it to clean and structured markdown:
1. Preserve headings, lists, table, and document structure using proper markdown header, list, and table syntax.
2. Use the following markdown header in a hierarchical manner: #, ##, ###.
3. Remove irrelevant elements and formatting.
4. Exclude navigation, header, and footer elements.
5. No additional comments or HTML tags, just the converted content without triple backtick codeblock.`;
    }

    const userMessages: CoreMessage[] = [];
    if (determinedContentType === 'pdf') {
      // For PDF, content should be a data part with base64 encoded string
      try {
        const buffer = extractedText as Buffer;
        console.log(`Converting PDF buffer to base64 (${buffer.length} bytes)`);
        if (buffer.length === 0) {
          // If the PDF buffer is empty, try using the alternative handler
          if (url.includes('drive.google.com')) {
            console.log(
              'Attempting to use alternative PDF handler for Google Drive...'
            );
            const base64Pdf = await processRemotePdf(url);
            console.log(
              `Alternative PDF handler succeeded (${base64Pdf.length} characters)`
            );
            userMessages.push({
              role: 'user',
              content: [
                {
                  type: 'image',
                  image: base64Pdf,
                  mimeType: 'application/pdf',
                },
              ],
            }); // Generate markdown from this PDF using the API
            const { text: markdown } = await generateText({
              model: google('gemini-2.5-flash-preview-05-20'),
              system: systemInstruction,
              messages: userMessages,
            });

            return {
              markdown,
              sourceUrl: url,
              title,
            };
          } else {
            throw new Error('PDF buffer is empty');
          }
        } else {
          const base64Pdf = buffer.toString('base64');
          console.log(
            `Base64 conversion complete (${base64Pdf.length} characters)`
          );
          userMessages.push({
            role: 'user',
            content: [
              { type: 'image', image: base64Pdf, mimeType: 'application/pdf' },
            ],
          });
        }
      } catch (error) {
        console.error('Error processing PDF:', error);
        // If primary method fails for Google Drive, try the alternative method
        if (url.includes('drive.google.com')) {
          try {
            console.log(
              'Primary PDF processing failed, trying alternative method...'
            );
            const base64Pdf = await processRemotePdf(url);
            console.log(
              `Alternative PDF handler succeeded (${base64Pdf.length} characters)`
            );
            userMessages.push({
              role: 'user',
              content: [
                {
                  type: 'image',
                  image: base64Pdf,
                  mimeType: 'application/pdf',
                },
              ],
            }); // Generate markdown from this PDF using the API
            const { text: markdown } = await generateText({
              model: google('gemini-2.5-flash-preview-05-20'),
              system: systemInstruction,
              messages: userMessages,
            });

            return {
              markdown,
              sourceUrl: url,
              title,
            };
          } catch (fallbackError) {
            console.error(
              'Alternative PDF processing also failed:',
              fallbackError
            );
            throw new Error(
              `Failed to process PDF after multiple attempts: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        } else {
          throw new Error(
            `Failed to process PDF: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    } else {
      // For HTML and JSON, extractedText is already a string
      userMessages.push({ role: 'user', content: extractedText as string });
    }

    const { text: markdown } = await generateText({
      model: google('gemini-2.5-flash-preview-05-20'),
      system: systemInstruction,
      messages: userMessages,
    });

    return {
      markdown,
      sourceUrl: url,
      title,
    };
  } catch (error) {
    console.error(`Error processing ${url}:`, error);
    // Return a structured error or rethrow, depending on desired error handling
    return {
      markdown: `Error processing URL: ${url}. ${error instanceof Error ? error.message : String(error)}`,
      sourceUrl: url,
      title,
    };
  }
}

// Example Usage (optional, for testing):
// async function main() {
//   // Test with a sample PDF from Adobe's website
//   const testUrl = "https://ppmb.upnjatim.ac.id/jalur-seleksi-mandiri-cbt/";

//   console.log(`Fetching and processing: ${testUrl}`);
//   try {
//     const processedData = await fetchAndProcessData({ url: testUrl, title: "Adobe PDF Sample" });
//     console.log(`\n--- Markdown for ${processedData.title} (${processedData.sourceUrl}) ---\n`);
//     console.log(processedData.markdown.substring(0, 500) + "..."); // Only show first 500 chars
//   } catch (e) {
//     console.error("Failed to process data:", e);
//   }
// }

// if (require.main === module) {
//   main();
// }
