
'use client'

import { useState } from 'react';
import { generateChapter } from './actions';

export default function StudentLearningCreatorPage() {
  const [topic, setTopic] = useState('');
  const [learningStyle, setLearningStyle] = useState('');
  const [chapter, setChapter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setChapter('');
    setLoading(true);

    const result = await generateChapter(topic, learningStyle);
    setLoading(false);

    if (result.success) {
      setChapter(result.chapter as string);
    } else {
      setError(result.error as string);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <a href="/" style={{ textDecoration: 'none', color: 'inherit', alignSelf: 'flex-start' }}>&larr; Back to Home</a>
        <h1>Student Dynamic Learning Chapter Creator</h1>
      </header>
      <main className="main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="topic">Topic</label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Photosynthesis, The French Revolution"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="learning-style">Learning Style</label>
            <input
              type="text"
              id="learning-style"
              value={learningStyle}
              onChange={(e) => setLearningStyle(e.target.value)}
              placeholder="e.g., Visual, Auditory, Kinesthetic, Reading/Writing"
              required
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Chapter'}
          </button>
        </form>

        {loading && (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Generating your chapter, please wait...</p>
          </div>
        )}

        {chapter && (
          <div className="result-container">
            <h2>Generated Chapter</h2>
            <div className="result-box">{chapter}</div>
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
