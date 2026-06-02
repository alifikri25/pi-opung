'use client';

import { useEffect, useState } from 'react';
import { IconBrandWhatsapp, IconEye, IconX } from '@tabler/icons-react';
import { getOrders, updateOrderStatus } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import type { Order } from '@/types';

const statusColors: Record<string, string> = {
  'Menunggu Konfirmasi': 'bg-yellow-100 text-yellow-700',
  'Diproses': 'bg-blue-100 text-blue-700',
  'Dikirim': 'bg-purple-100 text-purple-700',
  'Selesai': 'bg-green-100 text-green-700',
  'Dibatalkan': 'bg-red-100 text-red-700',
};

const statusOptions = ['Menunggu Konfirmasi', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];

export default function AdminPesanan() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Gagal memuat pesanan:', err);
      showToast('Gagal memuat data pesanan', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast(`Status pesanan diubah ke "${newStatus}"`);
    } catch (err) {
      console.error('Gagal mengubah status:', err);
      showToast('Gagal mengubah status pesanan', 'error');
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders = filterStatus
    ? orders.filter((o) => o.status === filterStatus)
    : orders;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-foreground">Manajemen Pesanan</h1>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-border rounded-lg px-4 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Semua Status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-skeleton"></div>)}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-background rounded-xl border border-border p-12 text-center">
          <p className="text-foreground/50">
            {orders.length === 0 ? 'Belum ada pesanan masuk.' : 'Tidak ada pesanan dengan status ini.'}
          </p>
        </div>
      ) : (
        <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-foreground/70">
                <tr>
                  <th className="px-6 py-4 font-medium">Pelanggan</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Tanggal</th>
                  <th className="px-6 py-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-xs text-foreground/50">{order.phone}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">Rp {Number(order.total).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[order.status] ?? 'bg-gray-100 text-gray-700'} disabled:opacity-60`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-foreground/60">
                      {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setDetailOrder(order)} className="p-2 text-foreground hover:bg-muted rounded-lg transition-colors" title="Lihat Detail">
                          <IconEye size={18} />
                        </button>
                        <a
                          href={`https://wa.me/${order.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-[#25D366] hover:bg-green-50 rounded-lg transition-colors"
                          title="Hubungi via WA"
                        >
                          <IconBrandWhatsapp size={18} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-overlay-in p-4">
          <div className="bg-background rounded-2xl border border-border shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10 rounded-t-2xl">
              <h2 className="text-lg font-bold text-foreground">Detail Pesanan</h2>
              <button onClick={() => setDetailOrder(null)} className="p-2 text-foreground/50 hover:text-foreground rounded-lg hover:bg-muted transition-colors">
                <IconX size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-foreground/50">Pelanggan</span>
                  <p className="font-medium">{detailOrder.customer_name}</p>
                </div>
                <div>
                  <span className="text-foreground/50">No. HP</span>
                  <p className="font-medium">{detailOrder.phone}</p>
                </div>
                <div>
                  <span className="text-foreground/50">Total</span>
                  <p className="font-bold text-accent">Rp {Number(detailOrder.total).toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <span className="text-foreground/50">Status</span>
                  <p><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[detailOrder.status]}`}>{detailOrder.status}</span></p>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-foreground/50">Alamat</span>
                <p className="font-medium">{detailOrder.address || '-'}</p>
              </div>
              {detailOrder.notes && (
                <div className="text-sm">
                  <span className="text-foreground/50">Catatan</span>
                  <p className="font-medium">{detailOrder.notes}</p>
                </div>
              )}
              <div className="text-sm">
                <span className="text-foreground/50">Tanggal Pesan</span>
                <p className="font-medium">{new Date(detailOrder.created_at).toLocaleString('id-ID')}</p>
              </div>
              <a
                href={`https://wa.me/${detailOrder.phone}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#25D366] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#25D366]/90 transition-colors mt-4"
              >
                <IconBrandWhatsapp size={20} /> Hubungi Pelanggan
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
