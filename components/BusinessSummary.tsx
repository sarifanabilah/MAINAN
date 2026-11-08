'use client';

import { Package2, Coins, CalendarDays, PlusCircle, ArrowRight } from 'lucide-react';
import { formatRupiah } from '@/lib/calculations';
import { AppMode } from '@/lib/storage';
import { NavTab } from './Sidebar';

interface BusinessSummaryProps {
  metrics: {
    totalStock: number;
    totalStockCapital: number;
    upcomingEventsCount: number;
    activeProductsCount: number;
  };
  mode: AppMode;
  onNavigate: (tab: NavTab) => void;
}

export default function BusinessSummary({
  metrics,
  mode,
  onNavigate,
}: BusinessSummaryProps) {
  const hasProducts = metrics.activeProductsCount > 0;
  const hasEvents = metrics.upcomingEventsCount > 0;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E9E5DF] shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-[#E9E5DF]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1F2A44] flex items-center gap-2">
            Ringkasan Usaha Anda
            {mode === 'demo' && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Data Demo
              </span>
            )}
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Dihitung dari data katalog produk dan agenda aktif tokomu
          </p>
        </div>

        <button
          onClick={() => onNavigate('stock')}
          className="text-xs font-semibold text-[#F28A2E] hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Buka Katalog Stok</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Total Stock */}
        <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#FFE8CC] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#F28A2E] flex items-center justify-center shrink-0">
            <Package2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#64748B] font-medium">Total Jumlah Stok</p>
            <p className="text-2xl font-extrabold text-[#1F2A44] tracking-tight">
              {metrics.totalStock.toLocaleString('id-ID')}{' '}
              <span className="text-sm font-semibold text-[#64748B]">unit</span>
            </p>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Dari {metrics.activeProductsCount} jenis mainan aktif
            </p>
          </div>
        </div>

        {/* Metric 2: Estimasi Modal Stok */}
        <div className="p-4 rounded-2xl bg-[#E8EEFF] border border-blue-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#64748B] font-medium">Estimasi Modal Stok</p>
            <p className="text-xl sm:text-2xl font-extrabold text-[#1F2A44] tracking-tight truncate">
              {formatRupiah(metrics.totalStockCapital)}
            </p>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Nilai modal yang saat ini ada di stok
            </p>
          </div>
        </div>

        {/* Metric 3: Event Terdekat */}
        <div className="p-4 rounded-2xl bg-[#E7F4EF] border border-teal-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-[#278C7B] flex items-center justify-center shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#64748B] font-medium">Event Mendatang</p>
            <p className="text-2xl font-extrabold text-[#1F2A44] tracking-tight">
              {metrics.upcomingEventsCount}{' '}
              <span className="text-sm font-semibold text-[#64748B]">agenda</span>
            </p>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Peluang jualan di area tokomu
            </p>
          </div>
        </div>
      </div>

      {/* Empty State guidance if user is in Ruang Usaha and has 0 products */}
      {!hasProducts && mode === 'business' && (
        <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="text-xs font-bold text-amber-900">
              Belum ada produk di Ruang Usaha Anda
            </p>
            <p className="text-xs text-amber-800 mt-0.5">
              Tambahkan produk mainan pertamamu untuk mulai menghitung stok dan modal kulakan otomatis.
            </p>
          </div>
          <button
            onClick={() => onNavigate('stock')}
            className="px-3.5 py-1.5 rounded-xl bg-[#F28A2E] hover:bg-[#E9781F] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Tambah Produk
          </button>
        </div>
      )}
    </div>
  );
}
