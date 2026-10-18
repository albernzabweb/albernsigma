import { getBookings } from "@/lib/queries";
import { BookingTable } from "@/components/booking-table";
import { RefreshBookings } from "@/components/dashboard-nav";
export default async function Page() {
  const bookings = await getBookings(true);
  return (
    <>
      <div className="dash-heading">
        <div>
          <h1>Semua pesanan.</h1>
          <p>Kelola siklus sewa dan pantau pembayaran demo.</p>
        </div>
        <RefreshBookings />
      </div>
      <BookingTable bookings={bookings} admin={true} />
    </>
  );
}
