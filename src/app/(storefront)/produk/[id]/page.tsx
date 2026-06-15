import type { Metadata } from 'next';
import Image from 'next/image';
import { IconArrowLeft, IconLeaf } from '@tabler/icons-react';
import Link from 'next/link';
import { getProductById, getSettings } from '@/lib/api';
import AddToCartButton from '@/components/ui/AddToCartButton';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  try {
    const product = await getProductById(params.id);
    if (!product) return { title: 'Produk Tidak Ditemukan - PI opung' };
    return {
      title: `${product.name} - PI opung`,
      description: product.description || `Beli ${product.name} segar di PI opung. Harga Rp ${product.price.toLocaleString('id-ID')}.`,
      openGraph: {
        title: `${product.name} - PI opung`,
        description: product.description || `Beli ${product.name} segar.`,
        images: product.images?.[0] ? [{ url: product.images[0] }] : [],
      },
    };
  } catch {
    return { title: 'Produk Tidak Ditemukan - PI opung' };
  }
}

export default async function ProductDetail(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const id = params.id;
  
  let product = null;
  let waNumber = '6281234567890';

  try {
    const [fetchedProduct, settings] = await Promise.all([
      getProductById(id),
      getSettings()
    ]);
    product = fetchedProduct;
    if (settings.wa_number) waNumber = settings.wa_number;
  } catch (err) {
    console.error("Failed to fetch product:", err);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/produk" className="inline-flex items-center gap-2 text-foreground/70 hover:text-primary mb-6">
        <IconArrowLeft size={20} /> Kembali ke Produk
      </Link>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Images */}
        <div className="w-full md:w-1/2">
          <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-md bg-muted">
            {product.images && product.images.length > 0 ? (
              <Image 
                src={product.images[0]} 
                alt={product.name} 
                fill 
                sizes="(max-width: 768px) 100vw, 50vw" 
                className="object-cover" 
                priority 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/5">
                <IconLeaf size={64} className="text-primary/20" />
              </div>
            )}
          </div>
          {/* Note: We could add a client component for image gallery if there are multiple images, 
              but keeping it simple with first image for now since AddToCartButton is separated. */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <div key={idx} className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 ${idx === 0 ? 'border-primary' : 'border-transparent'}`}>
                  <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2">
          <div className="text-sm text-primary font-medium mb-2">
            {product.categories?.name || 'Uncategorized'}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>
          <div className="text-3xl font-bold text-accent mb-6">Rp {product.price.toLocaleString('id-ID')}</div>
          
          <div className="prose prose-sm text-foreground/80 mb-6 border-b border-border pb-6 max-w-none">
            <p className="whitespace-pre-wrap">{product.description || 'Tidak ada deskripsi produk.'}</p>
            <ul className="mt-4 space-y-1">
              <li><strong>Berat Estimasi:</strong> {product.weight} kg</li>
              <li><strong>Stok Tersedia:</strong> {product.stock > 0 ? product.stock : <span className="text-red-500 font-bold">Habis</span>}</li>
            </ul>
          </div>

          <AddToCartButton 
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              weight: product.weight,
              stock: product.stock,
              image: product.images?.[0] || ''
            }} 
            waNumber={waNumber} 
          />
        </div>
      </div>
    </div>
  );
}
