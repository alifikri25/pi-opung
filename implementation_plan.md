# Rencana Perapihan Aplikasi PI opung (Toko Pisang)

## Ringkasan Proyek
Aplikasi ini adalah **toko online pisang** berbasis Next.js 16 + Supabase + Zustand + TailwindCSS 4. Terdapat halaman publik (beranda, produk, keranjang, checkout) dan panel admin (dashboard, produk, pesanan, pengaturan).

## Hasil Testing

### ✅ Build Test
- `next build` berhasil tanpa error TypeScript maupun compile error.
- Semua halaman berhasil di-generate secara static.

### ❌ Masalah yang Ditemukan

---

## Kategori Masalah & Analisis

### 🔴 Masalah 1: Semua Data Hardcoded (Mock Data) — Supabase Tidak Terpakai

**File terdampak:**
- [page.tsx (home)](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/page.tsx) → `categories` dan `featuredProducts` hardcoded
- [page.tsx (produk)](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/produk/page.tsx) → `allProducts` hardcoded
- [page.tsx (produk detail)](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/produk/%5Bid%5D/page.tsx) → `product` hardcoded (selalu menampilkan Pisang Barangan apapun ID-nya!)
- [page.tsx (admin dashboard)](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/admin/page.tsx) → statistik hardcoded
- [page.tsx (admin produk)](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/admin/produk/page.tsx) → tabel produk hardcoded
- [page.tsx (admin pesanan)](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/admin/pesanan/page.tsx) → `mockOrders` hardcoded

**Masalah:** Supabase sudah dikonfigurasi tapi tidak ada satupun halaman yang mengambil data dari database. Semua data statis/mock.

**Rencana perbaikan:** Koneksikan semua halaman ke Supabase. Buat helper functions untuk CRUD operations dan gunakan data real dari database.

---

### 🔴 Masalah 2: Admin Panel Tanpa Proteksi Autentikasi

**File terdampak:**
- [layout.tsx (admin)](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/admin/layout.tsx) → tidak ada auth check
- [page.tsx (login)](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/login/page.tsx) → hanya `alert()`, tidak mengautentikasi

**Masalah:** Siapapun bisa mengakses `/admin` tanpa login. Tombol "Keluar" di sidebar tidak berfungsi.

**Rencana perbaikan:** Implementasi Supabase Auth pada halaman login, dan tambahkan auth guard pada admin layout.

---

### 🟡 Masalah 3: Halaman Broken / Dead Links

| Link | Dari | Masalah |
|------|------|---------|
| `/kategori` | Home, BottomNav | ❌ Halaman tidak ada (404) |
| `/kategori/{slug}` | Home (kategori card) | ❌ Halaman tidak ada (404) |
| `/tentang` | Footer | ❌ Halaman tidak ada (404) |

**Rencana perbaikan:** Hapus link ke halaman yang belum ada, atau arahkan ke halaman yang relevan (misalnya `/kategori` → `/produk`).

---

### 🟡 Masalah 4: Zustand Hydration Mismatch

**File terdampak:**
- [CartBadge.tsx](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/components/ui/CartBadge.tsx)
- [page.tsx (cart)](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/cart/page.tsx)
- [page.tsx (checkout)](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/checkout/page.tsx)

**Masalah:** Zustand `persist` middleware menyimpan state di localStorage. Saat SSR, server render `0` item tapi client bisa punya items → **hydration mismatch warning** di console.

**Rencana perbaikan:** Tambahkan hydration check di komponen yang menggunakan cart store.

---

### 🟡 Masalah 5: Admin Layout Konflik dengan Root Layout

**File terdampak:**
- [layout.tsx (root)](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/layout.tsx) → Navbar + Footer + BottomNav selalu tampil
- [layout.tsx (admin)](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/admin/layout.tsx) → punya sidebar sendiri

**Masalah:** Halaman admin menampilkan **Navbar toko** + **Footer toko** + **BottomNav mobile** + **Sidebar admin** sekaligus! UI sangat berantakan karena layout tumpang tindih.

**Rencana perbaikan:** Buat conditional rendering di root layout, atau gunakan route group untuk memisahkan layout admin dari layout publik.

---

### 🟠 Masalah 6: Kualitas Kode & UX Issues

