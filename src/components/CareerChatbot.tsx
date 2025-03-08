import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { ChatMessage, sendChatMessage } from '../utils/geminiChatApi';
import { AssessmentData } from '../utils/geminiApi';
import { GEMINI_MODEL } from '../config/env';

interface CareerChatbotProps {
  assessmentData: AssessmentData;
}

export default function CareerChatbot({ assessmentData }: CareerChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI career guidance counselor. I can help you explore career options based on your assessment results. What would you like to know about your career path?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Reset error state
    setError(null);
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Send message to Gemini API
      const updatedMessages = [...messages, userMessage];
      console.log("Sending messages to API:", updatedMessages);
      console.log("Assessment data:", assessmentData);
      
      const response = await sendChatMessage(updatedMessages, assessmentData);
      console.log("Received response:", response);
      
      if (response.isError) {
        setError("Sorry, I encountered an error. Please try again.");
      } else {
        // Add AI response to chat
        setMessages(prev => [...prev, response.message]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Chat header */}
      <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Bot className="h-6 w-6 mr-2" />
          <h2 className="text-lg font-semibold">Career Guidance Chatbot</h2>
        </div>
        <div className="text-xs bg-indigo-700 px-2 py-1 rounded">
          Powered by {GEMINI_MODEL}
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[80%] p-3 rounded-lg
              ${message.role === 'user' 
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-gray-800 dark:text-gray-100' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}
            `}>
              <div className="flex items-center mb-1">
                {message.role === 'user' ? (
                  <>
                    <span className="font-medium">You</span>
                    <User className="h-4 w-4 ml-1 text-gray-500 dark:text-gray-400" />
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-1 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-medium">AI Career Counselor</span>
                  </>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mb-4 flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-800 dark:text-gray-100">
              <div className="flex items-center">
                <Bot className="h-4 w-4 mr-1 text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium">AI Career Counselor</span>
              </div>
              <div className="flex items-center mt-2">
                <Loader2 className="h-4 w-4 mr-2 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-4 flex justify-center">
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-red-800 dark:text-red-200 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center">
          <textarea
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
            placeholder="Ask about your career options..."
            rows={2}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className="ml-2 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          This chatbot is designed to answer questions related to education and careers only.
        </p>
      </div>
    </div>
  );
} 