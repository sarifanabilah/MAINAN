'use client';

import {
  Product,
  StockMovement,
  BusinessEvent,
  BusinessProfile,
  PackagingCalculation,
  StockCalculation,
  SavedPromotion,
} from '@/types';
import {
  DEMO_PRODUCTS,
  DEMO_STOCK_MOVEMENTS,
  DEMO_EVENTS,
  DEMO_PACKAGING_CALCULATIONS,
  DEMO_STOCK_CALCULATIONS,
  DEMO_PROFILE,
} from './demoData';

export type AppMode = 'demo' | 'business';

const STORAGE_KEYS = {
  CURRENT_MODE: 'mk_app_mode',
  USER_SESSION_UID: 'mk_user_session_uid',
  BUSINESS_PROFILE: 'mk_business_profile_',
  PRODUCTS: 'mk_products_',
  MOVEMENTS: 'mk_movements_',
  EVENTS: 'mk_events_',
  PACKAGING_CALCS: 'mk_pkg_calcs_',
  STOCK_CALCS: 'mk_stk_calcs_',
  SAVED_PROMOTIONS: 'mk_promotions_',
  DEMO_INITIALIZED: 'mk_demo_init',
};

// Generates or retrieves an isolated business UID
export function getOrCreateSessionUID(): string {
  if (typeof window === 'undefined') return 'server_session';
  let uid = localStorage.getItem(STORAGE_KEYS.USER_SESSION_UID);
  if (!uid) {
    uid = 'usr_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEYS.USER_SESSION_UID, uid);
  }
  return uid;
}

export function getCurrentMode(): AppMode {
  if (typeof window === 'undefined') return 'business';
  const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_MODE);
  return (saved === 'demo' ? 'demo' : 'business') as AppMode;
}

export function setCurrentMode(mode: AppMode) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CURRENT_MODE, mode);
  notifyStorageChange();
}

// Storage event emitter for reactive updates inside client components
const listeners: Array<() => void> = [];

export function subscribeToStorage(callback: () => void) {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyStorageChange() {
  listeners.forEach((fn) => fn());
}

function getPrefix(mode?: AppMode): string {
  const currentMode = mode || getCurrentMode();
  if (currentMode === 'demo') {
    return 'demo_';
  }
  const uid = getOrCreateSessionUID();
  return `business_${uid}_`;
}

// Initialize Demo Data once if empty
export function initDemoDataIfNeeded() {
  if (typeof window === 'undefined') return;
  const isInit = sessionStorage.getItem(STORAGE_KEYS.DEMO_INITIALIZED);
  if (!isInit) {
    sessionStorage.setItem('demo_' + STORAGE_KEYS.PRODUCTS, JSON.stringify(DEMO_PRODUCTS));
    sessionStorage.setItem('demo_' + STORAGE_KEYS.MOVEMENTS, JSON.stringify(DEMO_STOCK_MOVEMENTS));
    sessionStorage.setItem('demo_' + STORAGE_KEYS.EVENTS, JSON.stringify(DEMO_EVENTS));
    sessionStorage.setItem('demo_' + STORAGE_KEYS.PACKAGING_CALCS, JSON.stringify(DEMO_PACKAGING_CALCULATIONS));
    sessionStorage.setItem('demo_' + STORAGE_KEYS.STOCK_CALCS, JSON.stringify(DEMO_STOCK_CALCULATIONS));
    sessionStorage.setItem('demo_' + STORAGE_KEYS.BUSINESS_PROFILE, JSON.stringify(DEMO_PROFILE));
    sessionStorage.setItem(STORAGE_KEYS.DEMO_INITIALIZED, 'true');
  }
}

const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  businessName: 'Toko Mainan Saya',
  ownerName: 'Sahabat Mainan',
  location: 'Banyuwangi, Jawa Timur',
  salesModel: 'Keliling & WhatsApp',
};

