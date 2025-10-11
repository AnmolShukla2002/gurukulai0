'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import {
  ArrowLeftIcon,
  BotIcon,
  LoaderCircle,
  PlayIcon,
  RestartIcon,
  TrophyIcon,
  UploadIcon,
} from '@/components/Icons';
import { QuizQuestion, evaluateSpokenAnswer, parseQuizPdf } from './actions';

type QuizState = 'idle' | 'parsing' | 'ready' | 'asking' | 'listening' | 'evaluating' | 'finished';
type Message = {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  isCorrect?: boolean;
};

export default function LearningSupportAgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => { setIsClient(true); }, []);

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

  const handleFileSubmit = async (formData: FormData) => {
    try {
      const file = formData.get('file') as File;
      if (!file || file.size === 0) return;

      setError('');
      setQuizState('parsing');
      setMessages([{ id: '1', role: 'system', content: 'Analyzing your document...' }]);

      const result = await parseQuizPdf(formData);
      
      if (result.success && result.quizData) {
        setQuizData(result.quizData);
        setQuizState('ready');
        setMessages([{
          id: '1',
          role: 'system',
          content: `Analysis complete! I've prepared ${result.quizData.length} questions for you.`
        }]);
      } else {
        throw new Error(result.error || 'Failed to parse PDF');
      }
    } catch (error) {
      setQuizState('idle');
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      setMessages([{ id: 'error', role: 'system', content: errorMessage }]);
    }
  };

  const startQuiz = () => {
    setCurrentQuestionIndex(0);
    setMessages([]);
    askQuestion(0);
  };

  const askQuestion = (index: number) => {
    if (index < quizData.length) {
      const question = quizData[index].question;
      setMessages(prev => [...prev, { id: `q-${index}`, role: 'agent', content: question }]);
      setQuizState('asking');
      speak(question, () => {
        setQuizState('listening');
        resetTranscript();
        SpeechRecognition.startListening();
      });
    } else {
      setQuizState('finished');
      const finalMessage = "You've completed the quiz! Excellent work.";
      setMessages(prev => [...prev, { id: 'finish', role: 'system', content: finalMessage }]);
      speak(finalMessage);
    }
  };

  const handleManualStop = async () => {
    if (!listening) return;
    
    SpeechRecognition.stopListening();
    setQuizState('evaluating');
    
    const finalTranscript = transcript || '';
    setMessages(prev => [...prev, { 
      id: `u-${currentQuestionIndex}`, 
      role: 'user', 
      content: finalTranscript 
    }]);
    
    const result = await evaluateSpokenAnswer(finalTranscript, quizData[currentQuestionIndex].answer);
    
    if (!result.success || !result.feedback) {
      const errorMessage = result.error || "Sorry, I had trouble evaluating that.";
      setMessages(prev => [...prev, { 
        id: `err-${currentQuestionIndex}`, 
        role: 'system', 
        content: errorMessage 
      }]);
      speak(errorMessage, () => {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        askQuestion(nextIndex);
      });
      return;
    }

    setMessages(prev => {
      const newMessages = [...prev];
      const userMessageIndex = newMessages.findIndex(m => m.id === `u-${currentQuestionIndex}`);
      if (userMessageIndex !== -1) {
        newMessages[userMessageIndex].isCorrect = result.isCorrect;
      }
      newMessages.push({ 
        id: `f-${currentQuestionIndex}`, 
        role: 'agent', 
        content: result.feedback! 
      });
      return newMessages;
    });

    speak(result.feedback, () => {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      askQuestion(nextIndex);
    });
  };

  const resetState = () => {
    setMessages([]);
    setQuizData([]);
    setQuizState('idle');
    setCurrentQuestionIndex(0);
    setError('');
    resetTranscript();
  };

  if (!isClient) return null;
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const score = messages.filter(m => m.role === 'user' && m.isCorrect).length;
  const currentQuestion = quizData[currentQuestionIndex];
  
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
            <h1 className="text-xl font-bold tracking-tight">Your Learning Buddy</h1>
          </div>
          <div style={{ width: '130px' }} />
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* IDLE STATE */}
          {quizState === 'idle' && (
            <div className="bg-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 text-center flex flex-col items-center message-enter">
              <h1 className="text-3xl font-bold text-white mb-2">Oral Support Agent</h1>
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

          {/* PARSING STATE */}
          {quizState === 'parsing' && (
            <div className="text-center text-white message-enter">
              <LoaderCircle className="h-12 w-12 animate-spin mx-auto mb-4"/>
              <h2 className="text-2xl font-bold">Analyzing Document...</h2>
            </div>
          )}

          {/* READY STATE */}
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

          {/* CONVERSATION STATES */}
          {['asking', 'listening', 'evaluating'].includes(quizState) && currentQuestion && (
            <div className="bg-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 text-center flex flex-col items-center message-enter">
              <p className="text-sm font-semibold text-primary mb-2">Question {currentQuestionIndex + 1} of {quizData.length}</p>
              <h2 className="text-2xl font-bold text-white mb-8">{currentQuestion.question}</h2>

              {/* AI ORB */}
              <div className={`relative h-32 w-32 flex items-center justify-center transition-all duration-300 ${listening ? 'scale-110' : ''}`}>
                <div className={`absolute inset-0 rounded-full bg-primary/20 ${listening ? 'animate-ping' : ''}`}></div>
                <div className={`absolute inset-2 rounded-full bg-primary/30 ${listening ? 'animate-pulse' : ''}`}></div>
                <div className="relative bg-primary rounded-full h-20 w-20 flex items-center justify-center shadow-lg">
                  <BotIcon className="h-10 w-10 text-primary-foreground" />
                </div>
              </div>

              <p className="text-white/80 mt-8 min-h-[24px] italic">
                {listening 
                  ? (transcript || 'Listening...') 
                  : (quizState === 'asking' 
                    ? 'Agent is speaking...' 
                    : 'Evaluating...')}
              </p>

              {quizState === 'listening' && (
                <button 
                  onClick={handleManualStop}
                  className="mt-4 px-8 py-3 bg-white/10 text-white font-semibold rounded-lg shadow-md hover:bg-white/20 transition-transform hover:scale-105"
                >
                  I'm Done
                </button>
              )}
            </div>
          )}
          
          {/* FINISHED STATE */}
          {quizState === 'finished' && (
            <div className="bg-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 text-center flex flex-col items-center message-enter">
              <TrophyIcon className="h-16 w-16 text-amber-400 mb-4"/>
              <h1 className="text-3xl font-bold text-white mb-2">Session Complete!</h1>
              <p className="text-white/80 mb-8 text-xl">
                You scored <span className="text-primary font-bold">{score} / {quizData.length}</span>
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
        </div>
      </main>
    </div>
  );
}