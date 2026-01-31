'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Send, Bot, User, Loader, X, MessageSquare, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  message: string;
  insights?: string[];
  suggestedQuestions?: string[];
}

export function ChatbotCard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      message: 'Halo! Saya Dr. Gizi, asisten AI untuk sistem Stunting Sentinel. Saya bisa membantu Anda menganalisis data pasien, memberikan insight, dan menjawab pertanyaan seputar stunting. Silakan tanyakan apa saja!',
      suggestedQuestions: [
        'Berapa jumlah pasien dengan risiko tinggi?',
        'Siapa saja pasien yang perlu perhatian khusus?',
        'Bagaimana tren kasus stunting bulan ini?',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      // Prepare conversation history (last 5 exchanges)
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
            '• Atau upgrade ke Gemini API paid tier untuk quota lebih besar\n\n' +
            'Terima kasih atas pengertiannya! 🙏';
        } else if (result.errorType === 'NETWORK') {
          errorMessage = '🌐 **Koneksi Jaringan Bermasalah**\n\n' +
            'Tidak dapat terhubung ke server AI. Silakan:\n' +
            '• Cek koneksi internet Anda\n' +
            '• Refresh halaman dan coba lagi\n' +
            '• Hubungi administrator jika masalah berlanjut';
        } else if (result.suggestion) {
          errorMessage = `❌ **Error**: ${result.error}\n\n${result.suggestion}`;
        } else if (result.message && (result.message.includes('429') || result.message.includes('quota'))) {
          errorMessage = '⚠️ **Batas Penggunaan API Tercapai**\n\n' +
            'Mohon tunggu sebentar, sistem akan kembali normal dalam beberapa saat.\n\n' +
            '💡 **Tips**: Gemini API free tier memiliki limit 20 requests/day. Untuk penggunaan unlimited, pertimbangkan upgrade ke paid tier.';
        } else if (result.error) {
          errorMessage = `❌ **Error**: ${result.error}\n\nSilakan refresh halaman atau hubungi administrator.`;
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
          message: '❌ **Koneksi Gagal**\n\n' +
            'Sistem sedang mengalami gangguan jaringan. Silakan:\n' +
            '• Cek koneksi internet Anda\n' +
            '• Refresh halaman\n' +
            '• Coba beberapa saat lagi',
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isExpanded) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 hover:shadow-lg transition-all duration-300">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                <Bot className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  Dr. Gizi - AI Assistant
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tanyakan apa saja tentang data pasien stunting Anda. AI akan menganalisis database dan memberikan insight mendalam.
                </p>
                <Button
                  onClick={() => setIsExpanded(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Mulai Chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-purple-200 shadow-xl">
      <div className="flex flex-col h-[600px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                Dr. Gizi - AI Assistant
                <Sparkles className="w-4 h-4" />
              </h3>
              <p className="text-xs text-purple-100">Always ready to help</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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
                      ? 'bg-purple-600 text-white'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 max-w-[80%]">
                  <div
                    className={`rounded-2xl p-4 ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
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
                            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-3 py-1.5 transition-colors"
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
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Dr. Gizi sedang berpikir...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tanyakan tentang data pasien..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-6"
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Powered by Google Gemini AI • Model: gemini-2.5-flash
          </p>
        </div>
      </div>
    </Card>
  );
}
