import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productName,
      productPrice,
      productDescription,
      promotionOrDiscount,
      targetAudience,
      channel,
      tone,
      customCta,
    } = body;

    if (!productName || typeof productName !== 'string' || productName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nama produk wajib diisi.' },
        { status: 400 }
      );
    }

    const priceText = productPrice ? `Rp${Number(productPrice).toLocaleString('id-ID')}` : 'Belum ditentukan';

    const prompt = `Kamu adalah Asisten Promosi Mainan Kita untuk pelaku UMKM toko mainan anak di Indonesia.
Tugasmu adalah membuat 3 versi pesan promosi WhatsApp yang alami, ramah, dan siap kirim berdasarkan data produk asli berikut:

Data Produk (Gunakan HANYA fakta ini, JANGAN mengarang diskon atau gratis ongkir jika tidak disebutkan):
- Nama Produk: ${productName}
- Harga Jual: ${priceText}
- Deskripsi Produk: ${productDescription || 'Mainan anak seru dan aman.'}
- Promo/Diskon Tambahan: ${promotionOrDiscount || 'Tidak ada promo khusus'}
- Target Pembaca: ${targetAudience || 'Orang tua / Ibu rumah tangga'}
- Saluran Pengiriman: ${channel || 'WhatsApp Status / Pesan Pribadi'}
- Nada Tulisan: ${tone || 'Ramah dan menarik'}
- Ajakan Bertindak (CTA): ${customCta || 'Hubungi WhatsApp untuk pesan atau tanya stok.'}

ATURAN KETAT:
1. Hasilkan TEPAT 3 versi:
   - Versi 1: "Ramah dan personal" (hangat, seperti menyapa tetangga/langganan, cocok untuk pesan pribadi atau grup RT)
   - Versi 2: "Singkat dan menarik" (padat, to-the-point, cocok untuk WhatsApp Status)
   - Versi 3: "Persuasif dan informatif" (menjelaskan manfaat bermain untuk anak dengan sopan dan jelas)
2. Bahasa Indonesia yang luwes, santai, sopan, tanpa istilah rumit.
3. JANGAN mengarang diskon, hadiah gratis, atau sertifikasi yang tidak diberikan.
4. Gunakan emotikon secukupnya yang ramah (🧸, 🚗, ✨, 📱).
5. Buat pesan mudah disalin dan dikirim.

KEMBALIKAN OUTPUT DALAM FORMAT JSON BERIKUT (hanya JSON murni):
{
  "versions": [
    {
      "type": "Ramah dan personal",
      "text": "..."
    },
    {
      "type": "Singkat dan menarik",
      "text": "..."
    },
    {
      "type": "Persuasif dan informatif",
      "text": "..."
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Clean possible markdown code fences if any
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    if (!parsedData.versions || !Array.isArray(parsedData.versions) || parsedData.versions.length === 0) {
      throw new Error('Format respon AI tidak sesuai.');
    }

    return NextResponse.json({
      success: true,
      versions: parsedData.versions,
    });
  } catch (error: any) {
    console.error('Error generating promotion:', error);
    return NextResponse.json(
      {
        error: error.message || 'Gagal menghasilkan teks promosi. Silakan coba kembali.',
      },
      { status: 500 }
    );
  }
}
