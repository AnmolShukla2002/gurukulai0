import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function fileToGenerativePart(file: File): Promise<Part> {
    const base64EncodedData = await file.arrayBuffer().then((buffer) =>
      Buffer.from(buffer).toString('base64')
    );
    return {
      inlineData: {
        data: base64EncodedData,
        mimeType: file.type,
      },
    };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const questionPaperId = formData.get('questionPaperId') as string;
    const answerSheetFile = formData.get('answerSheet') as File;

    if (!questionPaperId || !answerSheetFile) {
      return NextResponse.json({ success: false, error: 'Question paper ID and answer sheet are required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const questionPaper = await db.collection('questionPapers').findOne({ _id: new ObjectId(questionPaperId) });

    if (!questionPaper) {
      return NextResponse.json({ success: false, error: 'Question paper not found' }, { status: 404 });
    }

    const answerSheetPart = await fileToGenerativePart(answerSheetFile);

    const prompt = `
      You are an expert teaching assistant. Your task is to evaluate a student's handwritten answer sheet against a given question paper and its answer key.

      **Question Paper & Answer Key:**
      Title: ${questionPaper.title}
      Content:
      ${questionPaper.content}

      **Student's Handwritten Answer Sheet:**
      [Image Attached]

      Please perform the following:
      1.  Read and interpret the student's handwritten answers.
      2.  Compare each answer to the correct answer provided in the answer key section of the question paper.
      3.  For each question, provide a detailed evaluation explaining why the answer is right or wrong.
      4.  Suggest a score for each question.
      5.  Calculate a total score and provide a brief summary of the student's performance.
      6.  Format your entire response as clean, readable HTML, and do not include the markdown characters \`\`\`html.
    `;

    const result = await model.generateContent([prompt, answerSheetPart]);
    const response = await result.response;
    const evaluation = response.text();
    
    // Clean the response to remove markdown fences
    const cleanedEvaluation = evaluation.replace(/```html\n|```/g, '').trim();

    return NextResponse.json({ success: true, evaluation: cleanedEvaluation });

  } catch (error) {
    console.error('Answer evaluation error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
