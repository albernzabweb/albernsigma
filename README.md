# ALNUDIV

Platform sewa elektronik berbahasa Indonesia, tema biru–putih terang dengan gradasi. Next.js App Router, TypeScript, Tailwind, komponen UI berbasis pola shadcn/Radix, Motion, React Three Fiber/Drei, Supabase Auth/Postgres/Storage, Zod, React Hook Form, Lucide, dan Sonner.

**MODE DEMO — Tidak Ada Transaksi Nyata.** Semua harga, testimoni, dan statistik pemasaran diberi label ilustratif. Katalog memuat 18 produk dalam enam kategori. Model 3D kamera dan enam SVG produk adalah ilustrasi prosedural asli, bukan aset fotografi/model berlisensi dari produsen. Tidak ada URL Spline fiktif. Paket Spline disediakan tetapi tidak dimuat karena belum ada scene berlisensi.

## Status penyerahan

- Implementasi seluruh rute publik, pelanggan, dan admin tersedia, termasuk rute edit produk tambahan.
- Pemeriksaan tipe, lint, build produksi, tes PostgreSQL lokal terisolasi, dan browser smoke test disertakan.
- Tanpa environment Supabase, hanya katalog contoh yang aktif. Akun, booking, pembayaran, dan dashboard **tidak dibuat palsu**; membutuhkan Supabase sungguhan.
- Belum terhubung ke proyek Vercel atau Supabase. Belum ada deployment publik yang diverifikasi.
- Tes PostgreSQL menggunakan PGlite dengan schema auth/storage minimal khusus tes. Ini menguji SQL, fungsi, privileges, dan RLS sebenarnya, tetapi bukan verifikasi Supabase hosted, email, Storage hosted, atau contention lintas koneksi PostgreSQL.

## Menjalankan aplikasi

Gunakan Node.js 24 LTS dan npm. Jalankan dari folder yang berisi package.json ini:

```powershell
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

Buka alamat yang dicetak server. `npm run dev` tersedia untuk pengembangan setelah konfigurasi layanan selesai. Jangan jalankan perintah dari folder induk proyek.

## Setup Supabase

1. Buat proyek Supabase milikmu melalui dashboard, atau hubungkan integrasi Supabase pada proyek Vercel yang telah dipilih. Tidak diperlukan Supabase service-role key oleh aplikasi ini.
2. Buat `.env.local` dari `.env.example`. Isi:
   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public client key; bukan service-role key.
   - `NEXT_PUBLIC_SITE_URL`: origin aplikasi tanpa trailing slash; gunakan origin preview/produksi yang benar. Untuk pengembangan lokal, gunakan origin lokal servermu.
3. Jalankan seluruh `supabase/migrations/202610180001_initial.sql` melalui SQL Editor sebagai pemilik database. Setup dapat dijalankan ulang pada struktur ALNUDIV yang cocok. Tabel, data, akun, dan peran yang sudah ada dipertahankan. Struktur tabel atau kebijakan akses yang tidak sesuai akan dihentikan sebelum perubahan; jangan menghapus tabel untuk melewati pemeriksaan ini.
4. Jalankan `supabase/seed.sql`. Seed dapat diulang dan tidak menimpa produk/inventori yang sudah ada.
5. Aktifkan Email/Password di Supabase Auth. Atur Site URL sesuai origin aplikasi. Tambahkan URL redirect tepat `ORIGIN/auth/callback` untuk pengembangan dan produksi. Email confirmation didukung; akun yang belum dikonfirmasi tidak dilewati secara diam-diam.
6. Bucket publik `product-images` dan kebijakan akses dibuat oleh migrasi. Unggahan hanya admin, JPG/PNG/WebP, maksimal 5 MB. SVG lokal adalah ilustrasi bawaan dan tidak diunggah dari pengguna.
7. Jalankan ulang build setelah mengubah environment pada deployment.

Katalog mengambil produk dan inventori dari Supabase saat environment telah diatur. Koneksi yang gagal menampilkan error, bukan diam-diam beralih ke katalog contoh. Detail produk baru hasil admin memperoleh spesifikasi default kosong; spesifikasi produk contoh tersedia pada seed.

## Memberi peran administrator

Daftarkan akun melalui aplikasi **setelah migrasi** dan konfirmasi emailnya. Sebagai pemilik proyek, ambil ID pengguna yang benar dari Supabase Auth, kemudian jalankan di SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = 'UUID-AKUN-ADMIN-YANG-TELAH-DIVERIFIKASI';
```

Untuk mencabut akses, set `role = 'customer'`. Tidak ada password admin bawaan, endpoint promosi peran, atau kepercayaan terhadap `user_metadata.role`. Pengguna hanya boleh memperbarui kolom `name` dan `phone` miliknya. Semua halaman dan operasi admin memeriksa sesi/peran di server; fungsi database memeriksa ulang `is_admin()`.

## Integritas booking