// --- PROFILE ---
export function getBusinessProfile(mode?: AppMode): BusinessProfile {
  const currentMode = mode || getCurrentMode();
  if (currentMode === 'demo') {
    if (typeof window !== 'undefined') {
      initDemoDataIfNeeded();
      const raw = sessionStorage.getItem('demo_' + STORAGE_KEYS.BUSINESS_PROFILE);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
    }
    return DEMO_PROFILE;
  }
  if (typeof window === 'undefined') return DEFAULT_BUSINESS_PROFILE;
  const prefix = getPrefix(currentMode);
  const raw = localStorage.getItem(prefix + STORAGE_KEYS.BUSINESS_PROFILE);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }
  return DEFAULT_BUSINESS_PROFILE;
}

export function updateBusinessProfile(profile: Partial<BusinessProfile>, mode?: AppMode) {
  if (typeof window === 'undefined') return;
  const currentMode = mode || getCurrentMode();
  const current = getBusinessProfile(currentMode);
  const updated = { ...current, ...profile };
  if (currentMode === 'demo') {
    sessionStorage.setItem('demo_' + STORAGE_KEYS.BUSINESS_PROFILE, JSON.stringify(updated));
  } else {
    const prefix = getPrefix(currentMode);
    localStorage.setItem(prefix + STORAGE_KEYS.BUSINESS_PROFILE, JSON.stringify(updated));
  }
  notifyStorageChange();
}

// --- PRODUCTS ---
export function getProducts(mode?: AppMode): Product[] {
  if (typeof window === 'undefined') return [];
  const currentMode = mode || getCurrentMode();
  if (currentMode === 'demo') {
    initDemoDataIfNeeded();
    const raw = sessionStorage.getItem('demo_' + STORAGE_KEYS.PRODUCTS);
    return raw ? JSON.parse(raw) : DEMO_PRODUCTS;
  }
  const prefix = getPrefix(currentMode);
  const raw = localStorage.getItem(prefix + STORAGE_KEYS.PRODUCTS);
  return raw ? JSON.parse(raw) : [];
}

export function saveProducts(products: Product[], mode?: AppMode) {
  if (typeof window === 'undefined') return;
  const currentMode = mode || getCurrentMode();
  if (currentMode === 'demo') {
    sessionStorage.setItem('demo_' + STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } else {
    const prefix = getPrefix(currentMode);
    localStorage.setItem(prefix + STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }
  notifyStorageChange();
}

export function addProduct(
  productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  mode?: AppMode
): Product {
  const currentMode = mode || getCurrentMode();
  const products = getProducts(currentMode);
  const now = new Date().toISOString();
  const newProduct: Product = {
    ...productData,
    id: 'prod_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
    createdAt: now,
    updatedAt: now,
    currentStock: Math.max(0, Number(productData.currentStock || 0)),
    avgDailySales: Math.max(0, Number(productData.avgDailySales || 0)),
    safetyStock: Math.max(0, Number(productData.safetyStock || 0)),
    purchasePrice: Math.max(0, Number(productData.purchasePrice || 0)),
    sellingPrice: Math.max(0, Number(productData.sellingPrice || 0)),
  };

  const updatedList = [newProduct, ...products];
  saveProducts(updatedList, currentMode);

  // If initial stock > 0, log a StockMovement
  if (newProduct.currentStock > 0) {
    recordStockMovement(
      {
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'in',
        quantity: newProduct.currentStock,
        reason: 'Stok Awal',
        previousStock: 0,
        newStock: newProduct.currentStock,
        notes: 'Pencatatan stok awal saat penambahan produk',
      },
      currentMode
    );
  }

  return newProduct;
}

export function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'id' | 'createdAt'>>,
  mode?: AppMode
): Product | null {
  const currentMode = mode || getCurrentMode();
  const products = getProducts(currentMode);
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated: Product = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updated;
  saveProducts(products, currentMode);
  return updated;
}

export function deleteProduct(id: string, mode?: AppMode): boolean {
  const currentMode = mode || getCurrentMode();
  const products = getProducts(currentMode);
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length !== products.length) {
    saveProducts(filtered, currentMode);
    return true;
  }
  return false;
}

