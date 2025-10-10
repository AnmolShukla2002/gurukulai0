
import { BookOpenIcon } from "@/components/BookOpenIcon";
import { MicIcon } from "@/components/MicIcon";
import Link from "next/link";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="bg-primary text-white text-center py-12">
        <h1 className="text-5xl font-bold">Student Dashboard</h1>
        <p className="text-xl mt-2">Explore your AI-powered learning tools</p>
      </header>
      <main className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Link href="/student/learning-creator" className="block rounded-2xl bg-white shadow-lg p-8 text-center transition-transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="bg-secondary p-4 rounded-full">
                  <BookOpenIcon className="h-16 w-16 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Dynamic Learning Chapter Creator</h2>
              <p className="text-neutral-500">Create personalized learning chapters tailored to your needs.</p>
          </Link>
          <Link href="/student/learning-support-agent" className="block rounded-2xl bg-white shadow-lg p-8 text-center transition-transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="bg-accent p-4 rounded-full">
                  <MicIcon className="h-16 w-16 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Learning Support Oral Agent</h2>
              <p className="text-neutral-500">Practice your public speaking and presentation skills with an AI agent.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
