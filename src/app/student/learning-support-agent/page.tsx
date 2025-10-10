
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

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && messages.length -1 > lastSpokenMessageIndex.current) {
        lastSpokenMessageIndex.current = messages.length - 1;
        const sentences = lastMessage.content.match(/[^.!?]+[.!?]+/g) || [lastMessage.content];
        sentenceQueue.current.push(...sentences);
        if (!isSpeaking) {
          speakNextSentence();
        }
      } else if (lastMessage.role === 'assistant' && isLoading) {
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
    sentenceQueue.current = [];
  }

  useEffect(() => {
    if (!listening && isRecording) {
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
    <div className="flex flex-col h-screen bg-neutral-100 text-neutral-900">
       <header className="bg-accent text-white flex items-center justify-between p-4 shadow-md">
        <a href="/student/dashboard" className="text-xl font-bold hover:underline"> &larr; Back to Dashboard</a>
        <h1 className="text-2xl font-bold">Learning Support Oral Agent</h1>
        <div></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${m.role === 'user' ? 'bg-primary text-white' : 'bg-white'} rounded-lg p-4 max-w-lg shadow-md`}>
                    {m.content}
                </div>
            </div>
          ))}
           {isLoading && <div className="flex justify-start"><div className='bg-white rounded-lg p-4 max-w-lg shadow-md'>...</div></div>}
        </div>
      </main>

      <footer className="p-4 bg-white border-t border-neutral-200">
        <form id="chat-form" onSubmit={customHandleSubmit} className="flex items-center">
          <input
            className="flex-1 bg-neutral-200 rounded-full px-4 py-2 focus:outline-none"            
            value={input}
            onChange={handleInputChange}
            placeholder="Say something..."
            disabled={isLoading}
          />
          <button type="button" onClick={handleRecord} className={`ml-4 p-3 rounded-full ${isRecording ? 'bg-error' : 'bg-primary'} text-white`}>
            <MicIcon />
          </button>
        </form>
      </footer>
    </div>
  );
}