// --- STOCK MOVEMENTS ---
export function getStockMovements(mode?: AppMode): StockMovement[] {
  if (typeof window === 'undefined') return [];
  const currentMode = mode || getCurrentMode();
  if (currentMode === 'demo') {
    initDemoDataIfNeeded();
    const raw = sessionStorage.getItem('demo_' + STORAGE_KEYS.MOVEMENTS);
    return raw ? JSON.parse(raw) : DEMO_STOCK_MOVEMENTS;
  }
  const prefix = getPrefix(currentMode);
  const raw = localStorage.getItem(prefix + STORAGE_KEYS.MOVEMENTS);
  return raw ? JSON.parse(raw) : [];
}

export function recordStockMovement(
  movement: Omit<StockMovement, 'id' | 'timestamp'>,
  mode?: AppMode
): StockMovement {
  const currentMode = mode || getCurrentMode();
  const movements = getStockMovements(currentMode);
  const newMovement: StockMovement = {
    ...movement,
    id: 'mov_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
    timestamp: new Date().toISOString(),
  };

  const updatedList = [newMovement, ...movements];
  if (currentMode === 'demo') {
    sessionStorage.setItem('demo_' + STORAGE_KEYS.MOVEMENTS, JSON.stringify(updatedList));
  } else {
    const prefix = getPrefix(currentMode);
    localStorage.setItem(prefix + STORAGE_KEYS.MOVEMENTS, JSON.stringify(updatedList));
  }
  notifyStorageChange();
  return newMovement;
}

/**
 * Adjust stock safely with atomic verification (preventing negative stock)
 */
export function adjustProductStock(
  productId: string,
  change: {
    type: 'in' | 'out';
    quantity: number;
    reason: 'Kulakan' | 'Stok Awal' | 'Terjual' | 'Rusak' | 'Penyesuaian';
    notes?: string;
  },
  mode?: AppMode
): { success: boolean; error?: string; updatedProduct?: Product } {
  const currentMode = mode || getCurrentMode();
  const products = getProducts(currentMode);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return { success: false, error: 'Produk tidak ditemukan.' };
  }

  const qty = Math.floor(change.quantity);
  if (qty <= 0) {
    return { success: false, error: 'Jumlah harus lebih besar dari 0.' };
  }

  const previousStock = product.currentStock;
  let newStock = previousStock;

  if (change.type === 'in') {
    newStock = previousStock + qty;
  } else {
    if (previousStock < qty) {
      return {
        success: false,
        error: `Stok tidak mencukupi. Stok saat ini (${previousStock}) lebih kecil dari jumlah keluar (${qty}).`,
      };
    }
    newStock = previousStock - qty;
  }

  // Update product
  const updatedProduct = updateProduct(productId, { currentStock: newStock }, currentMode);
  if (!updatedProduct) {
    return { success: false, error: 'Gagal memperbarui stok produk.' };
  }

  // Record movement
  recordStockMovement(
    {
      productId,
      productName: product.name,
      type: change.type,
      quantity: qty,
      reason: change.reason,
      previousStock,
      newStock,
      notes: change.notes,
    },
    currentMode
  );

  return { success: true, updatedProduct };
}

// --- EVENTS ---
export function getEvents(mode?: AppMode): BusinessEvent[] {
  if (typeof window === 'undefined') return [];
  const currentMode = mode || getCurrentMode();
  if (currentMode === 'demo') {
    initDemoDataIfNeeded();
    const raw = sessionStorage.getItem('demo_' + STORAGE_KEYS.EVENTS);
    return raw ? JSON.parse(raw) : DEMO_EVENTS;
  }
  const prefix = getPrefix(currentMode);
  const raw = localStorage.getItem(prefix + STORAGE_KEYS.EVENTS);
  return raw ? JSON.parse(raw) : [];
}

