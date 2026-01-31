'use client';

import { useState, useRef, useEffect } from 'react';
import { Lightbulb, Send, Loader, Bot, User, Sparkles, MessageSquare } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  message: string;
  insights?: string[];
  suggestedQuestions?: string[];
}

interface AIInsightCardProps {
  insight: string;
  onLearnMore?: () => void;
  onShare?: () => void;
}

export function AIInsightCard({ insight }: AIInsightCardProps) {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (showChat && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showChat]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', message: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Prepare conversation history (last 10 exchanges)
      const conversationHistory = newMessages.slice(-10).map(msg => ({
        role: msg.role,
        message: msg.message,
      }));

      const response = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          conversationHistory,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            message: result.data.answer,
            insights: result.data.insights,
            suggestedQuestions: result.data.suggestedQuestions,
          },
        ]);
      } else {
        // Handle specific error cases based on errorType
        let errorMessage = 'Maaf, terjadi kesalahan. Silakan coba lagi.';
        
        if (result.errorType === 'RATE_LIMIT') {
          errorMessage = '⚠️ **Quota API Gemini Habis**\n\n' +
            'Sistem telah mencapai batas penggunaan API Gemini hari ini (20 requests/day untuk free tier).\n\n' +
            '**Solusi:**\n' +
            '• Tunggu beberapa menit, quota akan reset otomatis\n' +
            '• Atau upgrade ke Gemini API paid tier untuk quota lebih besar';
        } else if (result.errorType === 'NETWORK') {
          errorMessage = '🌐 **Koneksi Jaringan Bermasalah**\n\n' +
            'Tidak dapat terhubung ke server AI. Silakan cek koneksi internet dan coba lagi.';
        } else if (result.message && (result.message.includes('429') || result.message.includes('quota'))) {
          errorMessage = '⚠️ **Batas Penggunaan API Tercapai**\n\n' +
            'Mohon tunggu sebentar, sistem akan kembali normal dalam beberapa saat.';
        }

        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            message: errorMessage,
          },
        ]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          message: '❌ Koneksi gagal. Silakan cek koneksi internet dan coba lagi.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-teal-50 rounded-xl card-shadow-lg border border-teal-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shrink-0">
            <Lightbulb className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  Insight Hari Ini
                </h3>
                <span className="text-xs font-semibold bg-teal-200 text-teal-800 px-2 py-1 rounded flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI POWERED
                </span>
              </div>
              <button
                onClick={() => setShowChat(!showChat)}
                className="text-sm font-medium text-teal-700 hover:text-teal-800 flex items-center gap-2 bg-teal-100 hover:bg-teal-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                {showChat ? 'Sembunyikan Chat' : 'Tanya AI'}
              </button>
            </div>
            <p
              className="text-gray-700 leading-relaxed text-lg"
              dangerouslySetInnerHTML={{ __html: insight }}
            />
          </div>
        </div>

        {/* Chat Interface */}
        {showChat && (
          <div className="mt-6 border-t border-teal-200 pt-6">
            {/* Search/Input Bar */}
            <div className="mb-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tanyakan tentang data pasien, tren stunting, atau rekomendasi..."
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 border border-teal-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm bg-white"
                  />
                  <Bot className="absolute right-4 top-3.5 w-5 h-5 text-teal-400" />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-teal-600 to-indigo-600 text-white hover:from-teal-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-medium"
                >
                  {isLoading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Messages */}
            {messages.length > 0 && (
              <div className="max-h-[400px] overflow-y-auto space-y-4 bg-white rounded-xl p-4 border border-teal-200">
                {messages.map((msg, idx) => (
                  <div key={idx}>
                    <div
                      className={`flex gap-3 ${
                        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-teal-600 text-white'
                            : 'bg-indigo-600 text-white'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 max-w-[85%]">
                        <div
                          className={`rounded-2xl p-4 ${
                            msg.role === 'user'
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-50 border border-gray-200 text-gray-800'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.message}
                          </p>
                        </div>

                        {/* Insights */}
                        {msg.insights && msg.insights.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              💡 Key Insights:
                            </p>
                            {msg.insights.map((insight, i) => (
                              <div
                                key={i}
                                className="bg-amber-50 border border-amber-200 rounded-lg p-3"
                              >
                                <p className="text-xs text-amber-900">{insight}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Suggested Questions */}
                        {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              💬 Pertanyaan Lanjutan:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {msg.suggestedQuestions.map((question, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleSuggestedQuestion(question)}
                                  className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-full px-3 py-1.5 transition-colors"
                                >
                                  {question}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="p-2 rounded-lg bg-indigo-600 text-white">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Dr. Gizi sedang berpikir...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {messages.length === 0 && (
              <div className="bg-white rounded-xl p-6 border border-teal-200 text-center">
                <Bot className="w-12 h-12 text-teal-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-4">
                  Tanyakan apa saja tentang data pasien stunting Anda. AI akan menganalisis database dan memberikan insight mendalam.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => handleSuggestedQuestion('Berapa jumlah pasien dengan risiko tinggi?')}
                    className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-full px-3 py-1.5 transition-colors"
                  >
                    Berapa jumlah pasien dengan risiko tinggi?
                  </button>
                  <button
                    onClick={() => handleSuggestedQuestion('Siapa pasien yang perlu perhatian khusus?')}
                    className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-full px-3 py-1.5 transition-colors"
                  >
                    Siapa pasien yang perlu perhatian khusus?
                  </button>
                  <button
                    onClick={() => handleSuggestedQuestion('Bagaimana tren kasus stunting bulan ini?')}
                    className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-full px-3 py-1.5 transition-colors"
                  >
                    Bagaimana tren kasus stunting bulan ini?
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-3 text-center">
              Powered by Google Gemini AI • Model: gemini-2.5-flash
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
