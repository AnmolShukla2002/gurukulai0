import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Define a type for the classroom data to ensure type safety
interface Classroom {
  name: string;
  teacherId: string; // Assuming you'll associate classrooms with teachers
  createdAt: Date;
}

// GET method to fetch all classrooms for a specific teacher
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json({ success: false, error: 'Teacher ID is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const classrooms = await db.collection('classrooms').find({ teacherId }).toArray();

    return NextResponse.json({ success: true, data: classrooms });
  } catch (error) {
    console.error('Failed to fetch classrooms:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// POST method to create a new classroom
export async function POST(req: NextRequest) {
  try {
    const { name, teacherId } = await req.json();

    if (!name || !teacherId) {
      return NextResponse.json({ success: false, error: 'Classroom name and teacher ID are required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const newClassroom: Classroom = {
      name,
      teacherId,
      createdAt: new Date(),
    };

    const result = await db.collection('classrooms').insertOne(newClassroom);

    return NextResponse.json({ success: true, data: { ...newClassroom, _id: result.insertedId } }, { status: 201 });
  } catch (error) {
    console.error('Failed to create classroom:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
