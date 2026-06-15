import Link from 'next/link';
import { getSettings } from '@/lib/api';

export default async function Footer() {
  let storeName = 'PI opung';
  let waNumber = '6281234567890';
  let address = '';

  try {
    const settings = await getSettings();
    if (settings.store_name) storeName = settings.store_name;
    if (settings.wa_number) waNumber = settings.wa_number;
    if (settings.address) address = settings.address;
  } catch {
    // Fallback ke default
  }

  const waDisplay = waNumber.startsWith('62')
    ? `+62 ${waNumber.slice(2, 4)}-${waNumber.slice(4, 8)}-${waNumber.slice(8)}`
    : waNumber;

  return (
    <footer className="bg-foreground text-background py-8 mt-auto hidden md:block">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-xl mb-4 text-primary">{storeName}</h3>
          <p className="text-sm opacity-80">Toko pisang segar terlengkap. Menyediakan berbagai macam jenis pisang berkualitas untuk kebutuhan Anda.</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-4 text-primary">Tautan</h3>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link href="/" className="hover:text-accent">Beranda</Link></li>
            <li><Link href="/produk" className="hover:text-accent">Semua Produk</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-4 text-primary">Hubungi Kami</h3>
          {waNumber && <p className="text-sm opacity-80">WhatsApp: {waDisplay}</p>}
          {address && <p className="text-sm opacity-80 mt-2">{address}</p>}
        </div>
      </div>
      <div className="text-center text-xs opacity-60 mt-8 pt-4 border-t border-background/20">
        &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
      </div>
    </footer>
  );
}
