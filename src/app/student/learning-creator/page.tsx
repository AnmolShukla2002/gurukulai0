"use client";

import { useState, useMemo } from "react";
import {
  generateChapter,
  evaluateTheoryQuestion,
  generateQuizFeedback,
} from "./actions";
import Link from "next/link";
import Confetti from "react-confetti";
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
  id: string;
  flashcards: Flashcard[];
  questions: Question[];
}
interface TheoryEvaluation {
  evaluation: "correct" | "partially-correct" | "incorrect";
  feedback: string;
}
interface QuizResult {
  questionId: string;
  question: string;
  type: "multiple-choice" | "theory";
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  evaluation?: TheoryEvaluation;
}
interface FinalFeedback {
  score: number;
  total: number;
  scoreText: string;
  keyTakeaways: string;
  detailedReview: {
    question: string;
    yourAnswer: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

export default function StudentLearningCreatorPage() {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [theoryAnswers, setTheoryAnswers] = useState<Record<string, string>>(
    {}
  );
  const [finalFeedback, setFinalFeedback] = useState<FinalFeedback | null>(
    null
  );
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const [activeTab, setActiveTab] = useState<"flashcards" | "quiz">(
    "flashcards"
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleGenerationSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");
    setChapter(null);
    setLoading(true);
    setSelectedAnswers({});
    setTheoryAnswers({});
    setFinalFeedback(null);
    setQuizSubmitted(false);
    setFlippedCards({});
    setCurrentQuestionIndex(0);
    setActiveTab("flashcards");

    const formData = new FormData(e.currentTarget);
    const result = await generateChapter(formData);
    setLoading(false);

    if (result.success) {
      setChapter(result.chapter as Chapter);
    } else {
      setError(result.error as string);
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapter) return;

    setQuizLoading(true);
    const allResults: QuizResult[] = [];

    for (const question of chapter.questions) {
      if (question.type === "multiple-choice") {
        const userAnswer = selectedAnswers[question.id] || "Not answered";
        allResults.push({
          questionId: question.id,
          question: question.question,
          type: "multiple-choice",
          userAnswer: userAnswer,
          correctAnswer: question.answer,
          isCorrect: userAnswer === question.answer,
        });
      } else if (question.type === "theory") {
        const userAnswer = theoryAnswers[question.id] || "Not answered";
        const result = await evaluateTheoryQuestion(
          userAnswer,
          question.answer
        );
        if (result.success) {
          allResults.push({
            questionId: question.id,
            question: question.question,
            type: "theory",
            userAnswer: userAnswer,
            correctAnswer: question.answer,
            isCorrect: result.evaluation.evaluation === "correct",
            evaluation: result.evaluation,
          });
        } else {
          setError("Failed to evaluate one or more theory questions.");
        }
      }
    }

    const feedbackResult = await generateQuizFeedback(allResults);
    if (feedbackResult.success) {
      setFinalFeedback(feedbackResult.feedback);
    } else {
      setError("Failed to generate the final feedback report.");
    }

    setQuizLoading(false);
    setQuizSubmitted(true);
  };

  const handleCardFlip = (cardId: string) =>
    setFlippedCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  const handleMultipleChoiceChange = (
    questionId: string,
    selectedOption: string
  ) => setSelectedAnswers({ ...selectedAnswers, [questionId]: selectedOption });
  const handleTheoryChange = (questionId: string, answer: string) =>
    setTheoryAnswers({ ...theoryAnswers, [questionId]: answer });

  const currentQuestion = chapter?.questions[currentQuestionIndex];
  const scorePercentage = useMemo(() => {
    if (!finalFeedback || typeof finalFeedback.score === "undefined") return 0;
    return (finalFeedback.score / finalFeedback.total) * 100;
  }, [finalFeedback]);

  return (
    <div className="min-h-screen w-full animated-gradient text-foreground">
      {/* --- Sticky Header --- */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold tracking-tight">
            Dynamic Chapter Creator
          </h1>
          <div className="w-28"></div> {/* Spacer */}
        </div>
      </header>

      <main className="container mx-auto py-8 md:py-12 px-4">
        {/* --- Generation Form --- */}
        {!chapter && !loading && (
          <div className="mx-auto max-w-2xl">
            <div className="relative bg-card/60 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-center mb-2">
                Create Your Learning Chapter
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Tell us what you want to learn, and we'll build it for you.
              </p>
              <form onSubmit={handleGenerationSubmit} className="space-y-6">
                {/* Topic Input */}
                <div className="relative">
                  <BookOpenIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    id="topic"
                    name="topic"
                    required
                    placeholder="e.g., Photosynthesis, The French Revolution"
                    className="w-full pl-10 pr-4 py-3 bg-input/50 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary"
                  />
                </div>
                {/* Learning Style Input */}
                <div className="relative">
                  <SparklesIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    id="learning-style"
                    name="learning-style"
                    required
                    placeholder="e.g., Visual, Auditory, Kinesthetic"
                    className="w-full pl-10 pr-4 py-3 bg-input/50 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary"
                  />
                </div>
                {/* File Upload */}
                <div>
                  <label
                    htmlFor="file"
                    className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-input/50 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
                  >
                    <UploadIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Upload a PDF (Optional)
                    </span>
                  </label>
                  <input
                    type="file"
                    id="file"
                    name="file"
                    accept=".pdf"
                    className="sr-only"
                  />
                </div>
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 disabled:bg-muted disabled:cursor-not-allowed"
                >
                  <WandIcon className="h-5 w-5" />
                  {loading ? "Generating..." : "Generate Chapter"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- Loading Indicator --- */}
        {loading && (
          <div className="text-center text-white">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <h2 className="text-2xl font-bold">Crafting Your Chapter...</h2>
            <p className="text-primary-foreground/80">
              This might take a moment.
            </p>
          </div>
        )}

        {/* --- Error Display --- */}
        {error && (
          <div className="mx-auto max-w-2xl bg-destructive/80 backdrop-blur-lg border border-red-500/50 rounded-2xl p-8 text-center text-destructive-foreground">
            <h2 className="text-2xl font-bold mb-2">An Error Occurred</h2>
            <p>{error}</p>
          </div>
        )}

        {/* --- Chapter & Quiz Display --- */}
        {chapter && !finalFeedback && (
          <div className="w-full">
            {/* Tabs */}
            <div className="flex justify-center border-b border-border mb-8">
              <button
                onClick={() => setActiveTab("flashcards")}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === "flashcards"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Flashcards
              </button>
              <button
                onClick={() => setActiveTab("quiz")}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === "quiz"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Quiz
              </button>
            </div>

            {/* Flashcards View */}
            {activeTab === "flashcards" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {chapter.flashcards.map((card) => (
                  <div className="scene h-64" key={card.id} onClick={() => handleCardFlip(card.id)}>
                    <div className={`flashcard h-full w-full ${flippedCards[card.id] ? "is-flipped" : ""}`}>
                      <div className="card-face card-face-front absolute h-full w-full rounded-2xl p-6 flex flex-col justify-center items-center text-center bg-card/60 backdrop-blur-lg border border-white/20 text-card-foreground">
                        <p className="text-lg font-semibold">{card.front}</p>
                        <small className="text-muted-foreground/70 mt-4 absolute bottom-4">
                          Click to flip
                        </small>
                      </div>
                      <div className="card-face card-face-back absolute h-full w-full rounded-2xl p-6 flex flex-col justify-center items-center text-center bg-secondary/80 backdrop-blur-lg border border-white/20 text-secondary-foreground">
                        <p>{card.back}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quiz View */}
            {activeTab === "quiz" && currentQuestion && (
              <div className="mx-auto max-w-3xl">
                {/* Progress Bar */}
                <div className="mb-4">
                  <p className="text-sm text-center text-muted-foreground mb-2">
                    Question {currentQuestionIndex + 1} of{" "}
                    {chapter.questions.length}
                  </p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${
                          ((currentQuestionIndex + 1) /
                            chapter.questions.length) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Question Card */}
                <div className="bg-card/60 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
                  <p className="font-semibold text-xl mb-6 text-center">
                    {currentQuestion.question}
                  </p>
                  {currentQuestion.type === "multiple-choice" && (
                    <div className="space-y-3">
                      {currentQuestion.options?.map((option) => (
                        <label
                          key={option}
                          className={`flex items-center p-4 rounded-lg border transition-all cursor-pointer ${
                            selectedAnswers[currentQuestion.id] === option
                              ? "border-primary bg-primary/10 ring-2 ring-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={currentQuestion.id}
                            value={option}
                            onChange={() =>
                              handleMultipleChoiceChange(
                                currentQuestion.id,
                                option
                              )
                            }
                            checked={
                              selectedAnswers[currentQuestion.id] === option
                            }
                            className="sr-only"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {currentQuestion.type === "theory" && (
                    <textarea
                      value={theoryAnswers[currentQuestion.id] || ""}
                      onChange={(e) =>
                        handleTheoryChange(currentQuestion.id, e.target.value)
                      }
                      placeholder="Your answer..."
                      className="w-full p-3 bg-input/50 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary min-h-[120px]"
                    />
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={() => setCurrentQuestionIndex((i) => i - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-2 bg-muted text-muted-foreground rounded-lg disabled:opacity-50 hover:bg-muted/80 transition-colors"
                  >
                    Previous
                  </button>
                  {currentQuestionIndex < chapter.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((i) => i + 1)}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={quizLoading}
                      className="px-6 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/90 transition-colors"
                    >
                      {quizLoading ? "Evaluating..." : "Submit Quiz"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- Final Feedback / Results --- */}
        {finalFeedback && (
          <div className="mx-auto max-w-3xl">
            {scorePercentage >= 80 && (
              <Confetti recycle={false} numberOfPieces={400} />
            )}
            <div className="bg-card/60 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
              {/* --- Dynamic Header --- */}
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">
                  {scorePercentage === 100
                    ? "Perfect Score!"
                    : scorePercentage >= 80
                    ? "Excellent Work!"
                    : scorePercentage >= 60
                    ? "Great Effort!"
                    : "Good Try!"}
                </h2>
                <p className="text-2xl font-semibold text-primary mb-6">
                  {finalFeedback.scoreText}
                </p>
              </div>

              {/* --- Score Visualization with Color Coding --- */}
              <div className="relative h-32 w-32 mx-auto mb-8">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                  <path
                    className="text-muted/50"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className={
                      scorePercentage >= 80
                        ? "text-green-500"
                        : scorePercentage >= 50
                        ? "text-yellow-500"
                        : "text-destructive"
                    }
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${scorePercentage}, 100`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                  {Math.round(scorePercentage)}%
                </div>
              </div>

              {/* --- Key Takeaways --- */}
              <div className="mb-8 p-6 bg-muted/50 rounded-xl">
                <h3 className="text-xl font-semibold flex items-center gap-3">
                  <LightbulbIcon className="h-6 w-6 text-accent" />
                  Key Takeaways
                </h3>
                <p className="text-muted-foreground mt-2">
                  {finalFeedback.keyTakeaways}
                </p>
              </div>

              {/* --- Interactive Detailed Review Carousel --- */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Detailed Review</h3>
                <div
                  className={`p-4 border rounded-lg bg-background/50 relative overflow-hidden ${
                    finalFeedback.detailedReview[reviewIndex].isCorrect
                      ? "border-green-500/50"
                      : "border-destructive/50"
                  }`}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      finalFeedback.detailedReview[reviewIndex].isCorrect
                        ? "bg-green-500"
                        : "bg-destructive"
                    }`}
                  ></div>
                  <p className="font-semibold pl-2">
                    {finalFeedback.detailedReview[reviewIndex].question}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 pl-2">
                    Your Answer:{" "}
                    <span className="text-foreground">
                      {finalFeedback.detailedReview[reviewIndex].yourAnswer}
                    </span>
                  </p>
                  <p className="text-sm text-primary mt-2 pl-2">
                    Feedback:{" "}
                    <span className="text-foreground">
                      {finalFeedback.detailedReview[reviewIndex].feedback}
                    </span>
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => setReviewIndex((i) => i - 1)}
                    disabled={reviewIndex === 0}
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-lg disabled:opacity-50 hover:bg-muted/80 transition-colors text-sm"
                  >
                    Previous
                  </button>
                  <p className="text-sm text-muted-foreground">
                    Reviewing {reviewIndex + 1} of{" "}
                    {finalFeedback.detailedReview.length}
                  </p>
                  <button
                    onClick={() => setReviewIndex((i) => i + 1)}
                    disabled={
                      reviewIndex === finalFeedback.detailedReview.length - 1
                    }
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-lg disabled:opacity-50 hover:bg-muted/80 transition-colors text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Another Chapter
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- SVG Icon Components ---
const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);
const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9 1.9 5.8 1.9-5.8 5.8-1.9-5.8-1.9z" />
  </svg>
);
const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);
const WandIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 4V2" />
    <path d="M15 16v-2" />
    <path d="M8 9h2" />
    <path d="M20 9h2" />
    <path d="M17.8 11.8 19 13" />
    <path d="M5 13 6.2 11.8" />
    <path d="M19 7 17.8 8.2" />
    <path d="M6.2 8.2 5 7" />
    <path d="M9 4h1" />
    <path d="M9 16H8" />
    <path d="M4 9v1" />
    <path d="M16 9v1" />
    <path d="M21 12v-1" />
    <path d="M3 12v-1" />
    <path d="M12 21v-1l2-2 2-2-4-4-4 4 2 2 2 2z" />
  </svg>
);
const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);
