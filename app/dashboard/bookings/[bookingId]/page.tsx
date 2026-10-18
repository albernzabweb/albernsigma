import Link from "next/link";
import { notFound } from "next/navigation";
import { getBooking } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { BookingSummary } from "@/components/booking-summary";
import { Timeline, Status } from "@/components/booking-table";
import { RefreshBookings } from "@/components/dashboard-nav";
import { Button } from "@/components/ui/button";
export default async function Page({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const b = await getBooking(bookingId, false);
  if (!b) notFound();
  const db = await supabase();
  const { data: history, error } = await db
    .from("booking_status_history")
    .select("status,created_at")
    .eq("booking_id", b.id)
    .order("created_at");
  if (error) throw new Error("Riwayat status gagal dimuat");
  const { data: payments } = await db
    .from("simulated_payments")
    .select("method,amount,created_at")
    .eq("booking_id", b.id);
  return (
    <>
      <div className="dash-heading">
        <div>
          <h1>Detail pesanan.</h1>
          <p>
            {b.id.slice(0, 8).toUpperCase()} ·{" "}
            <Status value={b.rental_status} />
          </p>
        </div>
        <RefreshBookings />
      </div>
      <div className="form-shell">
        <div className="form-card">
          <h2>Perjalanan alatmu</h2>
          <Timeline booking={b} history={history ?? []} />
          {b.payment_status === "unpaid" &&
            b.rental_status !== "Dibatalkan" && (
              <Button asChild>
                <Link href={"/checkout/" + b.id}>
                  Lanjutkan Pembayaran Demo
                </Link>
              </Button>
            )}
          <h3>Penerima</h3>
          <p className="note">
            {b.customer_name} · {b.phone}
            <br />
            {b.address || "Ambil sendiri"}
            <br />
            Catatan: {b.notes || "Tidak ada catatan"}
          </p>
          <h3>Pembayaran simulasi</h3>
          {payments?.length ? (
            payments.map((p, i) => (
              <div className="alert success" key={i}>
                {p.method} ·{" "}
                {new Date(p.created_at).toLocaleString("id-ID", {
                  timeZone: "Asia/Jakarta",
                })}{" "}
                WIB
                <br />
                Simulasi tersimpan. Tidak ada transaksi uang nyata.
              </div>
            ))
          ) : (
            <p className="note">Belum ada pembayaran demo.</p>
          )}
        </div>
        <BookingSummary booking={b} />
      </div>
    </>
  );
}
