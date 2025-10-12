'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PlusIcon, FileTextIcon, ArrowLeftIcon, Loader2Icon } from 'lucide-react';

interface QuestionPaper {
  _id: string;
  title: string;
  createdAt: string;
}

interface Classroom {
    _id: string;
    name: string;
}

export default function ClassroomDetailsClientPage({ classroomId }: { classroomId: string }) {
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClassroomDetails = async () => {
      if (!classroomId) return;
      setLoading(true);
      try {
        // Fetch classroom details
        const classRes = await fetch(`/api/classrooms/${classroomId}`);
        if (!classRes.ok) throw new Error('Failed to fetch classroom details');
        const classResult = await classRes.json();

        if (classResult.success) {
            setClassroom(classResult.data);
        } else {
            throw new Error(classResult.error || 'Could not fetch classroom');
        }

        // Fetch question papers for the classroom
        const papersRes = await fetch(`/api/question-papers?classroomId=${classroomId}`);
        if (!papersRes.ok) throw new Error('Failed to fetch question papers');
        const papersResult = await papersRes.json();
        
        if(papersResult.success) {
            setQuestionPapers(papersResult.data);
        } else {
            throw new Error(papersResult.error || 'Could not fetch question papers');
        }

      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchClassroomDetails();
  }, [classroomId]);

  const QuestionPaperCard = ({ id, title, createdAt }: { id: string, title: string, createdAt: string }) => (
    <Card className="bg-white/50 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <FileTextIcon className="h-5 w-5 text-primary" />
                    <span className="truncate">{title}</span>
                </CardTitle>
                <CardDescription>
                    Created on {new Date(createdAt).toLocaleDateString()}
                </CardDescription>
            </div>
            <Link href={`/teacher/question-papers/${id}`}>
              <Button variant="outline" size="sm">View</Button>
            </Link>
        </div>
      </CardHeader>
    </Card>
  );

  return (
    <div className="min-h-screen animated-gradient">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/teacher/classrooms" className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Classrooms
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 truncate">
            {classroom ? classroom.name : 'Classroom'}
          </h1>
          <Link href={`/teacher/helper?classroomId=${classroomId}`}>
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Question Paper
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2Icon className="h-12 w-12 animate-spin text-white" />
          </div>
        ) : error ? (
          <div className="text-center text-red-200 bg-red-800/50 p-4 rounded-lg">{error}</div>
        ) : questionPapers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questionPapers.map((paper) => (
              <QuestionPaperCard key={paper._id} id={paper._id} title={paper.title} createdAt={paper.createdAt} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-lg">
            <FileTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-medium text-gray-700">No question papers yet</h2>
            <p className="text-gray-500 mt-2">Get started by creating a new question paper for this class.</p>
          </div>
        )}
      </main>
    </div>
  );
}
