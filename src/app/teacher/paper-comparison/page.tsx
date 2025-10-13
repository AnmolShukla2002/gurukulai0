'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react';
import Link from 'next/link';

interface Paper {
  _id: string;
  title: string;
}

export default function PaperComparisonPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [paper1, setPaper1] = useState<string | null>(null);
  const [paper2, setPaper2] = useState<string | null>(null);
  const [comparison, setComparison] = useState('');
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

  const handleCompare = async () => {
    if (!paper1 || !paper2) {
      setError('Please select two papers to compare.');
      return;
    }
    setLoading(true);
    setError('');
    setComparison('');
    try {
      const res = await fetch('/api/teacher/paper-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paper1Id: paper1, paper2Id: paper2 }),
      });
      if (!res.ok) throw new Error('Failed to get comparison');
      const result = await res.json();
      if (result.success) {
        setComparison(result.comparison);
      } else {
        throw new Error(result.error || 'Could not compare papers');
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
        <h1 className="text-4xl font-bold text-white text-center mb-8">Compare Question Papers</h1>
        <Card className="max-w-4xl mx-auto bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Select onValueChange={setPaper1}>
                <SelectTrigger><SelectValue placeholder="Select Paper 1" /></SelectTrigger>
                <SelectContent>
                  {papers.map(p => <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select onValueChange={setPaper2}>
                <SelectTrigger><SelectValue placeholder="Select Paper 2" /></SelectTrigger>
                <SelectContent>
                  {papers.map(p => <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="text-center">
              <Button onClick={handleCompare} disabled={loading}>
                {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                Compare Papers
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-red-200 text-center mt-4">{error}</p>}

        {comparison && (
          <Card className="max-w-4xl mx-auto mt-8 bg-white/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Comparison Result</h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: comparison }} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
