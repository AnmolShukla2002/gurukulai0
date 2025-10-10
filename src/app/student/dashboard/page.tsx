
import { BookOpenIcon } from "@/components/BookOpenIcon";
import { MicIcon } from "@/components/MicIcon";

export default function StudentDashboard() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-google-blue text-white text-center py-8">
        <h1 className="text-4xl font-bold">Student Dashboard</h1>
      </header>
      <main className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <a href="/student/learning-creator" className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center text-center hover:bg-gray-200 transition-colors" style={{ textDecoration: 'none', color: 'inherit' }}>
            <BookOpenIcon className="h-16 w-16 text-google-yellow mb-4" />
            <h2 className="text-2xl font-bold text-google-yellow mb-2">Student Dynamic Learning Chapter Creator</h2>
            <p className="text-gray-600">Create personalized learning chapters tailored to your needs.</p>
          </a>
          <a href="/student/learning-support-agent" className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center text-center hover:bg-gray-200 transition-colors" style={{ textDecoration: 'none', color: 'inherit' }}>
            <MicIcon className="h-16 w-16 text-google-green mb-4" />
            <h2 className="text-2xl font-bold text-google-green mb-2">Learning Support Oral Agent</h2>
            <p className="text-gray-600">Practice your public speaking and presentation skills with an AI agent.</p>
          </a>
        </div>
      </main>
    </div>
  );
}
