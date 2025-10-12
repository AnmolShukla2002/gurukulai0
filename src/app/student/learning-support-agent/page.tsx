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

  // Function to speak text using browser's TTS
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
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                setQuizState('evaluating');
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFormData = new FormData();
                audioFormData.append('audio', audioBlob, 'answer.webm');
                audioFormData.append('correctAnswer', quizData[currentQuestionIndex].answer);

                const result = await evaluateAudioAnswer(audioFormData);

                if(result.success && result.feedback) {
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
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
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
  
  const score = 0; // Score can be re-implemented if needed

  return (
    <div className="flex flex-col h-screen text-foreground font-sans animated-gradient">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link href="/student/dashboard" className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 text-white">
            <BotIcon className="h-7 w-7" />
            <h1 className="text-xl font-bold tracking-tight">Presentation Coach</h1>
          </div>
          <div style={{ width: '130px' }} />
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {quizState === 'idle' && (
            <div className="bg-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 text-center flex flex-col items-center message-enter">
              <h1 className="text-3xl font-bold text-white mb-2">Presentation Coach</h1>
              <p className="text-white/80 mb-8">Upload a document to start a practice session.</p>
              <form action={handleFileSubmit} className="group w-full">
                <label htmlFor="file-upload" className="flex items-center justify-center gap-3 w-full p-6 bg-white/5 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/10 transition-colors group-hover:scale-105">
                  <UploadIcon className="h-8 w-8 text-white/80 transition-transform group-hover:-translate-y-1" />
                  <span className="text-white/80 font-semibold text-lg">Select PDF to Begin</span>
                </label>
                <input id="file-upload" name="file" type="file" accept=".pdf" className="sr-only" onChange={(e) => e.target.form?.requestSubmit()} />
              </form>
            </div>
          )}

          {quizState === 'parsing' && (
            <div className="text-center text-white message-enter">
              <LoaderCircle className="h-12 w-12 animate-spin mx-auto mb-4"/>
              <h2 className="text-2xl font-bold">Analyzing Document...</h2>
            </div>
          )}

          {quizState === 'ready' && (
            <div className="bg-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 text-center flex flex-col items-center message-enter">
              <h1 className="text-3xl font-bold text-white mb-2">Session Ready</h1>
              <p className="text-white/80 mb-8">{quizData.length} questions have been prepared for you.</p>
              <button onClick={startQuiz} className="w-full max-w-xs flex items-center justify-center gap-3 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg hover:bg-primary/90 transition-transform hover:scale-105">
                <PlayIcon className="h-6 w-6"/>
                <span className="text-lg">Start Session</span>
              </button>
            </div>
          )}

          {['asking', 'recording', 'evaluating'].includes(quizState) && (
            <div className="bg-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 text-center flex flex-col items-center message-enter">
                <p className="text-sm font-semibold text-primary mb-2">Question {currentQuestionIndex + 1} of {quizData.length}</p>
                <h2 className="text-2xl font-bold text-white mb-8">{quizData[currentQuestionIndex]?.question}</h2>
                
                {quizState === 'asking' && (
                    <button onClick={startRecording} disabled={isSpeaking} className="w-full max-w-xs flex items-center justify-center gap-3 py-3 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-600 transition-transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed">
                        <MicIcon className="h-6 w-6" />
                        {isSpeaking ? 'Listen to the question...' : 'Start Answering'}
                    </button>
                )}

                {quizState === 'recording' && (
                    <button onClick={stopRecording} className="w-full max-w-xs flex items-center justify-center gap-3 py-3 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-lg hover:bg-red-600 transition-transform hover:scale-105 animate-pulse">
                        <LoaderCircle className="h-6 w-6 animate-spin"/>
                        Recording... (Click to Stop)
                    </button>
                )}
                 {quizState === 'evaluating' && (
                    <div className="text-center text-white">
                        <LoaderCircle className="h-12 w-12 animate-spin mx-auto mb-4"/>
                        <h2 className="text-2xl font-bold">Evaluating your answer...</h2>
                    </div>
                )}
            </div>
          )}
          
          {quizState === 'feedback' && feedback && (
            <div className="bg-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 message-enter">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Feedback</h2>
                <div className="space-y-4">
                    <div className="bg-white/10 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-400"/>Correctness</h3>
                        <p className="text-white/80">{feedback.correctness}</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2"><ThumbsUpIcon className="h-5 w-5 text-blue-400"/>Confidence</h3>
                        <p className="text-white/80">{feedback.confidence}</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2"><ZapIcon className="h-5 w-5 text-yellow-400"/>Tone</h3>
                        <p className="text-white/80">{feedback.tone}</p>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <button onClick={goToNextQuestion} className="w-full max-w-xs flex items-center justify-center gap-3 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg hover:bg-primary/90 transition-transform hover:scale-105">
                       Next Question
                    </button>
                </div>
            </div>
          )}

          {quizState === 'finished' && (
            <div className="bg-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 text-center flex flex-col items-center message-enter">
              <TrophyIcon className="h-16 w-16 text-amber-400 mb-4"/>
              <h1 className="text-3xl font-bold text-white mb-2">Session Complete!</h1>
              <p className="text-white/80 mb-8 text-xl">
                You've completed all the questions. Great work!
              </p>
              <button 
                onClick={resetState}
                className="w-full max-w-xs flex items-center justify-center gap-3 py-3 px-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-transform hover:scale-105"
              >
                <RestartIcon className="h-6 w-6"/>
                <span className="text-lg">Practice Again</span>
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-500/30 text-white p-4 rounded-lg text-center">
                <p>{error}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
