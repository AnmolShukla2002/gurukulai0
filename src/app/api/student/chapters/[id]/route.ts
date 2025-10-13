// src/app/api/student/chapters/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, error: 'Invalid chapter ID.' }, { status: 400 });
        }

        const { db } = await connectToDatabase();
        
        const chapter = await db.collection('chapters').findOne({ _id: new ObjectId(id) });

        if (!chapter) {
            return NextResponse.json({ success: false, error: 'Chapter not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: chapter });
    } catch (error) {
        console.error('Failed to fetch chapter:', error);
        return NextResponse.json({ success: false, error: 'Server error while fetching chapter.' }, { status: 500 });
    }
}
