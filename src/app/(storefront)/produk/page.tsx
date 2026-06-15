import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconLeaf, IconSearch, IconAlertCircle } from "@tabler/icons-react";
import { getProducts, getCategories } from "@/lib/api";
import type { ProductWithCategory, Category } from "@/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Semua Produk - PI opung",
  description: "Lihat semua produk pisang segar kami. Berbagai jenis pisang berkualitas dengan harga terbaik.",
}; // ISR cache 60s

export default async function ProductsPage(
  props: {
    searchParams: Promise<{ kategori?: string; q?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  let products: ProductWithCategory[] = [];
  let categories: Category[] = [];
  let error = false;

  try {
    const [fetchedProducts, fetchedCategories] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);
    products = fetchedProducts;
    categories = fetchedCategories;
  } catch (err) {
    console.error("Failed to fetch products:", err);
    error = true;
  }

  // Filter products based on searchParams
  const activeCategory = searchParams.kategori;
  const searchQuery = searchParams.q?.toLowerCase();

  let filteredProducts = products;

  if (activeCategory) {
    filteredProducts = filteredProducts.filter(
      (p) => p.categories?.slug === activeCategory
    );
  }

  if (searchQuery) {
    filteredProducts = filteredProducts.filter(
      (p) => 
        p.name.toLowerCase().includes(searchQuery) ||
        p.description?.toLowerCase().includes(searchQuery)
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Semua Produk</h1>
          <p className="text-foreground/70 mt-1">
            {activeCategory 
              ? `Kategori: ${categories.find(c => c.slug === activeCategory)?.name || activeCategory}`
              : "Temukan pisang segar pilihan Anda"
            }
          </p>
        </div>
        
        {/* Simple Search Form */}
        <form action="/produk" className="flex w-full md:w-auto gap-2">
          {activeCategory && <input type="hidden" name="kategori" value={activeCategory} />}
          <div className="relative flex-1 md:w-64">
            <input 
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Cari produk..." 
              className="w-full py-2 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-foreground/50">
              <IconSearch size={18} />
            </button>
          </div>
          {/* Reset Filters if any active */}
          {(activeCategory || searchQuery) && (
            <Link 
              href="/produk" 
              className="px-4 py-2 bg-muted text-foreground/80 hover:bg-border rounded-lg text-sm flex items-center transition-colors"
            >
              Reset
            </Link>
          )}
        </form>
      </div>

      {error ? (
        <div className="text-center py-12 bg-red-50 text-red-600 rounded-xl border border-red-200">
          <IconAlertCircle size={48} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold">Gagal memuat produk</h2>
          <p>Terdapat masalah saat mengambil data dari database.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-background rounded-2xl border border-border">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <IconLeaf size={40} className="text-primary/50" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Produk Tidak Ditemukan</h3>
          <p className="text-foreground/60 max-w-md mx-auto">
            {products.length === 0 
              ? "Toko belum menambahkan produk apapun. Silakan kembali lagi nanti." 
              : "Tidak ada produk yang cocok dengan pencarian atau filter Anda."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <Link 
              href={`/produk/${product.id}`} 
              key={product.id} 
              className="bg-background rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-border group block"
            >
              <div className="relative aspect-square bg-muted">
                {product.images?.[0] ? (
                  <Image 
                    src={product.images[0]} 
                    alt={product.name} 
                    fill 
                    sizes="(max-width: 768px) 50vw, 25vw" 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <IconLeaf size={32} className="text-primary/30" />
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col h-full">
                <div className="text-xs text-primary font-medium mb-1">
                  {product.categories?.name || 'Uncategorized'}
                </div>
                <h3 className="font-medium text-foreground line-clamp-2 mb-2">
                  {product.name}
                </h3>
                <div className="mt-auto">
                  <div className="text-accent font-bold text-lg mb-2">
                    Rp {product.price.toLocaleString('id-ID')}
                  </div>
                  <div className="text-sm">
                    {product.stock > 0 
                      ? <span className="text-foreground/60">Stok: {product.stock}</span>
                      : <span className="text-red-500 font-medium">Habis</span>
                    }
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
