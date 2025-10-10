
'use client'

import { useState } from 'react';
import { generateChapter, evaluateTheoryQuestion, generateQuizFeedback } from './actions';

interface Flashcard {
  id: string;
  front: string;
  back: string;
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
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const handleGenerationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setChapter(null);
    setLoading(true);
    setSelectedAnswers({});
    setTheoryAnswers({});
    setFinalFeedback(null);
    setQuizSubmitted(false);
    setFlippedCards({});

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
  
  const handleCardFlip = (cardId: string) => {
    setFlippedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  return (
    <div className="bg-neutral-100 min-h-screen">
      <header className="bg-secondary text-white flex items-center justify-between p-4 shadow-md">
        <a href="/student/dashboard" className="text-xl font-bold hover:underline"> &larr; Back to Dashboard</a>
        <h1 className="text-2xl font-bold">Dynamic Learning Chapter Creator</h1>
        <div></div>
      </header>
      <main className="main flex flex-col items-center">
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
            <p className="text-error">{error}</p>
          </div>
        )}

        {chapter && (
          <div className="result-container">
             {!finalFeedback && (
                <>
                    <h2 className="text-3xl font-bold mb-6 text-center">Generated Chapter</h2>
                    <div className="mb-12">
                        <h3 className="text-2xl font-semibold mb-4">Flashcards</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {chapter.flashcards.map(card => (
                               <div key={card.id} className="flashcard-container" onClick={() => handleCardFlip(card.id)}>
                               <div className={`flashcard ${flippedCards[card.id] ? 'is-flipped' : ''}`}>
                                 <div className="flashcard-front">
                                   <p>{card.front}</p>
                                   <small className="text-neutral-500">Click to flip</small>
                                 </div>
                                 <div className="flashcard-back">
                                   <p>{card.back}</p>
                                 </div>
                               </div>
                             </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold mb-4 text-center">Quiz</h3>
                        <form onSubmit={handleQuizSubmit} className="space-y-8">
                            {chapter.questions.map(question => (
                                <div key={question.id} className="p-6 bg-white rounded-xl shadow-md">
                                    <p className="font-semibold text-lg mb-4">{question.question}</p>
                                    {question.type === 'multiple-choice' && question.options && (
                                        <div className="space-y-3">
                                            {question.options.map(option => (
                                                <label key={option} className="flex items-center p-3 rounded-lg hover:bg-neutral-200 transition-colors">
                                                    <input
                                                        type="radio"
                                                        name={question.id}
                                                        value={option}
                                                        onChange={() => handleMultipleChoiceChange(question.id, option)}
                                                        checked={selectedAnswers[question.id] === option}
                                                        disabled={quizSubmitted}
                                                        className="mr-3"
                                                    />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {question.type === 'theory' && (
                                        <textarea
                                            value={theoryAnswers[question.id] || ''}
                                            onChange={(e) => handleTheoryChange(question.id, e.target.value)}
                                            placeholder="Your answer..."
                                            disabled={quizSubmitted}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
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
                <div className="mt-8">
                    <h2 className="text-3xl font-bold mb-4 text-center">Quiz Results</h2>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <h3 className="text-2xl font-semibold mb-4 text-center">{finalFeedback.scoreText}</h3>
                      <div className="mb-6">
                          <h4 className="text-xl font-semibold">Key Takeaways</h4>
                          <p className="text-neutral-700 mt-2">{finalFeedback.keyTakeaways}</p>
                      </div>
                      <div>
                          <h4 className="text-xl font-semibold">Detailed Review</h4>
                          {finalFeedback.detailedReview.map((review, index) => (
                              <div key={index} className="p-4 border-t border-neutral-200 mt-4">
                                  <p className="font-semibold">Question: {review.question}</p>
                                  <p className="text-neutral-700">Your Answer: {review.yourAnswer}</p>
                                  <p className="text-primary">Feedback: {review.feedback}</p>
                              </div>
                          ))}
                      </div>
                    </div>
                </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
