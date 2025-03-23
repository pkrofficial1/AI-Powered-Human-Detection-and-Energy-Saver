import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, X, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const INITIAL_BOT_MESSAGE = {
  type: 'bot' as const,
  content: "Hello! I'm your Smart Home AI assistant. How can I help you today?",
  timestamp: new Date(),
};

const AI_RESPONSES = {
  default: "I'm not sure about that. Can you please ask something about smart home features, devices, or automation?",
  greetings: ["Hello!", "Hi there!", "How can I help you?"],
  temperature: "The optimal temperature for most homes is between 20-22°C (68-72°F) during the day and 16-18°C (60-65°F) at night.",
  lighting: "Smart lighting can save up to 50% on energy costs. I recommend LED bulbs with motion sensors for optimal efficiency.",
  security: "Our security system includes 24/7 monitoring, smart cameras, and door sensors. Would you like to know more about specific features?",
  automation: "You can create custom schedules for all your devices, set up routines, and use voice commands for control.",
  energy: "I can help you monitor energy usage, set up power-saving schedules, and provide tips for reducing consumption.",
};

function getAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return AI_RESPONSES.greetings[Math.floor(Math.random() * AI_RESPONSES.greetings.length)];
  } else if (lowerMessage.includes('temperature') || lowerMessage.includes('temp')) {
    return AI_RESPONSES.temperature;
  } else if (lowerMessage.includes('light')) {
    return AI_RESPONSES.lighting;
  } else if (lowerMessage.includes('security') || lowerMessage.includes('camera')) {
    return AI_RESPONSES.security;
  } else if (lowerMessage.includes('automation') || lowerMessage.includes('schedule')) {
    return AI_RESPONSES.automation;
  } else if (lowerMessage.includes('energy') || lowerMessage.includes('power')) {
    return AI_RESPONSES.energy;
  }
  return AI_RESPONSES.default;
}

export default function AiChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_BOT_MESSAGE]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      const botMessage: Message = {
        type: 'bot',
        content: getAIResponse(inputMessage),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-50"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed right-4 bottom-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 transition-all duration-300 ${
        isMinimized ? 'w-72' : 'w-96'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Bot className="h-6 w-6 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Smart Home AI</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}