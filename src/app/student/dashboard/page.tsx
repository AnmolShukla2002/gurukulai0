import { BookOpenIcon } from "@/components/BookOpenIcon";
import { MicIcon } from "@/components/MicIcon";
import Link from "next/link";

export default function StudentDashboard() {
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
          <h1 className="text-5xl font-extrabold text-white tracking-tight">Welcome Back, Student!</h1>
          <p className="mt-4 text-xl text-white/80 max-w-2xl mx-auto">
            Your personalized AI learning tools are ready. Choose an option
            below to get started.
          </p>
        </header>

        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <FeatureCard
              title="Dynamic Learning Creator"
              description="Create personalized learning chapters tailored to your needs."
              href="/student/learning-creator"
              icon={<BookOpenIcon className="h-8 w-8 text-white" />}
            />
            <FeatureCard
              title="Learning Support Agent"
              description="Practice public speaking with an AI agent that gives you feedback."
              href="/student/learning-support-agent"
              icon={<MicIcon className="h-8 w-8 text-white" />}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
