'use client';

import Image from 'next/image';
import { ArrowRight, Bot, Sparkles, TrendingUp } from 'lucide-react';
import TeddyMascot from './TeddyMascot';
import { NavTab } from './Sidebar';

interface HeroBannerProps {
  onStartAction: (tab: NavTab) => void;
}

export default function HeroBanner({ onStartAction }: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#FFE8CC] via-[#FFF7ED] to-[#FED7AA] border border-[#FDBA74]/50 p-6 md:p-8 shadow-xs">
      {/* Decorative background shapes */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/40 blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 right-28 w-36 h-36 rounded-full bg-[#F28A2E]/10 blur-lg pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Column: Text & CTAs */}
        <div className="max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#FDBA74] text-[#F28A2E] text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F28A2E]" />
            Solusi Praktis Pedagang Mainan UMKM
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1F2A44] tracking-tight leading-tight">
            Mainan Kita
          </h1>
          <p className="text-base sm:text-lg font-bold text-[#F28A2E] mt-1">
            Asisten Cerdas untuk Usaha Mainan
          </p>
          <p className="text-xs font-semibold text-[#64748B] tracking-wide mt-0.5">
            Mitra Mainan Lokal & Tradisional
          </p>

          <p className="text-sm text-[#253344] mt-2 leading-relaxed">
            Atur stok harian, hitung modal kulakan, hitung kebutuhan plastik kemasan, cari peluang event jualan, dan buat promosi WhatsApp ramah pembeli dengan mudah.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={() => onStartAction('stock')}
              className="px-5 py-2.5 rounded-xl bg-[#F28A2E] hover:bg-[#E9781F] text-white font-semibold text-sm shadow-sm transition-all duration-150 flex items-center gap-2 group cursor-pointer"
            >
              <span>Mulai Sekarang</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onStartAction('assistant')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-orange-50/80 text-[#1F2A44] border border-[#E9E5DF] font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Bot className="w-4 h-4 text-[#F28A2E]" />
              <span>Tanya Asisten AI</span>
            </button>
          </div>
        </div>

        {/* Right Column: Official Brand Logo & Cultural Toy Motifs */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div className="w-56 h-48 sm:w-64 sm:h-52 relative flex items-center justify-center">
            {/* Soft decorative pedestal glow */}
            <div className="absolute inset-0 bg-white/70 rounded-3xl backdrop-blur-xs border border-white/90 shadow-sm" />

            {/* Official Logo Emblem in the center */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white shadow-md border-2 border-[#FFE8CC] overflow-hidden flex items-center justify-center p-1 relative">
                <Image
                  src="/assets/aistudio/Gemini_Generated_Image_rizqlxrizqlxrizq-removebg-preview_5a3bbbec.png"
                  alt="Logo Resmi Mainan Kita - Mitra Mainan Lokal & Tradisional"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover scale-[1.65] rounded-full"
                  referrerPolicy="no-referrer"
                  priority
                />
              </div>

              {/* Floating badges */}
              <div className="mt-2 flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-xl bg-white shadow-xs border border-[#FFE8CC] flex items-center gap-1.5 text-[11px] font-bold text-[#1F2A44]">
                  <span>🪁</span>
                  <span>Tradisional</span>
                </div>

                <div className="px-2.5 py-1 rounded-xl bg-white shadow-xs border border-[#FFE8CC] flex items-center gap-1.5 text-[11px] font-bold text-[#F28A2E]">
                  <span>✨</span>
                  <span>UMKM Lokal</span>
                </div>
              </div>
            </div>

            {/* Little floating mascot tag */}
            <div className="absolute -top-3 -left-3 bg-white px-2.5 py-1 rounded-xl shadow-xs border border-[#FFE8CC] flex items-center gap-1.5 text-[11px] font-semibold text-[#F28A2E]">
              <TeddyMascot size={18} mood="happy" />
              <span>Logo Resmi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
