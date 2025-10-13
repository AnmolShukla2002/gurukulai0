'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadIcon, ArrowLeftIcon, Loader2Icon } from 'lucide-react';
import Link from 'next/link';

interface Paper {
  _id: string;
  title: string;
}

export default function EvaluateAnswersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<string | null>(null);
  const [answerSheet, setAnswerSheet] = useState<File | null>(null);
  const [evaluation, setEvaluation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await fetch('/api/question-papers');
        if (!res.ok) throw new Error('Failed to fetch papers');
        const result = await res.json();
        if (result.success) {
          setPapers(result.data);
        } else {
          throw new Error(result.error || 'Could not fetch papers');
        }
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchPapers();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAnswerSheet(e.target.files[0]);
    }
  };

  const handleEvaluate = async () => {
    if (!selectedPaper || !answerSheet) {
      setError('Please select a question paper and upload an answer sheet.');
      return;
    }
    setLoading(true);
    setError('');
    setEvaluation('');
    
    const formData = new FormData();
    formData.append('questionPaperId', selectedPaper);
    formData.append('answerSheet', answerSheet);

    try {
      const res = await fetch('/api/teacher/evaluate-answers', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to get evaluation');
      const result = await res.json();
      if (result.success) {
        setEvaluation(result.evaluation);
      } else {
        throw new Error(result.error || 'Could not evaluate the answer sheet');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-gradient">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/teacher/dashboard" className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Evaluate Answer Sheet</h1>
        <Card className="max-w-4xl mx-auto bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Select onValueChange={setSelectedPaper}>
                <SelectTrigger><SelectValue placeholder="Select Question Paper" /></SelectTrigger>
                <SelectContent>
                  {papers.map(p => <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>)}
                </SelectContent>
              </Select>
              <div>
                <label htmlFor="answer-sheet-upload" className="flex items-center justify-center gap-3 w-full p-3 bg-white/50 border-2 border-dashed border-gray-300/80 rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <UploadIcon className="h-6 w-6 text-gray-500"/>
                  <span className="text-gray-600 truncate">{answerSheet?.name || "Upload Answer Sheet"}</span>
                </label>
                <input type="file" id="answer-sheet-upload" className="sr-only" onChange={handleFileChange} accept="image/*" />
              </div>
            </div>
            <div className="text-center">
              <Button onClick={handleEvaluate} disabled={loading}>
                {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                Evaluate
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-red-200 text-center mt-4">{error}</p>}

        {evaluation && (
          <Card className="max-w-4xl mx-auto mt-8 bg-white/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Evaluation Result</h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: evaluation }} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
