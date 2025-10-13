'use client';

import Link from 'next/link';
import { 
  BookOpenIcon, 
  MicIcon,
  LibraryIcon,
  TargetIcon,
  BookCopyIcon,
  CheckCircle2Icon,
  TrendingUpIcon
} from 'lucide-react';

export default function StudentDashboardPage() {
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
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Student Dashboard</h1>
          <p className="mt-2 text-xl text-white/80">Welcome back! Ready to dive in and learn something new?</p>
        </header>

        {/* Stat Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard title="Chapters Created" value="8" icon={<BookCopyIcon size={28}/>} />
            <StatCard title="Quizzes Passed" value="5" icon={<CheckCircle2Icon size={28}/>} />
            <StatCard title="Average Score" value="88%" icon={<TrendingUpIcon size={28}/>} />
            <StatCard title="Sessions Completed" value="12" icon={<TargetIcon size={28}/>} />
        </div>

        {/* Tools Section */}
        <main>
          <h2 className="text-3xl font-bold text-white mb-8">Your Learning Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              title="Dynamic Learning Creator"
              description="Create personalized learning chapters tailored to your needs."
              href="/student/learning-creator"
              icon={<BookOpenIcon size={32} />}
            />
            <FeatureCard
              title="Learning Support Agent"
              description="Practice public speaking with an AI agent that gives you feedback."
              href="/student/learning-support-agent"
              icon={<MicIcon size={32} />}
            />
            <FeatureCard
              title="My Learning Library"
              description="Access all your previously generated chapters and learning materials."
              href="/student/my-library"
              icon={<LibraryIcon size={32} />}
            />
            <FeatureCard
              title="Goals & Progress"
              description="Track your learning journey, set goals, and view your progress over time."
              href="/student/goals"
              icon={<TargetIcon size={32} />}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
