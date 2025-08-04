import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, upsertDocument, deleteDocument } from '@/lib/chroma-db';
import { convertToMarkdown } from '@/lib/url-to-markdown';

/**
 * GET - Retrieve all documents
 * Optional query parameter "limit" to restrict number of results
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.has('limit')
      ? parseInt(searchParams.get('limit') as string, 10)
      : undefined;

    const results = await getDocuments(limit);
    return NextResponse.json({
      success: true,
      message: 'Documents retrieved successfully',
      data: results,
    });
  } catch (error) {
    console.error('Error retrieving documents:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve documents',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new document
 * Required body: { title: string, url: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, url } = body;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: 'Title is required' },
        { status: 400 }
      );
    }

    if (!url || !url.trim()) {
      return NextResponse.json(
        { success: false, message: 'URL is required' },
        { status: 400 }
      );
    }

    try {
      // Basic URL validation
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Generate a unique document ID
    const docId = `doc-${Date.now()}`;

    // Convert URL to markdown
    const markdownResult = await convertToMarkdown(url);

    // Create metadata for ChromaDB
    const metadata = {
      title: title.trim(),
      content_type: markdownResult.contentType,
      source_url: markdownResult.sourceUrl,
      last_update: new Date().toISOString(),
    };

    // Upsert document to ChromaDB
    const result = await upsertDocument(markdownResult.markdown, metadata, docId);

    return NextResponse.json(
      {
        success: true,
        message: 'Document created successfully',
        data: {
          id: result.documentId,
          title: title.trim(),
          type: markdownResult.contentType,
          size: `${markdownResult.markdown.length} chars`,
          chunks: result.chunksStored,
          updated: metadata.last_update,
          url: markdownResult.sourceUrl,
          chunkDetails: result.chunks,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create document',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update an existing document
 * Required body: { id: string, title: string, url: string }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, url } = body;

    // Validation
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Document ID is required' },
        { status: 400 }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: 'Title is required' },
        { status: 400 }
      );
    }

    if (!url || !url.trim()) {
      return NextResponse.json(
        { success: false, message: 'URL is required' },
        { status: 400 }
      );
    }

    try {
      // Basic URL validation
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Convert URL to markdown
    const markdownResult = await convertToMarkdown(url);

    // Create metadata for ChromaDB
    const metadata = {
      title: title.trim(),
      content_type: markdownResult.contentType,
      source_url: markdownResult.sourceUrl,
      last_update: new Date().toISOString(),
    };

    // Upsert document to ChromaDB with the same ID
    const result = await upsertDocument(markdownResult.markdown, metadata, id);

    return NextResponse.json({
      success: true,
      message: 'Document updated successfully',
      data: {
        id: result.documentId,
        title: title.trim(),
        type: markdownResult.contentType,
        size: `${markdownResult.markdown.length} chars`,
        chunks: result.chunksStored,
        updated: metadata.last_update,
        url: markdownResult.sourceUrl,
        chunkDetails: result.chunks,
      },
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update document',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove a document by ID
 * Required query parameter "id"
 */
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Document ID is required' },
        { status: 400 }
      );
    }

    await deleteDocument(id);

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete document',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
