import Link from 'next/link';
import { IconHome, IconCategory } from '@tabler/icons-react';
import { CartBadgeBottom } from '@/components/ui/CartBadge';

export default function BottomNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 flex justify-around items-center h-16 pb-safe">
      <Link href="/" className="flex flex-col items-center p-2 text-foreground/70 hover:text-primary">
        <IconHome size={24} />
        <span className="text-[10px] mt-1">Beranda</span>
      </Link>
      <Link href="/produk" className="flex flex-col items-center p-2 text-foreground/70 hover:text-primary">
        <IconCategory size={24} />
        <span className="text-[10px] mt-1">Produk</span>
      </Link>
      <CartBadgeBottom />
    </div>
  );
}
