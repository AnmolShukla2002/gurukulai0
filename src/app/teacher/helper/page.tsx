'use client'

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateQuestionPaper } from './actions';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import Link from 'next/link';
import { ArrowLeftIcon, DocumentIcon, FileTextIcon, SparklesIcon, UploadIcon, WandIcon, LoaderCircle, SaveIcon } from '@/components/Icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const MOCK_TEACHER_ID = 'mock-teacher-123';

interface Classroom {
  _id: string;
  name: string;
}

function HelperPageContent() {
  const searchParams = useSearchParams();
  const preselectedClassroomId = searchParams.get('classroomId');

  const [format, setFormat] = useState('');
  const [instructions, setInstructions] = useState('');
  const [questionPaper, setQuestionPaper] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string | undefined>(preselectedClassroomId ?? undefined);

  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [contentFiles, setContentFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await fetch(`/api/classrooms?teacherId=${MOCK_TEACHER_ID}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) setClassrooms(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch classrooms", error);
      }
    };
    fetchClassrooms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('format', format);
    formData.append('instructions', instructions);

    if (referenceFile) formData.append('reference-file', referenceFile);
    contentFiles.forEach(file => formData.append('content-file', file));

    setLoading(true);
    setError('');
    setQuestionPaper('');
    const result = await generateQuestionPaper(formData);
    setLoading(false);

    if (result.success && result.questionPaper) {
      setQuestionPaper(result.questionPaper);
    } else {
      setError(result.error || 'An unexpected error occurred.');
    }
  };

  const handleSavePaper = async () => {
    if (!title.trim() || !selectedClassroom || !questionPaper) {
        setError("Please provide a title and select a classroom to save the paper.");
        return;
    }
    setSaving(true);
    setError('');
    try {
        const response = await fetch('/api/question-papers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                content: questionPaper,
                classroomId: selectedClassroom
            })
        });
        if (!response.ok) throw new Error("Failed to save the paper.");
        const result = await response.json();
        if(!result.success) throw new Error(result.error || "Could not save the paper.");
        
        // Optionally, redirect or show a success message
        alert("Question paper saved successfully!");

    } catch(err: any) {
        setError(err.message || "An unexpected error occurred while saving.");
    } finally {
        setSaving(false);
    }
  };

  const handleExportDoc = () => {
    if (!questionPaper) return;
    const doc = new Document({
      sections: [{ children: questionPaper.split('\n').map(p => new Paragraph(p)) }]
    });
    Packer.toBlob(doc).then(blob => saveAs(blob, `${title || 'question-paper'}.docx`));
  };

  const handleExportPdf = () => {
    if (!questionPaper) return;
    const doc = new jsPDF();
    doc.text(questionPaper, 10, 10);
    doc.save(`${title || 'question-paper'}.pdf`);
  };

  const FormStep = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-md">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-primary/20 text-primary p-2 rounded-lg">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen w-full animated-gradient">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link href="/teacher/dashboard" className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-gray-800">Question Paper Generator</h1>
          <div className="w-36"></div>
        </div>
      </header>

      <main className="container mx-auto py-8 md:py-12 px-4">
        {!questionPaper && !loading && (
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
            <FormStep icon={<FileTextIcon className="h-6 w-6"/>} title="Format Specification">
              <textarea id="format" value={format} onChange={(e) => setFormat(e.target.value)} required placeholder="e.g., 5 true/false, 5 multiple choice..." className="w-full p-3 bg-white/50 border border-gray-300/80 rounded-lg focus:ring-2 focus:ring-primary min-h-[100px]" />
            </FormStep>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormStep icon={<DocumentIcon className="h-6 w-6"/>} title="Reference Paper (Optional)">
                <label htmlFor="reference-file" className="flex flex-col items-center justify-center gap-2 w-full p-4 bg-white/50 border-2 border-dashed border-gray-300/80 rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <UploadIcon className="h-8 w-8 text-gray-500"/>
                  <span className="text-sm text-gray-600 text-center">{referenceFile?.name || "Upload for style matching"}</span>
                </label>
                <input type="file" id="reference-file" className="sr-only" onChange={(e) => setReferenceFile(e.target.files?.[0] || null)} />
              </FormStep>
              <FormStep icon={<UploadIcon className="h-6 w-6"/>} title="Content Materials (Optional)">
                <label htmlFor="content-file" className="flex flex-col items-center justify-center gap-2 w-full p-4 bg-white/50 border-2 border-dashed border-gray-300/80 rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <UploadIcon className="h-8 w-8 text-gray-500"/>
                  <span className="text-sm text-gray-600 text-center">{contentFiles.length > 0 ? `${contentFiles.length} file(s) selected` : "Upload textbooks, notes"}</span>
                </label>
                <input type="file" id="content-file" multiple className="sr-only" onChange={(e) => setContentFiles(Array.from(e.target.files || []))} />
              </FormStep>
            </div>
            
            <FormStep icon={<SparklesIcon className="h-6 w-6"/>} title="Custom Instructions (Optional)">
              <textarea id="instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g., Focus on Chapter 2..." className="w-full p-3 bg-white/50 border border-gray-300/80 rounded-lg focus:ring-2 focus:ring-primary min-h-[100px]" />
            </FormStep>

            <div className="flex justify-center pt-4">
              <button type="submit" className="w-full max-w-sm flex items-center justify-center gap-3 py-3 px-4 bg-primary text-white font-semibold rounded-lg shadow-lg hover:bg-primary/90 transition-transform hover:scale-105" disabled={loading}>
                <WandIcon className="h-6 w-6"/>
                <span className="text-lg">Generate Question Paper</span>
              </button>
            </div>
          </form>
        )}

        {loading && (
          <div className="text-center text-white">
            <LoaderCircle className="h-12 w-12 animate-spin mx-auto mb-4"/>
            <h2 className="text-2xl font-bold">Generating...</h2>
            <p>The AI is crafting your question paper, please wait.</p>
          </div>
        )}

        {questionPaper && (
          <div className="mx-auto max-w-4xl bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Generated Paper & Answer Key</h2>
            <div className="space-y-4 mb-8">
                <div>
                    <Label htmlFor="paper-title" className="text-gray-700">Question Paper Title</Label>
                    <Input id="paper-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Mid-Term Physics Exam" />
                </div>
                <div>
                    <Label htmlFor="classroom-select" className="text-gray-700">Save to Classroom</Label>
                    <Select onValueChange={setSelectedClassroom} defaultValue={selectedClassroom}>
                        <SelectTrigger id="classroom-select">
                            <SelectValue placeholder="Select a classroom..." />
                        </SelectTrigger>
                        <SelectContent>
                            {classrooms.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <pre className="bg-gray-100/50 p-6 rounded-lg whitespace-pre-wrap text-sm font-mono max-h-[50vh] overflow-auto border border-gray-200/80">{questionPaper}</pre>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button onClick={handleSavePaper} disabled={saving || !title.trim() || !selectedClassroom}>
                {saving ? <LoaderCircle className="animate-spin h-5 w-5 mr-2"/> : <SaveIcon className="h-5 w-5 mr-2" />}
                Save to Classroom
              </Button>
              <Button onClick={handleExportDoc} variant="secondary">Export as DOCX</Button>
              <Button onClick={handleExportPdf} variant="secondary">Export as PDF</Button>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-2xl bg-red-100/80 border border-red-500/50 rounded-2xl p-8 text-center text-red-800">
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        )}
      </main>
    </div>
  );
}


export default function HelperPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HelperPageContent />
    </Suspense>
  );
}
