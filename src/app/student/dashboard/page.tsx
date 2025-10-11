import { BookOpenIcon } from "@/components/BookOpenIcon";
import { MicIcon } from "@/components/MicIcon";
import Link from "next/link";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen w-full animated-gradient">
      <main className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center text-white mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Welcome Back, Student!
          </h1>
          <p className="text-xl mt-4 max-w-2xl mx-auto text-primary-foreground/80">
            Your personalized AI learning tools are ready. Choose an option
            below to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <Link
            href="/student/learning-creator"
            className="group block rounded-3xl p-8 text-center glow-card"
          >
            <div className="absolute inset-0 bg-card/60 backdrop-blur-lg rounded-3xl border border-white/20"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-secondary/80 p-4 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg mb-6">
                <BookOpenIcon className="h-12 w-12 text-secondary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Dynamic Learning Creator
              </h2>
              <p className="text-muted-foreground">
                Create personalized learning chapters tailored to your needs.
              </p>
            </div>
          </Link>

          <Link
            href="/student/learning-support-agent"
            className="group block rounded-3xl p-8 text-center glow-card"
          >
            <div className="absolute inset-0 bg-card/60 backdrop-blur-lg rounded-3xl border border-white/20"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-accent/80 p-4 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 shadow-lg mb-6">
                <MicIcon className="h-12 w-12 text-accent-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Learning Support Agent
              </h2>
              <p className="text-muted-foreground">
                Practice public speaking with an AI agent that gives you
                feedback.
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
