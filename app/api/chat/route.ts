import { google } from '@ai-sdk/google';
import { smoothStream, streamText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const promptTemplate = `
    Please answer the following question based on the context provided. 

    Before answering, analyze each document in the context and identify if it contains the answer to the question.
    Assign a score to each document based on its relevance to the question and then use this information to ignore documents that are not relevant to the question.
    Also, make sure to list the most relevant documents first and then answer the question based on those documents only.
    If the answer cannot be found within the context, state clearly that the information is not available on your knowledge base.
    
    Markdown supported.

    Context:
    {context}

    Question: {question}

    Answer:
    `;

  const result = streamText({
    model: google('gemini-2.0-flash-001'),
    // system: "Markdown supported.",
    system: promptTemplate,
    messages,
    experimental_transform: smoothStream({
      delayInMs: 25,
    }),
  });

  return result.toDataStreamResponse();
}
