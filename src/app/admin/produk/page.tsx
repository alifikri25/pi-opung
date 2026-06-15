'use client';

import { useEffect, useState } from 'react';
import { IconPlus, IconEdit, IconTrash, IconX, IconUpload } from '@tabler/icons-react';
import Image from 'next/image';
import { getAllProducts, createProduct, updateProduct, deleteProduct, getCategories, uploadImage } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import type { ProductWithCategory, Category } from '@/types';

const emptyForm = {
  name: '',
  price: '',
  weight: '',
  stock: '',
  category_id: '',
  description: '',
  is_active: true,
};

export default function AdminProduk() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [prods, cats] = await Promise.all([getAllProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Gagal memuat data:', err);
      showToast('Gagal memuat data produk', 'error');
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditingId(null);
    setFormData(emptyForm);
    setImageFiles([]);
    setExistingImages([]);
    setShowForm(true);
  }

  function openEditForm(product: ProductWithCategory) {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: String(product.price),
      weight: String(product.weight),
      stock: String(product.stock),
      category_id: product.category_id ?? '',
      description: product.description ?? '',
      is_active: product.is_active,
    });
    setExistingImages(product.images ?? []);
    setImageFiles([]);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
    setImageFiles([]);
    setExistingImages([]);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setImageFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  }

  function removeExistingImage(idx: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function removeNewImage(idx: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      // Upload new images
      const uploadedUrls: string[] = [];
      for (const file of imageFiles) {
        try {
          const url = await uploadImage(file);
          uploadedUrls.push(url);
        } catch (err) {
          console.error('Gagal upload gambar:', err);
          showToast('Gagal upload gambar. Pastikan bucket "product-images" sudah dibuat di Supabase Storage.', 'error');
          setSaving(false);
          return;
        }
      }

      const allImages = [...existingImages, ...uploadedUrls];

      const payload = {
        name: formData.name,
        price: Number(formData.price),
        weight: Number(formData.weight),
        stock: Number(formData.stock),
        category_id: formData.category_id || null,
        description: formData.description,
        is_active: formData.is_active,
        images: allImages,
      };

      if (editingId) {
        await updateProduct(editingId, payload);
        showToast('Produk berhasil diperbarui!');
      } else {
        await createProduct(payload);
        showToast('Produk berhasil ditambahkan!');
      }

      closeForm();
      await loadData();
    } catch (err) {
      console.error('Gagal menyimpan produk:', err);
      showToast('Gagal menyimpan produk', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId);
      showToast('Produk berhasil dihapus!');
      setDeleteId(null);
      await loadData();
    } catch (err) {
      console.error('Gagal menghapus produk:', err);
      showToast('Gagal menghapus produk', 'error');
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-foreground">Manajemen Produk</h1>
        <button onClick={openAddForm} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors">
          <IconPlus size={20} /> Tambah Produk
        </button>
      </div>

      {/* Product Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-skeleton"></div>)}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-background rounded-xl border border-border p-12 text-center">
          <p className="text-foreground/50 mb-4">Belum ada produk. Mulai tambahkan produk pertama Anda!</p>
          <button onClick={openAddForm} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <IconPlus size={18} className="inline mr-1 -mt-0.5" /> Tambah Produk
          </button>
        </div>
      ) : (
        <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-foreground/70">
                <tr>
                  <th className="px-6 py-4 font-medium">Produk</th>
                  <th className="px-6 py-4 font-medium">Kategori</th>
                  <th className="px-6 py-4 font-medium">Harga</th>
                  <th className="px-6 py-4 font-medium">Stok</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                          {product.images?.[0] ? (
                            <Image src={product.images[0]} alt="" fill sizes="40px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-primary/10" />
                          )}
                        </div>
                        <span className="font-medium text-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground/70">{product.categories?.name ?? '-'}</td>
                    <td className="px-6 py-4">Rp {Number(product.price).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {product.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditForm(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" aria-label={`Edit ${product.name}`}>
                          <IconEdit size={18} />
                        </button>
                        <button onClick={() => setDeleteId(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" aria-label={`Hapus ${product.name}`}>
                          <IconTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-overlay-in p-4">
          <div className="bg-background rounded-2xl border border-border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10 rounded-t-2xl">
              <h2 className="text-xl font-bold text-foreground">
                {editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
              <button onClick={closeForm} className="p-2 text-foreground/50 hover:text-foreground rounded-lg hover:bg-muted transition-colors">
                <IconX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nama Produk *</label>
                <input name="name" value={formData.name} onChange={handleChange} required type="text" className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Pisang Barangan Super" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Harga (Rp) *</label>
                  <input name="price" value={formData.price} onChange={handleChange} required type="number" min="0" className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="25000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Berat (kg) *</label>
                  <input name="weight" value={formData.weight} onChange={handleChange} required type="number" min="0" step="0.1" className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="1.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Stok *</label>
                  <input name="stock" value={formData.stock} onChange={handleChange} required type="number" min="0" className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="10" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Kategori</label>
                  <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Tanpa Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Deskripsi</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Deskripsi produk..." />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Gambar Produk</label>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-3">
                    {existingImages.map((url, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                        <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                        <button type="button" onClick={() => removeExistingImage(idx)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <IconX size={18} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Files Preview */}
                {imageFiles.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-3">
                    {imageFiles.map((file, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border border-dashed group">
                        <Image src={URL.createObjectURL(file)} alt="" fill sizes="80px" className="object-cover" />
                        <button type="button" onClick={() => removeNewImage(idx)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <IconX size={18} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors text-foreground/60 hover:text-primary">
                  <IconUpload size={20} />
                  <span className="text-sm font-medium">Pilih gambar...</span>
                  <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4 accent-primary" />
                <label htmlFor="is_active" className="text-sm text-foreground">Produk aktif (tampilkan di toko)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
                <button type="button" onClick={closeForm} className="px-6 py-3 rounded-xl font-medium border border-border text-foreground hover:bg-muted transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-overlay-in p-4">
          <div className="bg-background rounded-2xl border border-border shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-foreground mb-2">Hapus Produk?</h3>
            <p className="text-foreground/60 text-sm mb-6">Produk yang dihapus tidak bisa dikembalikan. Yakin ingin melanjutkan?</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-bold hover:bg-red-600 transition-colors">
                Ya, Hapus
              </button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl font-medium border border-border text-foreground hover:bg-muted transition-colors">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
