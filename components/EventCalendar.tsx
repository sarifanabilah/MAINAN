'use client';

import { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Check,
  Building2,
  ExternalLink,
  Users,
} from 'lucide-react';
import {
  BusinessEvent,
  EventCategory,
  EventVerificationStatus,
  CrowdLevel,
  Product,
} from '@/types';
import { formatDateIndo } from '@/lib/calculations';
import { addEvent, updateEvent, deleteEvent, AppMode } from '@/lib/storage';

interface EventCalendarProps {
  events: BusinessEvent[];
  products: Product[];
  mode: AppMode;
  userLocation: string;
}

const EVENT_CATEGORIES: EventCategory[] = [
  'Jaranan',
  'Janger',
  'Festival',
  'Pasar Malam',
  'Sekolah',
  'Bazar',
  'Kegiatan Masyarakat',
  'Lainnya',
];

export default function EventCalendar({
  events,
  products,
  mode,
  userLocation,
}: EventCalendarProps) {
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BusinessEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  // AI Analysis modal state
  const [analyzingEvent, setAnalyzingEvent] = useState<BusinessEvent | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<EventCategory>('Kegiatan Masyarakat');
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formCity, setFormCity] = useState(userLocation || 'Banyuwangi');
  const [formOrganizer, setFormOrganizer] = useState('');
  const [formSourceUrl, setFormSourceUrl] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formCrowd, setFormCrowd] = useState<CrowdLevel>('Ramai');
  const [formVerification, setFormVerification] = useState<EventVerificationStatus>(
    'Belum Diverifikasi'
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openAddModal = () => {
    setFormName('');
    setFormCategory('Kegiatan Masyarakat');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormStartTime('16:00');
    setFormEndTime('21:00');
    setFormLocation('');
    setFormCity(userLocation || 'Banyuwangi');
    setFormOrganizer('');
    setFormSourceUrl('');
    setFormNotes('');
    setFormCrowd('Ramai');
    setFormVerification('Belum Diverifikasi');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (ev: BusinessEvent) => {
    setEditingEvent(ev);
    setFormName(ev.name);
    setFormCategory(ev.category);
    setFormDate(ev.date);
    setFormStartTime(ev.startTime || '');
    setFormEndTime(ev.endTime || '');
    setFormLocation(ev.location);
    setFormCity(ev.city);
    setFormOrganizer(ev.organizer || '');
    setFormSourceUrl(ev.sourceUrl || '');
    setFormNotes(ev.notes || '');
    setFormCrowd(ev.expectedCrowd || 'Ramai');
    setFormVerification(ev.verificationStatus);
    setFormError(null);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Nama acara wajib diisi.');
      return;
    }
    if (!formDate) {
      setFormError('Tanggal acara wajib diisi.');
      return;
    }
    if (!formLocation.trim()) {
      setFormError('Lokasi acara wajib diisi.');
      return;
    }

    if (editingEvent) {
      updateEvent(
        editingEvent.id,
        {
          name: formName.trim(),
          category: formCategory,
          date: formDate,
          startTime: formStartTime || undefined,
          endTime: formEndTime || undefined,
          location: formLocation.trim(),
          city: formCity.trim(),
          organizer: formOrganizer.trim() || undefined,
          sourceUrl: formSourceUrl.trim() || undefined,
          notes: formNotes.trim() || undefined,
          expectedCrowd: formCrowd,
          verificationStatus: formVerification,
        },
        mode
      );
      setEditingEvent(null);
      showToast('Agenda event berhasil diperbarui.');
    } else {
      addEvent(
        {
          name: formName.trim(),
          category: formCategory,
          date: formDate,
          startTime: formStartTime || undefined,
          endTime: formEndTime || undefined,
          location: formLocation.trim(),
          city: formCity.trim(),
          organizer: formOrganizer.trim() || undefined,
          sourceUrl: formSourceUrl.trim() || undefined,
          notes: formNotes.trim() || undefined,
          expectedCrowd: formCrowd,
          verificationStatus: formVerification,
        },
        mode
      );
      setIsAddModalOpen(false);
      showToast('Agenda event baru berhasil ditambahkan.');
    }
  };

  const handleDeleteEvent = (id: string) => {
    deleteEvent(id, mode);
    setDeletingEventId(null);
    showToast('Agenda event berhasil dihapus.');
  };

  const handleAnalyzeEvent = async (ev: BusinessEvent) => {
    setAnalyzingEvent(ev);
    setAiAnalysisResult(null);
    setAnalysisError(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: ev,
          availableProducts: products,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menganalisis event.');
      }

      setAiAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || 'Terjadi kesalahan saat memproses analisis event.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredEvents = events.filter((ev) => {
    if (filterPeriod === 'upcoming') {
      return ev.date >= todayStr;
    }
    if (filterPeriod === 'past') {
      return ev.date < todayStr;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F2A44] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm animate-fade-in border border-white/10">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1F2A44] flex items-center gap-2">
            Kalender Event & Peluang Jualan
            {mode === 'demo' && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Data Demo
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Catat agenda keramaian lokal (jaranan, janger, CFD, pasar malam) dan minta saran persiapan ke AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period filter buttons */}
          <div className="p-1 bg-white rounded-xl border border-[#E9E5DF] flex items-center text-xs font-semibold">
            <button
              onClick={() => setFilterPeriod('upcoming')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterPeriod === 'upcoming'
                  ? 'bg-[#F28A2E] text-white'
                  : 'text-[#64748B] hover:text-[#253344]'
              }`}
            >
              Mendatang
            </button>
            <button
              onClick={() => setFilterPeriod('past')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterPeriod === 'past'
                  ? 'bg-[#F28A2E] text-white'
                  : 'text-[#64748B] hover:text-[#253344]'
              }`}
            >
              Lewat
            </button>
            <button
              onClick={() => setFilterPeriod('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterPeriod === 'all'
                  ? 'bg-[#F28A2E] text-white'
                  : 'text-[#64748B] hover:text-[#253344]'
              }`}
            >
              Semua
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="px-3.5 py-2 rounded-xl bg-[#F28A2E] hover:bg-[#E9781F] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Event</span>
          </button>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#E9E5DF]">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 text-[#278C7B] flex items-center justify-center mx-auto mb-3">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-[#1F2A44]">
            Belum ada jadwal event terverifikasi.
          </h3>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto mt-1">
            Kamu bisa menambahkan agenda sendiri sesuai kabar kegiatan desa, perayaan sekolah, atau pentas seni lokal.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-[#F28A2E] hover:bg-[#E9781F] text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Tambah Agenda Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((ev) => {
            const isVerified = ev.verificationStatus === 'Terverifikasi';
            const isUpcoming = ev.date >= todayStr;

            return (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-[#E9E5DF] p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Category and Verification Status */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF7ED] text-[#F28A2E] border border-[#FFE8CC]">
                      {ev.category}
                    </span>

                    {isVerified ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Terverifikasi
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-gray-500" />
                        Belum Diverifikasi
                      </span>
                    )}
                  </div>

                  {/* Event Name */}
                  <h3 className="font-bold text-base text-[#1F2A44] leading-snug">
                    {ev.name}
                  </h3>

                  {/* Details */}
                  <div className="mt-3 space-y-1.5 text-xs text-[#253344]">
                    <div className="flex items-center gap-2 text-[#64748B]">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#F28A2E] shrink-0" />
                      <span className="font-medium text-[#1F2A44]">
                        {formatDateIndo(ev.date)}
                      </span>
                      {ev.startTime && (
                        <span className="text-[11px]">
                          ({ev.startTime} - {ev.endTime || 'selesai'})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[#64748B]">
                      <MapPin className="w-3.5 h-3.5 text-[#278C7B] shrink-0" />
                      <span className="truncate">
                        {ev.location}, {ev.city}
                      </span>
                    </div>

                    {ev.organizer && (
                      <div className="flex items-center gap-2 text-[#64748B]">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">Penyelenggara: {ev.organizer}</span>
                      </div>
                    )}

                    {ev.expectedCrowd && (
                      <div className="flex items-center gap-2 text-[#64748B]">
                        <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Perkiraan Keramaian: {ev.expectedCrowd}</span>
                      </div>
                    )}
                  </div>

                  {ev.notes && (
                    <p className="mt-3 p-2.5 bg-[#FFF7ED]/50 rounded-xl text-xs text-[#64748B] italic border border-[#FFE8CC]/60 leading-relaxed">
                      &ldquo;{ev.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-[#E9E5DF] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleAnalyzeEvent(ev)}
                    className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#F28A2E] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analisis AI</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(ev)}
                      className="p-1.5 text-[#64748B] hover:text-[#253344] hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit event"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingEventId(ev.id)}
                      className="p-1.5 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Event Opportunity Analysis Modal */}
      {analyzingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#E9E5DF] my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E5DF]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 text-[#F28A2E] rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1F2A44]">
                    Analisis Peluang Jualan AI
                  </h3>
                  <p className="text-xs text-[#64748B]">{analyzingEvent.name}</p>
                </div>
              </div>
              <button
                onClick={() => setAnalyzingEvent(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4">
              {isAnalyzing ? (
                <div className="py-12 text-center space-y-3">
                  <div className="flex justify-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-[#F28A2E] animate-bounce" />
                    <div className="w-3 h-3 rounded-full bg-[#F28A2E] animate-bounce [animation-delay:0.2s]" />
                    <div className="w-3 h-3 rounded-full bg-[#F28A2E] animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Asisten AI sedang mencocokkan stok mainanmu dengan suasana acara...
                  </p>
                </div>
              ) : analysisError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{analysisError}</span>
                </div>
              ) : (
                <div className="space-y-3 text-xs leading-relaxed max-h-[460px] overflow-y-auto pr-1">
                  <div className="p-3 bg-[#FFF7ED] rounded-xl border border-[#FFE8CC] text-[11px] text-[#64748B]">
                    💡 <strong>Catatan:</strong> Saran ini dibuat berdasarkan jenis acara dan produk yang kamu miliki, bukan jaminan penjualan pasti.
                  </div>
                  <div className="whitespace-pre-wrap text-[#253344] bg-white p-3 rounded-xl border border-[#E9E5DF]">
                    {aiAnalysisResult}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-[#E9E5DF] flex justify-end">
              <button
                onClick={() => setAnalyzingEvent(null)}
                className="px-4 py-2 bg-[#F28A2E] hover:bg-[#E9781F] text-white text-xs font-semibold rounded-xl"
              >
                Tutup Analisis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {(isAddModalOpen || editingEvent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E9E5DF] my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E5DF]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#FFE8CC] text-[#F28A2E] rounded-xl">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-[#1F2A44]">
                  {editingEvent ? 'Edit Agenda Event' : 'Tambah Agenda Event Baru'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingEvent(null);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEvent} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#253344] mb-1">
                  Nama Acara / Event <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Pentas Jaranan Rogojampi / Bazar Sekolah"
                  className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#253344] mb-1">
                    Kategori Acara <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                  >
                    {EVENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#253344] mb-1">
                    Tanggal Acara <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#253344] mb-1">
                    Jam Mulai (Opsional)
                  </label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#253344] mb-1">
                    Jam Selesai (Opsional)
                  </label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#253344] mb-1">
                    Lokasi / Lapangan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Contoh: Lapangan Kompreng"
                    className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#253344] mb-1">
                    Kota / Kabupaten
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Contoh: Banyuwangi"
                    className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#253344] mb-1">
                    Perkiraan Keramaian
                  </label>
                  <select
                    value={formCrowd}
                    onChange={(e) => setFormCrowd(e.target.value as CrowdLevel)}
                    className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                  >
                    <option value="Sedang">Sedang</option>
                    <option value="Ramai">Ramai</option>
                    <option value="Sangat Ramai">Sangat Ramai</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#253344] mb-1">
                    Status Verifikasi
                  </label>
                  <select
                    value={formVerification}
                    onChange={(e) =>
                      setFormVerification(e.target.value as EventVerificationStatus)
                    }
                    className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                  >
                    <option value="Belum Diverifikasi">Belum Diverifikasi</option>
                    <option value="Terverifikasi">Terverifikasi (Jadwal Resmi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#253344] mb-1">
                  Penyelenggara (Opsional)
                </label>
                <input
                  type="text"
                  value={formOrganizer}
                  onChange={(e) => setFormOrganizer(e.target.value)}
                  placeholder="Contoh: Karang Taruna / Paguyuban Seni"
                  className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#253344] mb-1">
                  Catatan Penting (Opsional)
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Ramai anak-anak di sore hari, cocok bawa gelembung sabun dan mobil berlampu..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-[#E9E5DF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F28A2E]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E9E5DF]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingEvent(null);
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
                  {editingEvent ? 'Simpan Perubahan' : 'Tambahkan Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Event Modal */}
      {deletingEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E9E5DF]">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#1F2A44] text-center">
              Hapus Agenda Event Ini?
            </h3>
            <p className="text-xs text-[#64748B] text-center mt-1">
              Agenda ini akan dihapus dari kalender peluang jualan Anda.
            </p>
            <div className="mt-5 flex gap-2 justify-center">
              <button
                onClick={() => setDeletingEventId(null)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-gray-100 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteEvent(deletingEventId)}
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
