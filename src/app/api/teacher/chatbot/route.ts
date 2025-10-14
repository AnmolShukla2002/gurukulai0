import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { classifyUserIntent, generateMongoQuery, analyzeStudentData } from '@/lib/gemini';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1].content;
    
    // --- New Intent-Based Routing ---
    const intent = await classifyUserIntent(latestMessage);

    if (intent === 'analyze_data') {
        const analysis = await analyzeStudentData(latestMessage);
        return NextResponse.json({ papers: [], message: analysis, isHtml: true });
    }

    if (intent === 'find_documents') {
        let mongoQuery;
        if (latestMessage.toLowerCase().includes('all papers')) {
            mongoQuery = {};
        } else {
            mongoQuery = await generateMongoQuery(latestMessage);
        }

        if (mongoQuery === null) {
            return NextResponse.json({ papers: [], message: "I can find papers for you, but I didn't quite understand that. Could you rephrase?", isHtml: false });
        }

        const { db } = await connectToDatabase();
        const papers = await db.collection('questionPapers').aggregate([
            { $match: mongoQuery },
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'classrooms', localField: 'classroomId', foreignField: '_id', as: 'classroom' }},
            { $unwind: { path: '$classroom', preserveNullAndEmptyArrays: true }},
            { $project: { title: 1, createdAt: 1, classroomName: '$classroom.name' }}
        ]).toArray();

        if (papers.length > 0) {
            return NextResponse.json({
                papers: papers.map(p => ({ id: p._id.toString(), title: p.title, classroomName: p.classroomName || 'Unassigned' })),
                message: "Here are the papers I found:",
                isHtml: false
            });
        } else {
            return NextResponse.json({ papers: [], message: "I couldn't find any question papers that match your query.", isHtml: false });
        }
    }
    // --- End of Intent-Based Routing ---

    // Fallback for unknown intent
    return NextResponse.json({ papers: [], message: "I'm not sure how to help with that. I can find question papers or analyze student data.", isHtml: false });

  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json({ papers: [], message: 'Sorry, there was an error processing your request.', isHtml: false }, { status: 500 });
  }
}
