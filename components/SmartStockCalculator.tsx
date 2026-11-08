'use client';

import { useState, useEffect } from 'react';
import {
  Calculator,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Coins,
  Package,
  History,
  TrendingUp,
} from 'lucide-react';
import { Product, StockCalculation } from '@/types';
import {
  calculateStockRequirement,
  formatRupiah,
  formatDateIndo,
} from '@/lib/calculations';
import {
  saveStockCalculation,
  getStockCalculations,
  AppMode,
} from '@/lib/storage';

interface SmartStockCalculatorProps {
  products: Product[];
  mode: AppMode;
  initialProduct?: Product | null;
}

export default function SmartStockCalculator({
  products,
  mode,
  initialProduct,
}: SmartStockCalculatorProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProduct?.id || (products.length > 0 ? products[0].id : '')
  );
  const [productName, setProductName] = useState(
    initialProduct?.name || (products.length > 0 ? products[0].name : '')
  );
  const [currentStock, setCurrentStock] = useState<number | ''>(
    initialProduct ? initialProduct.currentStock : products[0]?.currentStock ?? 10
  );
  const [avgDailySales, setAvgDailySales] = useState<number | ''>(
    initialProduct ? initialProduct.avgDailySales : products[0]?.avgDailySales ?? 5
  );
  const [planningPeriodDays, setPlanningPeriodDays] = useState<number | ''>(7);
  const [safetyStock, setSafetyStock] = useState<number | ''>(
    initialProduct ? initialProduct.safetyStock : products[0]?.safetyStock ?? 3
  );
  const [purchasePrice, setPurchasePrice] = useState<number | ''>(
    initialProduct ? initialProduct.purchasePrice : products[0]?.purchasePrice ?? 3000
  );

  const [extraSaved, setExtraSaved] = useState<StockCalculation[]>([]);
  const storedHistory = getStockCalculations(mode);
  const calculationHistory = [
    ...extraSaved,
    ...storedHistory.filter((item) => !extraSaved.some((e) => e.id === item.id)),
  ];

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    const found = products.find((p) => p.id === id);
    if (found) {
      setProductName(found.name);
      setCurrentStock(found.currentStock);
      setAvgDailySales(found.avgDailySales);
      setSafetyStock(found.safetyStock);
      setPurchasePrice(found.purchasePrice);
    }
  };

  // Perform deterministic calculation
  const calcResult = calculateStockRequirement({
    currentStock: Number(currentStock) || 0,
    avgDailySales: Number(avgDailySales) || 0,
    planningPeriodDays: Number(planningPeriodDays) || 1,
    safetyStock: Number(safetyStock) || 0,
    purchasePrice: Number(purchasePrice) || 0,
  });

  const [savedSuccessToast, setSavedSuccessToast] = useState(false);

  const handleSaveCalculation = () => {
    const saved = saveStockCalculation(
      {
        productId: selectedProductId || undefined,
        productName: productName || 'Mainan Tanpa Nama',
        currentStock: Number(currentStock) || 0,
        avgDailySales: Number(avgDailySales) || 0,
        planningPeriodDays: Number(planningPeriodDays) || 1,
        safetyStock: Number(safetyStock) || 0,
        purchasePrice: Number(purchasePrice) || 0,
        targetStock: calcResult.targetStock,
        recommendedPurchase: calcResult.recommendedPurchase,
        estimatedCapital: calcResult.estimatedCapital,
        status: calcResult.status,
        explanation: calcResult.explanation,
      },
      mode
    );

    setExtraSaved((prev) => [saved, ...prev]);
    setSavedSuccessToast(true);
    setTimeout(() => setSavedSuccessToast(false), 3000);
  };

  const handleReset = () => {
    setCurrentStock(10);
    setAvgDailySales(5);
    setPlanningPeriodDays(7);
    setSafetyStock(3);
    setPurchasePrice(3000);
    setProductName(products[0]?.name || '');
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {savedSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F2A44] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm animate-fade-in border border-white/10">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Hasil perhitungan kulakan berhasil disimpan ke riwayat.</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1F2A44] flex items-center gap-2">
          Kalkulator Kulakan Cerdas
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-[#F28A2E]">
            Formula Pasti
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
          Hitung jumlah kulakan ideal sesuai target hari penjualan agar uang kas tidak tertahan di gudang.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-[#E9E5DF] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E9E5DF]">
            <h3 className="font-bold text-sm text-[#1F2A44] flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#F28A2E]" />
              Data Rencana Kulakan
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-[#64748B] hover:text-[#253344] flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Product Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#253344] mb-1">
              Pilih dari Katalog (Opsional)
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
            >
              <option value="">-- Ketik manual atau pilih produk --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stok: {p.currentStock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#253344] mb-1">
              Nama Mainan
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Contoh: Gelembung Sabun Magic"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#253344] mb-1">
                Stok Saat Ini (unit)
              </label>
              <input
                type="number"
                min="0"
                value={currentStock}
                onChange={(e) =>
                  setCurrentStock(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#253344] mb-1">
                Laku Rata-rata/Hari (unit)
              </label>
              <input
                type="number"
                min="0"
                value={avgDailySales}
                onChange={(e) =>
                  setAvgDailySales(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#253344] mb-1">
                Periode Rencana (hari)
              </label>
              <input
                type="number"
                min="1"
                value={planningPeriodDays}
                onChange={(e) =>
                  setPlanningPeriodDays(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="7"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
              />
              <span className="text-[10px] text-[#64748B]">Contoh: 7 hari untuk 1 minggu</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#253344] mb-1">
                Stok Aman Cadangan (unit)
              </label>
              <input
                type="number"
                min="0"
                value={safetyStock}
                onChange={(e) =>
                  setSafetyStock(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="3"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
              />
              <span className="text-[10px] text-[#64748B]">Buffer agar tidak kosong</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#253344] mb-1">
              Harga Beli / Kulakan per Unit (Rp)
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={purchasePrice}
              onChange={(e) =>
                setPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="3000"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
            />
          </div>

          <button
            onClick={handleSaveCalculation}
            className="w-full mt-2 py-2.5 rounded-xl bg-[#F28A2E] hover:bg-[#E9781F] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Hasil Perhitungan</span>
          </button>
        </div>

        {/* Calculation Result Display (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E9E5DF] shadow-xs">
            {/* Status Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E9E5DF]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Hasil Analisis Kebutuhan
              </span>

              {calcResult.status === 'aman' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5 border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Stok Aman
                </span>
              )}
              {calcResult.status === 'pantau' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1.5 border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Perlu Dipantau
                </span>
              )}
              {calcResult.status === 'kulakan' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 flex items-center gap-1.5 border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Perlu Kulakan Segera
                </span>
              )}
            </div>

            {/* Big Metrics Result */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
              <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#FFE8CC]">
                <p className="text-xs text-[#64748B] font-medium">
                  Rekomendasi Jumlah Kulakan
                </p>
                <p className="text-3xl font-extrabold text-[#F28A2E] mt-1">
                  {calcResult.recommendedPurchase}{' '}
                  <span className="text-sm font-semibold text-[#64748B]">unit</span>
                </p>
                <p className="text-[11px] text-[#64748B] mt-1">
                  Target stok {calcResult.targetStock} unit - sisa {currentStock || 0} unit
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#E8EEFF] border border-blue-200">
                <p className="text-xs text-[#64748B] font-medium">
                  Estimasi Modal Kulakan
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#1F2A44] mt-1">
                  {formatRupiah(calcResult.estimatedCapital)}
                </p>
                <p className="text-[11px] text-[#64748B] mt-1">
                  {calcResult.recommendedPurchase} unit × {formatRupiah(Number(purchasePrice) || 0)}
                </p>
              </div>
            </div>

            {/* Mathematical Breakdown Box */}
            <div className="bg-[#FFF7ED]/40 rounded-2xl p-4 border border-[#FFE8CC] space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#64748B]">
                <span>1. Estimasi Permintaan ({planningPeriodDays || 1} hari):</span>
                <span className="font-semibold text-[#253344]">
                  {Number(avgDailySales) || 0} unit × {planningPeriodDays || 1} hari ={' '}
                  {(Number(avgDailySales) || 0) * (Number(planningPeriodDays) || 1)} unit
                </span>
              </div>
              <div className="flex justify-between items-center text-[#64748B]">
                <span>2. Stok Cadangan Aman:</span>
                <span className="font-semibold text-[#253344]">+{safetyStock || 0} unit</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#FFE8CC] font-bold text-[#1F2A44]">
                <span>Total Target Kebutuhan Stok:</span>
                <span>{calcResult.targetStock} unit</span>
              </div>
            </div>

            {/* Explanation */}
            <div className="mt-4 p-3.5 rounded-xl bg-gray-50 border border-[#E9E5DF] text-xs text-[#253344] leading-relaxed">
              <p className="font-bold text-[#1F2A44] mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#F28A2E]" />
                Penjelasan Logika & Saran:
              </p>
              <p>{calcResult.explanation}</p>
            </div>
          </div>

          {/* Recent Calculations History */}
          <div className="bg-white rounded-3xl p-5 border border-[#E9E5DF] shadow-xs">
            <h3 className="font-bold text-sm text-[#1F2A44] flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-[#F28A2E]" />
              Riwayat Perhitungan Tersimpan
            </h3>

            {calculationHistory.length === 0 ? (
              <p className="text-xs text-[#64748B] py-3 text-center">
                Belum ada perhitungan tersimpan. Klik &ldquo;Simpan Hasil Perhitungan&rdquo; untuk menyimpan data.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {calculationHistory.slice(0, 5).map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-xl bg-[#FFF7ED]/30 border border-[#FFE8CC] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#1F2A44]">{h.productName}</p>
                      <p className="text-[11px] text-[#64748B]">
                        Saran kulakan: <strong className="text-[#F28A2E]">{h.recommendedPurchase} unit</strong> • Modal:{' '}
                        <strong>{formatRupiah(h.estimatedCapital)}</strong>
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
