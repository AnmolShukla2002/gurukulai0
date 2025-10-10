// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import SpeechRecognition, {
//   useSpeechRecognition,
// } from "react-speech-recognition";
// import {
//   MicIcon,
//   UploadIcon,
//   BotIcon,
//   UserIcon,
//   ArrowLeftIcon,
//   PlayIcon,
//   LoaderCircle,
//   CheckCircle,
//   XCircle,
//   RestartIcon,
// } from "@/components/Icons";
// import { QuizQuestion, evaluateSpokenAnswer } from "./actions";

// type QuizState =
//   | "idle"
//   | "parsing"
//   | "ready"
//   | "asking"
//   | "listening"
//   | "evaluating"
//   | "finished";
// type Message = {
//   id: string;
//   role: "user" | "agent" | "system";
//   content: string;
//   isCorrect?: boolean;
// };

// // --- MOCK DATA DEFINITION ---
// const MOCK_QUIZ_DATA: QuizQuestion[] = [
//   {
//     question: "What is the largest planet in our solar system?",
//     answer: "The largest planet is Jupiter.",
//   },
//   {
//     question: "Which planet is known as the 'Red Planet'?",
//     answer: "Mars is known as the Red Planet due to its reddish appearance.",
//   },
//   {
//     question: "What is the name of the galaxy that contains our Solar System?",
//     answer: "Our solar system is located in the Milky Way galaxy.",
//   },
//   {
//     question: "Does the sun orbit the Earth?",
//     answer:
//       "No, the Earth orbits the Sun. This is known as a heliocentric model.",
//   },
// ];

