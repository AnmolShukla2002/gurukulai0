'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react';
import { evaluateTheoryQuestion, generateQuizFeedback } from '@/app/student/learning-creator/actions';
import Confetti from "react-confetti";

// Re-defining interfaces here for clarity, though they could be in a shared types file
interface Flashcard {
  id: string;
  front: string;
  back: string;
}
interface Question {
  id: string;
  type: "multiple-choice" | "theory";
  question: string;
  options?: string[];
  answer: string;
}
interface Chapter {
  _id: string;
  topic: string;
  flashcards: Flashcard[];
  questions: Question[];
}
interface QuizResult {
  questionId: string;
  question: string;
  type: "multiple-choice" | "theory";
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  evaluation?: any;
}
interface FinalFeedback {
    score: number;
    total: number;
    scoreText: string;
    keyTakeaways: string;
    detailedReview: any[];
}


export default function ChapterViewer({ chapterId }: { chapterId: string }) {
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // States for interactivity, copied from learning-creator
    const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz'>('flashcards');
    const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [theoryAnswers, setTheoryAnswers] = useState<Record<string, string>>({});
    const [quizLoading, setQuizLoading] = useState(false);
    const [finalFeedback, setFinalFeedback] = useState<FinalFeedback | null>(null);
    const [reviewIndex, setReviewIndex] = useState(0);


    useEffect(() => {
        const fetchChapter = async () => {
            try {
                const response = await fetch(`/api/student/chapters/${chapterId}`);
                if (!response.ok) throw new Error('Failed to fetch chapter.');
                const result = await response.json();
                if (result.success) {
                    setChapter(result.data);
                } else {
                    throw new Error(result.error || 'Could not fetch chapter data.');
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (chapterId) {
            fetchChapter();
        }
    }, [chapterId]);
    
    // --- All handlers and computed values from learning-creator ---
    const handleCardFlip = (cardId: string) => setFlippedCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
    const handleMultipleChoiceChange = (questionId: string, selectedOption: string) => setSelectedAnswers({ ...selectedAnswers, [questionId]: selectedOption });
    const handleTheoryChange = (questionId: string, answer: string) => setTheoryAnswers({ ...theoryAnswers, [questionId]: answer });

    const handleQuizSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chapter) return;
    
        setQuizLoading(true);
        const allResults: QuizResult[] = [];
    
        for (const question of chapter.questions) {
          if (question.type === "multiple-choice") {
            const userAnswer = selectedAnswers[question.id] || "Not answered";
            allResults.push({ questionId: question.id, question: question.question, type: "multiple-choice", userAnswer, correctAnswer: question.answer, isCorrect: userAnswer === question.answer });
          } else if (question.type === "theory") {
            const userAnswer = theoryAnswers[question.id] || "Not answered";
            const result = await evaluateTheoryQuestion(userAnswer, question.answer);
            if (result.success) {
              allResults.push({ questionId: question.id, question: question.question, type: "theory", userAnswer, correctAnswer: question.answer, isCorrect: result.evaluation.evaluation === "correct", evaluation: result.evaluation });
            }
          }
        }
    
        const feedbackResult = await generateQuizFeedback(allResults);
        if (feedbackResult.success) {
          setFinalFeedback(feedbackResult.feedback as FinalFeedback);
        } else {
          setError("Failed to generate the final feedback report.");
        }
    
        setQuizLoading(false);
    };

    const currentQuestion = chapter?.questions[currentQuestionIndex];
    const scorePercentage = useMemo(() => {
        if (!finalFeedback) return 0;
        return (finalFeedback.score / finalFeedback.total) * 100;
    }, [finalFeedback]);

    // --- Loading and Error States ---
    if (loading) {
        return <div className="min-h-screen animated-gradient flex items-center justify-center"><Loader2Icon className="h-16 w-16 animate-spin text-white" /></div>;
    }
    if (error) {
        return <div className="min-h-screen animated-gradient flex items-center justify-center text-white text-center bg-red-500/50 p-8 rounded-lg">Error: {error}</div>;
    }
    if (!chapter) {
        return <div className="min-h-screen animated-gradient flex items-center justify-center text-white">Chapter not found.</div>;
    }

    // --- Main Render ---
    return (
        <div className="min-h-screen w-full animated-gradient text-foreground">
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="container mx-auto flex items-center justify-between p-4">
                    <Link href="/student/my-library" className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors">
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to Library
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight truncate">{chapter.topic}</h1>
                    <div className="w-28"></div>
                </div>
            </header>

            <main className="container mx-auto py-8 md:py-12 px-4">
            {/* --- Copied UI from learning-creator page --- */}
            {!finalFeedback ? (
                <div className="w-full">
                    <div className="flex justify-center border-b border-border mb-8">
                    <button onClick={() => setActiveTab("flashcards")} className={`px-6 py-3 font-semibold transition-colors ${activeTab === "flashcards" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>Flashcards</button>
                    <button onClick={() => setActiveTab("quiz")} className={`px-6 py-3 font-semibold transition-colors ${activeTab === "quiz" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>Quiz</button>
                    </div>

                    {activeTab === "flashcards" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {chapter.flashcards.map((card) => (
                        <div className="scene h-64" key={card.id} onClick={() => handleCardFlip(card.id)}>
                            <div className={`flashcard h-full w-full ${flippedCards[card.id] ? "is-flipped" : ""}`}>
                            <div className="card-face card-face-front absolute h-full w-full rounded-2xl p-6 flex flex-col justify-center items-center text-center bg-card/60 backdrop-blur-lg border border-white/20 text-card-foreground">
                                <p className="text-lg font-semibold">{card.front}</p>
                                <small className="text-muted-foreground/70 mt-4 absolute bottom-4">Click to flip</small>
                            </div>
                            <div className="card-face card-face-back absolute h-full w-full rounded-2xl p-6 flex flex-col justify-center items-center text-center bg-secondary/80 backdrop-blur-lg border border-white/20 text-secondary-foreground">
                                <p>{card.back}</p>
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    )}

                    {activeTab === "quiz" && currentQuestion && (
                    <div className="mx-auto max-w-3xl">
                        <div className="mb-4">
                        <p className="text-sm text-center text-muted-foreground mb-2">Question {currentQuestionIndex + 1} of {chapter.questions.length}</p>
                        <div className="w-full bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / chapter.questions.length) * 100}%`}}></div></div>
                        </div>
                        <div className="bg-card/60 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
                        <p className="font-semibold text-xl mb-6 text-center">{currentQuestion.question}</p>
                        {currentQuestion.type === "multiple-choice" && (
                            <div className="space-y-3">
                            {currentQuestion.options?.map((option) => (
                                <label key={option} className={`flex items-center p-4 rounded-lg border transition-all cursor-pointer ${selectedAnswers[currentQuestion.id] === option ? "border-primary bg-primary/10 ring-2 ring-primary" : "border-border hover:border-primary/50"}`}>
                                <input type="radio" name={currentQuestion.id} value={option} onChange={() => handleMultipleChoiceChange(currentQuestion.id, option)} checked={selectedAnswers[currentQuestion.id] === option} className="sr-only" />
                                <span>{option}</span>
                                </label>
                            ))}
                            </div>
                        )}
                        {currentQuestion.type === "theory" && (
                            <textarea value={theoryAnswers[currentQuestion.id] || ""} onChange={(e) => handleTheoryChange(currentQuestion.id, e.target.value)} placeholder="Your answer..." className="w-full p-3 bg-input/50 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary min-h-[120px]" />
                        )}
                        </div>
                        <div className="flex justify-between items-center mt-8">
                        <button onClick={() => setCurrentQuestionIndex((i) => i - 1)} disabled={currentQuestionIndex === 0} className="px-6 py-2 bg-muted text-muted-foreground rounded-lg disabled:opacity-50 hover:bg-muted/80 transition-colors">Previous</button>
                        {currentQuestionIndex < chapter.questions.length - 1 ? (
                            <button onClick={() => setCurrentQuestionIndex((i) => i + 1)} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Next</button>
                        ) : (
                            <button onClick={handleQuizSubmit} disabled={quizLoading} className="px-6 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/90 transition-colors">{quizLoading ? "Evaluating..." : "Submit Quiz"}</button>
                        )}
                        </div>
                    </div>
                    )}
                </div>
            ) : (
                // --- Copied Final Feedback UI ---
                <div className="mx-auto max-w-3xl">
                    {scorePercentage >= 80 && <Confetti recycle={false} numberOfPieces={400} />}
                    <div className="bg-card/60 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold mb-2">{finalFeedback?.scoreText}</h2>
                        </div>
                        {/* ... Rest of the feedback UI ... */}
                        <div className="text-center mt-8">
                            <button onClick={() => { setFinalFeedback(null); setCurrentQuestionIndex(0); setSelectedAnswers({}); setTheoryAnswers({}); }} className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">Retake Quiz</button>
                        </div>
                    </div>
                </div>
            )}
            </main>
        </div>
    );
}
