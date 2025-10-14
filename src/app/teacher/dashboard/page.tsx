'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { 
  BookOpenCheck, 
  Newspaper, 
  GitCompareArrows as GitCompareArrowsIcon, 
  ClipboardCheckIcon, 
  BarChartIcon,
  UsersIcon,
  FilePlus2Icon
} from 'lucide-react';

const googleColors = {
  blue: '#4285F4',
  red: '#EA4335',
  yellow: '#FBBC05',
  green: '#34A853',
};

function TeacherDashboardContent() {
    const searchParams = useSearchParams();
    const teacherName = searchParams.get('name');

    const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
        <div 
        className="bg-card border border-border rounded-lg p-6 flex items-center gap-6 transition-all duration-300 hover:-translate-y-1"
        style={{ boxShadow: `0 4px 20px -2px ${color}55` }}
        >
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}1A`, color: color }}>
            {icon}
        </div>
        <div>
            <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
            <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        </div>
    );

    const FeatureCard = ({ title, description, href, icon, color }: { title: string, description: string, href: string, icon: React.ReactNode, color: string }) => (
        <Link 
        href={href} 
        className="block bg-card border border-border rounded-lg h-full transition-all duration-300 hover:-translate-y-2"
        style={{ boxShadow: `0 4px 25px -5px ${color}44` }}
        >
            <div className="p-8">
                <div className="flex items-center justify-center h-16 w-16 rounded-full text-white mb-6" style={{ backgroundColor: color }}>
                    {icon}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
            </div>
        </Link>
    );

    return (
        <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="mb-12">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Teacher Dashboard</h1>
            <p className="mt-2 text-lg text-muted-foreground">Welcome back, {teacherName || 'Teacher'}! Here's an overview of your workspace.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard title="Total Students" value="80" icon={<UsersIcon size={28}/>} color={googleColors.blue} />
                <StatCard title="Classrooms" value="2" icon={<BookOpenCheck size={28}/>} color={googleColors.green} />
                <StatCard title="Papers Created" value="4" icon={<FilePlus2Icon size={28}/>} color={googleColors.yellow} />
                <StatCard title="Avg. Score" value="82%" icon={<BarChartIcon size={28}/>} color={googleColors.red} />
            </div>

            <main>
            <h2 className="text-3xl font-bold text-foreground mb-8">Your Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard
                title="Manage Classrooms"
                description="Create, view, and manage your classrooms and their question papers."
                href="/teacher/classrooms"
                icon={<BookOpenCheck size={32} />}
                color={googleColors.blue}
                />
                <FeatureCard
                title="Create Question Paper"
                description="Use the AI assistant to generate new question papers from your materials."
                href="/teacher/helper"
                icon={<Newspaper size={32} />}
                color={googleColors.green}
                />
                <FeatureCard
                title="Compare Papers"
                description="Get an AI-powered comparison of two different question papers."
                href="/teacher/paper-comparison"
                icon={<GitCompareArrowsIcon size={32} />}
                color={googleColors.yellow}
                />
                <FeatureCard
                title="Evaluate Answers"
                description="Upload a handwritten answer sheet for an AI-powered evaluation."
                href="/teacher/evaluate-answers"
                icon={<ClipboardCheckIcon size={32} />}
                color={googleColors.red}
                />
                <FeatureCard
                title="Student Analytics"
                description="View student performance, class averages, and predictive insights with mock data."
                href="/teacher/analytics"
                icon={<BarChartIcon size={32} />}
                color={googleColors.blue}
                />
            </div>
            </main>
        </div>
        </div>
    );
}

export default function TeacherDashboardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TeacherDashboardContent />
        </Suspense>
    )
}
