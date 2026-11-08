'use client';

import { Package, Calculator, Calendar, Megaphone, ArrowUpRight } from 'lucide-react';
import { NavTab } from './Sidebar';

interface FeatureCardsProps {
  onSelectFeature: (tab: NavTab) => void;
}

export default function FeatureCards({ onSelectFeature }: FeatureCardsProps) {
  const cards = [
    {
      tab: 'stock' as NavTab,
      icon: Package,
      title: 'Kelola Stok',
      description: 'Hitung kebutuhan kulakan dan cegah barang mati.',
      iconBg: 'bg-orange-100 text-[#F28A2E]',
      borderHover: 'hover:border-[#F28A2E]',
      tag: 'Katalog & Mutasi',
    },
    {
      tab: 'packaging' as NavTab,
      icon: Calculator,
      title: 'Hitung Kemasan',
      description: 'Ketahui jumlah plastik dan biaya repacking eceran.',
      iconBg: 'bg-amber-100 text-amber-700',
      borderHover: 'hover:border-amber-400',
      tag: 'Kalkulator Plastik',
    },
    {
      tab: 'events' as NavTab,
      icon: Calendar,
      title: 'Kalender Event',
      description: 'Temukan dan catat peluang jualan di daerahmu.',
      iconBg: 'bg-teal-100 text-[#278C7B]',
      borderHover: 'hover:border-[#278C7B]',
      tag: 'Agenda & Analisis AI',
    },
    {
      tab: 'promotions' as NavTab,
      icon: Megaphone,
      title: 'Buat Promosi',
      description: 'Dapatkan 3 versi teks promosi WhatsApp instan.',
      iconBg: 'bg-emerald-100 text-emerald-700',
      borderHover: 'hover:border-emerald-500',
      tag: 'WhatsApp Siap Kirim',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.tab}
            onClick={() => onSelectFeature(card.tab)}
            className={`group text-left p-4 sm:p-5 rounded-2xl bg-white border border-[#E9E5DF] ${card.borderHover} transition-all duration-200 hover:shadow-md flex flex-col justify-between cursor-pointer`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${card.iconBg} transition-transform group-hover:scale-105`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="w-7 h-7 rounded-full bg-[#FFF7ED] group-hover:bg-[#F28A2E] group-hover:text-white text-[#64748B] flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] block mb-1">
                {card.tag}
              </span>
              <h3 className="font-bold text-base text-[#1F2A44] group-hover:text-[#F28A2E] transition-colors">
                {card.title}
              </h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                {card.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
