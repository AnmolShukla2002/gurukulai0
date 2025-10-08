
import { BookOpenIcon } from "@/components/BookOpenIcon";
import { DocumentIcon } from "@/components/DocumentIcon";
import { MicIcon } from "@/components/MicIcon";

export default function HomePage() {
  return (
    <div className="container">
      <header className="header">
        <h1>Teacher & Student AI Tools</h1>
      </header>
      <main className="main">
        <a href="/teacher-helper" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <DocumentIcon className="icon" />
          <h2>Teacher Helper Question Paper Generator</h2>
          <p>Generate question papers for any subject and any grade in minutes.</p>
        </a>
        <a href="/student-learning-creator" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <BookOpenIcon className="icon" />
          <h2>Student Dynamic Learning Chapter Creator</h2>
          <p>Create personalized learning chapters tailored to your needs.</p>
        </a>
        <a href="/learning-support-agent" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <MicIcon className="icon" />
          <h2>Learning Support Oral Agent</h2>
          <p>Practice your public speaking and presentation skills with an AI agent.</p>
        </a>
      </main>
    </div>
  );
}
