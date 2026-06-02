import Link from 'next/link';
import { IconSearch } from '@tabler/icons-react';
import { CartBadgeNav } from '@/components/ui/CartBadge';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight">
          PI opung
        </Link>
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <input 
            type="text" 
            placeholder="Cari pisang segar..." 
            className="w-full py-2 px-4 rounded-full text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button className="absolute right-3 top-2 text-foreground/50">
            <IconSearch size={20} />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <CartBadgeNav />
        </div>
      </div>
      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Cari pisang segar..." 
            className="w-full py-2 px-4 rounded-full text-foreground focus:outline-none"
          />
          <button className="absolute right-3 top-2 text-foreground/50">
            <IconSearch size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
