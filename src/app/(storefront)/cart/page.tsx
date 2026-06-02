'use client';

import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { IconMinus, IconPlus, IconTrash, IconArrowRight, IconShoppingCart } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, updateQty, removeItem, getTotalPrice, getTotalItems } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-16 text-center animate-pulse">
        <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-6"></div>
        <div className="h-8 bg-muted w-48 mx-auto mb-4 rounded"></div>
        <div className="h-4 bg-muted w-64 mx-auto rounded"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="bg-muted w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <IconShoppingCart size={48} className="text-foreground/30" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4">Keranjang Kosong</h1>
        <p className="text-foreground/70 mb-8">Anda belum menambahkan produk apapun ke keranjang.</p>
        <Link href="/produk" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold inline-block hover:bg-accent transition-colors">
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-foreground mb-8">Keranjang Belanja</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row p-4 sm:p-6 border-b border-border last:border-b-0 gap-4">
                <div className="relative w-full sm:w-24 aspect-square rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-foreground mb-1">{item.name}</h3>
                    <div className="text-accent font-bold">Rp {item.price.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-border rounded-lg bg-background">
                      <button 
                        onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                        className="p-2 text-foreground hover:text-primary disabled:opacity-50"
                        disabled={item.qty <= 1}
                      >
                        <IconMinus size={16} />
                      </button>
                      <span className="w-10 text-center font-medium text-sm">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="p-2 text-foreground hover:text-primary"
                      >
                        <IconPlus size={16} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                    >
                      <IconTrash size={18} /> <span className="hidden sm:inline">Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-background border border-border rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-foreground mb-6">Ringkasan Pesanan</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-foreground/80">
                <span>Total Barang</span>
                <span>{getTotalItems()} item</span>
              </div>
              <div className="flex justify-between text-foreground/80">
                <span>Total Harga</span>
                <span>Rp {getTotalPrice().toLocaleString('id-ID')}</span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
                <span>Total Pembayaran</span>
                <span className="text-accent">Rp {getTotalPrice().toLocaleString('id-ID')}</span>
              </div>
            </div>

            <Link 
              href="/checkout"
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
            >
              Lanjut ke Checkout <IconArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
