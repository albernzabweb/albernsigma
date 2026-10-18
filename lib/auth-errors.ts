export function loginError(error: { code?: string; status?: number; message?: string }): string {
  if (error.code === 'invalid_credentials') return 'Email atau kata sandi tidak sesuai. Pastikan akun sudah dibuat di Supabase Authentication.';
  if (error.code === 'email_not_confirmed') return 'Email akun ini belum dikonfirmasi. Konfirmasi email terlebih dahulu sebelum masuk.';
  if (error.code === 'user_banned') return 'Akun ini sedang dinonaktifkan. Hubungi pengelola situs.';
  if (error.code === 'email_provider_disabled') return 'Login email belum diaktifkan. Hubungi pengelola situs.';
  if (error.status === 429 || error.code === 'over_request_rate_limit') return 'Terlalu banyak percobaan masuk. Tunggu sebentar sebelum mencoba lagi.';
  if (/invalid api key|invalid jwt|no api key/i.test(error.message ?? '')) return 'Konfigurasi koneksi Supabase belum benar. Pengelola perlu memeriksa Project URL dan public API key di Vercel.';
  if (error.status && error.status >= 500) return 'Layanan autentikasi sedang bermasalah. Silakan coba kembali nanti.';
  return 'Login belum dapat diproses. Hubungi pengelola untuk memeriksa layanan autentikasi.';
}
