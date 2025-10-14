'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { 
  BookOpenIcon, 
  MicIcon,
  LibraryIcon,
  TargetIcon,
  BookCopyIcon,
  CheckCircle2Icon,
  TrendingUpIcon
} from 'lucide-react';

const googleColors = {
  blue: '#4285F4',
  green: '#34A853',
  yellow: '#FBBC05',
  red: '#EA4335',
};

function StudentDashboardContent() {
    const searchParams = useSearchParams();
    const studentName = searchParams.get('name');

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
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Student Dashboard</h1>
            <p className="mt-2 text-lg text-muted-foreground">Welcome back, {studentName || 'Student'}! Ready to dive in and learn something new?</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard title="Chapters Created" value="8" icon={<BookCopyIcon size={28}/>} color={googleColors.blue} />
                <StatCard title="Quizzes Passed" value="5" icon={<CheckCircle2Icon size={28}/>} color={googleColors.green} />
                <StatCard title="Average Score" value="88%" icon={<TrendingUpIcon size={28}/>} color={googleColors.yellow} />
                <StatCard title="Sessions Completed" value="12" icon={<TargetIcon size={28}/>} color={googleColors.red} />
            </div>

            <main>
            <h2 className="text-3xl font-bold text-foreground mb-8">Your Learning Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <FeatureCard
                title="Dynamic Learning Creator"
                description="Create personalized learning chapters tailored to your needs."
                href="/student/learning-creator"
                icon={<BookOpenIcon size={32} />}
                color={googleColors.blue}
                />
                <FeatureCard
                title="Learning Support Agent"
                description="Practice public speaking with an AI agent that gives you feedback."
                href="/student/learning-support-agent"
                icon={<MicIcon size={32} />}
                color={googleColors.green}
                />
                <FeatureCard
                title="My Learning Library"
                description="Access all your previously generated chapters and learning materials."
                href="/student/my-library"
                icon={<LibraryIcon size={32} />}
                color={googleColors.yellow}
                />
                <FeatureCard
                title="Goals & Progress"
                description="Track your learning journey, set goals, and view your progress over time."
                href="/student/goals"
                icon={<TargetIcon size={32} />}
                color={googleColors.red}
                />
            </div>
            </main>
        </div>
        </div>
    );
}


export default function StudentDashboardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StudentDashboardContent />
        </Suspense>
    )
}
