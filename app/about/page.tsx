import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
export const metadata = { title: "Tentang Albencam" };
export default function Page() {
  return (
    <>
      <PageHeading
        eyebrow="TENTANG ALBENCAM"
        title="Ide besar pantas dapat kesempatan."
        description="Kami percaya akses ke teknologi seharusnya membuka pintu, bukan menjadi batas."
      />
      <article className="container content-page content-narrow prose">
        <span className="eyebrow">SEWA TEKNOLOGI, TANPA RIBET.</span>
        <h2>Lebih dekat dengan alat yang kamu butuhkan.</h2>
        <p>
          Albencam adalah konsep platform penyewaan elektronik untuk kreator,
          mahasiswa, profesional, dan siapa pun yang ingin mencoba hal baru.
          Kamera untuk film pertama, laptop untuk proyek penting, atau konsol
          untuk akhir pekan bersama teman.
        </p>
        <p>
          Dengan menyewa, kamu dapat memilih teknologi sesuai kebutuhan dan
          durasi pemakaian. Rincian biaya dibuat transparan, dari tarif harian
          hingga deposit dan pengiriman.
        </p>
        <h3>Dibangun sebagai proyek inovasi.</h3>
        <p>
          Platform ini merupakan proyek universitas Innovation &
          Commercialisation. Produk, harga, statistik, dan testimoni yang diberi
          label contoh adalah konten demonstrasi. Belum ada janji operasional,
          layanan pengiriman nyata, atau transaksi uang pada situs ini.
        </p>
        <Button asChild>
          <Link href="/catalog">Temukan alat untuk idemu</Link>
        </Button>
      </article>
    </>
  );
}
