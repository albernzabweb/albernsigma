import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Header, Footer } from "@/components/shell";
import { configured } from "@/lib/supabase";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Albencam — Sewa Teknologi, Tanpa Ribet.",
    template: "%s | Albencam",
  },
  description:
    "Sewa kamera, laptop, drone, konsol game, dan perlengkapan event. Alat premium untuk setiap ide besarmu.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <a href="#main" className="skip-link">
          Lewati ke konten
        </a>
        <Header />
        <main id="main">{children}</main>
        <div className="demo-notice">
          MODE DEMO — Tidak Ada Transaksi Nyata
          {!configured() && (
            <span>
              {" "}
              · Katalog contoh; akun dan booking menunggu koneksi Supabase.
            </span>
          )}
        </div>
        <Footer />
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
