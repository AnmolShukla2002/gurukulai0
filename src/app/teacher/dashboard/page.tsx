'use client';

import Link from 'next/link';
import { 
  BookOpenCheck, 
  Newspaper, 
  GitCompareArrows as GitCompareArrowsIcon, 
  ClipboardCheckIcon, 
  BarChartIcon,
  UsersIcon,
  FilePlus2Icon
} from 'lucide-react';

export default function TeacherDashboardPage() {
  // A new component for the top stat cards
  const StatCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
    <div className="bg-white/30 backdrop-blur-lg rounded-xl p-6 flex items-center gap-6 shadow-md">
      <div className="bg-primary/20 text-primary p-3 rounded-full">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  const FeatureCard = ({ title, description, href, icon }: { title: string, description: string, href: string, icon: React.ReactNode }) => (
    <Link href={href} className="block bg-white/30 backdrop-blur-lg rounded-xl shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-2 h-full overflow-hidden">
        <div className="p-8">
            <div className="flex items-center justify-center h-16 w-16 bg-primary rounded-full text-white mb-6 shadow-lg">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    </Link>
  );

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Teacher Dashboard</h1>
          <p className="mt-2 text-xl text-white/80">Welcome back, here's an overview of your workspace.</p>
        </header>

        {/* Stat Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard title="Total Students" value="80" icon={<UsersIcon size={28}/>} />
            <StatCard title="Classrooms" value="2" icon={<BookOpenCheck size={28}/>} />
            <StatCard title="Papers Created" value="4" icon={<FilePlus2Icon size={28}/>} />
            <StatCard title="Avg. Score" value="82%" icon={<BarChartIcon size={28}/>} />
        </div>

        {/* Tools Section */}
        <main>
          <h2 className="text-3xl font-bold text-white mb-8">Your Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Manage Classrooms"
              description="Create, view, and manage your classrooms and their question papers."
              href="/teacher/classrooms"
              icon={<BookOpenCheck size={32} />}
            />
            <FeatureCard
              title="Create Question Paper"
              description="Use the AI assistant to generate new question papers from your materials."
              href="/teacher/helper"
              icon={<Newspaper size={32} />}
            />
            <FeatureCard
              title="Compare Papers"
              description="Get an AI-powered comparison of two different question papers."
              href="/teacher/paper-comparison"
              icon={<GitCompareArrowsIcon size={32} />}
            />
            <FeatureCard
              title="Evaluate Answers"
              description="Upload a handwritten answer sheet for an AI-powered evaluation."
              href="/teacher/evaluate-answers"
              icon={<ClipboardCheckIcon size={32} />}
            />
             <FeatureCard
              title="Student Analytics"
              description="View student performance, class averages, and predictive insights with mock data."
              href="/teacher/analytics"
              icon={<BarChartIcon size={32} />}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