// export default function LearningSupportAgentPage() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
//   const [quizState, setQuizState] = useState<QuizState>("idle");
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [isClient, setIsClient] = useState(false);
//   const [error, setError] = useState("");
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const {
//     transcript,
//     listening,
//     resetTranscript,
//     browserSupportsSpeechRecognition,
//   } = useSpeechRecognition();
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   const speak = (text: string, onEnd?: () => void) => {
//     if (speechSynthesis.speaking) {
//       speechSynthesis.cancel();
//     }
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.onstart = () => setIsSpeaking(true);
//     utterance.onend = () => {
//       setIsSpeaking(false);
//       onEnd?.();
//     };
//     speechSynthesis.speak(utterance);
//   };

//   const handleFileSubmit = async (formData: FormData) => {
//     const file = formData.get("file") as File;
//     if (!file || file.size === 0) return;

//     setError("");
//     setQuizState("parsing");
//     setMessages([
//       { id: "1", role: "system", content: "Analyzing your document..." },
//     ]);

//     setTimeout(() => {
//       setQuizData(MOCK_QUIZ_DATA);
//       setQuizState("ready");
//       setMessages([
//         {
//           id: "1",
//           role: "system",
//           content: `Analysis complete! I've prepared ${MOCK_QUIZ_DATA.length} questions for you.`,
//         },
//       ]);
//     }, 1500);
//   };

//   const startQuiz = () => {
//     setCurrentQuestionIndex(0);
//     setMessages([]);
//     askQuestion(0);
//   };

//   const askQuestion = (index: number) => {
//     if (index < quizData.length) {
//       const question = quizData[index].question;
//       setMessages((prev) => [
//         ...prev,
//         { id: `q-${index}`, role: "agent", content: question },
//       ]);
//       setQuizState("asking");
//       speak(question, () => {
//         setQuizState("listening");
//         resetTranscript();
//         SpeechRecognition.startListening();
//       });
//     } else {
//       setQuizState("finished");
//       const finalMessage = "You've completed the quiz! Excellent work.";
//       setMessages((prev) => [
//         ...prev,
//         { id: "finish", role: "system", content: finalMessage },
//       ]);
//       speak(finalMessage);
//     }
//   };

//   useEffect(() => {
//     if (listening && transcript) {
//       if (speechTimeoutRef.current) {
//         clearTimeout(speechTimeoutRef.current);
//       }
//       speechTimeoutRef.current = setTimeout(() => {
//         SpeechRecognition.stopListening();
//       }, 1500);
//     }
//     return () => {
//       if (speechTimeoutRef.current) {
//         clearTimeout(speechTimeoutRef.current);
//       }
//     };
//   }, [transcript, listening]);

//   useEffect(() => {
//     // --- FIX: Removed the `&& transcript` check ---
//     // This now correctly triggers when listening stops, even if no words were spoken.
//     if (!listening && quizState === "listening") {
//       if (speechTimeoutRef.current) {
//         clearTimeout(speechTimeoutRef.current);
//       }
//       const finalTranscript = transcript || ""; // Ensure we always have a string
//       setMessages((prev) => [
//         ...prev,
//         { id: `u-${currentQuestionIndex}`, role: "user", content: finalTranscript },
//       ]);
//       evaluateAnswer(finalTranscript);
//     }
//   }, [listening, transcript, quizState, currentQuestionIndex]);

//   const evaluateAnswer = async (userAnswer: string) => {
//     setQuizState("evaluating");
//     const correctAnswer = quizData[currentQuestionIndex].answer;
//     const result = await evaluateSpokenAnswer(userAnswer, correctAnswer);

//     if (!result.success || !result.feedback) {
//       const errorMessage =
//         result.error ||
//         "Sorry, I had trouble evaluating that. Let's move to the next question.";
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: `err-${currentQuestionIndex}`,
//           role: "system",
//           content: errorMessage,
//         },
//       ]);
//       speak(errorMessage, () => {
//         const nextIndex = currentQuestionIndex + 1;
//         setCurrentQuestionIndex(nextIndex);
//         askQuestion(nextIndex);
//       });
//       return;
//     }

//     const feedbackText = result.feedback;
//     setMessages((prev) => {
//       const newMessages = [...prev];
//       const userMessageIndex = newMessages.findIndex(
//         (m) => m.id === `u-${currentQuestionIndex}`
//       );
//       if (userMessageIndex !== -1) {
//         newMessages[userMessageIndex].isCorrect = result.isCorrect;
//       }
//       newMessages.push({
//         id: `f-${currentQuestionIndex}`,
//         role: "agent",
//         content: feedbackText,
//       });
//       return newMessages;
//     });

//     speak(feedbackText, () => {
//       const nextIndex = currentQuestionIndex + 1;
//       setCurrentQuestionIndex(nextIndex);
//       askQuestion(nextIndex);
//     });
//   };

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const resetState = () => {
//     setMessages([]);
//     setQuizData([]);
//     setQuizState("idle");
//     setCurrentQuestionIndex(0);
//     setError("");
//     resetTranscript();
//   };
  
//   const handleManualStop = () => {
//     if (listening) {
//       SpeechRecognition.stopListening();
//     }
//   };

//   if (!isClient) {
//     return null;
//   }

//   if (!browserSupportsSpeechRecognition) {
//     return <span>Browser doesn't support speech recognition.</span>;
//   }

//   return (
//     <div className="flex flex-col h-screen text-foreground font-sans animated-gradient">
//       <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
//         <div className="container mx-auto flex items-center justify-between p-4">
//           <Link
//             href="/student/dashboard"
//             className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
//           >
//             <ArrowLeftIcon className="h-4 w-4" />
//             Back to Dashboard
//           </Link>
//           <h1 className="text-xl font-bold tracking-tight">
//             Oral Support Agent
//           </h1>
//           <div className="w-28"></div>
//         </div>
//       </header>

//       <main className="flex-1 overflow-y-auto p-4 space-y-6">
//         {messages.map((m) => (
//           <div
//             key={m.id}
//             className={`flex items-start gap-3 w-full message-enter ${
//               m.role === "user" ? "justify-end" : "justify-start"
//             }`}
//           >
//             {m.role === "agent" && (
//               <div className="bg-primary text-primary-foreground p-2 rounded-full flex-shrink-0">
//                 <BotIcon className="h-6 w-6" />
//               </div>
//             )}

//             {m.role === "system" ? (
//               <div className="text-center w-full text-muted-foreground text-sm italic py-2">
//                 {m.content}
//               </div>
//             ) : (
//               <div
//                 className={`max-w-xl rounded-2xl px-4 py-3 shadow-lg ${
//                   m.role === "user"
//                     ? "bg-primary text-primary-foreground rounded-br-none"
//                     : "bg-card text-card-foreground rounded-bl-none"
//                 }`}
//               >
//                 {m.content}
//               </div>
//             )}

//             {m.role === "user" && (
//               <div
//                 className={`p-1 rounded-full flex-shrink-0 self-end transition-all duration-300 ${
//                   m.isCorrect === true
//                     ? "bg-green-500/20 text-green-500"
//                     : m.isCorrect === false
//                     ? "bg-destructive/20 text-destructive"
//                     : "bg-muted"
//                 }`}
//               >
//                 {m.isCorrect === true && <CheckCircle className="h-5 w-5" />}
//                 {m.isCorrect === false && <XCircle className="h-5 w-5" />}
//                 {m.isCorrect === undefined && (
//                   <UserIcon className="h-5 w-5 text-muted-foreground" />
//                 )}
//               </div>
//             )}
//           </div>
//         ))}
//         {["asking", "evaluating"].includes(quizState) && (
//           <div className="flex items-start gap-3 justify-start message-enter">
//             <div className="bg-primary text-primary-foreground p-2 rounded-full">
//               <BotIcon className="h-6 w-6" />
//             </div>
//             <div className="max-w-xl rounded-2xl px-4 py-3 shadow-lg bg-card text-card-foreground rounded-bl-none flex items-center gap-2">
//               <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
//               <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
//               <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
//             </div>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </main>

//       <footer className="p-4 bg-background/80 backdrop-blur-lg border-t border-border transition-all duration-300">
//         <div className="container mx-auto">
//           {error && (
//             <p className="text-center text-destructive mb-2">{error}</p>
//           )}

//           {quizState === "idle" && (
//             <form action={handleFileSubmit} className="group">
//               <label
//                 htmlFor="file-upload"
//                 className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-input border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/10 transition-colors group-hover:scale-105"
//               >
//                 <UploadIcon className="h-6 w-6 text-muted-foreground transition-transform group-hover:-translate-y-1" />
//                 <span className="text-muted-foreground font-semibold text-lg">
//                   Upload PDF to Start a Session
//                 </span>
//               </label>
//               <input
//                 id="file-upload"
//                 name="file"
//                 type="file"
//                 accept=".pdf"
//                 className="sr-only"
//                 onChange={(e) => e.target.form?.requestSubmit()}
//               />
//             </form>
//           )}

//           {quizState === "parsing" && (
//             <div className="flex items-center justify-center gap-3 text-muted-foreground">
//               <LoaderCircle className="h-6 w-6 animate-spin" />
//               <span className="font-semibold text-lg">
//                 Analyzing Document...
//               </span>
//             </div>
//           )}

//           {quizState === "ready" && (
//             <button
//               onClick={startQuiz}
//               className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg hover:bg-primary/90 transition-transform hover:scale-105"
//             >
//               <PlayIcon className="h-6 w-6" />
//               <span className="text-lg">Start Quiz</span>
//             </button>
//           )}

//           {quizState === "listening" && (
//             <div className="flex flex-col items-center justify-center gap-4">
//               <div className="flex items-end justify-center gap-2 h-10">
//                 <div className="w-2 h-4 bg-primary rounded-full voice-bar"></div>
//                 <div className="w-2 h-8 bg-primary rounded-full voice-bar"></div>
//                 <div className="w-2 h-10 bg-primary rounded-full voice-bar"></div>
//                 <div className="w-2 h-6 bg-primary rounded-full voice-bar"></div>
//                 <div className="w-2 h-4 bg-primary rounded-full voice-bar"></div>
//               </div>
//               <span className="font-semibold text-lg text-primary animate-pulse">
//                 Listening...
//               </span>
//               <button
//                 onClick={handleManualStop}
//                 className="mt-2 px-6 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg shadow-md hover:bg-secondary/90 transition-transform hover:scale-105"
//               >
//                 I'm Done
//               </button>
//             </div>
//           )}

//           {quizState === "finished" && (
//             <button
//               onClick={resetState}
//               className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-muted text-muted-foreground font-semibold rounded-lg hover:bg-muted/80 transition-transform hover:scale-105"
//             >
//               <RestartIcon className="h-6 w-6" />
//               <span className="text-lg">Start a New Session</span>
//             </button>
//           )}
//         </div>
//       </footer>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  UploadIcon,
  BotIcon,
  ArrowLeftIcon,
  PlayIcon,
  LoaderCircle,
  CheckCircle,
  XCircle,
  RestartIcon,
  TrophyIcon, // Make sure to import the new TrophyIcon
} from "@/components/Icons";
import { QuizQuestion, evaluateSpokenAnswer } from "./actions";

type QuizState =
  | "idle"
  | "parsing"
  | "ready"
  | "asking"
  | "listening"
  | "evaluating"
  | "finished";
type Message = {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  isCorrect?: boolean;
};

const MOCK_QUIZ_DATA: QuizQuestion[] = [
    { question: "What is the largest planet in our solar system?", answer: "The largest planet is Jupiter." },
    { question: "Which planet is known as the 'Red Planet'?", answer: "Mars is known as the Red Planet." },
    { question: "What is the name of our galaxy?", answer: "Our solar system is in the Milky Way galaxy." },
];

export default function LearningSupportAgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState("");
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => { setIsClient(true) }, []);

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
    const file = formData.get("file") as File;
    if (!file || file.size === 0) return;
    setError("");
    setQuizState("parsing");
    setTimeout(() => {
      setQuizData(MOCK_QUIZ_DATA);
      setQuizState("ready");
    }, 1500);
  };

  const startQuiz = () => {
    setCurrentQuestionIndex(0);
    setMessages([]);
    askQuestion(0);
  };

  const askQuestion = (index: number) => {
    if (index < quizData.length) {
      const question = quizData[index].question;
      setMessages((prev) => [...prev, { id: `q-${index}`, role: "agent", content: question }]);
      setQuizState("asking");
      speak(question, () => {
        setQuizState("listening");
        resetTranscript();
        SpeechRecognition.startListening();
      });
    } else {
      setQuizState("finished");
      speak("You've completed the quiz! Excellent work.");
    }
  };

  const handleManualStop = async () => {
    if (!listening) return;
    SpeechRecognition.stopListening();
    setQuizState("evaluating");
    
    const finalTranscript = transcript || "";
    setMessages(prev => [...prev, { id: `u-${currentQuestionIndex}`, role: "user", content: finalTranscript }]);
    
    const correctAnswer = quizData[currentQuestionIndex].answer;
    const result = await evaluateSpokenAnswer(finalTranscript, correctAnswer);
    
    if (!result.success || !result.feedback) {
        const errorMessage = result.error || "Sorry, I had trouble evaluating that.";
        setMessages(prev => [...prev, { id: `err-${currentQuestionIndex}`, role: 'system', content: errorMessage }]);
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
        if (userMessageIndex !== -1) newMessages[userMessageIndex].isCorrect = result.isCorrect;
        newMessages.push({ id: `f-${currentQuestionIndex}`, role: "agent", content: result.feedback! });
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
    setQuizState("idle");
    setCurrentQuestionIndex(0);
    setError("");
    resetTranscript();
  };

  if (!isClient) return null;
  if (!browserSupportsSpeechRecognition) return <span>Browser doesn't support speech recognition.</span>;

  const score = messages.filter(m => m.role === 'user' && m.isCorrect).length;
  const currentQuestion = quizData[currentQuestionIndex];
  
  return (
    <div className="flex flex-col h-screen text-foreground font-sans animated-gradient">
      {/* New Secondary Navbar */}
      <header className="w-full bg-card/10 backdrop-blur-lg border-b border-white/10 z-10">
        <div className="container mx-auto flex items-center justify-between p-4">
            <Link href="/student/dashboard" className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors">
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back to Dashboard</span>
            </Link>

            <div className="flex items-center gap-3 text-white">
                <BotIcon className="h-7 w-7" />
                <h1 className="text-xl font-bold tracking-tight">Your Learning Buddy</h1>
            </div>

            {/* Spacer to balance the left link */}
            <div style={{ width: '130px' }}></div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* IDLE STATE */}
          {quizState === 'idle' && (
            <div className="bg-card/60 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 text-center flex flex-col items-center message-enter">
                <h1 className="text-3xl font-bold mb-2">Oral Support Agent</h1>
                <p className="text-muted-foreground mb-8">Upload a document to start a practice session.</p>
                <form action={handleFileSubmit} className="group w-full">
                    <label htmlFor="file-upload" className="flex items-center justify-center gap-3 w-full p-6 bg-input border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/10 transition-colors group-hover:scale-105">
                        <UploadIcon className="h-8 w-8 text-muted-foreground transition-transform group-hover:-translate-y-1" />
                        <span className="text-muted-foreground font-semibold text-lg">Select PDF to Begin</span>
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
            <div className="bg-card/60 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 text-center flex flex-col items-center message-enter">
                <h1 className="text-3xl font-bold mb-2">Session Ready</h1>
                <p className="text-muted-foreground mb-8">{quizData.length} questions have been prepared for you.</p>
                <button onClick={startQuiz} className="w-full max-w-xs flex items-center justify-center gap-3 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg hover:bg-primary/90 transition-transform hover:scale-105">
                    <PlayIcon className="h-6 w-6"/>
                    <span className="text-lg">Start Session</span>
                </button>
            </div>
          )}

          {/* CONVERSATION STATES */}
          {['asking', 'listening', 'evaluating'].includes(quizState) && currentQuestion && (
              <div className="bg-card/60 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 text-center flex flex-col items-center message-enter">
                  <p className="text-sm font-semibold text-primary mb-2">Question {currentQuestionIndex + 1} of {quizData.length}</p>
                  <h2 className="text-2xl font-bold mb-8 min-h-[96px]">{currentQuestion.question}</h2>

                  {/* AI ORB */}
                  <div className={`relative h-32 w-32 flex items-center justify-center transition-all duration-300 ${listening ? 'scale-110' : ''}`}>
                      <div className={`absolute inset-0 rounded-full bg-primary/20 ${listening ? 'orb-pulse' : ''}`}></div>
                      <div className={`absolute inset-2 rounded-full bg-primary/30 ${listening ? 'orb-pulse [animation-delay:0.2s]' : ''}`}></div>
                      <div className="relative bg-primary rounded-full h-20 w-20 flex items-center justify-center shadow-lg">
                          <BotIcon className="h-10 w-10 text-primary-foreground" />
                      </div>
                  </div>

                  <p className="text-muted-foreground mt-8 min-h-[24px] italic">{listening ? (transcript || 'Listening...') : (quizState === 'asking' ? 'Agent is speaking...' : 'Evaluating...')}</p>

                  {quizState === 'listening' && (
                      <button onClick={handleManualStop} className="mt-4 px-8 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg shadow-md hover:bg-secondary/90 transition-transform hover:scale-105">
                          I'm Done
                      </button>
                  )}
              </div>
          )}
          
          {/* FINISHED STATE */}
          {quizState === 'finished' && (
               <div className="bg-card/60 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 text-center flex flex-col items-center message-enter">
                  <TrophyIcon className="h-16 w-16 text-amber-400 mb-4"/>
                  <h1 className="text-3xl font-bold mb-2">Session Complete!</h1>
                  <p className="text-muted-foreground mb-8 text-xl">You scored <span className="text-primary font-bold">{score} / {quizData.length}</span></p>
                  <button onClick={resetState} className="w-full max-w-xs flex items-center justify-center gap-3 py-3 px-4 bg-muted text-muted-foreground font-semibold rounded-lg hover:bg-muted/80 transition-transform hover:scale-105">
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