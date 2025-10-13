import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function POST(req: NextRequest) {
  try {
    const { paper1Id, paper2Id } = await req.json();

    if (!paper1Id || !paper2Id) {
      return NextResponse.json({ success: false, error: 'Two paper IDs are required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const paper1 = await db.collection('questionPapers').findOne({ _id: new ObjectId(paper1Id) });
    const paper2 = await db.collection('questionPapers').findOne({ _id: new ObjectId(paper2Id) });

    if (!paper1 || !paper2) {
      return NextResponse.json({ success: false, error: 'One or both papers not found' }, { status: 404 });
    }

    const prompt = `
      You are an expert at comparing educational documents.
      Please compare the following two question papers and provide a detailed analysis of their similarities and differences.
      Consider the topics covered, the question types, the difficulty level, and the overall structure.
      Format your response as clean, readable HTML, and do not include the markdown characters \`\`\`html.

      **Question Paper 1: ${paper1.title}**
      ${paper1.content}

      **Question Paper 2: ${paper2.title}**
      ${paper2.content}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const comparison = response.text();
    
    // Clean the response to remove markdown fences
    const cleanedComparison = comparison.replace(/```html\n|```/g, '').trim();

    return NextResponse.json({ success: true, comparison: cleanedComparison });

  } catch (error) {
    console.error('Paper comparison error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
