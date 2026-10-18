import { getBookings, getProducts } from "@/lib/queries";
import { money } from "@/lib/utils";
import { RefreshBookings } from "@/components/dashboard-nav";
import { BookingTable } from "@/components/booking-table";
export default async function Page() {
  const bs = await getBookings(true);
  const products = await getProducts();
  const revenue = bs
    .filter(
      (b) => b.payment_status === "paid" && b.rental_status !== "Dibatalkan",
    )
    .reduce((s, b) => s + b.subtotal, 0);
  return (
    <>
      <div className="dash-heading">
        <div>
          <h1>Ruang kendali ALNUDIV.</h1>
          <p>
            Data dari pesanan demo tersimpan. Pendapatan hanya subtotal sewa,
            tanpa deposit.
          </p>
        </div>
        <RefreshBookings />
      </div>
      <div className="metric-grid">
        {[
          ["Pendapatan sewa demo", money(revenue)],
          ["Pesanan tersimpan", bs.length],
          ["Peralatan terdaftar", products.length],
        ].map(([label, n]) => (
          <div className="metric" key={label}>
            <span>{label}</span>
            <strong>{n}</strong>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: 20, marginBottom: 20 }}>Pesanan terbaru</h2>
      <BookingTable bookings={bs.slice(0, 8)} admin />
    </>
  );
}
