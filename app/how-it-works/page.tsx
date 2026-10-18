import Link from "next/link";
import { Search, CalendarDays, Sparkles, ArrowUpRight } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
export const metadata = { title: "Cara Sewa" };
export default function Page() {
  return (
    <>
      <PageHeading
        eyebrow="CARA SEWA"
        title="Lebih sedikit ribet. Lebih banyak karya."
        description="Akses teknologi premium dalam tiga langkah mudah."
      />
      <div className="container content-page">
        <div className="info-grid">
          {[
            [
              Search,
              "01 / Temukan alatmu",
              "Cari alat, bandingkan spesifikasi, dan pilih yang sesuai kebutuhanmu. Harga dan deposit ditampilkan di setiap produk.",
            ],
            [
              CalendarDays,
              "02 / Tentukan waktunya",
              "Pilih tanggal awal dan akhir, lalu masuk ke akunmu. Isi data penerima dan pilih ambil sendiri atau pengiriman.",
            ],
            [
              Sparkles,
              "03 / Konfirmasi & berkarya",
              "Tinjau pesanan dan jalankan simulasi pembayaran. Pantau status pesanan dari dashboard sampai pengembalian.",
            ],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof Search;
            return (
              <div className="info-card" key={String(title)}>
                <I size={28} />
                <h3>{String(title)}</h3>
                <p>{String(text)}</p>
              </div>
            );
          })}
        </div>
        <div className="contact-box prose">
          <h2>Detail kecil yang perlu kamu tahu.</h2>
          <p>
            Tanggal awal dan akhir sama-sama dihitung sebagai hari sewa. Contoh:
            20–22 Oktober = 3 hari. Durasi maksimum 90 hari. Deposit ditampilkan
            terpisah dan pengiriman demo dikenakan Rp35.000.
          </p>
          <p>
            Pesanan menahan stok selama 30 menit. Setelah waktu tersebut, buat
            pesanan baru agar ketersediaan dapat dicek lagi. Pembayaran di situs
            ini sepenuhnya simulasi.
          </p>
          <Button asChild>
            <Link href="/catalog">
              Mulai Jelajahi <ArrowUpRight size={17} />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
