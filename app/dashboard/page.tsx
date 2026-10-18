import Link from "next/link";
import { getBookings, requireUser } from "@/lib/queries";
import { BookingTable } from "@/components/booking-table";
import { Button } from "@/components/ui/button";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const s = await requireUser();
  const bs = await getBookings();
  const active = bs.filter(
    (b) =>
      b.payment_status === "paid" &&
      !["Selesai", "Dibatalkan"].includes(b.rental_status),
  );
  const q = await searchParams;
  return (
    <>
      {q.notice === "forbidden" && (
        <div className="alert error">
          Halaman administrator hanya dapat diakses oleh akun dengan peran
          admin.
        </div>
      )}
      <div className="dash-heading">
        <div>
          <h1>Halo, {s.profile?.name?.split(" ")[0] || "Kreator"}.</h1>
          <p>Selamat datang di ruang untuk ide besarmu.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/catalog">Sewa alat lagi ↗</Link>
        </Button>
      </div>
      <div className="metric-grid">
        {[
          ["Sewa aktif", active.length],
          ["Selesai", bs.filter((b) => b.rental_status === "Selesai").length],
          [
            "Menunggu pembayaran",
            bs.filter(
              (b) =>
                b.payment_status === "unpaid" &&
                b.rental_status !== "Dibatalkan",
            ).length,
          ],
        ].map(([label, n]) => (
          <div className="metric" key={label}>
            <span>{label}</span>
            <strong>{n}</strong>
          </div>
        ))}
      </div>
      {active.length > 0 && (
        <div className="alert">
          Pengembalian terdekat: {active.map((b) => b.end_date).sort()[0]}.
          Periksa detail pesanan untuk tahap penerimaan dan pengembalian.
        </div>
      )}
      <h2 style={{ fontSize: 20, marginBottom: 20 }}>Pesanan terbaru</h2>
      <BookingTable bookings={bs.slice(0, 5)} />
    </>
  );
}
