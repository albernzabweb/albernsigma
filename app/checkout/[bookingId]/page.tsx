import { notFound } from "next/navigation";
import { getBooking } from "@/lib/queries";
import { PageHeading } from "@/components/page-heading";
import { PaymentForm } from "@/components/forms";
import { BookingSummary } from "@/components/booking-summary";
export default async function Page({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const b = await getBooking(bookingId);
  if (!b) notFound();
  return (
    <>
      <PageHeading
        eyebrow="CHECKOUT / 02"
        title="Periksa. Konfirmasi. Siap berkarya."
        description="Tinjau rincian pesanan dan selesaikan simulasi pembayaran."
      />
      <div className="container content-page">
        <div className="form-shell">
          <div className="form-card">
            <h2>Pembayaran demo</h2>
            <PaymentForm booking={b} />
          </div>
          <BookingSummary booking={b} />
        </div>
      </div>
    </>
  );
}
