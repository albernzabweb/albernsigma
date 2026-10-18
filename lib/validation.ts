import { z } from "zod";
import { today } from "./utils";
export const statuses = [
  "Menunggu Pembayaran",
  "Menunggu Konfirmasi",
  "Diproses",
  "Siap Diambil",
  "Dalam Pengiriman",
  "Sedang Disewa",
  "Menunggu Pengembalian",
  "Selesai",
  "Dibatalkan",
] as const;
export const bookingSchema = z
  .object({
    product_id: z.uuid(),
    start_date: z.iso.date(),
    end_date: z.iso.date(),
    customer_name: z.string().trim().min(2).max(100),
    phone: z.string().regex(/^\+?[0-9\s-]{8,20}$/, "Nomor telepon tidak valid"),
    fulfillment: z.enum(["pickup", "delivery"]),
    address: z.string().trim().max(500),
    notes: z.string().max(1000).default(""),
  })
  .superRefine((d, c) => {
    if (d.start_date < today())
      c.addIssue({
        code: "custom",
        path: ["start_date"],
        message: "Tanggal mulai tidak boleh di masa lalu",
      });
    const n = rentalDays(d.start_date, d.end_date);
    if (!Number.isInteger(n) || n < 1 || n > 90)
      c.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "Durasi sewa harus 1–90 hari",
      });
    if (d.fulfillment === "delivery" && d.address.length < 10)
      c.addIssue({
        code: "custom",
        path: ["address"],
        message: "Lengkapi alamat pengiriman",
      });
  });
export function rentalDays(start: string, end: string) {
  return (
    (Date.parse(end + "T00:00:00Z") - Date.parse(start + "T00:00:00Z")) /
      86400000 +
    1
  );
}
export function calculatePrice(
  daily: number,
  days: number,
  deposit: number,
  delivery: boolean,
) {
  if (!Number.isInteger(days) || days < 1 || days > 90)
    throw new Error("Durasi tidak valid");
  return {
    subtotal: daily * days,
    delivery_fee: delivery ? 35000 : 0,
    deposit,
    total: daily * days + deposit + (delivery ? 35000 : 0),
  };
}
