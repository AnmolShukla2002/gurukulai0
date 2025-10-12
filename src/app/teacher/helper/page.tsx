'use client'

import { useState } from 'react';
import { generateQuestionPaper } from './actions';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import Link from 'next/link';
import { ArrowLeftIcon, DocumentIcon, FileTextIcon, SparklesIcon, UploadIcon, WandIcon, LoaderCircle } from '@/components/Icons';

export default function TeacherHelperPage() {
  const [format, setFormat] = useState('');
  const [instructions, setInstructions] = useState('');
  const [questionPaper, setQuestionPaper] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [contentFiles, setContentFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('format', format);
    formData.append('instructions', instructions);

    if (referenceFile) {
      formData.append('reference-file', referenceFile);
    }

    if (contentFiles.length > 0) {
      for (const file of contentFiles) {
        formData.append('content-file', file);
      }
    }

    setLoading(true);
    setError('');
    setQuestionPaper('');

    const result = await generateQuestionPaper(formData);
    
    setLoading(false);

    if (result.success && result.questionPaper) {
      setQuestionPaper(result.questionPaper);
    } else {
      setError(result.error || 'An unexpected error occurred.');
    }
  };

  const handleExportDoc = () => {
    if (!questionPaper) return;
    const paragraphs = questionPaper.split('\n').map(line => new Paragraph({
        children: [new TextRun(line)]
    }));
    const doc = new Document({ sections: [{ children: paragraphs }] });
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'question-paper.docx');
    });
  };

  const handleExportPdf = () => {
    if (!questionPaper) return;
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(questionPaper, 180);
    doc.text(splitText, 10, 10);
    doc.save('question-paper.pdf');
  };

  const FormStep = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-card/50 rounded-xl p-6 border border-border">
        <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary/20 text-primary p-2 rounded-lg">{icon}</div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        {children}
    </div>
  );

  return (
    <div className="min-h-screen w-full animated-gradient">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link href="/teacher/dashboard" className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Question Paper Generator</h1>
          <div className="w-36"></div> {/* Spacer */}
        </div>
      </header>

      <main className="container mx-auto py-8 md:py-12 px-4">
        {!questionPaper && !loading && (
            <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
                <FormStep icon={<FileTextIcon className="h-6 w-6"/>} title="Format Specification">
                    <textarea
                        id="format"
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        placeholder="e.g., 5 true/false questions, 5 match the following, 5 brief questions worth 5 marks each..."
                        className="w-full p-3 bg-input/50 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary min-h-[100px]"
                    />
                </FormStep>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormStep icon={<DocumentIcon className="h-6 w-6"/>} title="Reference Paper (Optional)">
                        <label htmlFor="reference-file" className="flex flex-col items-center justify-center gap-2 w-full p-4 bg-input/50 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                            <UploadIcon className="h-8 w-8 text-muted-foreground"/>
                            <span className="text-sm text-muted-foreground text-center">{referenceFile?.name || "Upload for style matching"}</span>
                        </label>
                        <input type="file" id="reference-file" className="sr-only" onChange={(e) => setReferenceFile(e.target.files?.[0] || null)} />
                    </FormStep>
                    <FormStep icon={<UploadIcon className="h-6 w-6"/>} title="Content Materials (Optional)">
                        <label htmlFor="content-file" className="flex flex-col items-center justify-center gap-2 w-full p-4 bg-input/50 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                            <UploadIcon className="h-8 w-8 text-muted-foreground"/>
                            <span className="text-sm text-muted-foreground text-center">{contentFiles.length > 0 ? `${contentFiles.length} file(s) selected` : "Upload textbooks, notes"}</span>
                        </label>
                        <input type="file" id="content-file" multiple className="sr-only" onChange={(e) => setContentFiles(Array.from(e.target.files || []))} />
                    </FormStep>
                </div>

                <FormStep icon={<SparklesIcon className="h-6 w-6"/>} title="Custom Instructions (Optional)">
                     <textarea
                        id="instructions"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="e.g., Distribute marks portion-wise: 40% from Chapter 1... Set question complexity to medium."
                        className="w-full p-3 bg-input/50 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary min-h-[100px]"
                    />
                </FormStep>

                <div className="flex justify-center pt-4">
                    <button type="submit" className="w-full max-w-sm flex items-center justify-center gap-3 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 disabled:bg-muted disabled:cursor-not-allowed" disabled={loading}>
                        <WandIcon className="h-6 w-6"/>
                        <span className="text-lg">Generate Question Paper</span>
                    </button>
                </div>
            </form>
        )}

        {loading && (
          <div className="text-center text-white">
            <LoaderCircle className="h-12 w-12 animate-spin mx-auto mb-4"/>
            <h2 className="text-2xl font-bold">Generating Your Question Paper...</h2>
            <p className="text-primary-foreground/80">The AI is crafting the questions, please wait.</p>
          </div>
        )}

        {questionPaper && (
          <div className="mx-auto max-w-4xl bg-card/80 backdrop-blur-lg border border-white/20 rounded-2xl p-8 message-enter">
            <h2 className="text-3xl font-bold mb-6 text-center">Generated Paper & Answer Key</h2>
            <pre className="bg-background/50 p-6 rounded-lg whitespace-pre-wrap text-sm font-mono max-h-[50vh] overflow-auto border border-border">{questionPaper}</pre>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={handleExportDoc} className="flex-1 flex items-center justify-center gap-3 py-3 px-4 bg-secondary text-secondary-foreground font-semibold rounded-lg shadow-lg hover:bg-secondary/90 transition-transform hover:scale-105">Export as DOCX</button>
              <button onClick={handleExportPdf} className="flex-1 flex items-center justify-center gap-3 py-3 px-4 bg-accent text-accent-foreground font-semibold rounded-lg shadow-lg hover:bg-accent/90 transition-transform hover:scale-105">Export as PDF</button>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-2xl bg-destructive/80 backdrop-blur-lg border border-red-500/50 rounded-2xl p-8 text-center text-destructive-foreground">
              <h2 className="text-2xl font-bold mb-2">Error</h2>
              <p>{error}</p>
          </div>
        )}
      </main>
    </div>
  );
}
