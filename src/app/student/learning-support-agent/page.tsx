'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  BotIcon,
  LoaderCircle,
  PlayIcon,
  RestartIcon,
  TrophyIcon,
  UploadIcon,
  MicIcon,
  CheckCircle,
  ZapIcon,
  ThumbsUpIcon,
} from '@/components/Icons';
import { generateQuizFromPDF, evaluateAudioAnswer, QuizQuestion } from './actions';
import { Button } from '@/components/ui/button';

type QuizState = 'idle' | 'parsing' | 'ready' | 'asking' | 'recording' | 'evaluating' | 'feedback' | 'finished';

type Feedback = {
    correctness: string;
    confidence: string;
    tone: string;
};

export default function PresentationCoachPage() {
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const speak = (text: string, onEnd?: () => void) => {
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (quizState === 'asking' && quizData.length > 0) {
      const questionToAsk = quizData[currentQuestionIndex].spokenQuestion;
      speak(questionToAsk);
    }
  }, [quizState, currentQuestionIndex, quizData]);

  const handleFileSubmit = async (formData: FormData) => {
    setError('');
    setQuizState('parsing');
    const result = await generateQuizFromPDF(formData);
    if (result.success && result.quizData) {
      setQuizData(result.quizData);
      setQuizState('ready');
    } else {
      setError(result.error || 'Failed to process document.');
      setQuizState('idle');
    }
  };

  const startQuiz = () => {
    setCurrentQuestionIndex(0);
    setQuizState('asking');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorderRef.current.onstop = async () => {
        setQuizState('evaluating');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFormData = new FormData();
        audioFormData.append('audio', audioBlob, 'answer.webm');
        audioFormData.append('correctAnswer', quizData[currentQuestionIndex].answer);
        const result = await evaluateAudioAnswer(audioFormData);
        if (result.success && result.feedback) {
          setFeedback(result.feedback);
          setQuizState('feedback');
        } else {
          setError(result.error || "Sorry, I had trouble evaluating your answer.");
          goToNextQuestion();
        }
      };
      mediaRecorderRef.current.start();
      setQuizState('recording');
    } catch (err) {
      setError("Microphone access was denied. Please enable it in your browser settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const goToNextQuestion = () => {
    setFeedback(null);
    setError('');
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < quizData.length) {
      setCurrentQuestionIndex(nextIndex);
      setQuizState('asking');
    } else {
      setQuizState('finished');
    }
  };

  const resetState = () => {
    setQuizData([]);
    setQuizState('idle');
    setCurrentQuestionIndex(0);
    setError('');
    setFeedback(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link href="/student/dashboard" className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <BotIcon className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Presentation Coach</h1>
          </div>
          <div style={{ width: '130px' }} />
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {quizState === 'idle' && (
            <div className="bg-card border border-border rounded-2xl p-8 text-center flex flex-col items-center">
              <h1 className="text-3xl font-bold mb-2">Presentation Coach</h1>
              <p className="text-muted-foreground mb-8">Upload a document to start a practice session.</p>
              <form action={handleFileSubmit} className="group w-full">
                <label htmlFor="file-upload" className="flex items-center justify-center gap-3 w-full p-6 bg-input/50 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <UploadIcon className="h-8 w-8 text-muted-foreground"/>
                  <span className="text-muted-foreground font-semibold text-lg">Select PDF to Begin</span>
                </label>
                <input id="file-upload" name="file" type="file" accept=".pdf" className="sr-only" onChange={(e) => e.target.form?.requestSubmit()} />
              </form>
            </div>
          )}

          {quizState === 'parsing' && (
            <div className="text-center">
              <LoaderCircle className="h-12 w-12 animate-spin mx-auto mb-4 text-primary"/>
              <h2 className="text-2xl font-bold">Generating Your Quiz...</h2>
              <p className="text-muted-foreground">The AI is crafting questions from your document. This may take a moment.</p>
            </div>
          )}

          {quizState === 'ready' && (
            <div className="bg-card border border-border rounded-2xl p-8 text-center flex flex-col items-center">
              <h1 className="text-3xl font-bold mb-2">Session Ready</h1>
              <p className="text-muted-foreground mb-8">{quizData.length} questions have been prepared for you.</p>
              <Button onClick={startQuiz} size="lg">
                <PlayIcon className="h-6 w-6 mr-2"/>
                Start Session
              </Button>
            </div>
          )}

          {['asking', 'recording', 'evaluating'].includes(quizState) && (
            <div className="bg-card border border-border rounded-2xl p-8 text-center flex flex-col items-center">
                <p className="text-sm font-semibold text-primary mb-2">Question {currentQuestionIndex + 1} of {quizData.length}</p>
                <h2 className="text-2xl font-bold mb-8">{quizData[currentQuestionIndex]?.question}</h2>
                
                {quizState === 'asking' && (
                    <Button onClick={startRecording} disabled={isSpeaking} size="lg" className="bg-green-500 hover:bg-green-600">
                        <MicIcon className="h-6 w-6 mr-2" />
                        {isSpeaking ? 'Listen to the question...' : 'Start Answering'}
                    </Button>
                )}

                {quizState === 'recording' && (
                    <Button onClick={stopRecording} size="lg" className="bg-red-500 hover:bg-red-600 animate-pulse">
                        <LoaderCircle className="h-6 w-6 animate-spin mr-2"/>
                        Recording... (Click to Stop)
                    </Button>
                )}
                 {quizState === 'evaluating' && (
                    <div className="text-center">
                        <LoaderCircle className="h-12 w-12 animate-spin mx-auto mb-4 text-primary"/>
                        <h2 className="text-2xl font-bold">Evaluating your answer...</h2>
                    </div>
                )}
            </div>
          )}
          
          {quizState === 'feedback' && feedback && (
            <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Feedback</h2>
                <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/>Correctness</h3>
                        <p className="text-muted-foreground">{feedback.correctness}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><ThumbsUpIcon className="h-5 w-5 text-blue-500"/>Confidence</h3>
                        <p className="text-muted-foreground">{feedback.confidence}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><ZapIcon className="h-5 w-5 text-yellow-500"/>Tone</h3>
                        <p className="text-muted-foreground">{feedback.tone}</p>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <Button onClick={goToNextQuestion} size="lg">Next Question</Button>
                </div>
            </div>
          )}

          {quizState === 'finished' && (
            <div className="bg-card border border-border rounded-2xl p-8 text-center flex flex-col items-center">
              <TrophyIcon className="h-16 w-16 text-yellow-500 mb-4"/>
              <h1 className="text-3xl font-bold mb-2">Session Complete!</h1>
              <p className="text-muted-foreground mb-8 text-xl">
                You've completed all the questions. Great work!
              </p>
              <Button onClick={resetState} size="lg" variant="secondary">
                <RestartIcon className="h-6 w-6 mr-2"/>
                Practice Again
              </Button>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-destructive/10 text-destructive p-4 rounded-lg text-center">
                <p>{error}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
