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
        return NextResponse.json({ success: false, error: 'Invalid classroom ID' }, { status: 400 });
      }
  
      const { db } = await connectToDatabase();
      const classroom = await db.collection('classrooms').findOne({ _id: new ObjectId(id) });
  
      if (!classroom) {
        return NextResponse.json({ success: false, error: 'Classroom not found' }, { status: 404 });
      }
  
      return NextResponse.json({ success: true, data: classroom });
    } catch (error) {
      console.error('Failed to fetch classroom:', error);
      return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid classroom ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection('classrooms').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Classroom not found' }, { status: 404 });
    }

    await db.collection('questionPapers').deleteMany({ classroomId: new ObjectId(id) });


    return NextResponse.json({ success: true, message: 'Classroom deleted successfully' });
  } catch (error) {
    console.error('Failed to delete classroom:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