- Satu pesanan memesan satu unit. Tanggal awal dan akhir bersifat inklusif, durasi 1–90 hari; validasi tanggal memakai Asia/Jakarta.
- Subtotal = harga harian server × jumlah hari. Pengiriman demo Rp35.000 atau ambil sendiri gratis. Total awal = subtotal + pengiriman + deposit.
- Harga mingguan ditampilkan sebagai referensi, tidak digunakan diam-diam sebagai diskon checkout.
- `create_booking`, `simulate_payment`, dan `admin_save_product` memakai advisory transaction lock yang sama per produk.
- Ketersediaan menghitung pemakaian puncak **per hari**, bukan menjumlahkan semua pesanan yang hanya sebagian bertumpang tindih.
- Booking unpaid menahan stok 30 menit. Hold kedaluwarsa tidak memakan stok dan tidak dapat dibayar; pelanggan harus membuat pesanan baru. Tidak perlu job cleanup untuk perhitungan stok.
- Harga tersimpan sebagai snapshot server saat booking dibuat; perubahan tarif admin tidak mengubah tagihan pesanan lama.
- Pembayaran demo memverifikasi pemilik pesanan, status, hold, dan stok dalam transaksi. Pembayaran bersifat idempotent dan unique per booking.
- Browser tidak mempunyai izin menulis bookings, inventory, simulated_payments, history, atau role secara langsung. RPC memakai `search_path` kosong dan hak eksekusi eksplisit.
- Pengurangan inventori ditolak jika mengurangi stok di bawah jumlah unit yang sudah direservasi.
- Admin harus mengikuti transisi status yang sah. Cabang ambil sendiri/pengiriman berbeda. Penyelesaian dan pembatalan melepaskan kapasitas reservasi.

Urutan status: Menunggu Pembayaran → Menunggu Konfirmasi → Diproses → Siap Diambil / Dalam Pengiriman → Sedang Disewa → Menunggu Pengembalian → Selesai. Pembatalan diperbolehkan sebelum masa sewa. Pembayaran hanya dilakukan melalui simulasi pelanggan.

## Rute

Publik: `/`, `/catalog`, `/catalog/[slug]`, `/categories/[slug]`, `/how-it-works`, `/about`, `/contact`, `/faq`.

Akun dan pelanggan: `/login`, `/register`, `/auth/callback`, `/booking/[productId]`, `/checkout/[bookingId]`, `/booking/success/[bookingId]`, `/dashboard`, `/dashboard/bookings`, `/dashboard/bookings/[bookingId]`, `/dashboard/profile`.

Admin: `/admin`, `/admin/products`, `/admin/products/new`, `/admin/products/[productId]/edit`, `/admin/bookings`, `/admin/bookings/[bookingId]`, `/admin/inventory`.

Semua rute menggunakan App Router asli. Loading, error boundary, dan halaman not-found tersedia. Respons not-found yang sudah streaming dapat memakai HTTP 200 menurut perilaku Next.js; konten not-found dan noindex tetap digunakan.

## UI, aset, dan aksesibilitas

- Desain orisinal dengan pola premium terinspirasi 21st.dev; tidak ada komponen 21st.dev yang diunduh atau diklaim lisensinya.
- Button berbasis Radix Slot/CVA dan accordion Radix mengikuti pola komponen shadcn yang dapat dikembangkan; `components.json` tersedia.
- Kamera dimuat dinamis di klien, gerak kursor dan scroll, pencahayaan studio, soft shadow. Render berhenti saat tidak terlihat. Motion menghormati reduced motion. WebGL tidak tersedia atau error → ilustrasi SVG.
- Gambar produk lokal berupa SVG; Next Image menangani ukuran dan fallback. Gambar unggahan Storage menggunakan optimasi Next Image.
- Menu mobile, label formulir, focus ring, skip link, feedback server, empty state, dan skeleton tersedia.
- Dashboard memperbarui status tiap 20 detik saat tab terlihat, serta menyediakan tombol pembaruan manual.
- Kontak bisnis, lokasi pengambilan, dan cakupan pengiriman sengaja belum diisi karena belum diberikan. Halaman kontak menjelaskan status layanan secara terbuka.

## Pengujian

```powershell
npm run typecheck
npm run lint
npm test
npm run build
# Setelah npm start berjalan pada port 3000:
node scripts/browser-smoke.mjs
```

Browser smoke menggunakan Microsoft Edge lokal melalui Playwright. Jika browser berbeda, ubah `channel` pada script. Uji mencakup katalog, filter/search, kalkulasi harga inklusif, carry tanggal/pengiriman melalui login, akses URL langsung, guard rute privat, menu mobile, overflow, FAQ, reduced motion, fallback WebGL, dan kegagalan gambar.

Tes SQL menguji migrasi/seed, RLS antar pelanggan, penolakan promosi peran/perubahan harga, harga server, stok, tanggal, pembayaran milik orang lain, pembayaran idempotent, transisi admin, dan pembacaan pembaruan status pelanggan.

