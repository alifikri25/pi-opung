'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { getSettings, updateSetting } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function AdminPengaturan() {
  const [settings, setSettings] = useState({
    store_name: '',
    wa_number: '',
    address: '',
    operating_hours: '',
    store_lat: '',
    store_lng: '',
    shipping_fee_flat: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await getSettings();
      setSettings({
        store_name: data.store_name ?? 'PI opung',
        wa_number: data.wa_number ?? '',
        address: data.address ?? '',
        operating_hours: data.operating_hours ?? '',
        store_lat: data.store_lat ?? '-6.2088',
        store_lng: data.store_lng ?? '106.8456',
        shipping_fee_flat: data.shipping_fee_flat ?? '15000',
      });
    } catch (err) {
      console.error('Gagal memuat pengaturan:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await Promise.all(
        Object.entries(settings).map(([key, value]) => updateSetting(key, value))
      );
      showToast('Pengaturan berhasil disimpan!');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : (err as any)?.message || JSON.stringify(err);
      console.error('Gagal menyimpan pengaturan:', errMsg, err);
      showToast(`Gagal menyimpan: ${errMsg}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Pengaturan Toko</h1>
        <div className="max-w-2xl space-y-4">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 animate-skeleton"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Pengaturan Toko</h1>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        <div className="bg-background rounded-xl border border-border p-6 shadow-sm space-y-5">
          <h2 className="font-bold text-lg text-foreground border-b border-border pb-3">Informasi Toko</h2>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nama Toko</label>
            <input name="store_name" value={settings.store_name} onChange={handleChange} type="text" className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nomor WhatsApp (Format: 62xxxx)</label>
            <input name="wa_number" value={settings.wa_number} onChange={handleChange} type="text" className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Alamat Toko</label>
            <textarea name="address" value={settings.address} onChange={handleChange} rows={2} className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Jam Operasional</label>
            <input name="operating_hours" value={settings.operating_hours} onChange={handleChange} type="text" className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Latitude Toko</label>
              <input name="store_lat" value={settings.store_lat} onChange={handleChange} type="text" className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="-6.2088" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Longitude Toko</label>
              <input name="store_lng" value={settings.store_lng} onChange={handleChange} type="text" className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="106.8456" />
            </div>
          </div>
        </div>

        <div className="bg-background rounded-xl border border-border p-6 shadow-sm space-y-5">
          <h2 className="font-bold text-lg text-foreground border-b border-border pb-3">Pengiriman</h2>
          <p className="text-sm text-foreground/60">Kelola zona ongkir di menu <Link href="/admin/ongkir" className="text-primary hover:underline">Ongkir</Link></p>
        </div>

        <button 
          type="submit"
          disabled={saving}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          <IconDeviceFloppy size={20} />
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </form>
    </div>
  );
}
