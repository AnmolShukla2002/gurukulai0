// src/app/api/student/goals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const MOCK_STUDENT_ID = '60d5ec49a1d2e1001c8f8b81'; // Using the same valid mock ObjectId

export async function GET(req: NextRequest) {
    try {
        const { db } = await connectToDatabase();
        const goals = await db.collection('goals')
            .find({ studentId: new ObjectId(MOCK_STUDENT_ID) })
            .sort({ createdAt: -1 })
            .toArray();
        return NextResponse.json({ success: true, data: goals });
    } catch (error) {
        console.error('Failed to fetch goals:', error);
        return NextResponse.json({ success: false, error: 'Server error while fetching goals.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { title, target } = await req.json();
        if (!title || !target) {
            return NextResponse.json({ success: false, error: 'Title and target are required.' }, { status: 400 });
        }

        const { db } = await connectToDatabase();
        const newGoal = {
            studentId: new ObjectId(MOCK_STUDENT_ID),
            title,
            target: parseInt(target, 10),
            progress: 0,
            createdAt: new Date(),
            completed: false,
        };

        const result = await db.collection('goals').insertOne(newGoal);
        return NextResponse.json({ success: true, insertedId: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error('Failed to create goal:', error);
        return NextResponse.json({ success: false, error: 'Server error while creating goal.' }, { status: 500 });
    }
}
