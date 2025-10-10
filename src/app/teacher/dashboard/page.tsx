
import { DocumentIcon } from "@/components/DocumentIcon";

export default function TeacherDashboard() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-google-blue text-white text-center py-8">
        <h1 className="text-4xl font-bold">Teacher Dashboard</h1>
      </header>
      <main className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
          <a href="/teacher/helper" className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center text-center hover:bg-gray-200 transition-colors" style={{ textDecoration: 'none', color: 'inherit' }}>
            <DocumentIcon className="h-16 w-16 text-google-red mb-4" />
            <h2 className="text-2xl font-bold text-google-red mb-2">Teacher Helper Question Paper Generator</h2>
            <p className="text-gray-600">Generate question papers for any subject and any grade in minutes.</p>
          </a>
        </div>
      </main>
    </div>
  );
}
