import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get('classroomId');

    if (!classroomId) {
      return NextResponse.json({ success: false, error: 'Classroom ID is required' }, { status: 400 });
    }

    if (!ObjectId.isValid(classroomId)) {
      return NextResponse.json({ success: false, error: 'Invalid Classroom ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const questionPapers = await db.collection('questionPapers').find({ classroomId: new ObjectId(classroomId) }).toArray();

    return NextResponse.json({ success: true, data: questionPapers });
  } catch (error) {
    console.error('Failed to fetch question papers:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    try {
      const { title, content, classroomId } = await req.json();
  
      if (!title || !content || !classroomId) {
        return NextResponse.json({ success: false, error: 'Title, content, and classroom ID are required' }, { status: 400 });
      }

      if (!ObjectId.isValid(classroomId)) {
        return NextResponse.json({ success: false, error: 'Invalid Classroom ID' }, { status: 400 });
      }
  
      const { db } = await connectToDatabase();
      
      const newQuestionPaper = {
        title,
        content,
        classroomId: new ObjectId(classroomId),
        createdAt: new Date(),
      };
  
      const result = await db.collection('questionPapers').insertOne(newQuestionPaper);
  
      return NextResponse.json({ success: true, data: { ...newQuestionPaper, _id: result.insertedId } }, { status: 201 });
    } catch (error) {
      console.error('Failed to create question paper:', error);
      return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