export function saveEvents(events: BusinessEvent[], mode?: AppMode) {
  if (typeof window === 'undefined') return;
  const currentMode = mode || getCurrentMode();
  if (currentMode === 'demo') {
    sessionStorage.setItem('demo_' + STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } else {
    const prefix = getPrefix(currentMode);
    localStorage.setItem(prefix + STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }
  notifyStorageChange();
}

export function addEvent(
  eventData: Omit<BusinessEvent, 'id' | 'createdAt' | 'updatedAt'>,
  mode?: AppMode
): BusinessEvent {
  const currentMode = mode || getCurrentMode();
  const events = getEvents(currentMode);
  const now = new Date().toISOString();
  const newEvent: BusinessEvent = {
    ...eventData,
    id: 'ev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
    createdAt: now,
    updatedAt: now,
  };

  const updatedList = [newEvent, ...events];
  saveEvents(updatedList, currentMode);
  return newEvent;
}

export function updateEvent(
  id: string,
  updates: Partial<Omit<BusinessEvent, 'id' | 'createdAt'>>,
  mode?: AppMode
): BusinessEvent | null {
  const currentMode = mode || getCurrentMode();
  const events = getEvents(currentMode);
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const updated: BusinessEvent = {
    ...events[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  events[index] = updated;
  saveEvents(events, currentMode);
  return updated;
}

export function deleteEvent(id: string, mode?: AppMode): boolean {
  const currentMode = mode || getCurrentMode();
  const events = getEvents(currentMode);
  const filtered = events.filter((e) => e.id !== id);
  if (filtered.length !== events.length) {
    saveEvents(filtered, currentMode);
    return true;
  }
  return false;
}

// --- PACKAGING CALCULATIONS ---
export function getPackagingCalculations(mode?: AppMode): PackagingCalculation[] {
  if (typeof window === 'undefined') return [];
  const currentMode = mode || getCurrentMode();
  if (currentMode === 'demo') {
    initDemoDataIfNeeded();
    const raw = sessionStorage.getItem('demo_' + STORAGE_KEYS.PACKAGING_CALCS);
    return raw ? JSON.parse(raw) : DEMO_PACKAGING_CALCULATIONS;
  }
  const prefix = getPrefix(currentMode);
  const raw = localStorage.getItem(prefix + STORAGE_KEYS.PACKAGING_CALCS);
  return raw ? JSON.parse(raw) : [];
}

export function savePackagingCalculation(
  calc: Omit<PackagingCalculation, 'id' | 'createdAt'>,
  mode?: AppMode
): PackagingCalculation {
  const currentMode = mode || getCurrentMode();
  const list = getPackagingCalculations(currentMode);
  const newCalc: PackagingCalculation = {
    ...calc,
    id: 'pkg_calc_' + Date.now().toString(36),
    createdAt: new Date().toISOString(),
  };
  const updatedList = [newCalc, ...list];
  if (currentMode === 'demo') {
    sessionStorage.setItem('demo_' + STORAGE_KEYS.PACKAGING_CALCS, JSON.stringify(updatedList));
  } else {
    const prefix = getPrefix(currentMode);
    localStorage.setItem(prefix + STORAGE_KEYS.PACKAGING_CALCS, JSON.stringify(updatedList));
  }
  notifyStorageChange();
  return newCalc;
}

// --- STOCK CALCULATIONS ---
export function getStockCalculations(mode?: AppMode): StockCalculation[] {
  if (typeof window === 'undefined') return [];
  const currentMode = mode || getCurrentMode();
  if (currentMode === 'demo') {
    initDemoDataIfNeeded();
    const raw = sessionStorage.getItem('demo_' + STORAGE_KEYS.STOCK_CALCS);
    return raw ? JSON.parse(raw) : DEMO_STOCK_CALCULATIONS;
  }
  const prefix = getPrefix(currentMode);
  const raw = localStorage.getItem(prefix + STORAGE_KEYS.STOCK_CALCS);
  return raw ? JSON.parse(raw) : [];
}

export function saveStockCalculation(
  calc: Omit<StockCalculation, 'id' | 'createdAt'>,
  mode?: AppMode
): StockCalculation {
  const currentMode = mode || getCurrentMode();
  const list = getStockCalculations(currentMode);
  const newCalc: StockCalculation = {
    ...calc,
    id: 'stk_calc_' + Date.now().toString(36),
    createdAt: new Date().toISOString(),
  };
  const updatedList = [newCalc, ...list];
  if (currentMode === 'demo') {
    sessionStorage.setItem('demo_' + STORAGE_KEYS.STOCK_CALCS, JSON.stringify(updatedList));
  } else {
    const prefix = getPrefix(currentMode);
    localStorage.setItem(prefix + STORAGE_KEYS.STOCK_CALCS, JSON.stringify(updatedList));
  }
  notifyStorageChange();
  return newCalc;
}

// --- SAVED PROMOTIONS ---
export function getSavedPromotions(mode?: AppMode): SavedPromotion[] {
  if (typeof window === 'undefined') return [];
  const currentMode = mode || getCurrentMode();
  const prefix = getPrefix(currentMode);
  const raw =
    currentMode === 'demo'
      ? sessionStorage.getItem('demo_' + STORAGE_KEYS.SAVED_PROMOTIONS)
      : localStorage.getItem(prefix + STORAGE_KEYS.SAVED_PROMOTIONS);
  return raw ? JSON.parse(raw) : [];
}

export function savePromotion(
  promo: Omit<SavedPromotion, 'id' | 'createdAt'>,
  mode?: AppMode
): SavedPromotion {
  const currentMode = mode || getCurrentMode();
  const list = getSavedPromotions(currentMode);
  const newPromo: SavedPromotion = {
    ...promo,
    id: 'promo_' + Date.now().toString(36),
    createdAt: new Date().toISOString(),
  };
  const updatedList = [newPromo, ...list];
  if (currentMode === 'demo') {
    sessionStorage.setItem('demo_' + STORAGE_KEYS.SAVED_PROMOTIONS, JSON.stringify(updatedList));
  } else {
    const prefix = getPrefix(currentMode);
    localStorage.setItem(prefix + STORAGE_KEYS.SAVED_PROMOTIONS, JSON.stringify(updatedList));
  }
  notifyStorageChange();
  return newPromo;
}

export function deleteSavedPromotion(id: string, mode?: AppMode): boolean {
  const currentMode = mode || getCurrentMode();
  const list = getSavedPromotions(currentMode);
  const filtered = list.filter((p) => p.id !== id);
  if (currentMode === 'demo') {
    sessionStorage.setItem('demo_' + STORAGE_KEYS.SAVED_PROMOTIONS, JSON.stringify(filtered));
  } else {
    const prefix = getPrefix(currentMode);
    localStorage.setItem(prefix + STORAGE_KEYS.SAVED_PROMOTIONS, JSON.stringify(filtered));
  }
  notifyStorageChange();
  return true;
}

// --- DASHBOARD REAL METRICS ---
export function getDashboardMetrics(mode?: AppMode) {
  const currentMode = mode || getCurrentMode();
  const products = getProducts(currentMode).filter((p) => !p.isArchived);
  const events = getEvents(currentMode);

  // 1. Total Stock: total units across active products
  const totalStock = products.reduce((sum, p) => sum + (p.currentStock || 0), 0);

  // 2. Estimasi Modal Stok: sum of stock quantity multiplied by purchase price
  const totalStockCapital = products.reduce(
    (sum, p) => sum + (p.currentStock || 0) * (p.purchasePrice || 0),
    0
  );

  // 3. Event Terdekat: count of future events with valid dates
  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter((e) => e.date >= today);

  return {
    totalStock,
    totalStockCapital,
    upcomingEventsCount: upcomingEvents.length,
    activeProductsCount: products.length,
  };
}
