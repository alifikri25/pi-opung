'use client';

import { useEffect, useState } from 'react';
import { IconPlus, IconEdit, IconTrash, IconTruck, IconX } from '@tabler/icons-react';
import { getAllShippingZones, createShippingZone, updateShippingZone, deleteShippingZone, type ShippingZone } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const emptyForm = {
  zone_name: '',
  districts: '',
  fee: '',
  estimated_days: '',
};

export default function AdminOngkir() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => { loadZones(); }, []);

  async function loadZones() {
    try {
      const data = await getAllShippingZones();
      setZones(data);
    } catch (err) {
      showToast('Gagal memuat data ongkir', 'error');
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  }

  function openEditForm(zone: ShippingZone) {
    setEditingId(zone.id);
    setFormData({
      zone_name: zone.zone_name,
      districts: zone.districts.join(', '),
      fee: String(zone.fee),
      estimated_days: zone.estimated_days ?? '',
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        zone_name: formData.zone_name,
        districts: formData.districts.split(',').map((d) => d.trim()).filter(Boolean),
        fee: Number(formData.fee),
        estimated_days: formData.estimated_days,
      };

      if (editingId) {
        await updateShippingZone(editingId, payload);
        showToast('Zona ongkir berhasil diperbarui!');
      } else {
        await createShippingZone(payload);
        showToast('Zona ongkir berhasil ditambahkan!');
      }

      closeForm();
      await loadZones();
    } catch (err) {
      showToast('Gagal menyimpan zona ongkir', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteShippingZone(deleteId);
      showToast('Zona ongkir berhasil dihapus!');
      setDeleteId(null);
      await loadZones();
    } catch (err) {
      showToast('Gagal menghapus zona', 'error');
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-foreground">Manajemen Ongkos Kirim</h1>
        <button onClick={openAddForm} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors">
          <IconPlus size={20} /> Tambah Zona
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-skeleton"></div>)}
        </div>
      ) : zones.length === 0 ? (
        <div className="bg-background rounded-xl border border-border p-12 text-center">
          <IconTruck size={48} className="mx-auto mb-4 text-foreground/30" />
          <p className="text-foreground/50 mb-4">Belum ada zona ongkir. Tambahkan zona pengiriman pertama!</p>
          <button onClick={openAddForm} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <IconPlus size={18} className="inline mr-1" /> Tambah Zona
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {zones.map((zone) => (
            <div key={zone.id} className="bg-background rounded-xl border border-border p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-foreground">{zone.zone_name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => openEditForm(zone)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <IconEdit size={16} />
                  </button>
                  <button onClick={() => setDeleteId(zone.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>
              <div className="text-2xl font-bold text-accent mb-2">Rp {Number(zone.fee).toLocaleString('id-ID')}</div>
              {zone.estimated_days && <div className="text-xs text-foreground/50 mb-2">Estimasi: {zone.estimated_days}</div>}
              <div className="text-xs text-foreground/60">
                <span className="font-medium text-foreground/80">Kecamatan:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {zone.districts.map((d, i) => (
                    <span key={i} className="bg-muted px-2 py-0.5 rounded text-xs">{d}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-overlay-in p-4">
          <div className="bg-background rounded-2xl border border-border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10 rounded-t-2xl">
              <h2 className="text-xl font-bold text-foreground">{editingId ? 'Edit Zona Ongkir' : 'Tambah Zona Ongkir'}</h2>
              <button onClick={closeForm} className="p-2 text-foreground/50 hover:text-foreground rounded-lg hover:bg-muted transition-colors">
                <IconX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nama Zona *</label>
                <input name="zone_name" value={formData.zone_name} onChange={handleChange} required type="text" className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Zona 1 (Kota)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Kecamatan *</label>
                <textarea name="districts" value={formData.districts} onChange={handleChange} required rows={3} className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Kecamatan A, Kecamatan B, Kecamatan C" />
                <p className="text-xs text-foreground/50 mt-1">Pisahkan dengan koma</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Ongkos Kirim (Rp) *</label>
                  <input name="fee" value={formData.fee} onChange={handleChange} required type="number" min="0" className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="15000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Estimasi</label>
                  <input name="estimated_days" value={formData.estimated_days} onChange={handleChange} type="text" className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="1-2 hari" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Zona'}
                </button>
                <button type="button" onClick={closeForm} className="px-6 py-3 rounded-xl font-medium border border-border text-foreground hover:bg-muted transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-overlay-in p-4">
          <div className="bg-background rounded-2xl border border-border shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-foreground mb-2">Hapus Zona Ini?</h3>
            <p className="text-foreground/60 text-sm mb-6">Data yang dihapus tidak bisa dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-bold hover:bg-red-600 transition-colors">Ya, Hapus</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl font-medium border border-border text-foreground hover:bg-muted transition-colors">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
