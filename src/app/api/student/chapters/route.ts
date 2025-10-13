// src/app/api/student/chapters/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const MOCK_STUDENT_ID = '60d5ec49a1d2e1001c8f8b81';

export async function POST(req: NextRequest) {
    try {
      const chapterData = await req.json();
  
      if (!chapterData.topic || !chapterData.flashcards || !chapterData.questions) {
        return NextResponse.json({ success: false, error: 'Incomplete chapter data provided.' }, { status: 400 });
      }
  
      const { db } = await connectToDatabase();
      
      const newChapter = {
        studentId: new ObjectId(MOCK_STUDENT_ID),
        ...chapterData,
        createdAt: new Date(),
      };
  
      const result = await db.collection('chapters').insertOne(newChapter);

      // --- New Goal Progress Update Logic ---
      const goalsToUpdate = await db.collection('goals').find({
        studentId: new ObjectId(MOCK_STUDENT_ID),
        completed: false,
        title: { $regex: new RegExp(chapterData.topic, "i") } // Case-insensitive match on topic
      }).toArray();

      for (const goal of goalsToUpdate) {
        const newProgress = goal.progress + 1;
        const isCompleted = newProgress >= goal.target;
        await db.collection('goals').updateOne(
          { _id: goal._id },
          { $set: { progress: newProgress, completed: isCompleted } }
        );
      }
      // --- End of New Logic ---
  
      return NextResponse.json({ success: true, insertedId: result.insertedId }, { status: 201 });
    } catch (error) {
      console.error('Failed to save chapter:', error);
      return NextResponse.json({ success: false, error: 'Server error while saving chapter.' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { db } = await connectToDatabase();
        
        const chapters = await db.collection('chapters')
            .find({ studentId: new ObjectId(MOCK_STUDENT_ID) })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({ success: true, data: chapters });
    } catch (error) {
        console.error('Failed to fetch chapters:', error);
        return NextResponse.json({ success: false, error: 'Server error while fetching chapters.' }, { status: 500 });
    }
}
