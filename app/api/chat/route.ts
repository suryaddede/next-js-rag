import { google } from '@ai-sdk/google';
import { smoothStream, streamText } from 'ai';
import { queryDocument } from '@/lib/chroma-db';

export const maxDuration = 60;

interface Message {
  role: string;
  content: string | object;
}

interface DocumentMetadata {
  title?: string;
  source_url?: string;
  content_type?: string;
  last_update?: string;
  [key: string]: string | number | boolean | undefined;
}

// Define ChromaDB query result structure
interface ChromaQueryResult {
  ids: string[][];
  embeddings: number[][][] | null;
  documents: string[][] | null;
  metadatas: Record<string, string | number | boolean | undefined>[][] | null;
  distances: number[][] | null;
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Get the latest user message to query the database
  const latestMessage = messages
    .filter((msg: Message) => msg.role === 'user')
    .pop();

  // Query ChromaDB for relevant documents based on the user's question
  let context = '';
  const sources: Array<{ title: string; url: string }> = [];
  let rawMetadata: Record<string, string | number | boolean | undefined>[][] =
    [];

  if (latestMessage?.content) {
    try {
      const queryResults = (await queryDocument(
        latestMessage.content.toString()
      )) as ChromaQueryResult;

      // Store raw metadata for later use
      rawMetadata = queryResults.metadatas || [];

      if (queryResults.documents && queryResults.documents.length > 0) {
        // Create context from document contents
        context = queryResults.documents
          .filter(
            (docGroup): docGroup is string[] =>
              Array.isArray(docGroup) && docGroup.every((item) => item !== null)
          )
          .map((docGroup: string[], i: number) => {
            if (
              docGroup.length > 0 &&
              queryResults.metadatas &&
              queryResults.metadatas[i]
            ) {
              const metadata = queryResults.metadatas[
                i
              ] as unknown as DocumentMetadata;
              sources.push({
                title: metadata.title || 'Unknown Document',
                url: metadata.source_url || '#',
              });
              return `Document: ${metadata.title || 'Untitled Document'}\n${docGroup[0]}`;
            }
            return '';
          })
          .filter(Boolean)
          .join('\n\n');
      }
    } catch (error) {
      console.error('Error querying documents:', error);
    }
  }

  const promptTemplate = `
Anda adalah asisten AI yang bertugas menjawab pertanyaan seputar Penerimaan Peserta Mahasiswa Baru (PPMB) di UPN "Veteran" Jawa Timur.

Anda akan diberikan pertanyaan, konteks, dan metadata konteks untuk menjawab pertanyaan tersebut.

**Langkah-langkah yang harus Anda ikuti:**

1. **Analisis Konteks:** Teliti setiap dokumen dalam konteks dan identifikasi apakah dokumen tersebut berisi jawaban atas pertanyaan. Berikan skor relevansi pada setiap dokumen berdasarkan seberapa erat kaitannya dengan pertanyaan.
2. **Prioritaskan Dokumen:** Urutkan dokumen berdasarkan skor relevansi, dengan dokumen yang paling relevan di awal. Abaikan dokumen yang tidak relevan dengan pertanyaan.
3. **Buat Ringkasan:** Berdasarkan dokumen-dokumen yang paling relevan, buatlah ringkasan umum tentang topik pertanyaan.
4. **Berikan Jawaban:** Berikan jawaban yang spesifik dan detail, didukung oleh informasi dari dokumen-dokumen yang relevan. Pastikan penjelasan Anda minimal 100 kata dan menggunakan Bahasa Indonesia yang baik dan benar.
5. **Keterbatasan Informasi:** Jika jawaban tidak dapat ditemukan dalam konteks yang diberikan, nyatakan dengan jelas bahwa Anda tidak memiliki cukup informasi untuk menjawab pertanyaan.
6. **Format Jawaban:**
    * Jangan menyebutkan proses yang Anda lakukan untuk mendapatkan jawaban, langsung berikan jawaban saja.
    * Anda dapat menggunakan format Markdown untuk memformat jawaban Anda.
    * Sertakan URL sumber dokumen yang Anda gunakan untuk menjawab pertanyaan di akhir jawaban.


**Contoh:**

**Pertanyaan:** Apa saja persyaratan untuk mendaftar jalur mandiri di UPN Veteran Jawa Timur?

**Jawaban:**

Untuk mendaftar jalur mandiri di UPN Veteran Jawa Timur, calon mahasiswa harus memenuhi beberapa persyaratan, antara lain:

... (penjelasan lebih detail minimal 100 kata) ...

Sumber: [Nama dokumen](URL sumber dokumen)
`; // Include the raw metadata rather than formatting as sources
  const metadataContext =
    rawMetadata.length > 0
      ? JSON.stringify(rawMetadata, null, 2)
      : 'No metadata available';

  const user_prompt = `
Context:
${context}

Metadata:
${metadataContext}

Original Query: ${latestMessage.content.toString()}

Answer:
`;

  const result = streamText({
    model: google('gemini-2.0-flash'),
    // system: "Markdown supported.",
    system: promptTemplate,
    prompt: user_prompt,
    experimental_transform: smoothStream({
      delayInMs: 25,
    }),
  });

  // No need for sendSources since we're manually including them in the prompt
  return result.toDataStreamResponse();
}
