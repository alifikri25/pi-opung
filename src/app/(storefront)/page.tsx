import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconBrandWhatsapp, IconLeaf } from "@tabler/icons-react";
import { getCategories, getFeaturedProducts, getSettings } from "@/lib/api";
import type { Category, ProductWithCategory } from "@/types";

export const revalidate = 60;

export default async function Home() {
  let categories: Category[] = [];
  let products: ProductWithCategory[] = [];
  let waNumber = "6281234567890";

  try {
    const [cats, prods, settings] = await Promise.all([
      getCategories(),
      getFeaturedProducts(4),
      getSettings(),
    ]);
    categories = cats;
    products = prods;
    if (settings.wa_number) waNumber = settings.wa_number;
  } catch {
    // Supabase belum siap — tampilkan halaman dengan empty state
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary/10 py-12 md:py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-4">
              Pisang Segar <br />
              <span className="text-primary">Langsung dari Kebun</span>
            </h1>
            <p className="text-lg text-foreground/80 mb-8 max-w-lg">
              Kami menyediakan berbagai jenis pisang pilihan terbaik untuk
              kebutuhan harian Anda. Belanja mudah, langsung dikirim ke rumah!
            </p>
            <Link
              href="/produk"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold text-lg hover:bg-accent transition inline-flex items-center gap-2"
            >
              Belanja Sekarang <IconArrowRight size={20} />
            </Link>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0 relative z-10 flex justify-center">
            <div className="w-64 h-64 md:w-80 md:h-80 bg-primary/20 rounded-full absolute -z-10 blur-3xl" />
            <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl rotate-3">
              <Image
                src="https://images.unsplash.com/photo-1543218024-57a70143c369?q=80&w=600&auto=format&fit=crop"
                alt="Pisang Segar"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Kategori Section */}
      {categories.length > 0 && (
        <section className="py-12 container mx-auto px-4">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Kategori Pilihan
            </h2>
            <Link
              href="/produk"
              className="text-primary font-medium hover:text-accent flex items-center"
            >
              Lihat Semua <IconArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/produk?kategori=${cat.slug}`}
                className="group block"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-md bg-muted">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                      <IconLeaf size={48} className="text-primary/40" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                    <h3 className="font-bold text-white text-sm md:text-base">
                      {cat.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Produk Terlaris */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Produk Terlaris
            </h2>
            {products.length > 0 && (
              <Link
                href="/produk"
                className="text-primary font-medium hover:text-accent flex items-center"
              >
                Lihat Semua <IconArrowRight size={16} className="ml-1" />
              </Link>
            )}
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <Link
                  href={`/produk/${product.id}`}
                  key={product.id}
                  className="bg-background rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border group block"
                >
                  <div className="relative aspect-square bg-muted">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IconLeaf size={48} className="text-primary/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-foreground line-clamp-2 mb-2 min-h-[3rem]">
                      {product.name}
                    </h3>
                    <div className="text-accent font-bold text-lg mb-4">
                      Rp {product.price.toLocaleString("id-ID")}
                    </div>
                    <span className="w-full bg-primary/10 text-primary font-semibold py-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors block text-center">
                      Lihat Detail
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-background rounded-2xl border border-border">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <IconLeaf size={40} className="text-primary/50" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Produk Segera Hadir
              </h3>
              <p className="text-foreground/60 max-w-md mx-auto">
                Kami sedang mempersiapkan produk terbaik untuk Anda. Silakan cek
                kembali nanti atau hubungi kami via WhatsApp.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Floating WA Button */}
      <a
        href={`https://wa.me/${waNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-50 flex items-center justify-center"
        aria-label="Hubungi via WhatsApp"
      >
        <IconBrandWhatsapp size={32} />
      </a>
    </div>
  );
}
