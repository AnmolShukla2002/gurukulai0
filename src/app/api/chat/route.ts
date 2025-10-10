
import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  const { messages } = await req.json();

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });

  const chatHistory = messages.map((msg: { role: string; content: any; }) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: msg.content,
  }));

  // Remove the last message, as that will be the new prompt
  const lastMessage = chatHistory.pop();

  const chat = model.startChat({
    history: chatHistory,
  });

  const stream = await chat.sendMessageStream(lastMessage.parts);

  // Convert the response into a friendly text-stream
  const customStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream.stream) {
        const chunkText = chunk.text();
        controller.enqueue(chunkText);
      }
      controller.close();
    },
  });

  // Respond with the stream
  return new StreamingTextResponse(customStream);
}
