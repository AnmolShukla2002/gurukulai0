
// import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// export const runtime = 'edge';

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// export async function POST(req: Request) {
//   const { messages } = await req.json();

//   const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL as string });

//   const chatHistory = messages.map((msg: { role: string; content: any; }) => ({
//     role: msg.role === 'user' ? 'user' : 'model',
//     parts: [{text: msg.content}],
//   }));

//   // Remove the last message, as that will be the new prompt
//   const lastMessage = chatHistory.pop();

//   const result = await model.generateContentStream({
//     contents: [...chatHistory, lastMessage],
//   });

//   // Convert the response into a friendly text-stream
//  const stream = GoogleGenerativeAIStream(result)

//   // Respond with the stream
//   return new StreamingTextResponse(stream);
// }
