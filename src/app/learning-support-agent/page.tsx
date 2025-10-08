
'use client'

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';

export default function LearningSupportAgentPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat();

  const handleRecord = () => {
    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        recorder.start();
        setIsRecording(true);
        recorder.ondataavailable = (e) => {
          setAudioChunks((prev) => [...prev, e.data]);
        };
      });
    }
  };

  useEffect(() => {
    if (audioChunks.length > 0) {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64Audio = (reader.result as string).split(',')[1];
        setInput(base64Audio);
      };
      setAudioChunks([]);
    }
  }, [audioChunks, setInput]);

  return (
    <div className="container">
      <header className="header">
        <a href="/" style={{ textDecoration: 'none', color: 'inherit', alignSelf: 'flex-start' }}>&larr; Back to Home</a>
        <h1>Learning Support Oral Agent</h1>
      </header>
      <main className="main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="chat-container">
          {messages.map((m) => (
            <div key={m.id} className={`chat-message ${m.role === 'user' ? 'user' : 'assistant'}`}>
              {m.content}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="chat-form">
          <input
            className="chat-input"
            value={input}
            onChange={handleInputChange}
            placeholder="Say something..."
          />
          <button type="button" onClick={handleRecord} className="record-btn">
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          <button type="submit" className="send-btn">Send</button>
        </form>
      </main>
    </div>
  );
}
