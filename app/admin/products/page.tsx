import Link from "next/link";
import { getProducts } from "@/lib/queries";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
export default async function Page() {
  const ps = await getProducts();
  return (
    <>
      <div className="dash-heading">
        <div>
          <h1>Peralatan & kemungkinan.</h1>
          <p>Kelola katalog, harga demo, gambar, dan stok.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/products/new">Tambah produk +</Link>
        </Button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>NAMA PRODUK</th>
              <th>TARIF HARIAN</th>
              <th>STOK</th>
              <th>AKTIF</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {ps.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{money(p.daily_price)}</td>
                <td>{p.quantity}</td>
                <td>{p.available ? "Ya" : "Tidak"}</td>
                <td>
                  <Link href={"/admin/products/" + p.id + "/edit"}>Edit →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
