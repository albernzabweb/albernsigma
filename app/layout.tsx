import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Header, Footer } from "@/components/shell";
import { configured } from "@/lib/supabase";
import { getSession } from "@/lib/queries";
import "./globals.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: {
    default: "ALNUDIV — Sewa Teknologi, Tanpa Ribet.",
    template: "%s | ALNUDIV",
  },
  description:
    "Sewa kamera, laptop, drone, konsol game, dan perlengkapan event. Alat premium untuk setiap ide besarmu.",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <html lang="id">
      <body>
        <a href="#main" className="skip-link">
          Lewati ke konten
        </a>
        <Header account={session ? { role: session.profile?.role === "admin" ? "admin" : "customer" } : null} />
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
