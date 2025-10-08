
import { StreamingTextResponse, GoogleGenerativeAIStream } from 'ai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });

  const streamingResponse = await model.generateContentStream(
    messages.map((m: any) => ({ role: m.role, parts: [{ text: m.content }] }))
  );

  return new StreamingTextResponse(GoogleGenerativeAIStream(streamingResponse));
}
