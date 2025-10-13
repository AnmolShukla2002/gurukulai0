'use client';

import { useState, useEffect, useRef } from 'react';
import { BotIcon, SendIcon, XCircle, FileTextIcon } from '@/components/Icons';
import Link from 'next/link';

type Paper = {
  id: string;
  title: string;
  classroomName: string;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
  papers?: Paper[];
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    const response = await fetch('/api/teacher/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages }),
    });

    if (response.ok) {
      const data = await response.json();
      setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: data.message, papers: data.papers }]);
    } else {
      setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-gray-900 bg-opacity-80 backdrop-blur-lg text-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <BotIcon className="h-7 w-7" />
            <h2 className="text-xl font-bold">AI Assistant</h2>
          </div>
          <button onClick={onClose} className="hover:text-gray-400">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                  message.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.papers && message.papers.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.papers.map((paper) => (
                      <Link key={paper.id} href={`/teacher/question-papers/${paper.id}`}>
                        <div className="block bg-gray-800 p-2 rounded-md hover:bg-gray-700 transition-colors">
                          <div className="flex items-center gap-2">
                            <FileTextIcon className="h-5 w-5" />
                            <div>
                                <span className="font-semibold">{paper.title}</span>
                                <p className="text-xs text-gray-400">{paper.classroomName}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
           <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask me anything..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-gray-400 hover:text-white"
            >
              <SendIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
