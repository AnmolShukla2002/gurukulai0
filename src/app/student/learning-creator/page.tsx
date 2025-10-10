
'use client'

import { useState } from 'react';
import { generateChapter, evaluateTheoryQuestion, generateQuizFeedback } from './actions';

interface Flashcard {
  id: string;
  content: string;
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'theory';
  question: string;
  options?: string[];
  answer: string;
}

interface Chapter {
  id: string;
  flashcards: Flashcard[];
  questions: Question[];
}

interface TheoryEvaluation {
  evaluation: 'correct' | 'partially-correct' | 'incorrect';
  feedback: string;
}

interface QuizResult {
  questionId: string;
  question: string;
  type: 'multiple-choice' | 'theory';
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  evaluation?: TheoryEvaluation;
}

interface FinalFeedback {
  scoreText: string;
  keyTakeaways: string;
  detailedReview: {
    question: string;
    yourAnswer: string;
    feedback: string;
  }[];
}

export default function StudentLearningCreatorPage() {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [theoryAnswers, setTheoryAnswers] = useState<Record<string, string>>({});
  const [finalFeedback, setFinalFeedback] = useState<FinalFeedback | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleGenerationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setChapter(null);
    setLoading(true);
    setSelectedAnswers({});
    setTheoryAnswers({});
    setFinalFeedback(null);
    setQuizSubmitted(false);

    const formData = new FormData(e.currentTarget);
    const result = await generateChapter(formData);
    setLoading(false);

    if (result.success) {
      setChapter(result.chapter as Chapter);
    } else {
      setError(result.error as string);
    }
  };

  const handleMultipleChoiceChange = (questionId: string, selectedOption: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: selectedOption,
    });
  };

  const handleTheoryChange = (questionId: string, answer: string) => {
    setTheoryAnswers({
      ...theoryAnswers,
      [questionId]: answer,
    });
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapter) return;
    
    setQuizLoading(true);
    const allResults: QuizResult[] = [];

    for (const question of chapter.questions) {
      if (question.type === 'multiple-choice') {
        const userAnswer = selectedAnswers[question.id] || "Not answered";
        allResults.push({
          questionId: question.id,
          question: question.question,
          type: 'multiple-choice',
          userAnswer: userAnswer,
          correctAnswer: question.answer,
          isCorrect: userAnswer === question.answer,
        });
      } else if (question.type === 'theory') {
        const userAnswer = theoryAnswers[question.id] || "Not answered";
        const result = await evaluateTheoryQuestion(userAnswer, question.answer);
        if (result.success) {
          allResults.push({
            questionId: question.id,
            question: question.question,
            type: 'theory',
            userAnswer: userAnswer,
            correctAnswer: question.answer,
            isCorrect: result.evaluation.evaluation === 'correct',
            evaluation: result.evaluation,
          });
        } else {
          setError('Failed to evaluate one or more theory questions.');
        }
      }
    }

    const feedbackResult = await generateQuizFeedback(allResults);
    if (feedbackResult.success) {
        setFinalFeedback(feedbackResult.feedback);
    } else {
        setError('Failed to generate the final feedback report.');
    }
    
    setQuizLoading(false);
    setQuizSubmitted(true);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-google-yellow text-white flex items-center justify-between p-4">
        <a href="/student/dashboard" className="text-xl font-bold"> &larr; Back to Dashboard</a>
        <h1 className="text-2xl font-bold">Student Dynamic Learning Chapter Creator</h1>
        <div></div>
      </header>
      <main className="main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!chapter && (
            <form onSubmit={handleGenerationSubmit} className="form-container">
              <div className="form-group">
                <label htmlFor="topic">Topic</label>
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  placeholder="e.g., Photosynthesis, The French Revolution"
                />
              </div>
              <div className="form-group">
                <label htmlFor="learning-style">Learning Style</label>
                <input
                  type="text"
                  id="learning-style"
                  name="learning-style"
                  placeholder="e.g., Visual, Auditory, Kinesthetic, Reading/Writing"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="file">Upload PDF</label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  accept=".pdf"
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Chapter'}
              </button>
            </form>
        )}

        {loading && (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Generating your chapter, please wait...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <h2>Error</h2>
            <p className="error-box">{error}</p>
          </div>
        )}

        {chapter && (
          <div className="result-container">
             {!finalFeedback && (
                <>
                    <h2>Generated Chapter</h2>
                    <div className="flashcards-section">
                        <h3>Flashcards</h3>
                        <div className="flashcards-grid">
                            {chapter.flashcards.map(card => (
                                <div key={card.id} className="flashcard">
                                    {card.content}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="quiz-section">
                        <h3>Quiz</h3>
                        <form onSubmit={handleQuizSubmit}>
                            {chapter.questions.map(question => (
                                <div key={question.id} className="question-block">
                                    <p className="question-text">{question.question}</p>
                                    {question.type === 'multiple-choice' && question.options && (
                                        <div className="options-group">
                                            {question.options.map(option => (
                                                <label key={option} className="option-label">
                                                    <input
                                                        type="radio"
                                                        name={question.id}
                                                        value={option}
                                                        onChange={() => handleMultipleChoiceChange(question.id, option)}
                                                        checked={selectedAnswers[question.id] === option}
                                                        disabled={quizSubmitted}
                                                    />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {question.type === 'theory' && (
                                        <textarea
                                            className="theory-textarea"
                                            value={theoryAnswers[question.id] || ''}
                                            onChange={(e) => handleTheoryChange(question.id, e.target.value)}
                                            placeholder="Your answer..."
                                            disabled={quizSubmitted}
                                        />
                                    )}
                                </div>
                            ))}
                            <button type="submit" className="submit-btn" disabled={quizLoading}>
                                {quizLoading ? 'Evaluating...' : 'Submit Quiz'}
                            </button>
                        </form>
                    </div>
                </>
            )}
            {quizLoading && (
              <div className="loading-container">
                <div className="loader"></div>
                <p>Evaluating your quiz, please wait...</p>
              </div>
            )}

            {finalFeedback && (
                <div className="feedback-section">
                    <h2>Quiz Results</h2>
                    <h3>{finalFeedback.scoreText}</h3>
                    <div className="feedback-block">
                        <h4>Key Takeaways</h4>
                        <p>{finalFeedback.keyTakeaways}</p>
                    </div>
                    <div className="feedback-block">
                        <h4>Detailed Review</h4>
                        {finalFeedback.detailedReview.map((review, index) => (
                            <div key={index} className="review-item">
                                <p><strong>Question:</strong> {review.question}</p>
                                <p><strong>Your Answer:</strong> {review.yourAnswer}</p>
                                <p><strong>Feedback:</strong> {review.feedback}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        )}
      </main>
       <style jsx>{`
        .flashcards-section, .quiz-section, .feedback-section {
          width: 100%;
          margin-top: 2rem;
        }
        .flashcards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }
        .flashcard {
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .question-block {
          margin-bottom: 1.5rem;
          padding: 1rem;
          border: 1px solid #eee;
          border-radius: 8px;
        }
        .question-text {
          font-weight: bold;
        }
        .options-group {
          display: flex;
          flex-direction: column;
        }
        .option-label {
          margin: 0.25rem 0;
        }
        .theory-textarea {
          width: 100%;
          min-height: 100px;
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #ccc;
        }
        .feedback-block {
            margin-bottom: 2rem;
        }
        .review-item {
            padding: 1rem;
            border: 1px solid #eee;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}
