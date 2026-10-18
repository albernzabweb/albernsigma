"use client";
import * as A from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
export const faqs = [
  [
    "Bagaimana cara menyewa di ALNUDIV?",
    "Pilih alat di katalog, tentukan tanggal sewa, lalu masuk dan isi data pemesanan. Tinjau rincian biaya dan selesaikan simulasi pembayaran. Status pesanan dapat dilihat di dashboard.",
  ],
  [
    "Apakah ada deposit jaminan?",
    "Ya. Setiap alat memiliki deposit yang tertera pada rincian produk. Deposit dapat dikembalikan setelah alat diterima dan diperiksa sesuai ketentuan sewa. Pada situs demo ini tidak ada uang yang dipungut.",
  ],
  [
    "Bisa diantar ke lokasi saya?",
    "Tersedia pilihan ambil sendiri atau pengiriman. Biaya pengiriman demo adalah Rp35.000 per pesanan. Cakupan layanan operasional perlu dikonfirmasi sebelum peluncuran.",
  ],
  [
    "Bagaimana jika alat rusak atau terlambat dikembalikan?",
    "Hubungi tim layanan sebelum waktu pengembalian. Penilaian kerusakan dan keterlambatan mengikuti kesepakatan sewa; tidak ada biaya otomatis atau transaksi nyata pada demo ini.",
  ],
  [
    "Apakah pembayaran di sini sungguhan?",
    "Tidak. QRIS, transfer bank, dan e-wallet hanya simulasi. Tombol pembayaran demo tidak memindahkan uang atau menerbitkan konfirmasi bank.",
  ],
];
export function Faq({ limit = 5 }: { limit?: number }) {
  return (
    <A.Root type="single" collapsible className="faq">
      {faqs.slice(0, limit).map(([q, a], i) => (
        <A.Item value={String(i)} key={q}>
          <A.Header>
            <A.Trigger>
              {q}
              <Plus size={20} />
            </A.Trigger>
          </A.Header>
          <A.Content>
            <p>{a}</p>
          </A.Content>
        </A.Item>
      ))}
    </A.Root>
  );
}
