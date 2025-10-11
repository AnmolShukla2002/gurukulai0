import { DocumentIcon } from "@/components/Icons"; // Assuming DocumentIcon is in your Icons.tsx
import Link from "next/link";

export default function TeacherDashboard() {
  return (
    // Use the animated gradient from the login page for a consistent background
    <div className="min-h-screen w-full animated-gradient">
      <main className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header Section */}
        <div className="text-center text-white mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Welcome, Teacher!</h1>
          <p className="text-xl mt-4 max-w-2xl mx-auto text-primary-foreground/80">
            Leverage AI to enhance your teaching and streamline your workflow.
          </p>
        </div>

        {/* Action Card */}
        <div className="w-full max-w-lg">
          <Link 
            href="/teacher/helper" 
            className="group block rounded-3xl p-8 text-center glow-card"
          >
            {/* Glassmorphism background effect */}
            <div className="absolute inset-0 bg-card/60 backdrop-blur-lg rounded-3xl border border-white/20"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-primary/80 p-4 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg mb-6">
                <DocumentIcon className="h-12 w-12 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Question Paper Generator</h2>
              <p className="text-muted-foreground">
                Generate comprehensive question papers for any subject and grade in minutes.
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}