import Link from "next/link";
import { Check, ArrowUpRight } from "lucide-react";
import { type Booking } from "@/lib/data";
import { money, dateLabel } from "@/lib/utils";
import { statuses } from "@/lib/validation";
import { Button } from "./ui/button";
export function Status({ value }: { value: string }) {
  return (
    <span
      className={
        "status " +
        (value === "Selesai"
          ? "complete"
          : value === "Dibatalkan"
            ? "cancel"
            : "")
      }
    >
      {value}
    </span>
  );
}
export function BookingTable({
  bookings,
  admin = false,
}: {
  bookings: Booking[];
  admin?: boolean;
}) {
  if (!bookings.length)
    return (
      <div className="empty-state">
        <h2>Ruang untuk cerita pertamamu.</h2>
        <p>
          {admin
            ? "Belum ada pesanan tersimpan."
            : "Pesananmu akan muncul di sini setelah kamu menyewa alat."}
        </p>
        <Button asChild>
          <Link href="/catalog">
            Jelajahi Peralatan <ArrowUpRight size={16} />
          </Link>
        </Button>
      </div>
    );
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>PERALATAN / PESANAN</th>
            {admin && <th>PELANGGAN</th>}
            <th>TANGGAL</th>
            <th>TOTAL DEMO</th>
            <th>STATUS</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>
                <strong>{b.products.name}</strong>
                <br />
                <small className="note">{b.id.slice(0, 8).toUpperCase()}</small>
              </td>
              {admin && <td>{b.customer_name}</td>}
              <td>
                {dateLabel(b.start_date)}
                <br />
                <small className="note">{b.rental_days} hari</small>
              </td>
              <td>{money(b.total)}</td>
              <td>
                <Status value={b.rental_status} />
              </td>
              <td>
                <Link
                  href={(admin ? "/admin" : "/dashboard") + "/bookings/" + b.id}
                >
                  Lihat detail →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Timeline({
  booking: b,
  history,
}: {
  booking: Booking;
  history: { status: string; created_at: string }[];
}) {
  const route =
    b.fulfillment === "delivery" ? "Dalam Pengiriman" : "Siap Diambil";
  const path = [
    statuses[0],
    statuses[1],
    statuses[2],
    route,
    statuses[5],
    statuses[6],
    statuses[7],
  ];
  const selected = path.indexOf(b.rental_status);
  return (
    <ol className="timeline">
      {(b.rental_status === "Dibatalkan"
        ? ["Menunggu Pembayaran", "Dibatalkan"]
        : path
      ).map((s, i) => {
        const entry = history.find((h) => h.status === s);
        return (
          <li className={entry || i <= selected ? "done" : ""} key={s}>
            <span className="dot">
              {entry || i <= selected ? <Check size={13} /> : i + 1}
            </span>
            <div>
              <h3>{s}</h3>
              <small>
                {entry
                  ? new Date(entry.created_at).toLocaleString("id-ID", {
                      timeZone: "Asia/Jakarta",
                    }) + " WIB"
                  : "Menunggu tahap sebelumnya"}
              </small>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
