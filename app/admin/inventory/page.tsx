import Link from "next/link";
import { getProducts, getBookings } from "@/lib/queries";
import { today } from "@/lib/utils";
export default async function Page() {
  const ps = await getProducts();
  const bs = await getBookings(true);
  return (
    <>
      <div className="dash-heading">
        <div>
          <h1>Semua alat, terpantau.</h1>
          <p>Stok total dan unit terpesan untuk hari ini (WIB).</p>
        </div>
      </div>
      <div className="form-card">
        {ps.map((p) => {
          const used = bs.filter(
            (b) =>
              b.product_id === p.id &&
              b.start_date <= today() &&
              b.end_date >= today() &&
              !["Selesai", "Dibatalkan"].includes(b.rental_status) &&
              (b.payment_status === "paid" ||
                new Date(b.hold_until) > new Date()),
          ).length;
          return (
            <div className="inventory-row" key={p.id}>
              <div>
                <strong>{p.name}</strong>
                <br />
                <span>
                  {used} terpesan hari ini · {p.quantity} total unit ·{" "}
                  {Math.max(0, p.quantity - used)} bebas
                </span>
              </div>
              <Link
                className="text-link"
                href={"/admin/products/" + p.id + "/edit"}
              >
                Atur stok →
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}
