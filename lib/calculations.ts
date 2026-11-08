import { StockStatus } from '@/types';

export interface StockCalcInput {
  currentStock: number;
  avgDailySales: number;
  planningPeriodDays: number;
  safetyStock: number;
  purchasePrice: number;
}

export interface StockCalcResult {
  targetStock: number;
  recommendedPurchase: number;
  estimatedCapital: number;
  status: StockStatus;
  explanation: string;
}

/**
 * Formula:
 * Target stock = (Average daily sales × Planning period) + Safety stock
 * Recommended purchase quantity = MAX(0, Target stock - Current stock)
 * Estimated purchasing capital = Recommended purchase quantity × Purchase price
 */
export function calculateStockRequirement(input: StockCalcInput): StockCalcResult {
  const current = Math.max(0, Math.floor(input.currentStock || 0));
  const avgSales = Math.max(0, Number(input.avgDailySales || 0));
  const period = Math.max(1, Math.floor(input.planningPeriodDays || 1));
  const safety = Math.max(0, Math.floor(input.safetyStock || 0));
  const price = Math.max(0, Math.floor(input.purchasePrice || 0));

  const targetStock = Math.round(avgSales * period + safety);
  const recommendedPurchase = Math.max(0, targetStock - current);
  const estimatedCapital = recommendedPurchase * price;

  let status: StockStatus = 'aman';
  let explanation = '';

  if (current <= safety) {
    status = 'kulakan';
    explanation = `Stok saat ini (${current} unit) berada di bawah atau sama dengan stok aman cadangan (${safety} unit). Disarankan segera kulakan sebanyak ${recommendedPurchase} unit untuk memenuhi target ${period} hari ke depan.`;
  } else if (current < targetStock) {
    status = 'pantau';
    explanation = `Stok saat ini (${current} unit) masih cukup untuk beberapa hari, namun belum mencapai target ${period} hari (${targetStock} unit). Kulakan ${recommendedPurchase} unit dapat dipertimbangkan jika modal harian tersedia.`;
  } else {
    status = 'aman';
    explanation = `Stok saat ini (${current} unit) sudah memenuhi atau melebihi target kebutuhan ${period} hari (${targetStock} unit). Tidak perlu kulakan saat ini agar modal tidak tertahan.`;
  }

  return {
    targetStock,
    recommendedPurchase,
    estimatedCapital,
    status,
    explanation,
  };
}

export interface PackagingCalcInput {
  toyCount: number;
  toysPerPackage: number;
  pricePerBag: number;
  availableBags: number;
}

export interface PackagingCalcResult {
  requiredPackaging: number;
  additionalBags: number;
  estimatedCost: number;
  savingTip: string;
}

/**
 * Formula:
 * Required packaging = CEILING(Number of toys / Toys per package)
 * Additional bags to purchase = MAX(0, Required packaging - Available bags)
 * Estimated additional packaging cost = Additional bags × Price per bag
 */
export function calculatePackagingRequirement(input: PackagingCalcInput): PackagingCalcResult {
  const toys = Math.max(0, Math.floor(input.toyCount || 0));
  const perPkg = Math.max(1, Math.floor(input.toysPerPackage || 1));
  const price = Math.max(0, Math.floor(input.pricePerBag || 0));
  const available = Math.max(0, Math.floor(input.availableBags || 0));

  const requiredPackaging = Math.ceil(toys / perPkg);
  const additionalBags = Math.max(0, requiredPackaging - available);
  const estimatedCost = additionalBags * price;

  let savingTip = '';
  if (additionalBags === 0) {
    savingTip = `Kantong plastik tersedia (${available} lembar) sudah mencukupi kebutuhan repacking (${requiredPackaging} bungkus). Kamu hemat Rp0 tambahan modal kemasan!`;
  } else if (additionalBags <= 50) {
    savingTip = `Beli plastik secukupnya (${additionalBags} lembar) untuk menjaga perputaran kas harian tetap lancar daripada membeli 1 bal utuh jika kas harian terbatas.`;
  } else {
    savingTip = `Kebutuhan ${additionalBags} lembar plastik. Jika membeli kemasan per ikat (100 lembar), bandingkan harga per lembar dan pastikan sisa plastik tidak rusak/kotor saat disimpan.`;
  }

  return {
    requiredPackaging,
    additionalBags,
    estimatedCost,
    savingTip,
  };
}

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}
