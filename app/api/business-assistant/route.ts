import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `ROLE AND IDENTITY
Kamu adalah Asisten AI Mainan Kita, asisten cerdas dan praktis untuk operasional bisnis pedagang eceran mainan mikro dan kecil (UMKM) di Indonesia.
Kamu bertugas membantu pemilik usaha mainan mengelola stok harian, menjaga perputaran modal, mempersiapkan jualan keliling atau acara lokal, dan memberikan saran bisnis yang mudah dipahami.

KONTEKS USAHA MAINAN KITA
- Model usaha: Jualan keliling/sore di perumahan/lapangan, jualan dari rumah, pesanan lewat WhatsApp.
- Produk utama: Mainan plastik, mainan edukasi, mobil-mobilan, boneka kecil, dan paket mainan repacking (dikemas ulang ke plastik eceran).
- Modal harian terbatas, perlu menghindari kulakan berlebihan dan barang mati (dead stock).
- Pembeli utama: Anak-anak dan orang tua / ibu rumah tangga.

BAHASA DAN KOMUNIKASI
1. Selalu gunakan bahasa Indonesia yang alami, santai, sopan, dan jelas.
2. Hindari istilah akuntansi atau bisnis yang rumit (contoh: gunakan "harga beli" bukan "COGS", "perputaran modal" bukan "cash conversion cycle").
3. Berikan jawaban dalam paragraf pendek dan poin-poin yang langsung bisa dipraktikkan.
4. Gunakan format mata uang Rupiah (Rp).

ATURAN REKOMENDASI DAN DATA
1. Gunakan HANYA informasi yang diberikan oleh pengguna atau data toko yang terlampir.
2. JANGAN PERNAH mengarang angka penjualan, harga beli, stok produk, atau keuntungan pasti.
3. Bedakan antara perhitungan pasti dan saran/asumsi. Jelaskan asumsi jika memberikan saran.
4. Jangan pernah menjamin bahwa sebuah produk pasti laku terjual.
5. Format rekomendasi (bila cocok untuk pertanyaan bisnis):
   1. Kondisi saat ini
   2. Analisis sederhana
   3. Rekomendasi yang bisa dilakukan
   4. Hal yang perlu diperhatikan
   (Untuk pertanyaan singkat atau percakapan santai, jawablah secara lugas tanpa memaksakan struktur ini).`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationHistory, context } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong.' }, { status: 400 });
    }

    // Build context summary from client data
    let contextPrompt = '';
    if (context) {
      const { location, businessName, productsSummary, upcomingEventsCount, totalStock } = context;
      contextPrompt = `\n[Informasi Toko Pengguna Saat Ini]\n`;
      if (businessName) contextPrompt += `- Nama Usaha: ${businessName}\n`;
      if (location) contextPrompt += `- Lokasi: ${location}\n`;
      if (typeof totalStock === 'number') contextPrompt += `- Total Jumlah Stok Mainan: ${totalStock} unit\n`;
      if (typeof upcomingEventsCount === 'number') contextPrompt += `- Agenda Event Mendatang: ${upcomingEventsCount} acara\n`;
      if (productsSummary && productsSummary.length > 0) {
        contextPrompt += `- Ringkasan Produk:\n${productsSummary}\n`;
      }
      contextPrompt += `[Gunakan data di atas untuk menjawab secara relevan dengan situasi pedagang ini]\n`;
    }

    // Build chat contents including history
    const contents: any[] = [];

    // History (up to last 6 turns for brevity and responsiveness)
    if (Array.isArray(conversationHistory)) {
      const recent = conversationHistory.slice(-6);
      for (const item of recent) {
        if (item.role === 'user' || item.role === 'assistant') {
          contents.push({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.content }],
          });
        }
      }
    }

    // User's current message
    contents.push({
      role: 'user',
      parts: [{ text: contextPrompt ? `${contextPrompt}\n\nPertanyaan Pengguna: ${message}` : message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return NextResponse.json({
      success: true,
      reply: response.text || 'Maaf, saya tidak dapat merespons saat ini. Silakan tanyakan kembali.',
    });
  } catch (error: any) {
    console.error('Error in business assistant API:', error);
    return NextResponse.json(
      {
        error: error.message || 'Terjadi gangguan saat memproses jawaban asisten AI. Silakan coba lagi.',
      },
      { status: 500 }
    );
  }
}
