export type ProductCategory =
  | 'Mainan Plastik'
  | 'Mainan Edukasi'
  | 'Mobil-mobilan'
  | 'Boneka'
  | 'Mainan Anak Lainnya';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  purchasePrice: number; // Harga beli per unit
  sellingPrice: number;  // Harga jual per unit
  currentStock: number;   // Jumlah stok saat ini
  avgDailySales: number;  // Rata-rata penjualan harian
  safetyStock: number;    // Stok aman / buffer cadangan
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
}

export type MovementType = 'in' | 'out';
export type MovementReason =
  | 'Kulakan'
  | 'Stok Awal'
  | 'Terjual'
  | 'Rusak'
  | 'Penyesuaian';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  reason: MovementReason;
  previousStock: number;
  newStock: number;
  notes?: string;
  timestamp: string;
}

export type StockStatus = 'aman' | 'pantau' | 'kulakan';

export interface StockCalculation {
  id: string;
  productId?: string;
  productName: string;
  currentStock: number;
  avgDailySales: number;
  planningPeriodDays: number;
  safetyStock: number;
  purchasePrice: number;
  targetStock: number;
  recommendedPurchase: number;
  estimatedCapital: number;
  status: StockStatus;
  explanation: string;
  createdAt: string;
}

export interface PackagingCalculation {
  id: string;
  toyCount: number;
  toysPerPackage: number;
  pricePerBag: number;
  availableBags: number;
  requiredPackaging: number;
  additionalBags: number;
  estimatedCost: number;
  savingTip: string;
  createdAt: string;
}

export type EventCategory =
  | 'Jaranan'
  | 'Janger'
  | 'Festival'
  | 'Pasar Malam'
  | 'Sekolah'
  | 'Bazar'
  | 'Kegiatan Masyarakat'
  | 'Lainnya';

export type EventVerificationStatus = 'Terverifikasi' | 'Belum Diverifikasi';
export type CrowdLevel = 'Sedang' | 'Ramai' | 'Sangat Ramai';

export interface BusinessEvent {
  id: string;
  name: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  location: string;
  city: string; // e.g. Banyuwangi
  organizer?: string;
  sourceUrl?: string;
  notes?: string;
  expectedCrowd?: CrowdLevel;
  verificationStatus: EventVerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SavedPromotion {
  id: string;
  productName: string;
  channel: string;
  targetAudience: string;
  versionType: string;
  content: string;
  createdAt: string;
}

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  location: string; // Default: Banyuwangi, Jawa Timur
  salesModel: string; // Keliling & WhatsApp
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
