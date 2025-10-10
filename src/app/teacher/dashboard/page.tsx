
import { DocumentIcon } from "@/components/DocumentIcon";
import Link from "next/link";

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="bg-secondary text-white text-center py-12">
        <h1 className="text-5xl font-bold">Teacher Dashboard</h1>
        <p className="text-xl mt-2">Leverage AI to enhance your teaching</p>
      </header>
      <main className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-10">
          <Link href="/teacher/helper" className="block rounded-2xl bg-white shadow-lg p-8 text-center transition-transform hover:scale-105">
            <div className="flex justify-center mb-4">
                <div className="bg-primary p-4 rounded-full">
                    <DocumentIcon className="h-16 w-16 text-white" />
                </div>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Question Paper Generator</h2>
            <p className="text-neutral-500">Generate question papers for any subject and any grade in minutes.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
