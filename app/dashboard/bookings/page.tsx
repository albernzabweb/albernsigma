import { getBookings } from "@/lib/queries";
import { BookingTable } from "@/components/booking-table";
import { RefreshBookings } from "@/components/dashboard-nav";
export default async function Page() {
  const bookings = await getBookings(false);
  return (
    <>
      <div className="dash-heading">
        <div>
          <h1>Cerita & pesananmu.</h1>
          <p>Pantau rencana berikutnya, dari pemesanan sampai pengembalian.</p>
        </div>
        <RefreshBookings />
      </div>
      <BookingTable bookings={bookings} admin={false} />
    </>
  );
}
