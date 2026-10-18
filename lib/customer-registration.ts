import { z } from "zod";
import { safeNext } from "./utils";
export const registrationSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(100),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Alamat email tidak valid.")),
    password: z.string().min(8, "Kata sandi minimal 8 karakter.").max(128),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    path: ["confirm_password"],
    message: "Konfirmasi kata sandi belum sama.",
  });
export function customerNext(value: unknown) {
  const next = safeNext(value);
  const path = next.split(/[?#]/, 1)[0];
  return path === "/admin" || path.startsWith("/admin/") ? "/dashboard" : next;
}
export function confirmationUrl(origin: string | undefined, next: unknown) {
  if (!origin)
    throw new Error(
      "Alamat website belum dikonfigurasi. Hubungi pengelola situs.",
    );
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    throw new Error("Alamat website belum valid. Hubungi pengelola situs.");
  }
  if (
    url.protocol !== "https:" &&
    !(
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname)
    )
  )
    throw new Error("Alamat website belum valid. Hubungi pengelola situs.");
  const callback = new URL("/auth/callback", url.origin);
  callback.searchParams.set("next", customerNext(next));
  return callback.toString();
}
export function registrationError(error: {
  code?: string;
  status?: number;
  message?: string;
}) {
  if (
    error.code === "signup_disabled" ||
    error.code === "email_provider_disabled"
  )
    return "Pendaftaran akun baru belum diaktifkan oleh pengelola. Silakan coba lagi nanti.";
  if (
    error.status === 429 ||
    error.code === "over_email_send_rate_limit" ||
    error.code === "over_request_rate_limit"
  )
    return "Terlalu banyak permintaan. Tunggu beberapa saat sebelum mencoba lagi.";
  if (error.code === "user_already_exists" || error.code === "email_exists")
    return "Email ini sudah terdaftar. Silakan masuk dengan akunmu.";
  if (error.code === "weak_password")
    return "Kata sandi belum cukup kuat. Gunakan kombinasi huruf, angka, dan simbol.";
  if (error.code === "email_address_invalid")
    return "Alamat email tidak valid. Periksa kembali alamat yang kamu masukkan.";
  if (
    error.code === "email_address_not_authorized" ||
    /email address not authorized|error sending confirmation email/i.test(
      error.message ?? "",
    )
  )
    return "Email konfirmasi belum dapat dikirim. Pengelola perlu mengaktifkan layanan email pendaftaran.";
  return "Pendaftaran belum dapat diproses. Silakan coba lagi atau hubungi pengelola situs.";
}
