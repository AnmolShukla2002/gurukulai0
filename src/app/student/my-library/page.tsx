'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, LibraryIcon, Loader2Icon, BookOpenIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

interface Chapter {
  _id: string;
  topic: string;
  createdAt: string;
}

export default function MyLibraryPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await fetch('/api/student/chapters');
        if (!response.ok) throw new Error('Failed to fetch learning library.');
        const result = await response.json();
        if (result.success) {
          setChapters(result.data);
        } else {
          throw new Error(result.error || 'Could not fetch chapters.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchChapters();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/student/dashboard" className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
            <div className="inline-block p-4 bg-yellow-500/10 text-yellow-500 rounded-full mb-6">
                <LibraryIcon className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">My Learning Library</h1>
            <p className="text-xl text-muted-foreground">All your generated chapters, saved in one place.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 bg-red-500/10 p-4 rounded-lg">{error}</div>
        ) : chapters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {chapters.map((chapter) => (
              <Card 
                key={chapter._id} 
                className="bg-card border border-border flex flex-col transition-all duration-300 hover:-translate-y-2"
                style={{ boxShadow: '0 4px 25px -5px rgba(251, 188, 5, 0.4)'}}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-yellow-500/10 text-yellow-500 rounded-full">
                        <BookOpenIcon className="h-5 w-5" />
                    </div>
                    <span className="truncate">{chapter.topic}</span>
                  </CardTitle>
                  <CardDescription>
                    Created on {new Date(chapter.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                  <Link href={`/student/my-library/${chapter._id}`} className="w-full">
                    <Button className="w-full font-semibold">View Chapter</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border-2 border-dashed border-border rounded-lg">
            <h2 className="text-xl font-medium text-foreground">Your library is empty.</h2>
            <p className="text-muted-foreground mt-2">Create a new chapter to get started!</p>
            <Link href="/student/learning-creator">
                <Button className="mt-6">Create a Chapter</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
