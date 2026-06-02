'use client';
import { useCartStore } from '@/store/cartStore';
import { IconShoppingCart } from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function CartBadgeNav() {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore(state => state.getTotalItems());
  
  useEffect(() => setMounted(true), []);

  return (
    <Link href="/cart" className="relative p-2">
      <IconShoppingCart size={24} />
      {mounted && totalItems > 0 && (
        <span className="absolute top-0 right-0 bg-accent text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-fade-in">
          {totalItems}
        </span>
      )}
    </Link>
  );
}

export function CartBadgeBottom() {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore(state => state.getTotalItems());
  
  useEffect(() => setMounted(true), []);

  return (
    <Link href="/cart" className="flex flex-col items-center p-2 text-foreground/70 hover:text-primary relative">
      <IconShoppingCart size={24} />
      {mounted && totalItems > 0 && (
        <span className="absolute top-1 right-2 bg-accent text-primary-foreground text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-fade-in">
          {totalItems}
        </span>
      )}
      <span className="text-[10px] mt-1">Keranjang</span>
    </Link>
  );
}
