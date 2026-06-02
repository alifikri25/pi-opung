'use client';

import { useEffect, useState } from 'react';
import { IconTrendingUp, IconShoppingCart, IconCoin, IconPackage } from '@tabler/icons-react';
import Link from 'next/link';
import { getDashboardStats } from '@/lib/api';
import type { Order } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    newOrderCount: 0,
    productCount: 0,
    pendingOrders: [] as Order[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Gagal memuat statistik:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-background rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <IconCoin size={24} />
            </div>
            <span className="text-sm font-medium text-green-500 flex items-center"><IconTrendingUp size={16} className="mr-1"/>Bulan ini</span>
          </div>
          <p className="text-sm text-foreground/60 font-medium">Pendapatan</p>
          {loading ? (
            <div className="h-8 w-32 animate-skeleton mt-1"></div>
          ) : (
            <h3 className="text-2xl font-bold text-foreground mt-1">Rp {stats.revenue.toLocaleString('id-ID')}</h3>
          )}
        </div>

        <div className="bg-background rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
              <IconShoppingCart size={24} />
            </div>
          </div>
          <p className="text-sm text-foreground/60 font-medium">Pesanan Baru (Bulan Ini)</p>
          {loading ? (
            <div className="h-8 w-16 animate-skeleton mt-1"></div>
          ) : (
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.newOrderCount}</h3>
          )}
        </div>

        <div className="bg-background rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
              <IconPackage size={24} />
            </div>
          </div>
          <p className="text-sm text-foreground/60 font-medium">Total Produk</p>
          {loading ? (
            <div className="h-8 w-16 animate-skeleton mt-1"></div>
          ) : (
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.productCount}</h3>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Orders */}
        <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="font-bold text-lg text-foreground">Pesanan Menunggu Konfirmasi</h2>
            <Link href="/admin/pesanan" className="text-sm text-primary hover:underline">Lihat Semua</Link>
          </div>
          {loading ? (
            <div className="p-6 space-y-4">
              {[1,2].map(i => <div key={i} className="h-12 animate-skeleton"></div>)}
            </div>
          ) : stats.pendingOrders.length === 0 ? (
            <div className="p-8 text-center text-foreground/50 text-sm">
              Tidak ada pesanan yang menunggu konfirmasi.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-foreground/70">
                  <tr>
                    <th className="px-6 py-3 font-medium">Pelanggan</th>
                    <th className="px-6 py-3 font-medium">Total</th>
                    <th className="px-6 py-3 font-medium">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.pendingOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">{order.customer_name}</td>
                      <td className="px-6 py-4 font-medium">Rp {Number(order.total).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-foreground/60">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
