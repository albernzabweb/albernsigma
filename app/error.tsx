"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container content-page">
      <div className="empty-state">
        <h2>Ada kendala saat memuat halaman.</h2>
        <p>
          Silakan coba lagi. Jika berlanjut, periksa koneksi Supabase dan status
          layanan.
        </p>
        <Button onClick={reset}>Coba Lagi</Button>
      </div>
    </div>
  );
}
