'use client';

import { useCartStore } from '@/store/cartStore';
import { useState, useEffect } from 'react';
import { IconArrowLeft, IconBrandWhatsapp, IconLoader2 } from '@tabler/icons-react';
import Link from 'next/link';
import { createOrder, getSettings } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [shippingFee, setShippingFee] = useState(0);
  const [storeSettings, setStoreSettings] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
    shippingMethod: 'delivery'
  });

  useEffect(() => {
    setMounted(true);
    getSettings().then(settings => {
      setStoreSettings(settings);
      setShippingFee(Number(settings.shipping_fee_flat || 0));
    }).catch(console.error);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const isDelivery = formData.shippingMethod === 'delivery';
      const orderTotal = getTotalPrice() + (isDelivery ? shippingFee : 0);
      
      const newOrder = await createOrder({
        customer_name: formData.name,
        phone: formData.phone,
        address: isDelivery ? formData.address : 'Diambil Sendiri',
        notes: formData.notes,
        total: orderTotal,
      }, items.map(item => ({
        product_id: item.id,
        qty: item.qty,
        price_snapshot: item.price
      })));

      const orderId = newOrder.id.split('-')[0].toUpperCase();

      let orderText = `Halo *${storeSettings.store_name || 'PI opung'}*! 👋\nSaya ingin memesan produk dengan detail berikut:\n\n`;
      orderText += `*📦 ID PESANAN: #ORD-${orderId}*\n\n`;
      orderText += `*📝 RINCIAN PESANAN:*\n`;
      items.forEach(item => {
        orderText += `- ${item.qty}x ${item.name} (Rp ${item.price.toLocaleString('id-ID')})\n`;
      });
      orderText += `--------------------------------\n`;
      orderText += `Subtotal: Rp ${getTotalPrice().toLocaleString('id-ID')}\n`;
      if (isDelivery) {
         orderText += `Ongkos Kirim: Rp ${shippingFee.toLocaleString('id-ID')}\n`;
      }
      orderText += `*TOTAL: Rp ${orderTotal.toLocaleString('id-ID')}*\n\n`;
      
      orderText += `*👤 DATA PENGIRIMAN:*\n`;
      orderText += `Nama: ${formData.name}\n`;
      orderText += `No. WA: ${formData.phone}\n`;
      orderText += `Metode: ${isDelivery ? 'Antar ke Alamat' : 'Ambil Sendiri di Toko'}\n`;
      if (isDelivery) {
        orderText += `Alamat: ${formData.address}\n`;
      }
      if (formData.notes) {
        orderText += `Catatan: ${formData.notes}\n`;
      }
      orderText += `\nMohon info untuk total pembayaran dan nomor rekeningnya. Terima kasih! 🙏`;

      const waNumber = storeSettings.wa_number || '6281234567890';
      const cleanWa = waNumber.replace(/\D/g, '');
      const finalWa = cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa;
      
      const waUrl = `https://wa.me/${finalWa}?text=${encodeURIComponent(orderText)}`;
      
      clearCart();
      window.open(waUrl, '_blank');
      // Redirect to home after 1 second so they aren't stuck on empty checkout
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);

    } catch (err) {
      console.error(err);
      showToast('Gagal membuat pesanan. Silakan coba lagi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-8 bg-muted w-48 mx-auto mb-4 rounded"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-4">Keranjang Kosong</h1>
        <Link href="/produk" className="text-primary hover:underline">Kembali Belanja</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl animate-fade-in">
      <Link href="/cart" className="inline-flex items-center gap-2 text-foreground/70 hover:text-primary mb-6">
        <IconArrowLeft size={20} /> Kembali ke Keranjang
      </Link>
      
      <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>
      
      <form onSubmit={handleCheckout} className="space-y-8">
        <div className="bg-background border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-6">Data Pengiriman</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nama Lengkap</label>
              <input required name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Masukkan nama Anda" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nomor WhatsApp</label>
              <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="081234567890" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Metode Pengiriman</label>
              <select name="shippingMethod" value={formData.shippingMethod} onChange={handleInputChange} className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="delivery">Antar ke Alamat (Delivery)</option>
                <option value="pickup">Ambil Sendiri di Toko (Pickup)</option>
              </select>
            </div>
            {formData.shippingMethod === 'delivery' && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-foreground mb-1">Alamat Lengkap</label>
                <textarea required name="address" value={formData.address} onChange={handleInputChange} rows={3} className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Masukkan alamat lengkap pengiriman"></textarea>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Catatan Pesanan (Opsional)</label>
              <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={2} className="w-full py-2.5 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Tingkat kematangan pisang, patokan rumah, dll"></textarea>
            </div>
          </div>
        </div>

        {/* Order Summary Insert */}
        <div className="bg-background border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-4">Ringkasan Pesanan</h2>
          <div className="space-y-3 mb-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-foreground">
                <span>{item.qty}x {item.name}</span>
                <span className="font-medium">Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-foreground/80">
              <span>Subtotal</span>
              <span>Rp {getTotalPrice().toLocaleString('id-ID')}</span>
            </div>
            {formData.shippingMethod === 'delivery' && (
              <div className="flex justify-between text-foreground/80">
                <span>Ongkos Kirim</span>
                <span>Rp {shippingFee.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-foreground pt-2">
              <span>Total</span>
              <span>Rp {(getTotalPrice() + (formData.shippingMethod === 'delivery' ? shippingFee : 0)).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#25D366]/90 transition-colors shadow-lg shadow-[#25D366]/30 text-lg disabled:opacity-70"
        >
          {isSubmitting ? <IconLoader2 className="animate-spin" size={24} /> : <IconBrandWhatsapp size={24} />}
          {isSubmitting ? 'Memproses...' : 'Pesan via WhatsApp'}
        </button>
      </form>
    </div>
  );
}
