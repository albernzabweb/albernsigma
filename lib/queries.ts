import { cache } from "react";
import "server-only";
import { configured, supabase } from "./supabase";
import { sampleProducts, type Product, type Booking } from "./data";
import { redirect } from "next/navigation";
export const getProducts = cache(async function getProducts(): Promise<
  Product[]
> {
  if (!configured()) return sampleProducts;
  const db = await supabase();
  const { data, error } = await db
    .from("products")
    .select("*,inventory_quantities(quantity)");
  if (error)
    throw new Error(
      "Katalog gagal dimuat. Periksa koneksi dan migrasi Supabase.",
    );
  return (data ?? []).map((p) => ({
    ...p,
    quantity: p.inventory_quantities?.quantity ?? 0,
  }));
});
export async function getProduct(idOrSlug: string) {
  return (await getProducts()).find(
    (p) => p.id === idOrSlug || p.slug === idOrSlug,
  );
}
export const getSession = cache(async function getSession() {
  if (!configured()) return null;
  const db = await supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const { data: profile } = await db
    .from("profiles")
    .select("name,phone,role")
    .eq("id", user.id)
    .single();
  return { user, profile };
});
export async function requireUser(next = "/dashboard") {
  const s = await getSession();
  if (!s) redirect("/login?next=" + encodeURIComponent(next));
  return s;
}
export async function requireAdmin() {
  const s = await requireUser("/admin");
  if (s.profile?.role !== "admin") redirect("/dashboard?notice=forbidden");
  return s;
}
export async function getBookings(admin = false): Promise<Booking[]> {
  const s = admin
    ? await requireAdmin()
    : await requireUser("/dashboard/bookings");
  const db = await supabase();
  let q = db
    .from("bookings")
    .select("*,products(name,slug,image)")
    .order("created_at", { ascending: false });
  if (!admin) q = q.eq("customer_id", s.user.id);
  const { data, error } = await q;
  if (error) throw new Error("Pesanan tidak dapat dimuat");
  return (data ?? []) as unknown as Booking[];
}
export async function getBooking(id: string, admin = false) {
  return (await getBookings(admin)).find((b) => b.id === id);
}
