import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { queryDocument } from './chroma-db';

/**
 * Enhanced RAG Chatbot class implementing the Python prototype features
 * Includes query rewriting, multi-language support, and improved retrieval
 */

interface RetrievedInformation {
  ids: string[];
  documents: string[];
  metadatas: Record<string, string | number | boolean | undefined>[];
}

export class RAGChatbot {
  // Query rewriter prompt for career/entrepreneurship context
  private static readonly REWRITER_PROMPT = `
You are a query rewriter that rewrites a query to be more easily understood by a search engine or a question-answering system focused on career development and entrepreneurship for graduates and final year students.
Given a query, rewrite it to be clearer and more specific.
Here are some guidelines for rewriting queries:

1. Remove unnecessary words or phrases.
2. Use more specific terms related to career, job search, entrepreneurship, or professional development.
3. Rephrase the query in a more natural way.
4. Ensure the query is grammatically correct.
5. Response with 3 alternative query without your comment and without numbering in the same language as the original query

Example:
Original Query:
Bagaimana cara mencari kerja?

Rewritten Query:
Strategi efektif untuk mencari pekerjaan pertama setelah lulus kuliah.
Tips dan cara mencari lowongan kerja yang sesuai dengan jurusan.
Panduan lengkap mencari pekerjaan untuk fresh graduate.
`;

  /**
   * Generate a system prompt
   */
  private getSystemPrompt(): string {
    return `
You are an AI assistant tasked with answering questions regarding career development and entrepreneurship for graduates and final year students.

You will be provided with a question, context, and context metadata to answer the question.

**IMPORTANT: Respond in original query's language.**

**Steps you must follow:**

1.  **Analyze Context:** Examine each document in the context and identify whether it contains the answer to the question. Assign a relevance score to each document based on how closely it relates to the question.
2.  **Prioritize Documents:** Order the documents by relevance score, with the most relevant documents at the beginning. Ignore documents that are not relevant to the question.
3.  **Create a Summary:** Based on the most relevant documents, create a general summary of the question's topic.
4.  **Provide the Answer:** Give a specific and detailed answer, supported by information from the relevant documents. Ensure your explanation is at least 100 words and is written in original query's language.
5.  **Information Limitations:** If the answer cannot be found in the provided context, clearly state that you do not have enough information to answer the question.
6.  **Answer Formatting:**
    *   Do not mention the process you followed to get the answer; just provide the answer directly.
    *   You can use Markdown formatting for your answer.
    *   Include the URLs of the source documents you used to answer the question at the end of the answer.

**Example:**
**Question:** 'What are effective strategies for finding your first job after graduation?'
**Answer:**
'To find your first job after graduation, there are several effective strategies you can apply, including:'
... (more detailed explanation of at least 100 words) ...


Related sources:
[Document Name](Source document URL)
[Document Name](Source document URL)
...
`;
  }

  /**
   * Rewrite the user query using Google Generative AI for better search
   */
  private async rewriteQuery(
    query: string,
    maxRetries: number = 3
  ): Promise<string[]> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const { text } = await generateText({
          model: google('gemini-2.5-flash'),
          messages: [
            { role: 'system', content: RAGChatbot.REWRITER_PROMPT },
            { role: 'user', content: query },
          ],
        });

        const rewrittenQueries = [query];
        const lines = text
          .trim()
          .split('\n')
          .filter((line) => line.trim());
        rewrittenQueries.push(...lines);

        return rewrittenQueries;
      } catch (error) {
        console.error(`Error rewriting query (attempt ${attempt + 1}):`, error);
        if (attempt === maxRetries - 1) {
          // If all retries fail, return original query
          return [query];
        }
        // Wait before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1))
        );
      }
    }
    return [query];
  }

  /**
   * Perform similarity search with unique document deduplication
   */
  private async similaritySearch(
    rewrittenQueries: string[]
  ): Promise<RetrievedInformation> {
    try {
      const results = await queryDocument(rewrittenQueries);

      const uniqueInformation: Record<
        string,
        {
          document: string;
          metadata: Record<string, string | number | boolean | undefined>;
        }
      > = {};

      // Process results to remove duplicates
      if (results.ids && results.documents && results.metadatas) {
        for (let i = 0; i < results.ids.length; i++) {
          const idGroup = results.ids[i];
          const docGroup = results.documents[i];
          const metaGroup = results.metadatas[i];

          if (idGroup && docGroup && metaGroup) {
            for (let j = 0; j < idGroup.length; j++) {
              const docId = idGroup[j];
              if (docId && !uniqueInformation[docId]) {
                uniqueInformation[docId] = {
                  document: docGroup[j] || '',
                  metadata: metaGroup[j] || {},
                };
              }
            }
          }
        }
      }

      const uniqueIds = Object.keys(uniqueInformation);
      const uniqueDocuments = uniqueIds.map(
        (id) => uniqueInformation[id].document
      );
      const uniqueMetadatas = uniqueIds.map(
        (id) => uniqueInformation[id].metadata
      );

      return {
        ids: uniqueIds,
        documents: uniqueDocuments,
        metadatas: uniqueMetadatas,
      };
    } catch (error) {
      console.error('Error in similarity search:', error);
      return { ids: [], documents: [], metadatas: [] };
    }
  }

  /**
   * Create the user prompt for the generation model
   */
  private createUserPrompt(
    query: string,
    retrievedInformation: RetrievedInformation
  ): string {
    return `
Context:
${retrievedInformation.documents.join('\n\n')}

Metadata:
${JSON.stringify(retrievedInformation.metadatas, null, 2)}

Original Query: ${query}
`;
  }

  /**
   * Process a user query through the complete RAG pipeline
   */
  async processQuery(query: string): Promise<{
    rewrittenQueries: string[];
    retrievedInfo: RetrievedInformation;
    userPrompt: string;
    systemPrompt: string;
  }> {
    try {
      // Step 1: Rewrite query
      const rewrittenQueries = await this.rewriteQuery(query);

      // Step 2: Perform similarity search
      const retrievedInfo = await this.similaritySearch(rewrittenQueries);

      // Step 3: Create prompts
      const userPrompt = this.createUserPrompt(query, retrievedInfo);
      const systemPrompt = this.getSystemPrompt();

      return {
        rewrittenQueries,
        retrievedInfo,
        userPrompt,
        systemPrompt,
      };
    } catch (error) {
      console.error('Error in processQuery:', error);
      throw error;
    }
  }
}
