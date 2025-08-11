import { google, GoogleGenerativeAIProviderOptions } from '@ai-sdk/google';
import { smoothStream, streamText } from 'ai';
import { RAGChatbot } from '@/lib/rag-chatbot';

export const maxDuration = 60;

interface Message {
  role: string;
  content: string | object;
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Get the latest user message to query the database
  const latestMessage = messages
    .filter((msg: Message) => msg.role === 'user')
    .pop();

  if (!latestMessage?.content) {
    return new Response('No user message found', { status: 400 });
  }

  try {
    // Initialize the RAG chatbot
    const ragChatbot = new RAGChatbot();
    
    // Process the query through the enhanced RAG pipeline
    const {
      userPrompt,
      systemPrompt,
      rewrittenQueries,
      retrievedInfo
    } = await ragChatbot.processQuery(latestMessage.content.toString());

    console.log(`Rewritten queries: ${rewrittenQueries.join(', ')}`);
    console.log(`Retrieved ${retrievedInfo.documents.length} unique documents`);

    // Generate the streaming response
    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: userPrompt,
      providerOptions: {
        google: {
          responseModalities: ['TEXT'],
          thinkingConfig: {
            thinkingBudget: 1024,
          },
        } satisfies GoogleGenerativeAIProviderOptions,
      },
      experimental_transform: smoothStream({
        delayInMs: 25,
      }),
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
