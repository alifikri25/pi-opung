'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/components/ui/Toast';
import { IconMinus, IconPlus, IconShoppingCart } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    weight: number;
    image: string;
    stock: number;
  };
  /** WhatsApp number for "Beli Sekarang" button (format: 62xxx) */
  waNumber?: string;
}

export default function AddToCartButton({ product, waNumber = '6281234567890' }: AddToCartButtonProps) {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const { showToast } = useToast();
  const router = useRouter();

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      weight: product.weight,
      image: product.image,
      qty,
    });
    showToast(`${product.name} ditambahkan ke keranjang!`);
    setQty(1);
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      weight: product.weight,
      image: product.image,
      qty,
    });
    router.push('/checkout');
  };

  return (
    <>
      {/* Quantity Selector */}
      <div className="mb-6">
        <h3 className="font-medium text-foreground mb-3">Atur Jumlah</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-border rounded-lg bg-background">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="p-3 text-foreground hover:text-primary disabled:opacity-50"
              disabled={qty <= 1}
            >
              <IconMinus size={18} />
            </button>
            <span className="w-12 text-center font-medium">{qty}</span>
            <button
              onClick={() => setQty(Math.min(product.stock, qty + 1))}
              className="p-3 text-foreground hover:text-primary disabled:opacity-50"
              disabled={qty >= product.stock}
            >
              <IconPlus size={18} />
            </button>
          </div>
          <span className="text-sm text-foreground/50">
            Tersisa {product.stock} barang
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleAdd}
          disabled={product.stock <= 0}
          className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconShoppingCart size={20} />
          Tambah ke Keranjang
        </button>
        <button
          onClick={handleBuyNow}
          disabled={product.stock <= 0}
          className="flex-1 bg-accent text-accent-foreground py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors shadow-lg shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Beli Sekarang
        </button>
      </div>
    </>
  );
}
