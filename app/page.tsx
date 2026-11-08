'use client';

import { useState, useEffect } from 'react';
import Sidebar, { NavTab } from '@/components/Sidebar';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import FeatureCards from '@/components/FeatureCards';
import BusinessSummary from '@/components/BusinessSummary';
import DailyTip from '@/components/DailyTip';
import AssistantChat from '@/components/AssistantChat';
import StockManager from '@/components/StockManager';
import SmartStockCalculator from '@/components/SmartStockCalculator';
import PackagingCalculator from '@/components/PackagingCalculator';
import EventCalendar from '@/components/EventCalendar';
import PromotionGenerator from '@/components/PromotionGenerator';
import {
  getCurrentMode,
  setCurrentMode,
  getBusinessProfile,
  getProducts,
  getStockMovements,
  getEvents,
  getDashboardMetrics,
  subscribeToStorage,
  AppMode,
} from '@/lib/storage';
import { Product, BusinessProfile, StockMovement, BusinessEvent } from '@/types';
import { X, Sparkles, Store, Compass } from 'lucide-react';
import TeddyMascot from '@/components/TeddyMascot';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mode, setMode] = useState<AppMode>(() => getCurrentMode());
  const [profile, setProfile] = useState<BusinessProfile>(() => getBusinessProfile());
  const [products, setProducts] = useState<Product[]>(() => getProducts());
  const [movements, setMovements] = useState<StockMovement[]>(() => getStockMovements());
  const [events, setEvents] = useState<BusinessEvent[]>(() => getEvents());
  const [metrics, setMetrics] = useState(() => getDashboardMetrics());

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calculatorInitialProduct, setCalculatorInitialProduct] = useState<Product | null>(null);

  // Sync state from storage
  const reloadData = () => {
    const curMode = getCurrentMode();
    setMode(curMode);
    setProfile(getBusinessProfile(curMode));
    setProducts(getProducts(curMode));
    setMovements(getStockMovements(curMode));
    setEvents(getEvents(curMode));
    setMetrics(getDashboardMetrics(curMode));
  };

  useEffect(() => {
    const unsubscribe = subscribeToStorage(reloadData);
    return () => unsubscribe();
  }, []);

  const handleToggleMode = () => {
    const nextMode = mode === 'demo' ? 'business' : 'demo';
    setCurrentMode(nextMode);
    setMode(nextMode);
    reloadData();
  };

  const handleOpenCalculatorWithProduct = (product: Product) => {
    setCalculatorInitialProduct(product);
    setActiveTab('stock');
  };

  // Count low stock items for badges
  const lowStockCount = products.filter(
    (p) => !p.isArchived && p.currentStock <= p.safetyStock
  ).length;

  return (
    <div className="min-h-screen flex bg-[#FFF7ED]">
      {/* Desktop Left Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
          }}
          mode={mode}
          onToggleMode={handleToggleMode}
          lowStockCount={lowStockCount}
          upcomingEventsCount={metrics.upcomingEventsCount}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#64748B] hover:text-[#1F2A44]"
              aria-label="Tutup menu"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
              mode={mode}
              onToggleMode={() => {
                handleToggleMode();
                setMobileMenuOpen(false);
              }}
              lowStockCount={lowStockCount}
              upcomingEventsCount={metrics.upcomingEventsCount}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          mode={mode}
          profile={profile}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onToggleMode={handleToggleMode}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Demo Mode Banner (if in demo mode) */}
          {mode === 'demo' && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-amber-900">
                    Anda sedang mencoba Mode Demo dengan data simulasi.
                  </span>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    Perubahan di mode ini tidak disimpan ke ruang usaha aslimu.
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleMode}
                className="px-3 py-1.5 rounded-xl bg-[#F28A2E] hover:bg-[#E9781F] text-white font-semibold text-xs shrink-0 flex items-center gap-1.5 shadow-2xs"
              >
                <Store className="w-3.5 h-3.5" />
                Mulai Kelola Usaha Asli
              </button>
            </div>
          )}

          {/* TAB: BERANDA (Dashboard) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <HeroBanner
                onStartAction={(tab) => {
                  setActiveTab(tab);
                }}
              />

              {/* 4 Core Feature Cards */}
              <FeatureCards
                onSelectFeature={(tab) => {
                  setActiveTab(tab);
                }}
              />

              {/* Business Summary (Real Data) */}
              <BusinessSummary
                metrics={metrics}
                mode={mode}
                onNavigate={(tab) => setActiveTab(tab)}
              />

              {/* Daily Practical Tip */}
              <DailyTip onNavigate={(tab) => setActiveTab(tab)} />

              {/* AI Assistant Preview Panel */}
              <AssistantChat
                profile={profile}
                products={products}
                metrics={metrics}
                compact={true}
              />
            </div>
          )}

          {/* TAB: KELOLA STOK */}
          {activeTab === 'stock' && (
            <div className="space-y-8">
              <StockManager
                products={products}
                movements={movements}
                mode={mode}
                onOpenCalculatorWithProduct={handleOpenCalculatorWithProduct}
              />

              {/* Embedded Smart Stock Calculator */}
              <div className="pt-6 border-t border-[#E9E5DF]">
                <SmartStockCalculator
                  key={calculatorInitialProduct?.id || 'smart-calc'}
                  products={products}
                  mode={mode}
                  initialProduct={calculatorInitialProduct}
                />
              </div>
            </div>
          )}

          {/* TAB: HITUNG KEMASAN */}
          {activeTab === 'packaging' && (
            <PackagingCalculator mode={mode} />
          )}

          {/* TAB: KALENDER EVENT */}
          {activeTab === 'events' && (
            <EventCalendar
              events={events}
              products={products}
              mode={mode}
              userLocation={profile.location}
            />
          )}

          {/* TAB: BUAT PROMOSI */}
          {activeTab === 'promotions' && (
            <PromotionGenerator products={products} mode={mode} />
          )}

          {/* TAB: TANYA ASISTEN AI (Full Page) */}
          {activeTab === 'assistant' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1F2A44] flex items-center gap-2">
                  Tanya Asisten AI Mainan Kita
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-[#F28A2E]">
                    Konsultasi UMKM
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                  Tanyakan apapun seputar strategi jualan keliling, cara memutar modal, hingga mengatasi mainan tidak laku.
                </p>
              </div>

              <AssistantChat
                profile={profile}
                products={products}
                metrics={metrics}
                compact={false}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
