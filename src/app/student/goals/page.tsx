'use client';

import Link from 'next/link';
import { ArrowLeftIcon, TargetIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GoalsPage() {
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <TargetIcon className="mx-auto h-16 w-16 text-white mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">Goals & Progress</h1>
        <p className="text-xl text-white/80 mb-8">This feature is under construction!</p>
        <p className="text-white/70 max-w-2xl mx-auto">
          We're building a powerful tool to help you set learning goals, track your progress with beautiful charts, and see your study streaks. Stay tuned!
        </p>
        <Link href="/student/dashboard">
            <Button variant="secondary" className="mt-8">Go Back</Button>
        </Link>
      </div>
    </div>
  );
}
