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
    <div className="min-h-screen animated-gradient">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/student/dashboard" className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
            <LibraryIcon className="mx-auto h-16 w-16 text-white mb-6" />
            <h1 className="text-4xl font-bold text-white mb-4">My Learning Library</h1>
            <p className="text-xl text-white/80">All your generated chapters, saved in one place.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2Icon className="h-12 w-12 animate-spin text-white" />
          </div>
        ) : error ? (
          <div className="text-center text-red-200 bg-red-800/50 p-4 rounded-lg">{error}</div>
        ) : chapters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {chapters.map((chapter) => (
              <Card key={chapter._id} className="bg-white/60 backdrop-blur-lg flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <BookOpenIcon className="h-6 w-6 text-primary" />
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
          <div className="text-center py-16 bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-lg">
            <h2 className="text-xl font-medium text-gray-700">Your library is empty.</h2>
            <p className="text-gray-500 mt-2">Create a new chapter to get started!</p>
            <Link href="/student/learning-creator">
                <Button className="mt-6">Create a Chapter</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
