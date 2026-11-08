'use client';

import { useState, useEffect } from 'react';
import {
  Calculator,
  Save,
  RotateCcw,
  CheckCircle,
  Lightbulb,
  History,
  PackageCheck,
  Coins,
  Layers,
} from 'lucide-react';
import { PackagingCalculation } from '@/types';
import {
  calculatePackagingRequirement,
  formatRupiah,
  formatDateIndo,
} from '@/lib/calculations';
import {
  savePackagingCalculation,
  getPackagingCalculations,
  AppMode,
} from '@/lib/storage';

interface PackagingCalculatorProps {
  mode: AppMode;
}

export default function PackagingCalculator({ mode }: PackagingCalculatorProps) {
  const [toyCount, setToyCount] = useState<number | ''>(100);
  const [toysPerPackage, setToysPerPackage] = useState<number | ''>(2);
  const [pricePerBag, setPricePerBag] = useState<number | ''>(100);
  const [availableBags, setAvailableBags] = useState<number | ''>(10);

  const [savedSuccessToast, setSavedSuccessToast] = useState(false);
  const [extraSaved, setExtraSaved] = useState<PackagingCalculation[]>([]);
  const storedHistory = getPackagingCalculations(mode);
  const calculationHistory = [
    ...extraSaved,
    ...storedHistory.filter((item) => !extraSaved.some((e) => e.id === item.id)),
  ];

  // Deterministic calculation
  const calcResult = calculatePackagingRequirement({
    toyCount: Number(toyCount) || 0,
    toysPerPackage: Number(toysPerPackage) || 1,
    pricePerBag: Number(pricePerBag) || 0,
    availableBags: Number(availableBags) || 0,
  });

  const handleSaveCalculation = () => {
    const saved = savePackagingCalculation(
      {
        toyCount: Number(toyCount) || 0,
        toysPerPackage: Number(toysPerPackage) || 1,
        pricePerBag: Number(pricePerBag) || 0,
        availableBags: Number(availableBags) || 0,
        requiredPackaging: calcResult.requiredPackaging,
        additionalBags: calcResult.additionalBags,
        estimatedCost: calcResult.estimatedCost,
        savingTip: calcResult.savingTip,
      },
      mode
    );

    setExtraSaved((prev) => [saved, ...prev]);
    setSavedSuccessToast(true);
    setTimeout(() => setSavedSuccessToast(false), 3000);
  };

  const handleReset = () => {
    setToyCount(100);
    setToysPerPackage(2);
    setPricePerBag(100);
    setAvailableBags(10);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {savedSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F2A44] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm animate-fade-in border border-white/10">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Hasil hitungan kemasan plastik berhasil disimpan ke riwayat.</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1F2A44] flex items-center gap-2">
          Kalkulator Kemasan Eceran (Repacking)
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
          Hitung jumlah plastik pembungkus dan biaya tambahan agar modal kas harian tetap terkendali.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-[#E9E5DF] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E9E5DF]">
            <h3 className="font-bold text-sm text-[#1F2A44] flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#F28A2E]" />
              Data Mainan & Plastik
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-[#64748B] hover:text-[#253344] flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#253344] mb-1">
              1. Jumlah Mainan yang Akan Dikemas (unit)
            </label>
            <input
              type="number"
              min="1"
              value={toyCount}
              onChange={(e) =>
                setToyCount(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="Contoh: 100"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
            />
            <span className="text-[10px] text-[#64748B]">
              Total isi barang dari kulakan bal/pak besar
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#253344] mb-1">
              2. Isi Mainan per Bungkus Plastik
            </label>
            <input
              type="number"
              min="1"
              value={toysPerPackage}
              onChange={(e) =>
                setToysPerPackage(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="Contoh: 2"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
            />
            <span className="text-[10px] text-[#64748B]">
              Jumlah mainan di dalam tiap kantong eceran
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#253344] mb-1">
              3. Harga per Kantong Plastik (Rp)
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={pricePerBag}
              onChange={(e) =>
                setPricePerBag(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="Contoh: 100"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
            />
            <span className="text-[10px] text-[#64748B]">
              Harga satuan plastik klip/mika (bisa dihitung dari harga per ikat / 100)
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#253344] mb-1">
              4. Stok Kantong Plastik yang Tersedia di Rumah
            </label>
            <input
              type="number"
              min="0"
              value={availableBags}
              onChange={(e) =>
                setAvailableBags(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="Contoh: 10"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
            />
            <span className="text-[10px] text-[#64748B]">
              Sisa plastik yang belum terpakai
            </span>
          </div>

          <button
            onClick={handleSaveCalculation}
            className="w-full mt-2 py-2.5 rounded-xl bg-[#F28A2E] hover:bg-[#E9781F] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Hasil Kemasan</span>
          </button>
        </div>

        {/* Results & Saving Suggestion (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E9E5DF] shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] pb-3 border-b border-[#E9E5DF]">
              Hasil Hitungan Kemasan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
              <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#FFE8CC]">
                <p className="text-xs text-[#64748B] font-medium">
                  Total Paket Hasil Repack
                </p>
                <p className="text-3xl font-extrabold text-[#F28A2E] mt-1">
                  {calcResult.requiredPackaging}{' '}
                  <span className="text-sm font-semibold text-[#64748B]">bungkus</span>
                </p>
                <p className="text-[11px] text-[#64748B] mt-1">
                  CEILING({toyCount || 0} mainan ÷ {toysPerPackage || 1} per bungkus)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#E8EEFF] border border-blue-200">
                <p className="text-xs text-[#64748B] font-medium">
                  Tambahan Plastik yang Perlu Dibeli
                </p>
                <p className="text-3xl font-extrabold text-[#1F2A44] mt-1">
                  {calcResult.additionalBags}{' '}
                  <span className="text-sm font-semibold text-[#64748B]">lembar</span>
                </p>
                <p className="text-[11px] text-[#64748B] mt-1">
                  Perlu {calcResult.requiredPackaging} - sisa di rumah {availableBags || 0}
                </p>
              </div>
            </div>

            {/* Total Cost Highlight */}
            <div className="p-4 rounded-2xl bg-[#E7F4EF] border border-teal-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#278C7B] font-bold uppercase tracking-wider">
                  Estimasi Biaya Tambahan Plastik
                </p>
                <p className="text-2xl font-extrabold text-[#1F2A44] mt-0.5">
                  {formatRupiah(calcResult.estimatedCost)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-[#278C7B] flex items-center justify-center">
                <Coins className="w-6 h-6" />
              </div>
            </div>

            {/* Saving Suggestion */}
            <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-[#253344] leading-relaxed">
              <p className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Tips Hemat Modal Kemasan:
              </p>
              <p>{calcResult.savingTip}</p>
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-3xl p-5 border border-[#E9E5DF] shadow-xs">
            <h3 className="font-bold text-sm text-[#1F2A44] flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-[#F28A2E]" />
              Riwayat Hitung Kemasan
            </h3>

            {calculationHistory.length === 0 ? (
              <p className="text-xs text-[#64748B] py-3 text-center">
                Belum ada riwayat kemasan tersimpan.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {calculationHistory.slice(0, 5).map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-xl bg-[#FFF7ED]/30 border border-[#FFE8CC] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#1F2A44]">
                        {h.toyCount} mainan ({h.toysPerPackage}/bungkus) ={' '}
                        <span className="text-[#F28A2E]">{h.requiredPackaging} bungkus</span>
                      </p>
                      <p className="text-[11px] text-[#64748B]">
                        Beli plastik: <strong>{h.additionalBags} lembar</strong> • Biaya:{' '}
                        <strong>{formatRupiah(h.estimatedCost)}</strong>
                      </p>
                    </div>
                    <span className="text-[10px] text-[#64748B] shrink-0">
                      {formatDateIndo(h.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
