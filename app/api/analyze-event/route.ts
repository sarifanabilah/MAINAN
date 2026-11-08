import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, availableProducts } = body;

    if (!event || !event.name) {
      return NextResponse.json({ error: 'Data event tidak lengkap.' }, { status: 400 });
    }

    const productsText =
      Array.isArray(availableProducts) && availableProducts.length > 0
        ? availableProducts
            .map(
              (p: any) =>
                `- ${p.name} (Kategori: ${p.category}, Stok: ${p.currentStock} unit, Jual: Rp${(p.sellingPrice || 0).toLocaleString('id-ID')})`
            )
            .join('\n')
        : 'Belum ada daftar produk toko.';

    const prompt = `Kamu adalah Asisten Analisis Peluang Jualan Mainan Kita untuk pedagang UMKM mainan anak di Indonesia.
Analisis peluang jualan untuk agenda event berikut ini:

DATA EVENT:
- Nama Acara: ${event.name}
- Kategori Acara: ${event.category || 'Umum'}
- Tanggal & Waktu: ${event.date} ${event.startTime ? `(${event.startTime} - ${event.endTime || 'selesai'})` : ''}
- Lokasi: ${event.location || '-'}, ${event.city || '-'}
- Penyelenggara: ${event.organizer || 'Tidak dicantumkan'}
- Catatan Acara: ${event.notes || 'Tidak ada catatan khusus'}
- Status Verifikasi: ${event.verificationStatus || 'Belum Diverifikasi'}

DAFTAR STOK MAINAN YANG DIMILIKI PEDAGANG SAAT INI:
${productsText}

ATURAN PENTING:
1. JANGAN mengarang angka resmi jumlah penonton atau pengunjung yang tidak ada di data.
2. JANGAN menjamin bahwa mainan pasti habis terjual (jelaskan ini sebagai saran persiapan).
3. Buat analisis praktis, ramah, dan aplikatif untuk pedagang keliling/lapak.
4. Gunakan bahasa Indonesia yang mudah dipahami.

BERIKAN REKOMENDASI DALAM FORMAT BERIKUT:
1. Rekomendasi Jenis Mainan yang Cocok Dibawa (sesuai waktu, tempat, dan profil anak yang biasanya hadir)
2. Persiapan Lapak & Operasional (contoh: perlengkapan tali, baterai cadangan, uang kembalian receh, pencahayaan jika malam)
3. Strategi Penjualan Sederhana (contoh: bundling kemasan, demo mainan menyala, posisi mangkal)
4. Hal yang Perlu Diwaspadai (cuaca, perizinan, atau jika acara belum terverifikasi)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: response.text || 'Tidak dapat memproses analisis event saat ini.',
    });
  } catch (error: any) {
    console.error('Error analyzing event:', error);
    return NextResponse.json(
      {
        error: error.message || 'Gagal menganalisis peluang event. Silakan coba kembali.',
      },
      { status: 500 }
    );
  }
}
