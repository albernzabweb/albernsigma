import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check, ArrowUpRight } from "lucide-react";
import { getBooking } from "@/lib/queries";
import { dateLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
export default async function Page({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const b = await getBooking(bookingId);
  if (!b) notFound();
  if (b.payment_status !== "paid") redirect("/checkout/" + b.id);
  return (
    <div className="container content-page">
      <div className="success-card">
        <div className="success-icon">
          <Check size={33} />
        </div>
        <span className="eyebrow">KONFIRMASI PEMBAYARAN DEMO</span>
        <h1>Rencanamu siap dimulai.</h1>
        <p>
          Simulasi pembayaran berhasil. Pesanan {b.products.name} sudah
          tersimpan dan menunggu konfirmasi admin.
        </p>
        <div className="alert">MODE DEMO — Tidak Ada Transaksi Nyata</div>
        <p>
          {dateLabel(b.start_date)} – {dateLabel(b.end_date)} · {b.rental_days}{" "}
          hari
        </p>
        <p className="note">
          ID pesanan: {b.id}
          <br />
          Ini bukan bukti pembayaran atau konfirmasi transaksi bank.
        </p>
        <Button asChild>
          <Link href={"/dashboard/bookings/" + b.id}>
            Pantau Pesanan <ArrowUpRight size={17} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
