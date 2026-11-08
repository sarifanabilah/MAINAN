'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import TeddyMascot from './TeddyMascot';
import { ChatMessage, Product, BusinessProfile } from '@/types';

interface AssistantChatProps {
  profile: BusinessProfile;
  products: Product[];
  metrics: {
    totalStock: number;
    totalStockCapital: number;
    upcomingEventsCount: number;
  };
  compact?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'assistant',
    content:
      'Halo! Saya Asisten AI Mainan Kita 🧸\n\nSaya siap membantu kamu mengelola perputaran modal, mengatur stok kulakan, merencanakan rute jualan keliling, hingga membuat promosi WhatsApp yang ramah pembeli. Ada yang bisa saya bantu hari ini?',
    timestamp: new Date().toISOString(),
  },
];

const SUGGESTED_QUESTIONS = [
  'Strategi promosi hari ini?',
  'Mainan apa yang perlu diprioritaskan?',
  'Cara mengatur modal kulakan?',
  'Apa yang harus disiapkan untuk jualan keliling?',
  'Bagaimana mengatasi mainan yang tidak laku?',
];

export default function AssistantChat({
  profile,
  products,
  metrics,
  compact = false,
}: AssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    const userMessage: ChatMessage = {
      id: 'msg-u-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      // Build summary of products for context
      const productsSummary = products
        .slice(0, 10)
        .map(
          (p) =>
            `- ${p.name} (Stok: ${p.currentStock}, Jual: Rp${p.sellingPrice.toLocaleString('id-ID')}, Beli: Rp${p.purchasePrice.toLocaleString('id-ID')})`
        )
        .join('\n');

      const response = await fetch('/api/business-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: newHistory,
          context: {
            businessName: profile.businessName,
            location: profile.location,
            totalStock: metrics.totalStock,
            upcomingEventsCount: metrics.upcomingEventsCount,
            productsSummary,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menerima tanggapan dari asisten.');
      }

      const assistantMessage: ChatMessage = {
        id: 'msg-a-' + Date.now(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Koneksi ke asisten AI terganggu. Silakan coba kembali.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
    setErrorMessage(null);
  };

  return (
    <div
      className={`bg-white rounded-3xl border border-[#E9E5DF] shadow-xs flex flex-col ${
        compact ? 'h-[520px]' : 'h-[640px]'
      }`}
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#E9E5DF] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-[#FFE8CC] overflow-hidden shadow-2xs relative p-0.5 shrink-0">
            <Image
              src="/assets/aistudio/Gemini_Generated_Image_rizqlxrizqlxrizq-removebg-preview_5a3bbbec.png"
              alt="Logo Resmi Mainan Kita"
              width={40}
              height={40}
              className="w-full h-full object-cover scale-[1.65] rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#1F2A44] flex items-center gap-2">
              Tanya Asisten AI
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-[#F28A2E]">
                Gemini 3.8 Flash
              </span>
            </h3>
            <p className="text-xs text-[#64748B]">
              Konsultasi praktis stok, modal, event, & promosi mainan
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-xs flex items-center gap-1"
          title="Hapus riwayat obrolan"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Bersihkan</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FFF7ED]/30">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-[#1F2A44] text-white'
                    : 'bg-[#FFE8CC] text-[#F28A2E]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <TeddyMascot size={22} />}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#F28A2E] text-white rounded-tr-xs shadow-xs font-medium'
                    : 'bg-white text-[#253344] border border-[#E9E5DF] rounded-tl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Assistant message action (copy) */}
                {!isUser && (
                  <div className="mt-2.5 pt-2 border-t border-[#E9E5DF]/60 flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>Asisten Mainan Kita</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="flex items-center gap-1 hover:text-[#F28A2E] transition-colors"
                      title="Salin jawaban"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFE8CC] text-[#F28A2E] flex items-center justify-center shrink-0">
              <TeddyMascot size={22} mood="thinking" />
            </div>
            <div className="bg-white text-[#64748B] border border-[#E9E5DF] rounded-2xl rounded-tl-xs px-4 py-3 text-xs flex items-center gap-2 shadow-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-[#F28A2E] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#F28A2E] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#F28A2E] animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>Sedang merumuskan saran terbaik...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => handleSendMessage()}
              className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-semibold flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              Coba Lagi
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Pills */}
      <div className="px-4 py-2 border-t border-[#E9E5DF] bg-white overflow-x-auto shrink-0 flex items-center gap-2 no-scrollbar">
        <span className="text-[11px] font-bold text-[#64748B] shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          Tanya:
        </span>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="shrink-0 text-xs px-3 py-1 rounded-full bg-[#FFF7ED] hover:bg-[#FFE8CC] text-[#253344] border border-[#FFE8CC] transition-colors font-medium disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 border-t border-[#E9E5DF] bg-white shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pertanyaan seputar stok, modal, event, atau promosi..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm border border-[#E9E5DF] rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E] disabled:bg-gray-50 placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-2xl bg-[#F28A2E] hover:bg-[#E9781F] text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 shadow-xs"
            aria-label="Kirim pesan ke asisten"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </form>
      </div>
    </div>
  );
}
