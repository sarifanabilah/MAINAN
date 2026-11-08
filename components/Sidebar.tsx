'use client';

import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  Calculator,
  Calendar,
  Megaphone,
  Bot,
  Sparkles,
  Store,
  Compass,
} from 'lucide-react';
import TeddyMascot from './TeddyMascot';
import { AppMode } from '@/lib/storage';

export type NavTab =
  | 'dashboard'
  | 'stock'
  | 'packaging'
  | 'events'
  | 'promotions'
  | 'assistant';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mode: AppMode;
  onToggleMode: () => void;
  lowStockCount?: number;
  upcomingEventsCount?: number;
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  mode,
  onToggleMode,
  lowStockCount = 0,
  upcomingEventsCount = 0,
}: SidebarProps) {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Beranda',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'stock' as NavTab,
      label: 'Kelola Stok',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} menipis` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'packaging' as NavTab,
      label: 'Hitung Kemasan',
      icon: Calculator,
      badge: null,
    },
    {
      id: 'events' as NavTab,
      label: 'Kalender Event',
      icon: Calendar,
      badge: upcomingEventsCount > 0 ? `${upcomingEventsCount} acara` : null,
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
      id: 'promotions' as NavTab,
      label: 'Buat Promosi',
      icon: Megaphone,
      badge: 'WhatsApp',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'assistant' as NavTab,
      label: 'Tanya Asisten AI',
      icon: Bot,
      badge: 'AI',
      badgeColor: 'bg-orange-100 text-[#F28A2E]',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E9E5DF] flex flex-col justify-between shrink-0 min-h-screen">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-[#E9E5DF]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E9E5DF] flex items-center justify-center shadow-xs overflow-hidden shrink-0 relative p-0.5">
              <Image
                src="/assets/aistudio/Gemini_Generated_Image_rizqlxrizqlxrizq-removebg-preview_5a3bbbec.png"
                alt="Logo Resmi Mainan Kita"
                width={48}
                height={48}
                className="w-full h-full object-cover scale-[1.65] rounded-xl"
                referrerPolicy="no-referrer"
                priority
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-base text-[#1F2A44] leading-tight flex items-center gap-1.5">
                Mainan Kita
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#FFE8CC] text-[#F28A2E]">
                  MVP 1.0
                </span>
              </h1>
              <p className="text-[11px] text-[#64748B] mt-0.5 font-medium truncate">
                Mitra Mainan Lokal & Tradisional
              </p>
            </div>
          </div>

          {/* Mode Switcher Pill */}
          <div className="mt-4 p-1.5 bg-[#FFF7ED] rounded-xl border border-[#FFE8CC]">
            <div className="flex items-center justify-between text-xs mb-1.5 px-1 font-medium">
              <span className="text-[#64748B]">Mode Aktif:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                  mode === 'demo'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-[#E7F4EF] text-[#278C7B]'
                }`}
              >
                {mode === 'demo' ? 'Mode Demo' : 'Ruang Usaha'}
              </span>
            </div>
            <button
              onClick={onToggleMode}
              className="w-full text-left flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors bg-white hover:bg-orange-50 text-[#F28A2E] border border-[#E9E5DF]"
            >
              {mode === 'demo' ? (
                <>
                  <Store className="w-3.5 h-3.5" />
                  Beralih ke Ruang Usaha
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5" />
                  Lihat Contoh Demo
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1" aria-label="Menu Utama">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-[#F28A2E] text-white shadow-xs font-semibold'
                    : 'text-[#253344] hover:bg-[#FFF7ED] hover:text-[#F28A2E]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'text-white scale-105' : 'text-[#64748B]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Encouragement / Practical Tip Card at bottom of sidebar */}
      <div className="p-4">
        <div className="bg-[#FFF7ED] border border-[#FFE8CC] rounded-2xl p-3.5 relative overflow-hidden">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-orange-100 text-[#F28A2E] shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1F2A44]">
                Semangat Kulakan! 🌟
              </p>
              <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">
                Prioritaskan mainan yang cepat terjual agar perputaran modal harianmu tetap aman.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('assistant')}
            className="mt-3 w-full text-center text-[11px] font-semibold text-[#F28A2E] hover:underline"
          >
            Tanya strategi jualan →
          </button>
        </div>
      </div>
    </aside>
  );
}
