/**
 * Google Drive Downloader
 * This module provides specialized handling for Google Drive URLs
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { promisify } from 'util';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { createWriteStream } from 'fs';
import type { ReadableStream } from 'node:stream/web';

// Promisify fs functions
const readFile = promisify(fs.readFile);
// const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

// Different user agents to try
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/114.0.1823.58 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0',
];

/**
 * Creates a temporary file path
 */
function getTempFilePath(extension: string = 'pdf'): string {
  const tempDir = os.tmpdir();
  return path.join(tempDir, `gdrive-${Date.now()}.${extension}`);
}

/**
 * Extracts Google Drive file ID from a URL
 */
export function extractGoogleDriveId(url: string): string | null {
  // Handle different Google Drive URL formats
  const patterns = [
    /\/file\/d\/([^/]+)/, // Standard file link
    /id=([^&]+)/, // Export link
    /\/open\?id=([^&]+)/, // Open link
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Creates a direct download URL for a Google Drive file
 */
export function getGoogleDriveDirectUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Downloads a file from Google Drive
 */
export async function downloadGoogleDriveFile(url: string): Promise<Buffer> {
  console.log(`Attempting to download Google Drive file: ${url}`);

  // Extract the file ID
  const fileId = extractGoogleDriveId(url);
  if (!fileId) {
    throw new Error(`Could not extract file ID from Google Drive URL: ${url}`);
  }

  // Create direct download URL
  const directUrl = getGoogleDriveDirectUrl(fileId);
  console.log(`Direct download URL: ${directUrl}`);

  // Try different user agents
  for (const userAgent of USER_AGENTS) {
    try {
      console.log(
        `Trying download with user agent: ${userAgent.substring(0, 25)}...`
      );

      const response = await fetch(directUrl, {
        headers: {
          'User-Agent': userAgent,
          Accept: 'application/pdf,*/*',
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        console.warn(`Attempt failed with status: ${response.status}`);
        continue;
      }

      // Get content type to verify it's a PDF
      const contentType = response.headers.get('content-type');
      console.log(`Received content-type: ${contentType}`);

      // Save to temporary file
      const tempPath = getTempFilePath();
      const fileStream = createWriteStream(tempPath);
      const body = Readable.fromWeb(response.body as unknown as ReadableStream);

      await finished(body.pipe(fileStream));
      console.log(`Saved downloaded file to: ${tempPath}`);

      // Read file into buffer
      const buffer = await readFile(tempPath);
      console.log(`File size: ${buffer.length} bytes`);

      // Clean up temp file
      try {
        await unlink(tempPath);
      } catch (e) {
        console.warn(`Could not delete temporary file: ${tempPath}`, e);
      }

      if (buffer.length === 0) {
        console.warn('Downloaded file is empty, trying next method...');
        continue;
      }

      return buffer;
    } catch (error) {
      console.warn(`Download attempt failed:`, error);
    }
  }

  // If all methods failed, try with a cookie bypass approach
  try {
    console.log(
      'Trying alternative download method with cookie confirmation...'
    );

    // First request to get cookies
    const cookieResponse = await fetch(
      `https://drive.google.com/file/d/${fileId}/view`,
      {
        headers: {
          'User-Agent': USER_AGENTS[0],
        },
      }
    );

    if (!cookieResponse.ok) {
      throw new Error(`Cookie request failed: ${cookieResponse.status}`);
    }

    // Extract cookies
    const cookies = cookieResponse.headers.get('set-cookie') || '';
    console.log(`Got cookies, length: ${cookies.length}`);

    // Second request with cookies
    const downloadResponse = await fetch(directUrl, {
      headers: {
        'User-Agent': USER_AGENTS[0],
        Cookie: cookies,
        Accept: 'application/pdf,*/*',
      },
      redirect: 'follow',
    });

    if (!downloadResponse.ok) {
      throw new Error(`Download request failed: ${downloadResponse.status}`);
    }

    const buffer = Buffer.from(await downloadResponse.arrayBuffer());

    if (buffer.length === 0) {
      throw new Error('Downloaded file is empty');
    }

    console.log(`Successfully downloaded file, size: ${buffer.length} bytes`);
    return buffer;
  } catch (error) {
    console.error('All download methods failed:', error);
    throw new Error(
      `Could not download Google Drive file: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
