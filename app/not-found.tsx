import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="container content-page">
      <div className="empty-state">
        <span className="eyebrow">404 / BELUM KETEMU</span>
        <h2>Halaman ini di luar jangkauan.</h2>
        <p>Alamat mungkin berubah atau data tidak tersedia untuk akunmu.</p>
        <Button asChild>
          <Link href="/catalog">Kembali ke Katalog</Link>
        </Button>
      </div>
    </div>
  );
}
