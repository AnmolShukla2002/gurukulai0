
'use client'

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { MicIcon } from '@/components/MicIcon';

export default function LearningSupportAgentPage() {
  const [isRecording, setIsRecording] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, setInput, isLoading } = useChat();
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const lastSpokenMessageIndex = useRef(-1);
  const sentenceQueue = useRef<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript, setInput]);

  // Process incoming messages for speech
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && messages.length -1 > lastSpokenMessageIndex.current) {
        // If this is a new message, mark it for processing
        lastSpokenMessageIndex.current = messages.length - 1;
        // Split the content by sentences and add to queue
        const sentences = lastMessage.content.match(/[^.!?]+[.!?]+/g) || [lastMessage.content];
        sentenceQueue.current.push(...sentences);
        // Start speaking if not already doing so
        if (!isSpeaking) {
          speakNextSentence();
        }
      } else if (lastMessage.role === 'assistant' && isLoading) {
        // Handle streaming content updates
        const lastProcessedContent = sentenceQueue.current.join('');
        const newContent = lastMessage.content.substring(lastProcessedContent.length);
        const newSentences = newContent.match(/[^.!?]+[.!?]+/g);
        if (newSentences) {
          sentenceQueue.current.push(...newSentences);
          if (!isSpeaking) {
            speakNextSentence();
          }
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading, isSpeaking]);

  const speakNextSentence = () => {
    if (sentenceQueue.current.length > 0) {
      const sentence = sentenceQueue.current.shift();
      if(sentence){
        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          if (sentenceQueue.current.length > 0) {
            speakNextSentence();
          } else {
            setIsSpeaking(false);
          }
        };
        speechSynthesis.speak(utterance);
      }
    } else {
        setIsSpeaking(false);
    }
  };

  const handleRecord = () => {
    if (isRecording) {
      SpeechRecognition.stopListening();
      setIsRecording(false);
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
      setIsRecording(true);
    }
  };

  const customHandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
    resetTranscript();
    sentenceQueue.current = []; // Clear queue on new submission
  }

  useEffect(() => {
    if (!listening && isRecording) {
      // Automatically submit the form when the user stops speaking
      const form = document.getElementById('chat-form') as HTMLFormElement;
      if(form) {
        const event = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(event);
      }
    }
  }, [listening, isRecording]);


  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-800">
       <header className="bg-google-green text-white flex items-center justify-between p-4">
        <a href="/student/dashboard" className="text-xl font-bold"> &larr; Back to Dashboard</a>
        <h1 className="text-2xl font-bold">Learning Support Oral Agent</h1>
        <div></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${m.role === 'user' ? 'bg-google-blue text-white' : 'bg-white'} rounded-lg p-4 max-w-lg shadow-md`}>
                    {m.content}
                </div>
            </div>
          ))}
           {isLoading && <div className="flex justify-start"><div className='bg-white rounded-lg p-4 max-w-lg shadow-md'>...</div></div>}
        </div>
      </main>

      <footer className="p-4 bg-white border-t border-gray-200">
        <form id="chat-form" onSubmit={customHandleSubmit} className="flex items-center">
          <input
            className="flex-1 bg-gray-200 rounded-full px-4 py-2 focus:outline-none"            
            value={input}
            onChange={handleInputChange}
            placeholder="Say something..."
            disabled={isLoading}
          />
          <button type="button" onClick={handleRecord} className={`ml-4 p-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-blue-500'}`}>
            <MicIcon />
          </button>
        </form>
      </footer>
    </div>
  );
}
