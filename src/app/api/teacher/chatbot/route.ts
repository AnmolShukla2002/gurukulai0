import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { generateMongoQuery } from '@/lib/gemini';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1].content;
    const lowerCaseMessage = latestMessage.toLowerCase();

    let mongoQuery;

    if (lowerCaseMessage.includes('all') && lowerCaseMessage.includes('papers')) {
      mongoQuery = {};
    } else {
      mongoQuery = await generateMongoQuery(latestMessage);
    }

    if (mongoQuery === null) {
      return NextResponse.json({ papers: [], message: "Sorry, I couldn't understand that. Could you please rephrase your question?" });
    }

    const { db } = await connectToDatabase();
    
    const papers = await db.collection('questionPapers').aggregate([
      { $match: mongoQuery },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'classrooms',
          localField: 'classroomId',
          foreignField: '_id',
          as: 'classroom'
        }
      },
      {
        $unwind: {
          path: '$classroom',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          title: 1,
          createdAt: 1,
          classroomName: '$classroom.name'
        }
      }
    ]).toArray();

    if (papers.length > 0) {
      return NextResponse.json({
        papers: papers.map(p => ({ 
          id: p._id.toString(), 
          title: p.title,
          classroomName: p.classroomName || 'Unassigned'
        })),
        message: "Here are the papers I found:",
      });
    } else {
      return NextResponse.json({ papers: [], message: "I couldn't find any question papers that match your query." });
    }
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json({ papers: [], message: 'Sorry, there was an error processing your request.' }, { status: 500 });
  }
}
