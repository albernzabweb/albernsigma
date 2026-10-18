"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  User,
  LogOut,
  Boxes,
  Plus,
  RefreshCw,
} from "lucide-react";
import { logout } from "@/lib/actions";
import { useEffect, useTransition } from "react";
export function DashboardNav({ admin = false }: { admin?: boolean }) {
  const path = usePathname();
  const router = useRouter();
  const [pending, run] = useTransition();
  const base = admin ? "/admin" : "/dashboard";
  const links = admin
    ? [
        [base, "Ringkasan", LayoutDashboard],
        [base + "/products", "Peralatan", Package],
        [base + "/products/new", "Tambah Produk", Plus],
        [base + "/bookings", "Semua Pesanan", Boxes],
        [base + "/inventory", "Inventori", Boxes],
      ]
    : [
        [base, "Ringkasan", LayoutDashboard],
        [base + "/bookings", "Pesanan Saya", Package],
        [base + "/profile", "Profil Saya", User],
      ];
  return (
    <nav
      className="dashboard-nav"
      aria-label={admin ? "Menu administrator" : "Menu pelanggan"}
    >
      <h3>{admin ? "Administrator" : "Ruang Kreatormu"}</h3>
      {links.map(([url, text, Icon]) => {
        const I = Icon as typeof User;
        return (
          <Link
            className={path === url ? "active" : ""}
            key={String(url)}
            href={String(url)}
          >
            <I size={17} />
            {String(text)}
          </Link>
        );
      })}
      <button
        disabled={pending}
        onClick={() =>
          run(async () => {
            await logout();
            router.push("/login");
            router.refresh();
          })
        }
      >
        <LogOut size={17} />
        Keluar
      </button>
    </nav>
  );
}
export function RefreshBookings() {
  const router = useRouter();
  const [pending, run] = useTransition();
  useEffect(() => {
    const refresh = () => { if (!document.hidden) router.refresh(); };
    const t = setInterval(refresh, 20000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);
  return (
    <button
      className="text-button"
      disabled={pending}
      onClick={() => run(() => router.refresh())}
    >
      <RefreshCw size={14} />
      {pending ? "Memuat…" : "Perbarui status"}
    </button>
  );
}
