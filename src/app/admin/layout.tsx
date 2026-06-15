'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconDashboard, IconBox, IconShoppingCart, IconTruck, IconSettings, IconLogout } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
      } else {
        setUserEmail(session.user.email ?? '');
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/login');
      } else {
        setUserEmail(session.user.email ?? '');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground/60 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/admin" className="font-bold text-xl text-primary tracking-tight">
            PI opung Admin
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-muted transition-colors">
            <IconDashboard size={20} /> Dashboard
          </Link>
          <Link href="/admin/produk" className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-muted transition-colors">
            <IconBox size={20} /> Produk
          </Link>
          <Link href="/admin/pesanan" className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-muted transition-colors">
            <IconShoppingCart size={20} /> Pesanan
          </Link>
          <Link href="/admin/ongkir" className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-muted transition-colors">
            <IconTruck size={20} /> Ongkir
          </Link>
          <Link href="/admin/pengaturan" className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-muted transition-colors">
            <IconSettings size={20} /> Pengaturan
          </Link>
        </nav>
        <div className="p-4 border-t border-border">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-red-500 hover:bg-red-50 transition-colors">
            <IconLogout size={20} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 z-10">
          <h2 className="font-semibold text-lg text-foreground">Admin Panel</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block">{userEmail}</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