| No | Issue | File | Detail |
|----|-------|------|--------|
| 1 | Import tidak teratur | [layout.tsx (root)](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/layout.tsx) | Import statement ada di tengah file (L15-17), seharusnya di atas |
| 2 | Search bar non-fungsional | [Navbar.tsx](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/components/layout/Navbar.tsx) | Input search tidak punya logic apapun |
| 3 | Filter non-fungsional | [page.tsx (produk)](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/produk/page.tsx) | Tombol filter dan search tidak berfungsi |
| 4 | Produk detail selalu sama | [page.tsx [id]](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/produk/%5Bid%5D/page.tsx) | Parameter `[id]` tidak dipakai, selalu tampilkan produk yang sama |
| 5 | `alert()` untuk feedback | Banyak file | UX jelek, harusnya pakai toast notification |
| 6 | No loading/error states | Semua halaman | Tidak ada skeleton loading atau error boundary |
| 7 | No `sizes` pada Image di Cart | [page.tsx (cart)](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/cart/page.tsx#L36) | `<Image>` tanpa prop `sizes` |
| 8 | Ongkir tidak dihitung | [page.tsx (checkout)](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/checkout/page.tsx) | Checkout tidak menghitung ongkos kirim |
| 9 | Button admin tanpa fungsi | Admin produk, admin pesanan | Tombol edit, hapus, proses hanya markup, tidak ada handler |
| 10 | WA number hardcoded | [page.tsx (home)](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/page.tsx), [page.tsx [id]](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/produk/%5Bid%5D/page.tsx) | Nomor WA hardcoded, tidak dari settings |
| 11 | Missing TypeScript types | Beberapa file | Tidak ada type definitions untuk data models |

---

## Rencana Perapihan — Arah & Prioritas

> [!IMPORTANT]
> Karena koneksi Supabase memerlukan database yang sudah di-setup dan migrasi schema, saya akan fokus pada **perbaikan kode yang bisa langsung diterapkan tanpa tergantung database**. Integrasi Supabase penuh akan ditandai sebagai TODO yang siap dikerjakan setelah database ready.

### Fase 1: Fix Layout Conflict (Prioritas Tertinggi ⬆️)
**Alasan:** Layout yang tumpang tindih membuat admin panel tidak usable sama sekali.
- Buat route group `(storefront)` dan `(admin)` untuk memisahkan layout
- Root layout hanya berisi html/body wrapper
- Storefront layout: Navbar + Footer + BottomNav
- Admin layout: Sidebar + Header (tanpa navbar/footer toko)

#### [MODIFY] [layout.tsx (root)](file:///c:/Users/aliif/.gemini/antigravity-ide/scratch/pi-opung/src/app/layout.tsx)
- Hapus Navbar, Footer, BottomNav dari root layout
- Hanya berisi html, body, font, dan global styling

#### [NEW] `src/app/(storefront)/layout.tsx`
- Pindahkan Navbar, Footer, BottomNav ke sini

#### Move semua halaman publik ke `(storefront)/`:
- `page.tsx` → `(storefront)/page.tsx`
- `produk/` → `(storefront)/produk/`
- `cart/` → `(storefront)/cart/`
- `checkout/` → `(storefront)/checkout/`
- `login/` → `(storefront)/login/`

---

### Fase 2: Fix Dead Links & Broken Pages
**Alasan:** Link 404 memberikan kesan aplikasi belum jadi / rusak.
- Ubah link `/kategori` di BottomNav → `/produk`
- Ubah link `/kategori` dan `/kategori/{slug}` di Home → `/produk`
- Ubah link `/tentang` di Footer → hapus atau buat halaman sederhana

---

### Fase 3: Fix Hydration Mismatch
**Alasan:** Console penuh warning, UX flicker saat load pertama.
- Tambahkan hook `useHydration` atau `mounted` state
- CartBadge, Cart page, dan Checkout page render kosong dulu sampai hydrated

---

### Fase 4: Buat Type Definitions & Data Layer
**Alasan:** Kode lebih maintainable dan siap koneksi ke Supabase.
- Buat `src/types/index.ts` dengan interface Product, Category, Order, dll
- Buat `src/lib/data.ts` untuk centralize mock data (single source of truth)
- Refactor semua halaman untuk pakai centralized data

---

### Fase 5: Perbaikan UX & Kualitas Kode
**Alasan:** Polish agar aplikasi terasa profesional.
- Ganti `alert()` dengan toast notification component
- Rapihkan import statements
- Tambahkan `sizes` prop pada semua `<Image>`
- Fix produk detail agar membaca parameter `[id]`
- Tambahkan loading skeleton pada halaman
- Buat search & filter fungsional (client-side untuk data mock)

---

### Fase 6: Admin Panel Enhancement
**Alasan:** Admin panel saat ini hanya tampilan tanpa fungsionalitas.
- Tambahkan handler untuk tombol edit/hapus/proses
- Buat modal dialog untuk tambah/edit produk
- Filter pesanan fungsional
- Tombol "Keluar" diarahkan ke `/login`

---

## Verification Plan

### Automated Tests
- `next build` — pastikan tidak ada error build
- Manual cek setiap route dari browser

### Manual Verification
- Navigasi semua halaman, tidak ada 404 untuk link internal
- Admin panel tidak menampilkan Navbar/Footer toko
- Tidak ada hydration mismatch warning di console
- Cart add/remove/quantity update berfungsi
- Checkout flow via WhatsApp berfungsi
- Search dan filter di halaman produk berfungsi

---

## Open Questions

> [!IMPORTANT]
> **Pertanyaan untuk Anda:**
> 1. Apakah database Supabase sudah di-setup dengan schema yang ada di `schema.sql`? Jika sudah, saya bisa langsung koneksikan data dari Supabase.
> 2. Apakah ada data produk real yang sudah dimasukkan ke Supabase?
> 3. Untuk autentikasi admin, apakah ingin pakai Supabase Auth atau cukup password sederhana?
> 4. Prioritas mana yang ingin dikerjakan duluan? Saya merekomendasikan **Fase 1-5** dikerjakan sekarang (tanpa memerlukan Supabase ready).
