'use client';

import { useState } from 'react';
import { Lightbulb, RefreshCw, ChevronRight } from 'lucide-react';
import { NavTab } from './Sidebar';

interface DailyTipProps {
  onNavigate?: (tab: NavTab) => void;
}

const PRACTICAL_TIPS = [
  {
    title: 'Pilih Mainan "Perputaran Cepat"',
    content:
      'Untuk pedagang keliling dan jualan sore, prioritaskan mainan harga jual Rp5.000 - Rp15.000 (seperti gelembung sabun, mobil tarik LED, pop-it). Orang tua lebih mudah memutuskan pembelian tanpa pikir panjang.',
    actionTab: 'stock' as NavTab,
    actionText: 'Cek Stok Produk',
  },
  {
    title: 'Hemat Modal Plastik dengan Repacking',
    content:
      'Membeli mainan plastik 1 kantong besar lalu dikemas ulang (repack) menjadi paket eceran kecil Rp5.000-an sering kali memberikan margin yang lebih sehat daripada menjual barang satuan mahal.',
    actionTab: 'packaging' as NavTab,
    actionText: 'Hitung Kebutuhan Plastik',
  },
  {
    title: 'Pantau Jadwal Pentas Seni & Pasar Malam',
    content:
      'Acara lokal seperti Pentas Seni Jaranan, Janger, atau Car Free Day selalu dihadiri keluarga dengan anak-anak. Pastikan siapkan uang receh untuk kembalian dan bawa mainan bertali atau menyala saat malam.',
    actionTab: 'events' as NavTab,
    actionText: 'Lihat Kalender Event',
  },
  {
    title: 'Rutinitas Promosi WhatsApp Pagi & Sore',
    content:
      'Kirim foto atau status WhatsApp di jam santai orang tua (pukul 09.00 - 10.30 pagi saat istirahat, atau 16.30 - 18.00 saat anak bermain di rumah). Gunakan bahasa yang menyapa ramah seperti tetangga.',
    actionTab: 'promotions' as NavTab,
    actionText: 'Buat Teks WhatsApp',
  },
  {
    title: 'Cegah Modal Mati (Dead Stock)',
    content:
      'Jika sebuah mainan tidak bergerak selama lebih dari 2 minggu, jangan biarkan menumpuk di kardus. Buat paket bundling bersama mainan favorit atau tawarkan sedikit potongan di grup WhatsApp warga.',
    actionTab: 'stock' as NavTab,
    actionText: 'Kelola Stok Lama',
  },
];

export default function DailyTip({ onNavigate }: DailyTipProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const currentTip = PRACTICAL_TIPS[tipIndex];

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % PRACTICAL_TIPS.length);
  };

  return (
    <div className="bg-linear-to-r from-[#FFF7ED] to-white border border-[#FFE8CC] rounded-3xl p-5 shadow-2xs">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-100 text-[#F28A2E]">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F28A2E]">
              Tips Hari Ini
            </h3>
            <h4 className="text-sm font-bold text-[#1F2A44]">
              {currentTip.title}
            </h4>
          </div>
        </div>

        <button
          onClick={handleNextTip}
          className="p-1.5 rounded-xl text-[#64748B] hover:text-[#F28A2E] hover:bg-orange-50 transition-colors text-xs flex items-center gap-1"
          title="Lihat tips lainnya"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs">Ganti Tips</span>
        </button>
      </div>

      <p className="text-xs text-[#253344] leading-relaxed mt-2">
        {currentTip.content}
      </p>

      {onNavigate && (
        <div className="mt-3 pt-2.5 border-t border-[#FFE8CC]/60 flex justify-end">
          <button
            onClick={() => onNavigate(currentTip.actionTab)}
            className="text-xs font-semibold text-[#F28A2E] hover:underline flex items-center gap-1"
          >
            <span>{currentTip.actionText}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
