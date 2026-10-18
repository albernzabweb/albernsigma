import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
export const metadata = { title: "Hubungi Kami" };
export default function Page() {
  return (
    <>
      <PageHeading
        eyebrow="HUBUNGI KAMI"
        title="Setiap ide dimulai dari percakapan."
        description="Temukan bantuan untuk pesanan dan pertanyaan tentang ALNUDIV."
      />
      <div className="container content-page content-narrow">
        <div className="info-card prose">
          <h2>Bantuan pesanan</h2>
          <p>
            Untuk pesanan yang sudah dibuat, buka rincian pesanan melalui
            dashboard. Data penerima, ringkasan biaya, dan riwayat status
            tersedia di sana.
          </p>
          <Button asChild>
            <Link href="/dashboard/bookings">Buka Pesanan Saya</Link>
          </Button>
          <h3>Informasi layanan</h3>
          <p>
            ALNUDIV masih merupakan proyek demonstrasi universitas. Kanal
            dukungan, alamat pengambilan, jam operasional, dan cakupan
            pengiriman belum ditetapkan. Situs ini tidak mencantumkan kontak
            atau alamat bisnis fiktif.
          </p>
          <Link className="text-link" href="/faq">
            Baca pertanyaan umum
          </Link>
        </div>
      </div>
    </>
  );
}
