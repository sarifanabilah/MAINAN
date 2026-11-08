'use client';

import { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  History,
  Calculator,
  Edit2,
  Trash2,
  AlertTriangle,
  Check,
  X,
  PackageCheck,
  Info,
} from 'lucide-react';
import { Product, ProductCategory, StockMovement, MovementReason } from '@/types';
import { formatRupiah, formatDateIndo } from '@/lib/calculations';
import {
  addProduct,
  updateProduct,
  deleteProduct,
  adjustProductStock,
  AppMode,
} from '@/lib/storage';

interface StockManagerProps {
  products: Product[];
  movements: StockMovement[];
  mode: AppMode;
  onOpenCalculatorWithProduct?: (product: Product) => void;
}

const CATEGORIES: ProductCategory[] = [
  'Mainan Plastik',
  'Mainan Edukasi',
  'Mobil-mobilan',
  'Boneka',
  'Mainan Anak Lainnya',
];

export default function StockManager({
  products,
  movements,
  mode,
  onOpenCalculatorWithProduct,
}: StockManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<{
    product: Product;
    type: 'in' | 'out';
  } | null>(null);

  // Form states for Add / Edit
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Mainan Plastik');
  const [formPurchasePrice, setFormPurchasePrice] = useState<number | ''>('');
  const [formSellingPrice, setFormSellingPrice] = useState<number | ''>('');
  const [formStock, setFormStock] = useState<number | ''>('');
  const [formAvgSales, setFormAvgSales] = useState<number | ''>('');
  const [formSafetyStock, setFormSafetyStock] = useState<number | ''>('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Adjust stock form state
  const [adjustQty, setAdjustQty] = useState<number | ''>('');
  const [adjustReason, setAdjustReason] = useState<MovementReason>('Kulakan');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const openAddModal = () => {
    setFormName('');
    setFormCategory('Mainan Plastik');
    setFormPurchasePrice('');
    setFormSellingPrice('');
    setFormStock('');
    setFormAvgSales('');
    setFormSafetyStock('');
    setFormNotes('');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPurchasePrice(p.purchasePrice);
    setFormSellingPrice(p.sellingPrice);
    setFormStock(p.currentStock);
    setFormAvgSales(p.avgDailySales);
    setFormSafetyStock(p.safetyStock);
    setFormNotes(p.notes || '');
    setFormError(null);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Nama produk wajib diisi.');
      return;
    }
    const purchase = Number(formPurchasePrice);
    const selling = Number(formSellingPrice);
    if (isNaN(purchase) || purchase < 0) {
      setFormError('Harga beli harus berupa angka positif.');
      return;
    }
    if (isNaN(selling) || selling < 0) {
      setFormError('Harga jual harus berupa angka positif.');
      return;
    }

    if (editingProduct) {
      updateProduct(
        editingProduct.id,
        {
          name: formName.trim(),
          category: formCategory,
          purchasePrice: purchase,
          sellingPrice: selling,
          currentStock: Math.max(0, Number(formStock) || 0),
          avgDailySales: Math.max(0, Number(formAvgSales) || 0),
          safetyStock: Math.max(0, Number(formSafetyStock) || 0),
          notes: formNotes.trim() || undefined,
        },
        mode
      );
      setEditingProduct(null);
      showToast('Produk berhasil diperbarui.');
    } else {
      addProduct(
        {
          name: formName.trim(),
          category: formCategory,
          purchasePrice: purchase,
          sellingPrice: selling,
          currentStock: Math.max(0, Number(formStock) || 0),
          avgDailySales: Math.max(0, Number(formAvgSales) || 0),
          safetyStock: Math.max(0, Number(formSafetyStock) || 0),
          notes: formNotes.trim() || undefined,
        },
        mode
      );
      setIsAddModalOpen(false);
      showToast('Produk baru berhasil ditambahkan.');
    }
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id, mode);
    setDeletingProductId(null);
    showToast('Produk berhasil dihapus.');
  };

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    setAdjustError(null);

    const qty = Number(adjustQty);
    if (!qty || qty <= 0) {
      setAdjustError('Jumlah mutasi harus lebih besar dari 0.');
      return;
    }

    const res = adjustProductStock(
      adjustingProduct.product.id,
      {
        type: adjustingProduct.type,
        quantity: qty,
        reason: adjustReason,
        notes: adjustNotes.trim() || undefined,
      },
      mode
    );

    if (!res.success) {
      setAdjustError(res.error || 'Gagal mengubah stok.');
      return;
    }

    showToast(
      adjustingProduct.type === 'in'
        ? `Berhasil menambah ${qty} unit stok kulakan.`
        : `Berhasil mencatat ${qty} unit mainan keluar.`
    );
    setAdjustingProduct(null);
    setAdjustQty('');
    setAdjustNotes('');
  };

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F2A44] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm animate-fade-in border border-white/10">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1F2A44] flex items-center gap-2">
            Kelola Stok Mainan
            {mode === 'demo' && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Data Demo
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Pantau stok harian, catat barang terjual, dan hindari kulakan berlebih.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="p-1 bg-white rounded-xl border border-[#E9E5DF] flex items-center gap-1">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'catalog'
                  ? 'bg-[#F28A2E] text-white'
                  : 'text-[#64748B] hover:text-[#253344]'
              }`}
            >
              Katalog Produk ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                activeTab === 'history'
                  ? 'bg-[#F28A2E] text-white'
                  : 'text-[#64748B] hover:text-[#253344]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Riwayat Mutasi ({movements.length})</span>
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="px-3.5 py-2 rounded-xl bg-[#F28A2E] hover:bg-[#E9781F] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mainan</span>
          </button>
        </div>
      </div>

      {activeTab === 'catalog' && (
        <>
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E9E5DF] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari mainan (contoh: gelembung sabun, mobil tarik)..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              <Filter className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              <button
                onClick={() => setSelectedCategory('Semua')}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
                  selectedCategory === 'Semua'
                    ? 'bg-[#F28A2E] text-white'
                    : 'bg-[#FFF7ED] text-[#64748B] hover:text-[#253344]'
                }`}
              >
                Semua
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#F28A2E] text-white'
                      : 'bg-[#FFF7ED] text-[#64748B] hover:text-[#253344]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid / Cards */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-[#E9E5DF]">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#F28A2E] flex items-center justify-center mx-auto mb-3">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base text-[#1F2A44]">
                Tidak Ada Produk yang Ditemukan
              </h3>
              <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1">
                {products.length === 0
                  ? 'Katalog mainan masih kosong. Tambahkan mainan pertamamu untuk mulai mencatat stok dan modal.'
                  : 'Coba ubah kata kunci pencarian atau pilih kategori lain.'}
              </p>
              {products.length === 0 && (
                <button
                  onClick={openAddModal}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#F28A2E] hover:bg-[#E9781F] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Produk Sekarang
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((p) => {
                const isUnderSafety = p.currentStock <= p.safetyStock;
                const margin = p.sellingPrice - p.purchasePrice;
                const marginPercent =
                  p.purchasePrice > 0 ? Math.round((margin / p.purchasePrice) * 100) : 0;

                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                      isUnderSafety ? 'border-amber-300 ring-1 ring-amber-300' : 'border-[#E9E5DF]'
                    }`}
                  >
                    <div>
                      {/* Category and Status Badge */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF7ED] text-[#F28A2E] border border-[#FFE8CC]">
                          {p.category}
                        </span>
                        {isUnderSafety ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Stok Menipis
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <PackageCheck className="w-3 h-3" />
                            Stok Aman
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      <h3 className="font-bold text-base text-[#1F2A44] line-clamp-2">
                        {p.name}
                      </h3>

                      {p.notes && (
                        <p className="text-xs text-[#64748B] mt-1 line-clamp-1 italic">
                          &ldquo;{p.notes}&rdquo;
                        </p>
                      )}

                      {/* Pricing & Stock Details */}
                      <div className="mt-4 p-3 bg-[#FFF7ED]/50 rounded-xl space-y-2 border border-[#FFE8CC]/60 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[#64748B]">Jumlah Stok:</span>
                          <span className="font-bold text-sm text-[#1F2A44]">
                            {p.currentStock}{' '}
                            <span className="text-xs font-normal text-[#64748B]">unit</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#64748B]">Harga Beli:</span>
                          <span className="font-medium text-[#253344]">
                            {formatRupiah(p.purchasePrice)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#64748B]">Harga Jual:</span>
                          <span className="font-bold text-[#F28A2E]">
                            {formatRupiah(p.sellingPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-[#FFE8CC]">
                          <span className="text-[#64748B]">Estimasi Laba/unit:</span>
                          <span className="font-semibold text-emerald-700">
                            +{formatRupiah(margin)} ({marginPercent}%)
                          </span>
                        </div>
                      </div>

                      {/* Planning specs */}
                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#64748B] px-1">
                        <span>Laku/hari: ~{p.avgDailySales} unit</span>
                        <span>Stok aman: {p.safetyStock} unit</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 pt-3 border-t border-[#E9E5DF] space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setAdjustingProduct({ product: p, type: 'in' });
                            setAdjustReason('Kulakan');
                            setAdjustQty('');
                            setAdjustNotes('');
                            setAdjustError(null);
                          }}
                          className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>+ Tambah Stok</span>
                        </button>
                        <button
                          onClick={() => {
                            setAdjustingProduct({ product: p, type: 'out' });
                            setAdjustReason('Terjual');
                            setAdjustQty('');
                            setAdjustNotes('');
                            setAdjustError(null);
                          }}
                          className="py-1.5 px-2 bg-orange-50 hover:bg-orange-100 text-[#F28A2E] rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>- Barang Keluar</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        {onOpenCalculatorWithProduct && (
                          <button
                            onClick={() => onOpenCalculatorWithProduct(p)}
                            className="text-xs font-semibold text-[#F28A2E] hover:underline flex items-center gap-1"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>Hitung Kulakan</span>
                          </button>
                        )}
                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-[#64748B] hover:text-[#253344] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit data produk"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingProductId(p.id)}
                            className="p-1.5 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Movement History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-[#E9E5DF] overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#E9E5DF]">
            <h3 className="font-bold text-sm text-[#1F2A44] flex items-center gap-2">
              <History className="w-4 h-4 text-[#F28A2E]" />
              Catatan Keluar-Masuk Stok
            </h3>
            <p className="text-xs text-[#64748B]">
              Setiap penambahan kulakan dan barang terjual dicatat otomatis untuk audit harian.
            </p>
          </div>

          {movements.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#64748B]">
              Belum ada riwayat mutasi stok. Mutasi akan tercatat saat Anda menambah atau mengurangi stok barang.
            </div>
          ) : (
            <div className="divide-y divide-[#E9E5DF] max-h-[500px] overflow-y-auto">
              {movements.map((mov) => {
                const isIn = mov.type === 'in';
                return (
                  <div
                    key={mov.id}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#FFF7ED]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isIn ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-[#F28A2E]'
                        }`}
                      >
                        {isIn ? (
                          <ArrowDownRight className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-[#1F2A44] truncate">
                          {mov.productName}
                        </p>
                        <p className="text-[11px] text-[#64748B]">
                          Alasan: <span className="font-semibold text-[#253344]">{mov.reason}</span>
                          {mov.notes && ` • "${mov.notes}"`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`text-xs sm:text-sm font-bold ${
                          isIn ? 'text-emerald-700' : 'text-[#F28A2E]'
                        }`}
                      >
                        {isIn ? `+${mov.quantity}` : `-${mov.quantity}`} unit
                      </p>
                      <p className="text-[11px] text-[#64748B]">
                        Sisa: {mov.newStock} unit • {formatDateIndo(mov.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E9E5DF] my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E5DF]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#FFE8CC] text-[#F28A2E] rounded-xl">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-[#1F2A44]">
                  {editingProduct ? 'Edit Data Mainan' : 'Tambah Mainan Baru'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#253344] mb-1">
                  Nama Produk Mainan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Balon Gelembung Sabun Magic"
                  className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#253344] mb-1">
                  Kategori Mainan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#253344] mb-1">
                    Harga Beli / Modal (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formPurchasePrice}
                    onChange={(e) =>
                      setFormPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="Contoh: 3000"
                    className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#253344] mb-1">
                    Harga Jual Eceran (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formSellingPrice}
                    onChange={(e) =>
                      setFormSellingPrice(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="Contoh: 6000"
                    className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#253344] mb-1">
                    Stok Saat Ini
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formStock}
                    onChange={(e) =>
                      setFormStock(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#253344] mb-1">
                    Laku/Hari (~unit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formAvgSales}
                    onChange={(e) =>
                      setFormAvgSales(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="Contoh: 5"
                    className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#253344] mb-1">
                    Stok Aman (Cadangan)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formSafetyStock}
                    onChange={(e) =>
                      setFormSafetyStock(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="Contoh: 3"
                    className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#253344] mb-1">
                  Catatan Produk (Opsional)
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Selalu laris saat pasar malam atau Car Free Day..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E9E5DF]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-[#F28A2E] text-white hover:bg-[#E9781F] rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editingProduct ? 'Simpan Perubahan' : 'Tambahkan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock (In / Out) Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E9E5DF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E5DF]">
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-xl ${
                    adjustingProduct.type === 'in'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-orange-100 text-[#F28A2E]'
                  }`}
                >
                  {adjustingProduct.type === 'in' ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1F2A44]">
                    {adjustingProduct.type === 'in' ? 'Tambah Stok Masuk' : 'Catat Barang Keluar'}
                  </h3>
                  <p className="text-xs text-[#64748B]">{adjustingProduct.product.name}</p>
                </div>
              </div>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {adjustError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{adjustError}</span>
              </div>
            )}

            <div className="mt-3 p-3 bg-[#FFF7ED] rounded-xl border border-[#FFE8CC] flex justify-between text-xs">
              <span className="text-[#64748B]">Stok Saat Ini:</span>
              <span className="font-bold text-[#1F2A44]">
                {adjustingProduct.product.currentStock} unit
              </span>
            </div>

            <form onSubmit={handleAdjustStock} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#253344] mb-1">
                  Jumlah {adjustingProduct.type === 'in' ? 'Masuk (Kulakan)' : 'Keluar (Terjual)'}{' '}
                  (unit) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={adjustingProduct.type === 'out' ? adjustingProduct.product.currentStock : 9999}
                  value={adjustQty}
                  onChange={(e) =>
                    setAdjustQty(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="Masukkan jumlah unit..."
                  className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#253344] mb-1">
                  Alasan Mutasi <span className="text-red-500">*</span>
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value as MovementReason)}
                  className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                >
                  {adjustingProduct.type === 'in' ? (
                    <>
                      <option value="Kulakan">Kulakan (Beli baru dari grosir)</option>
                      <option value="Stok Awal">Stok Awal</option>
                      <option value="Penyesuaian">Penyesuaian (Hitung ulang)</option>
                    </>
                  ) : (
                    <>
                      <option value="Terjual">Terjual (Laku ke pembeli)</option>
                      <option value="Rusak">Rusak / Hilang</option>
                      <option value="Penyesuaian">Penyesuaian Stok</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#253344] mb-1">
                  Catatan Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="Contoh: Laku di CFD Rogojampi / Pesanan Bu Dewi..."
                  className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E9E5DF]">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-xl flex items-center gap-1.5 ${
                    adjustingProduct.type === 'in'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-[#F28A2E] hover:bg-[#E9781F]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E9E5DF]">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#1F2A44] text-center">
              Hapus Mainan Ini?
            </h3>
            <p className="text-xs text-[#64748B] text-center mt-1">
              Produk akan dihapus dari daftar katalog Anda. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-5 flex gap-2 justify-center">
              <button
                onClick={() => setDeletingProductId(null)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-gray-100 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteProduct(deletingProductId)}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
