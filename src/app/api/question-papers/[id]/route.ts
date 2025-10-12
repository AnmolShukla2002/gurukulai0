import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

type RouteContext = {
    params: {
        id: string;
    }
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid question paper ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const questionPaper = await db.collection('questionPapers').findOne({ _id: new ObjectId(id) });

    if (!questionPaper) {
      return NextResponse.json({ success: false, error: 'Question paper not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: questionPaper });
  } catch (error) {
    console.error('Failed to fetch question paper:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
