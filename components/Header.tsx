'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  MapPin,
  Store,
  Sparkles,
  Menu,
  X,
  Edit2,
  Check,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { AppMode, updateBusinessProfile } from '@/lib/storage';
import { BusinessProfile } from '@/types';

interface HeaderProps {
  mode: AppMode;
  profile: BusinessProfile;
  onOpenMobileMenu: () => void;
  onToggleMode: () => void;
}

export default function Header({
  mode,
  profile,
  onOpenMobileMenu,
  onToggleMode,
}: HeaderProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [location, setLocation] = useState(profile.location);
  const [salesModel, setSalesModel] = useState(profile.salesModel);
  const [showFirebaseNotice, setShowFirebaseNotice] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile({
      businessName,
      location,
      salesModel,
    });
    setIsEditingProfile(false);
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E9E5DF] px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-[#253344] hover:bg-[#FFF7ED] transition-colors"
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="md:hidden w-8 h-8 rounded-full bg-white border border-[#E9E5DF] overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
            <Image
              src="/assets/aistudio/Gemini_Generated_Image_rizqlxrizqlxrizq-removebg-preview_5a3bbbec.png"
              alt="Logo Mainan Kita"
              width={32}
              height={32}
              className="w-full h-full object-cover scale-[1.65] rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-bold text-[#1F2A44] flex items-center gap-1.5">
                Halo, {profile.ownerName || 'Sahabat Mainan'}! 👋
              </h2>
              {mode === 'demo' ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Data Demo
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E7F4EF] text-[#278C7B] border border-teal-200">
                  <Store className="w-3 h-3" />
                  Ruang Usaha Aktif
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] hidden sm:block">
              Mari kelola stok, hitung modal, dan buat promosi hari ini.
            </p>
          </div>
        </div>

        {/* Right: Location, Mode Switcher & Profile info */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Location button */}
          <button
            onClick={() => {
              setBusinessName(profile.businessName);
              setLocation(profile.location);
              setSalesModel(profile.salesModel);
              setIsEditingProfile(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF7ED] hover:bg-[#FFE8CC] text-[#253344] text-xs font-medium border border-[#FFE8CC] transition-colors"
            title="Klik untuk mengubah profil lokasi usaha"
          >
            <MapPin className="w-3.5 h-3.5 text-[#F28A2E] shrink-0" />
            <span className="max-w-[130px] md:max-w-[200px] truncate font-semibold">
              {profile.location || 'Banyuwangi'}
            </span>
            <Edit2 className="w-3 h-3 text-[#64748B] ml-0.5 opacity-60" />
          </button>

          {/* Mode Switcher Toggle Button */}
          <button
            onClick={onToggleMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-2xs ${
              mode === 'demo'
                ? 'bg-[#F28A2E] text-white hover:bg-[#E9781F] border-transparent'
                : 'bg-white hover:bg-orange-50 text-[#F28A2E] border-[#FFE8CC]'
            }`}
          >
            {mode === 'demo' ? (
              <>
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mulai Kelola Usaha</span>
                <span className="sm:hidden">Kelola Usaha</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Beralih ke Demo</span>
                <span className="sm:hidden">Demo</span>
              </>
            )}
          </button>

          {/* Cloud Info Button */}
          <button
            onClick={() => setShowFirebaseNotice(true)}
            className="p-1.5 rounded-xl text-[#64748B] hover:text-[#253344] hover:bg-[#FFF7ED] transition-colors"
            aria-label="Informasi penyimpanan data"
            title="Info Penyimpanan"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Profile & Location Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E9E5DF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E5DF]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#FFE8CC] text-[#F28A2E] rounded-xl">
                  <Store className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-[#1F2A44]">
                  Profil Usaha Mainan
                </h3>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#253344] mb-1">
                  Nama Usaha / Lapak
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Contoh: Mainan Ceria Barokah"
                  className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#253344] mb-1">
                  Lokasi Usaha (Kota/Kabupaten)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Banyuwangi, Jawa Timur"
                  className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                  required
                />
                <p className="text-[11px] text-[#64748B] mt-1">
                  Lokasi ini digunakan oleh Asisten AI untuk memberikan rekomendasi event dan persiapan jualan lokal.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#253344] mb-1">
                  Model Penjualan
                </label>
                <input
                  type="text"
                  value={salesModel}
                  onChange={(e) => setSalesModel(e.target.value)}
                  placeholder="Contoh: Keliling Sore & WhatsApp"
                  className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E9E5DF]">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#F28A2E] text-white hover:bg-[#E9781F] rounded-xl flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Simpan Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Storage & Privacy Info Modal */}
      {showFirebaseNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E9E5DF]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-[#E7F4EF] text-[#278C7B]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1F2A44]">
                  Penyimpanan & Keamanan Data
                </h3>
                <p className="text-xs text-[#64748B]">
                  Privasi bisnis UMKM Mainan Kita
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-[#253344] leading-relaxed bg-[#FFF7ED] p-3.5 rounded-xl border border-[#FFE8CC]">
              <p>
                <strong>Ruang Usaha:</strong> Data usaha tersimpan di perangkat dan akun sesi ini secara terisolasi. Setiap sesi memiliki pengenal unik sehingga data Anda tidak tercampur dengan pedagang lain.
              </p>
              <p>
                <strong>Sinkronisasi Cloud:</strong> Hubungkan akun di pengembangan berikutnya agar data lebih mudah dipulihkan di perangkat lain secara otomatis.
              </p>
              <p className="text-[11px] text-[#64748B]">
                Tidak ada data bisnis Anda yang dibagikan atau dipublikasikan secara terbuka.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowFirebaseNotice(false)}
                className="px-4 py-2 bg-[#F28A2E] text-white hover:bg-[#E9781F] text-xs font-semibold rounded-xl"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
