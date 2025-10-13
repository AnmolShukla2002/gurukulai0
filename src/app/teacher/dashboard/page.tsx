'use client'

import Link from 'next/link';
import { BookOpenCheck, Newspaper, GitCompareArrows as GitCompareArrowsIcon } from 'lucide-react';

export default function TeacherDashboardPage() {
  const FeatureCard = ({ title, description, href, icon }: { title: string, description: string, href: string, icon: React.ReactNode }) => (
    <Link href={href}>
      <div className="block p-8 bg-white/30 backdrop-blur-lg rounded-xl shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-2 h-full">
        <div className="flex items-center justify-center h-16 w-16 bg-primary rounded-full text-white mb-6 shadow-lg">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white tracking-tight">Teacher Dashboard</h1>
          <p className="mt-4 text-xl text-white/80">Your central hub for classroom and question paper management.</p>
        </header>

        <main>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            <FeatureCard
              title="Manage Classrooms"
              description="Create new classrooms, view existing ones, and manage saved question papers within each class."
              href="/teacher/classrooms"
              icon={<BookOpenCheck size={32} />}
            />
            <FeatureCard
              title="Create Question Paper"
              description="Generate new question papers using the AI assistant and save them to your classrooms."
              href="/teacher/helper"
              icon={<Newspaper size={32} />}
            />
            <FeatureCard
              title="Compare Papers"
              description="Select two question papers and get an AI-powered comparison of their content and structure."
              href="/teacher/paper-comparison"
              icon={<GitCompareArrowsIcon size={32} />}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
