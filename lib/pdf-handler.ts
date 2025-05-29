/**
 * PDF Handler - Alternative methods for handling PDF files
 * This module provides alternative ways to download and process PDF files,
 * especially for problematic sources like Google Drive.
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import os from 'os';
import { downloadGoogleDriveFile } from './gdrive-downloader';
import type { ReadableStream } from 'node:stream/web';

// Promisify some fs functions
// const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

/**
 * Downloads a file from a URL and saves it to a temporary location
 * @param url URL to download from
 * @returns Path to the downloaded file
 */
export async function downloadFile(url: string): Promise<string> {
  // For Google Drive files, convert to a direct download URL
  if (url.includes('drive.google.com')) {
    const driveIdMatch = url.match(/\/d\/([^/]+)/);
    if (driveIdMatch) {
      const driveId = driveIdMatch[1];
      url = `https://drive.google.com/uc?export=download&id=${driveId}`;
    }
  }

  // Create a temporary file path
  const tempDir = os.tmpdir();
  const tempPath = path.join(tempDir, `download-${Date.now()}.pdf`);

  console.log(`Downloading file from ${url} to ${tempPath}`);

  try {
    // Use a robust download method with multiple user agents
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Save the file directly to disk using streams
    const fileStream = fs.createWriteStream(tempPath);
    const body = Readable.fromWeb(response.body as unknown as ReadableStream);
    await finished(body.pipe(fileStream));

    // Check if file was created and has content
    const stats = fs.statSync(tempPath);
    if (stats.size === 0) {
      throw new Error('Downloaded file is empty');
    }

    console.log(`Download complete: ${stats.size} bytes`);
    return tempPath;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error(
      `Download failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Reads a PDF file from disk and returns it as a base64 string
 * @param filePath Path to the PDF file
 * @returns Base64 encoded PDF content
 */
export async function readPdfAsBase64(filePath: string): Promise<string> {
  try {
    const buffer = await readFile(filePath);
    return buffer.toString('base64');
  } finally {
    // Clean up the temporary file
    try {
      await unlink(filePath);
    } catch (error) {
      console.warn(
        `Warning: Could not delete temporary file ${filePath}`,
        error
      );
    }
  }
}

/**
 * Main function to handle PDF processing from a URL
 * @param url URL pointing to a PDF file
 * @returns Base64 encoded content of the PDF
 */
export async function processRemotePdf(url: string): Promise<string> {
  // Use specialized Google Drive handler for Google Drive URLs
  if (url.includes('drive.google.com')) {
    try {
      console.log('Using specialized Google Drive handler...');
      const buffer = await downloadGoogleDriveFile(url);
      return buffer.toString('base64');
    } catch (error) {
      console.error('Specialized Google Drive handler failed:', error);
      console.log('Falling back to standard download method...');
    }
  }

  // Standard method for non-Google Drive PDFs or as fallback
  const filePath = await downloadFile(url);
  return await readPdfAsBase64(filePath);
}
