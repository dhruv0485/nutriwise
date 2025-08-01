import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, Send, Bot, User, Loader2, 
  Sparkles, Brain, Leaf, Zap, ArrowLeft 
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface NutritionChatbotProps {
  onNavigate: (page: string) => void;
}

const NutritionChatbot = ({ onNavigate }: NutritionChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm NutriBot, your AI nutrition assistant. I can help you with diet advice, meal planning, nutrition facts, and healthy eating tips. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    "What should I eat for weight loss?",
    "How many calories should I consume daily?",
    "What are the best protein sources?",
    "How to plan a healthy meal?",
    "What vitamins do I need?",
    "Is intermittent fasting good?",
    "How to read nutrition labels?",
    "Best foods for energy?"
  ];

  const generateResponse = async (userMessage: string) => {
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8000/api/chatbot/nutrition-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: "nutrition_diet_health"
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Simulate typing delay for better UX
        setTimeout(() => {
          const botMessage: Message = {
            id: Date.now().toString(),
            text: data.response,
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
          setIsLoading(false);
        }, 1000);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or feel free to ask me about nutrition, diet tips, meal planning, or healthy eating habits!",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    await generateResponse(inputText);
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 relative overflow-hidden">
      {/* Background decorations - Mobile optimized */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-4 left-4 w-12 h-12 sm:w-16 sm:h-16 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-16 right-8 w-8 h-8 sm:w-12 sm:h-12 bg-blue-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-16 left-6 w-6 h-6 sm:w-10 sm:h-10 bg-purple-200 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute bottom-8 right-4 w-8 h-8 sm:w-14 sm:h-14 bg-orange-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-4 h-4 sm:w-8 sm:h-8 bg-teal-300 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-3 h-3 sm:w-6 sm:h-6 bg-emerald-300 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header - Mobile optimized */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center space-x-1 sm:space-x-2 text-white/90 hover:text-white transition-all duration-300 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 font-medium text-sm sm:text-base"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </button>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3">
                <Bot className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">NutriBot</h1>
                <p className="text-green-100 text-xs sm:text-sm">Your AI Nutrition Assistant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container - Mobile optimized */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
          {/* Messages Area - Mobile optimized height */}
          <div className="h-[60vh] sm:h-[500px] overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl p-3 sm:p-4 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white'
                      : 'bg-gradient-to-r from-gray-50 to-green-50 text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    {message.sender === 'bot' && (
                      <div className="bg-green-600 text-white rounded-full p-1 flex-shrink-0">
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm leading-relaxed">{message.text}</p>
                      <p className={`text-xs mt-1 sm:mt-2 ${
                        message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <div className="bg-white/20 rounded-full p-1 flex-shrink-0">
                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator - Mobile optimized */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-gray-50 to-green-50 text-gray-800 border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="bg-green-600 text-white rounded-full p-1">
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-600 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions - Mobile optimized */}
          {messages.length === 1 && (
            <div className="p-3 sm:p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-green-50">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-green-600" />
                Quick Questions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-gray-700 hover:bg-green-50 hover:border-green-300 transition-all duration-200 text-left"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area - Mobile optimized */}
          <div className="p-3 sm:p-6 border-t border-gray-200 bg-white">
            <div className="flex space-x-2 sm:space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about nutrition, diet tips, meal planning, or healthy eating..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 resize-none transition-all duration-300 text-sm sm:text-base"
                  rows={1}
                  disabled={isLoading}
                  style={{ minHeight: '40px', maxHeight: '100px' }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base ${
                  !inputText.trim() || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800 transform hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>
            
            {/* Features Highlight - Mobile optimized */}
            <div className="mt-3 sm:mt-4 flex items-center justify-center space-x-3 sm:space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Brain className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                <span className="hidden sm:inline">AI Nutrition Expert</span>
                <span className="sm:hidden">Expert</span>
              </div>
              <div className="flex items-center space-x-1">
                <Leaf className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                <span className="hidden sm:inline">Diet Advice</span>
                <span className="sm:hidden">Advice</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                <span className="hidden sm:inline">Instant Answers</span>
                <span className="sm:hidden">Instant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards - Mobile optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200/50">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
              <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Expert Knowledge</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Get evidence-based nutrition advice from our AI trained on the latest dietary science and health guidelines.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200/50">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
              <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Personalized Help</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Ask specific questions about your diet, health goals, or nutrition concerns for tailored advice.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200/50 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
              <div className="bg-purple-100 p-1.5 sm:p-2 rounded-lg">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">24/7 Available</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Get instant nutrition guidance anytime, anywhere. No appointments needed for quick dietary questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionChatbot; 