**Masih perlu diverifikasi setelah Supabase terhubung:** signup/email callback hosted, upload Storage, alur login → booking → payment → success → refresh → admin update melalui browser dengan akun nyata, dan race dua koneksi PostgreSQL independen. Jalankan seluruh acceptance journey pada staging sebelum peluncuran.

Audit runtime: tidak ditemukan kerentanan saat pemeriksaan. Audit lengkap melaporkan lima temuan development-only pada rantai lint `eslint-config-next → fast-glob → micromatch → braces`; tidak ada patch kompatibel yang ditawarkan registry saat pemeriksaan. Jangan memakai `npm audit fix --force` yang menurunkan Next lint config ke generasi lama tanpa meninjau kompatibilitas.

## Deploy ke Vercel

Pilih atau buat proyek **ALNUDIV** pada akun/team yang benar. Hubungkan folder ini sebagai root project, framework Next.js, Node.js 24, build `npm run build`, install `npm ci`, output default. Tidak memerlukan rewrite SPA atau konfigurasi edge runtime.

Tambahkan tiga environment variable yang sama di Vercel untuk lingkungan yang digunakan. `NEXT_PUBLIC_SITE_URL` harus cocok dengan URL deployment; masukkan URL callback ke Supabase Auth. Pull environment hanya setelah proyek yang benar terhubung.

```powershell
npx vercel link
npx vercel env pull .env.local
npx vercel deploy
# Verifikasi staging dan seluruh acceptance journey sebelum promosi produksi.
```

Jangan menjalankan migrasi terhadap proyek yang sudah berisi data tanpa meninjau perubahan. Jangan menaruh `.env.local`, token Vercel, atau service-role key di Git/ZIP. Arsip penyerahan tidak menyertakan node_modules, .next, .vercel, atau environment rahasia.

## Jika muncul `relation "profiles" already exists`

File setup terbaru dapat dijalankan ulang. Buka kembali `supabase/migrations/202610180001_initial.sql` dari branch main, klik Raw, salin seluruh isi terbaru ke query baru di Supabase SQL Editor, lalu Run. Jangan menjalankan salinan lama yang masih terbuka di tab editor. Setelah setup berhasil, jalankan `supabase/seed.sql`. Keduanya mempertahankan data yang sudah ada. Jika pesan berubah menjadi struktur tabel tidak cocok, ambil hasil `supabase/diagnose.sql` untuk meninjau kolom/kebijakan yang sudah ada.

## Pemeriksaan koneksi deployment

`/api/health` memeriksa autentikasi dan query katalog secara read-only. Hasil hanya menampilkan URL proyek publik, status HTTP, kode error, dan jumlah produk; tidak menampilkan API key, session, atau data pelanggan. `status: ready` berarti kedua pemeriksaan berhasil, bukan bukti bahwa password atau peran akun tertentu benar.

Project URL harus berupa origin API Supabase. Untuk menghindari kegagalan jika URL dashboard terlanjur tersimpan, aplikasi menormalisasi tautan resmi `https://supabase.com/dashboard/project/REF` ke `https://REF.supabase.co`. Ubah environment ke URL API yang benar saat memungkinkan. Nama `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` juga didukung selain `NEXT_PUBLIC_SUPABASE_ANON_KEY`; bila keduanya diisi, publishable key diprioritaskan. Secret/service-role key ditolak.

## Customer daftar sendiri

Customer membuka `/register` melalui tombol Daftar Akun, mengisi nama/email/password/konfirmasi password, dan mendaftar sendiri. Aplikasi hanya mengirim metadata nama ke Supabase Auth. Trigger `handle_new_user` yang sudah terpasang membuat profil dan menetapkan role `customer` otomatis. Tidak diperlukan pembuatan user, pengisian profil, atau persetujuan admin per customer.

Jika proyek Supabase menerbitkan session langsung, customer langsung diarahkan ke dashboard atau booking yang sedang dikerjakan. Jika Confirm Email aktif, customer mendapat layar panduan konfirmasi dan tombol kirim ulang; setelah mengklik tautan email, callback membuat sesi dan meneruskan tujuan sewa. Tidak ada auto-promotion atau service-role key dalam pendaftaran.

Pengaturan layanan sekali saja: Enable new user signups dan provider Email harus aktif di Supabase. Jika konfirmasi email dipakai untuk customer umum, siapkan SMTP sendiri; email bawaan Supabase dibatasi untuk anggota tim proyek. Ini konfigurasi layanan, bukan pengaturan akun satu per satu. Aplikasi mengikuti kebijakan konfirmasi proyek dan tidak melewatinya. `/api/health` menampilkan `auth.signupEnabled` dan `auth.emailConfirmationRequired` tanpa menampilkan key atau akun pengguna.

Tes pendaftaran dengan mengirim email sungguhan hanya dilakukan setelah alamat uji diizinkan pemiliknya. Tes lokal memeriksa validasi, callback, batas peran, dan profil otomatis tanpa mengirim email.
