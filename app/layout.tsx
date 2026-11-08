import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Mainan Kita - Asisten Cerdas untuk Usaha Mainan',
  description: 'Asisten Cerdas untuk Usaha Mainan - Atur stok, hitung modal kulakan, hitung kemasan, cari peluang jualan, dan buat promosi WhatsApp untuk UMKM mainan.',
  icons: {
    icon: '/assets/aistudio/Gemini_Generated_Image_rizqlxrizqlxrizq-removebg-preview_5a3bbbec.png',
    apple: '/assets/aistudio/Gemini_Generated_Image_rizqlxrizqlxrizq-removebg-preview_5a3bbbec.png',
  },
  openGraph: {
    title: 'Mainan Kita - Asisten Cerdas untuk Usaha Mainan',
    description: 'Asisten Cerdas untuk Usaha Mainan - Atur stok, hitung modal kulakan, hitung kemasan, cari peluang jualan, dan buat promosi WhatsApp untuk UMKM mainan.',
    type: 'website',
    images: ['/assets/aistudio/Gemini_Generated_Image_rizqlxrizqlxrizq-removebg-preview_5a3bbbec.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mainan Kita - Asisten Cerdas untuk Usaha Mainan',
    description: 'Asisten Cerdas untuk Usaha Mainan - Atur stok, hitung modal kulakan, hitung kemasan, cari peluang jualan, dan buat promosi WhatsApp untuk UMKM mainan.',
    images: ['/assets/aistudio/Gemini_Generated_Image_rizqlxrizqlxrizq-removebg-preview_5a3bbbec.png'],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <body suppressHydrationWarning className="bg-[#FFF7ED] text-[#253344] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
