'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react';
import { Document, Packer, Paragraph } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

interface QuestionPaper {
  _id: string;
  title: string;
  content: string;
  classroomId: string;
}

export default function QuestionPaperPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [paper, setPaper] = useState<QuestionPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaper = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/question-papers/${id}`);
        if (!response.ok) throw new Error('Failed to fetch question paper.');
        const result = await response.json();
        if (result.success) {
          setPaper(result.data);
        } else {
          throw new Error(result.error || 'Could not fetch the paper.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPaper();
  }, [id]);

  const handleExportDoc = () => {
    if (!paper) return;
    const doc = new Document({
      sections: [{ children: paper.content.split('\n').map(p => new Paragraph(p)) }]
    });
    Packer.toBlob(doc).then(blob => saveAs(blob, `${paper.title}.docx`));
  };

  const handleExportPdf = () => {
    if (!paper) return;
    const doc = new jsPDF();
    doc.text(paper.content, 10, 10);
    doc.save(`${paper.title}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <Loader2Icon className="h-16 w-16 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="text-center text-red-200 bg-red-800/50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <Link href="/teacher/dashboard">
            <Button variant="secondary" className="mt-4">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          {paper && (
             <Link href={`/teacher/classrooms/${paper.classroomId}`} className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Classroom
            </Link>
          )}
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {paper && (
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">{paper.title}</h1>
            <pre className="bg-gray-100/50 p-6 rounded-lg whitespace-pre-wrap text-sm font-mono max-h-[60vh] overflow-auto border border-gray-200/80">
              {paper.content}
            </pre>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button onClick={handleExportDoc}>Export as DOCX</Button>
              <Button onClick={handleExportPdf}>Export as PDF</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
