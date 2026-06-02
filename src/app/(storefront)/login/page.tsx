'use client';

import { useState } from 'react';
import { IconLock, IconUser } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      showToast('Login berhasil!');
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Login Admin</h1>
          <p className="text-foreground/60 mt-2">Masuk ke panel admin PI opung</p>
        </div>
        
        <form onSubmit={handleLogin} className="bg-background border border-border rounded-2xl p-8 shadow-sm space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-foreground/40">
                <IconUser size={18} />
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="admin@piopung.com" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-foreground/40">
                <IconLock size={18} />
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••" 
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-foreground/50">
          <Link href="/" className="text-primary hover:underline">← Kembali ke Toko</Link>
        </p>
      </div>
    </div>
  );
}
