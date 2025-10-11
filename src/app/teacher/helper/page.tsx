
// 'use client'

// import { useState, useRef } from 'react';
// import { generateQuestionPaper } from './actions';
// import { Document, Packer, Paragraph } from 'docx';
// import { saveAs } from 'file-saver';
// import jsPDF from 'jspdf';

// export default function TeacherHelperPage() {
//   const [format, setFormat] = useState('');
//   const [instructions, setInstructions] = useState('');
//   const [questionPaper, setQuestionPaper] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const referenceFileRef = useRef<HTMLInputElement>(null);
//   const contentFilesRef = useRef<HTMLInputElement>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setQuestionPaper('');
//     setLoading(true);

//     const formData = new FormData();
//     formData.append('format', format);
//     formData.append('instructions', instructions);

//     if (referenceFileRef.current?.files?.[0]) {
//       formData.append('reference-file', referenceFileRef.current.files[0]);
//     }

//     if (contentFilesRef.current?.files) {
//       for (const file of Array.from(contentFilesRef.current.files)) {
//         formData.append('content-file', file);
//       }
//     }

//     const result = await generateQuestionPaper(formData);
//     setLoading(false);

//     if (result.success) {
//       setQuestionPaper(result.questionPaper as string);
//     } else {
//       setError(result.error as string);
//     }
//   };

//   const handleExportDoc = () => {
//     const doc = new Document({
//       sections: [
//         {
//           children: [
//             new Paragraph(questionPaper),
//           ],
//         },
//       ],
//     });

//     Packer.toBlob(doc).then((blob) => {
//       saveAs(blob, 'question-paper.docx');
//     });
//   };

//   const handleExportPdf = () => {
//     const doc = new jsPDF();
//     doc.text(questionPaper, 10, 10);
//     doc.save('question-paper.pdf');
//   };

//   return (
//     <div className="bg-neutral-100 min-h-screen">
//       <header className="bg-primary text-white flex items-center justify-between p-4 shadow-md">
//         <a href="/teacher/dashboard" className="text-xl font-bold hover:underline"> &larr; Back to Dashboard</a>
//         <h1 className="text-2xl font-bold">Question Paper Generator</h1>
//         <div></div>
//       </header>
//       <main className="main flex flex-col items-center">
//         <form onSubmit={handleSubmit} className="form-container">
//           <div className="form-group">
//             <label htmlFor="format">Format Specification (Optional)</label>
//             <textarea
//               id="format"
//               value={format}
//               onChange={(e) => setFormat(e.target.value)}
//               placeholder="e.g., 5 true/false questions, 5 match the following, 5 brief questions worth 5 marks each"
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="reference-file">Reference Integration (Optional)</label>
//             <input type="file" id="reference-file" ref={referenceFileRef} />
//             <p className="file-info">Upload a previous year's paper for format and style matching.</p>
//           </div>
//           <div className="form-group">
//             <label htmlFor="content-file">Content Upload (Optional)</label>
//             <input type="file" id="content-file" ref={contentFilesRef} multiple />
//             <p className="file-info">Upload textbooks, study units, or reference materials (PDF, DOCX, PPT).</p>
//           </div>
//           <div className="form-group">
//             <label htmlFor="instructions">Custom Instructions (Optional)</label>
//             <textarea
//               id="instructions"
//               value={instructions}
//               onChange={(e) => setInstructions(e.target.value)}
//               placeholder="e.g., Distribute marks portion-wise: 40% from Chapter 1, 35% from Chapter 2, and 25% from Chapter 3. Set question complexity to medium."
//             />
//           </div>
//           <button type="submit" className="submit-btn" disabled={loading}>
//             {loading ? 'Generating...' : 'Generate'}
//           </button>
//         </form>

//         {loading && (
//           <div className="loading-container">
//             <div className="loader"></div>
//             <p>Generating your question paper, please wait...</p>
//           </div>
//         )}

//         {questionPaper && (
//           <div className="result-container">
//             <h2 className="text-3xl font-bold mb-4">Generated Question Paper & Answer Key</h2>
//             <pre className="bg-neutral-200 p-4 rounded-lg whitespace-pre-wrap">{questionPaper}</pre>
//             <div className="mt-6 flex space-x-4">
//               <button onClick={handleExportDoc} className="submit-btn">Export as DOC</button>
//               <button onClick={handleExportPdf} className="submit-btn">Export as PDF</button>
//             </div>
//           </div>
//         )}

//         {error && (
//           <div className="error-container">
//             <h2 className="text-2xl font-bold mb-2">Error</h2>
//             <p className="text-error">{error}</p>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

'use client'

import { useState, useRef } from 'react';
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

  const referenceFileRef = useRef<HTMLInputElement>(null);
  const contentFilesRef = useRef<HTMLInputElement>(null);
  const [referenceFileName, setReferenceFileName] = useState('');
  const [contentFileNames, setContentFileNames] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setQuestionPaper('');
    setLoading(true);

    const formData = new FormData();
    formData.append('format', format);
    formData.append('instructions', instructions);

    if (referenceFileRef.current?.files?.[0]) {
      formData.append('reference-file', referenceFileRef.current.files[0]);
    }

    if (contentFilesRef.current?.files) {
      for (const file of Array.from(contentFilesRef.current.files)) {
        formData.append('content-file', file);
      }
    }

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
                            <span className="text-sm text-muted-foreground text-center">{referenceFileName || "Upload for style matching"}</span>
                        </label>
                        <input type="file" id="reference-file" ref={referenceFileRef} className="sr-only" onChange={(e) => setReferenceFileName(e.target.files?.[0]?.name || '')}/>
                    </FormStep>
                    <FormStep icon={<UploadIcon className="h-6 w-6"/>} title="Content Materials (Optional)">
                        <label htmlFor="content-file" className="flex flex-col items-center justify-center gap-2 w-full p-4 bg-input/50 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                            <UploadIcon className="h-8 w-8 text-muted-foreground"/>
                            <span className="text-sm text-muted-foreground text-center">{contentFileNames.length > 0 ? `${contentFileNames.length} file(s) selected` : "Upload textbooks, notes"}</span>
                        </label>
                        <input type="file" id="content-file" ref={contentFilesRef} multiple className="sr-only" onChange={(e) => setContentFileNames(Array.from(e.target.files || []).map(f => f.name))}/>
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