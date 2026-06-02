import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background py-8 mt-auto hidden md:block">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-xl mb-4 text-primary">PI opung</h3>
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
          <p className="text-sm opacity-80">WhatsApp: +62 812-3456-7890</p>
          <p className="text-sm opacity-80 mt-2">Jl. Pisang No. 1, Jakarta</p>
        </div>
      </div>
      <div className="text-center text-xs opacity-60 mt-8 pt-4 border-t border-background/20">
        &copy; {new Date().getFullYear()} PI opung. All rights reserved.
      </div>
    </footer>
  );
}
