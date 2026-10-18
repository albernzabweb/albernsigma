"use server";
import { supabase, configured } from "./supabase";
import { requireUser, requireAdmin } from "./queries";
import { bookingSchema, statuses } from "./validation";
import { safeNext } from "./utils";
import { loginError } from "./auth-errors";
import {
  registrationSchema,
  customerNext,
  confirmationUrl,
  registrationError,
} from "./customer-registration";
import { z } from "zod";
import { unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
export type Result = {
  error?: string;
  id?: string;
  message?: string;
  redirect?: string;
  requiresConfirmation?: boolean;
  email?: string;
};
function fail(e: unknown): Result {
  unstable_rethrow(e);
  if (e instanceof z.ZodError)
    return { error: e.issues[0]?.message ?? "Data tidak valid" };
  return {
    error:
      e instanceof Error ? e.message : "Permintaan gagal. Silakan coba lagi.",
  };
}
export async function authenticate(
  form: FormData,
  register: boolean,
): Promise<Result> {
  try {
    const email = z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email())
      .parse(form.get("email"));
    const password = z
      .string()
      .min(8, "Kata sandi minimal 8 karakter")
      .max(128)
      .parse(form.get("password"));
    const next = safeNext(form.get("next"));
    if (!configured())
      return {
        error:
          "Akun belum aktif: hubungkan Supabase sesuai README terlebih dahulu.",
      };
    const db = await supabase();
    if (register) {
      const input = registrationSchema.parse(Object.fromEntries(form));
      const destination = customerNext(next);
      const { data, error } = await db.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: { name: input.name },
          emailRedirectTo: confirmationUrl(
            process.env.NEXT_PUBLIC_SITE_URL,
            destination,
          ),
        },
      });
      if (error) return { error: registrationError(error) };
      if (data.session) {
        revalidatePath("/", "layout");
        return { redirect: destination };
      }
      return {
        requiresConfirmation: true,
        email: input.email,
        message:
          "Cek inbox dan folder spam untuk tautan konfirmasi. Akun customer aktif otomatis setelah email dikonfirmasi.",
      };
    }
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error)
      return {
        error: loginError(error),
        requiresConfirmation: error.code === "email_not_confirmed",
        email,
      };
    revalidatePath("/", "layout");
    return { redirect: next };
  } catch (e) {
    return fail(e);
  }
}
export async function resendConfirmation(form: FormData): Promise<Result> {
  try {
    const email = z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email())
      .parse(form.get("email"));
    const db = await supabase();
    const { error } = await db.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: confirmationUrl(
          process.env.NEXT_PUBLIC_SITE_URL,
          form.get("next"),
        ),
      },
    });
    if (error) return { error: registrationError(error) };
    return {
      message:
        "Jika akun memerlukan konfirmasi, tautan baru akan dikirim. Periksa inbox dan folder spam.",
    };
  } catch (e) {
    return fail(e);
  }
}
export async function logout() {
  const db = await supabase();
  await db.auth.signOut();
  revalidatePath("/", "layout");
}
export async function checkAvailability(
  productId: string,
  start: string,
  end: string,
): Promise<{ remaining?: number; error?: string }> {
  try {
    const db = await supabase();
    const { data, error } = await db.rpc("check_availability", {
      p_product_id: productId,
      p_start: start,
      p_end: end,
    });
    if (error) return { error: error.message };
    return { remaining: data as number };
  } catch (e) {
    return fail(e);
  }
}
export async function createBooking(form: FormData): Promise<Result> {
  try {
    await requireUser("/booking/" + String(form.get("product_id")));
    const d = bookingSchema.parse(Object.fromEntries(form));
    const db = await supabase();
    const { data, error } = await db.rpc("create_booking", {
      p_product_id: d.product_id,
      p_start: d.start_date,
      p_end: d.end_date,
      p_name: d.customer_name,
      p_phone: d.phone,
      p_fulfillment: d.fulfillment,
      p_address: d.address,
      p_notes: d.notes,
    });
    if (error) return { error: error.message };
    revalidatePath("/dashboard", "layout");
    revalidatePath("/admin", "layout");
    return { id: String(data) };
  } catch (e) {
    return fail(e);
  }
}
export async function simulatePayment(
  id: string,
  method: string,
): Promise<Result> {
  try {
    await requireUser();
    z.uuid().parse(id);
    z.enum(["QRIS Demo", "Bank Transfer Demo", "E-Wallet Demo"]).parse(method);
    const db = await supabase();
    const { error } = await db.rpc("simulate_payment", {
      p_booking_id: id,
      p_method: method,
    });
    if (error) return { error: error.message };
    revalidatePath("/dashboard", "layout");
    revalidatePath("/checkout/" + id);
    revalidatePath("/admin", "layout");
    return { id };
  } catch (e) {
    return fail(e);
  }
}
export async function updateProfile(form: FormData): Promise<Result> {
  try {
    const s = await requireUser();
    const d = z
      .object({
        name: z.string().trim().min(2).max(100),
        phone: z.string().max(20),
      })
      .parse(Object.fromEntries(form));
    const db = await supabase();
    const { error } = await db.from("profiles").update(d).eq("id", s.user.id);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/profile");
    return { message: "Profil berhasil disimpan." };
  } catch (e) {
    return fail(e);
  }
}
export async function updateBookingStatus(form: FormData): Promise<Result> {
  try {
    await requireAdmin();
    const id = z.uuid().parse(form.get("id"));
    const status = z.enum(statuses).parse(form.get("status"));
    const db = await supabase();
    const { error } = await db.rpc("admin_update_booking", {
      p_booking_id: id,
      p_status: status,
    });
    if (error) return { error: error.message };
    revalidatePath("/admin", "layout");
    revalidatePath("/dashboard", "layout");
    return { message: "Status pesanan diperbarui." };
  } catch (e) {
    return fail(e);
  }
}
export async function saveProduct(form: FormData): Promise<Result> {
  try {
    await requireAdmin();
    const raw = Object.fromEntries(form);
    const p = z
      .object({
        id: z.union([z.uuid(), z.literal("")]),
        name: z.string().min(3).max(120),
        slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        category: z.string().min(1),
        description: z.string().min(10).max(2000),
        daily_price: z.coerce.number().int().min(1000).max(100000000),
        weekly_price: z.coerce.number().int().min(1000).max(700000000),
        deposit: z.coerce.number().int().min(0).max(100000000),
        quantity: z.coerce.number().int().min(0).max(999),
        image: z
          .string()
          .regex(
            /^(\/products\/[a-z-]+\.svg|https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/product-images\/.+)$/,
          ),
      })
      .parse(raw);
    const db = await supabase();
    const { data, error } = await db.rpc("admin_save_product", {
      p_data: { ...p, available: raw.available === "on" },
    });
    if (error) return { error: error.message };
    revalidatePath("/catalog");
    revalidatePath("/admin", "layout");
    return { id: String(data), message: "Produk berhasil disimpan." };
  } catch (e) {
    return fail(e);
  }
}
export async function uploadProductImage(form: FormData): Promise<Result> {
  try {
    await requireAdmin();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    )
      return { error: "Gunakan JPG, PNG, atau WebP, maksimal 5 MB." };
    const db = await supabase();
    const ext =
      file.type === "image/jpeg"
        ? "jpg"
        : file.type === "image/png"
          ? "png"
          : "webp";
    const path = crypto.randomUUID() + "." + ext;
    const { error } = await db.storage
      .from("product-images")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) return { error: error.message };
    return {
      message: db.storage.from("product-images").getPublicUrl(path).data
        .publicUrl,
    };
  } catch (e) {
    return fail(e);
  }
}
