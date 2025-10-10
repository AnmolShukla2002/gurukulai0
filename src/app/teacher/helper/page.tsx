
'use client'

import { useState, useRef } from 'react';
import { generateQuestionPaper } from './actions';
import { Document, Packer, Paragraph } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

export default function TeacherHelperPage() {
  const [format, setFormat] = useState('');
  const [instructions, setInstructions] = useState('');
  const [questionPaper, setQuestionPaper] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const referenceFileRef = useRef<HTMLInputElement>(null);
  const contentFilesRef = useRef<HTMLInputElement>(null);

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

    if (result.success) {
      setQuestionPaper(result.questionPaper as string);
    } else {
      setError(result.error as string);
    }
  };

  const handleExportDoc = () => {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph(questionPaper),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'question-paper.docx');
    });
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.text(questionPaper, 10, 10);
    doc.save('question-paper.pdf');
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-google-red text-white flex items-center justify-between p-4">
        <a href="/teacher/dashboard" className="text-xl font-bold"> &larr; Back to Dashboard</a>
        <h1 className="text-2xl font-bold">Teacher Helper Question Paper Generator</h1>
        <div></div>
      </header>
      <main className="main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="format">Format Specification (Optional)</label>
            <textarea
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              placeholder="e.g., 5 true/false questions, 5 match the following, 5 brief questions worth 5 marks each"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reference-file">Reference Integration (Optional)</label>
            <input type="file" id="reference-file" ref={referenceFileRef} />
            <p className="file-info">Upload a previous year's paper for format and style matching.</p>
          </div>
          <div className="form-group">
            <label htmlFor="content-file">Content Upload (Optional)</label>
            <input type="file" id="content-file" ref={contentFilesRef} multiple />
            <p className="file-info">Upload textbooks, study units, or reference materials (PDF, DOCX, PPT).</p>
          </div>
          <div className="form-group">
            <label htmlFor="instructions">Custom Instructions (Optional)</label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Distribute marks portion-wise: 40% from Chapter 1, 35% from Chapter 2, and 25% from Chapter 3. Set question complexity to medium."
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </form>

        {loading && (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Generating your question paper, please wait...</p>
          </div>
        )}

        {questionPaper && (
          <div className="result-container">
            <h2>Generated Question Paper & Answer Key</h2>
            <pre className="result-box">{questionPaper}</pre>
            <div className="export-btn-group">
              <button onClick={handleExportDoc} className="submit-btn" style={{marginRight: '1rem' }}>Export as DOC</button>
              <button onClick={handleExportPdf} className="submit-btn">Export as PDF</button>
            </div>
          </div>
        )}

        {error && (
          <div className="error-container">
            <h2>Error</h2>
            <p className="error-box">{error}</p>
          </div>
        )}
      </main>
    </div>
  );
}
