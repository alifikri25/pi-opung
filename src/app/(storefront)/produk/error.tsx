'use client';

import { IconAlertCircle } from '@tabler/icons-react';

export default function ProdukError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-16 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
        <IconAlertCircle size={40} className="text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Gagal Memuat Produk</h2>
      <p className="text-foreground/60 mb-6">Terjadi kesalahan saat memuat data produk. Silakan coba lagi.</p>
      <button
        onClick={() => unstable_retry()}
        className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold hover:bg-accent transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  );
}
