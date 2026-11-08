'use client';

import { useState } from 'react';
import {
  Megaphone,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Save,
  Trash2,
  AlertCircle,
  Share2,
  Heart,
  Zap,
  Info,
} from 'lucide-react';
import { Product, SavedPromotion } from '@/types';
import { formatRupiah, formatDateIndo } from '@/lib/calculations';
import {
  savePromotion,
  getSavedPromotions,
  deleteSavedPromotion,
  AppMode,
} from '@/lib/storage';

interface PromotionGeneratorProps {
  products: Product[];
  mode: AppMode;
}

interface PromoVersion {
  type: string;
  text: string;
}

export default function PromotionGenerator({
  products,
  mode,
}: PromotionGeneratorProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [productName, setProductName] = useState(
    products[0]?.name || 'Balon Gelembung Sabun Magic'
  );
  const [productPrice, setProductPrice] = useState<number | ''>(
    products[0]?.sellingPrice || 5000
  );
  const [productDescription, setProductDescription] = useState(
    products[0]?.notes || 'Bahan aman untuk anak, gelembung banyak dan seru dimainkan sore hari.'
  );
  const [promotionOrDiscount, setPromotionOrDiscount] = useState('');
  const [targetAudience, setTargetAudience] = useState('Orang tua / Ibu rumah tangga');
  const [channel, setChannel] = useState('WhatsApp Status');
  const [tone, setTone] = useState('Ramah dan menarik');
  const [customCta, setCustomCta] = useState('Bisa antar/COD area sekitar atau chat WA.');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedVersions, setGeneratedVersions] = useState<PromoVersion[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');
  const [savedPromotions, setSavedPromotions] = useState<SavedPromotion[]>(() =>
    getSavedPromotions(mode)
  );

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    const found = products.find((p) => p.id === id);
    if (found) {
      setProductName(found.name);
      setProductPrice(found.sellingPrice);
      if (found.notes) setProductDescription(found.notes);
    }
  };

  const handleGenerate = async () => {
    if (!productName.trim()) {
      setErrorMessage('Nama produk wajib diisi.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    setCopiedIndex(null);
    setSavedIndex(null);

    try {
      const response = await fetch('/api/generate-promotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          productPrice: Number(productPrice) || 0,
          productDescription,
          promotionOrDiscount,
          targetAudience,
          channel,
          tone,
          customCta,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghasilkan teks promosi.');
      }

      setGeneratedVersions(data.versions);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat memanggil asisten AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleSavePromo = (version: PromoVersion, index: number) => {
    const saved = savePromotion(
      {
        productName,
        channel,
        targetAudience,
        versionType: version.type,
        content: version.text,
      },
      mode
    );

    setSavedPromotions([saved, ...savedPromotions]);
    setSavedIndex(index);
    setTimeout(() => setSavedIndex(null), 2500);
  };

  const handleDeleteSaved = (id: string) => {
    deleteSavedPromotion(id, mode);
    setSavedPromotions(savedPromotions.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1F2A44] flex items-center gap-2">
            Buat Promosi WhatsApp Cerdas
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              3 Versi Instan
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Dapatkan teks promosi alami, sopan, dan memikat untuk WhatsApp Status, Grup RT/Warga, atau Pesan Pribadi.
          </p>
        </div>

        {/* Tab switch */}
        <div className="p-1 bg-white rounded-xl border border-[#E9E5DF] flex items-center text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'create'
                ? 'bg-[#F28A2E] text-white'
                : 'text-[#64748B] hover:text-[#253344]'
            }`}
          >
            Buat Promosi Baru
          </button>
          <button
            onClick={() => {
              setSavedPromotions(getSavedPromotions(mode));
              setActiveTab('saved');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
              activeTab === 'saved'
                ? 'bg-[#F28A2E] text-white'
                : 'text-[#64748B] hover:text-[#253344]'
            }`}
          >
            <span>Tersimpan</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-100 text-[#F28A2E]">
              {savedPromotions.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Column (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-[#E9E5DF] shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#1F2A44] flex items-center gap-2 pb-3 border-b border-[#E9E5DF]">
              <Megaphone className="w-4 h-4 text-[#F28A2E]" />
              Detail Produk & Target Pembaca
            </h3>

            {/* Select from catalog */}
            {products.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-[#253344] mb-1">
                  Pilih Cepat dari Katalog Produk
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatRupiah(p.sellingPrice)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#253344] mb-1">
                Nama Mainan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Contoh: Balon Gelembung Sabun Magic"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#253344] mb-1">
                  Harga Jual (Rp)
                </label>
                <input
                  type="number"
                  value={productPrice}
                  onChange={(e) =>
                    setProductPrice(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="5000"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#253344] mb-1">
                  Promo / Bonus (Opsional)
                </label>
                <input
                  type="text"
                  value={promotionOrDiscount}
                  onChange={(e) => setPromotionOrDiscount(e.target.value)}
                  placeholder="Contoh: Beli 2 gratis 1 baterai"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#253344] mb-1">
                  Saluran WhatsApp
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                >
                  <option value="WhatsApp Status">WhatsApp Status (Singkat)</option>
                  <option value="WhatsApp Group">Grup WhatsApp RT/Warga</option>
                  <option value="WhatsApp Pesan Pribadi">Pesan Pribadi (Personal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#253344] mb-1">
                  Target Pembaca
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                >
                  <option value="Ibu rumah tangga">Ibu rumah tangga</option>
                  <option value="Orang tua">Orang tua / Ayah Bunda</option>
                  <option value="Pelanggan umum">Pelanggan umum</option>
                  <option value="Reseller / pedagang kecil">Reseller / Pedagang kecil</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#253344] mb-1">
                Nada Tulisan (Tone)
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
              >
                <option value="Ramah dan menarik">Ramah dan menarik (Tetangga bersahabat)</option>
                <option value="Ceria dan santai">Ceria dan santai (Menyenangkan)</option>
                <option value="Singkat dan persuasif">Singkat dan persuasif (Langsung ke inti)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#253344] mb-1">
                Deskripsi Singkat / Manfaat Mainan
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Contoh: Cocok untuk anak usia 3-7 tahun, melatih ketangkasan..."
                rows={2}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#253344] mb-1">
                Ajakan Bertindak (CTA)
              </label>
              <input
                type="text"
                value={customCta}
                onChange={(e) => setCustomCta(e.target.value)}
                placeholder="Contoh: Bisa diantar sore ini atau ambil di rumah..."
                className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#F28A2E] hover:bg-[#E9781F] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI Sedang Merangkai 3 Versi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Buat 3 Versi Teks WhatsApp</span>
                </>
              )}
            </button>
          </div>

          {/* Results Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!generatedVersions && !isLoading && (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#E9E5DF]">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <Share2 className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-base text-[#1F2A44]">
                  Siap Membuat Promosi WhatsApp
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto mt-1 leading-relaxed">
                  Pilih produk dari katalog di sebelah kiri dan klik tombol &ldquo;Buat 3 Versi Teks WhatsApp&rdquo;. Asisten AI akan merumuskan versi ramah personal, status singkat, dan persuasif.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E9E5DF] space-y-4">
                <div className="flex justify-center space-x-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#F28A2E] animate-bounce" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#F28A2E] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#F28A2E] animate-bounce [animation-delay:0.4s]" />
                </div>
                <p className="font-semibold text-sm text-[#1F2A44]">
                  Menghasilkan 3 Variasi Promosi...
                </p>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  Menyesuaikan bahasa santai yang sopan dan mudah dipahami orang tua di grup WhatsApp.
                </p>
              </div>
            )}

            {generatedVersions && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-bold text-[#1F2A44] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#F28A2E]" />
                    Pilih versi yang paling sesuai dan salin langsung:
                  </p>
                  <button
                    onClick={handleGenerate}
                    className="text-xs text-[#F28A2E] font-semibold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Buat Ulang
                  </button>
                </div>

                {generatedVersions.map((ver, idx) => {
                  let badgeIcon = Heart;
                  let badgeColor = 'bg-orange-100 text-[#F28A2E]';

                  if (idx === 1) {
                    badgeIcon = Zap;
                    badgeColor = 'bg-amber-100 text-amber-800';
                  } else if (idx === 2) {
                    badgeIcon = Info;
                    badgeColor = 'bg-teal-100 text-[#278C7B]';
                  }

                  const BadgeIcon = badgeIcon;

                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-[#E9E5DF] p-5 shadow-xs space-y-3 hover:border-[#F28A2E]/50 transition-colors"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-[#E9E5DF]">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${badgeColor}`}
                        >
                          <BadgeIcon className="w-3.5 h-3.5" />
                          Versi {idx + 1}: {ver.type}
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          Target: {channel}
                        </span>
                      </div>

                      {/* Message Content Preview */}
                      <div className="bg-[#FFF7ED]/30 p-3.5 rounded-xl border border-[#FFE8CC] text-xs sm:text-sm text-[#253344] whitespace-pre-wrap leading-relaxed font-sans">
                        {ver.text}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleSavePromo(ver, idx)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#253344] hover:bg-gray-100 transition-colors flex items-center gap-1.5"
                        >
                          {savedIndex === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Tersimpan</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Simpan</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleCopyText(ver.text, idx)}
                          className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#278C7B] hover:bg-teal-700 text-white transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Tersalin ke Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Teks</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Promotions Tab */}
      {activeTab === 'saved' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E9E5DF] shadow-xs">
          <h3 className="font-bold text-base text-[#1F2A44] mb-3 flex items-center gap-2">
            <Save className="w-4 h-4 text-[#F28A2E]" />
            Daftar Teks Promosi Tersimpan
          </h3>

          {savedPromotions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#64748B]">
              Belum ada teks promosi yang disimpan. Saat menghasilkan teks di tab &ldquo;Buat Promosi Baru&rdquo;, klik tombol &ldquo;Simpan&rdquo; untuk menyimpannya di sini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedPromotions.map((promo) => (
                <div
                  key={promo.id}
                  className="bg-[#FFF7ED]/30 rounded-2xl border border-[#FFE8CC] p-4 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-[#1F2A44]">{promo.productName}</span>
                      <span className="text-[11px] text-[#64748B]">
                        {formatDateIndo(promo.createdAt)}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-[#F28A2E] inline-block mb-2">
                      {promo.versionType} • {promo.channel}
                    </span>
                    <p className="text-xs text-[#253344] whitespace-pre-wrap line-clamp-4 bg-white p-2.5 rounded-xl border border-[#E9E5DF]">
                      {promo.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#FFE8CC]">
                    <button
                      onClick={() => handleDeleteSaved(promo.id)}
                      className="text-xs text-red-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(promo.content);
                        alert('Teks promosi tersalin!');
                      }}
                      className="px-3 py-1 bg-[#278C7B] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
