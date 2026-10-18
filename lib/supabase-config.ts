export type SupabaseEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
};
export class SupabaseConfigurationError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "SupabaseConfigurationError";
  }
}
function clean(value: string | undefined) {
  const s = value?.trim() ?? "";
  return s.length > 1 &&
    ((s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'")))
    ? s.slice(1, -1).trim()
    : s;
}
export function hasSupabaseEnvironment(env: SupabaseEnvironment) {
  return Boolean(
    clean(env.NEXT_PUBLIC_SUPABASE_URL) ||
    clean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    clean(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  );
}
export function resolveSupabaseConfig(env: SupabaseEnvironment) {
  const raw = clean(env.NEXT_PUBLIC_SUPABASE_URL);
  const key =
    clean(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    clean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!raw || !key)
    throw new SupabaseConfigurationError(
      "SUPABASE_CONFIG_MISSING",
      "Konfigurasi Supabase belum lengkap. Isi Project URL dan public API key di Vercel.",
    );
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new SupabaseConfigurationError(
      "SUPABASE_URL_INVALID",
      "Project URL Supabase tidak valid. Gunakan alamat API dari tombol Connect.",
    );
  }
  let normalizedDashboardUrl = false;
  if (parsed.hostname === "supabase.com") {
    const match = parsed.pathname.match(
      /^\/dashboard\/project\/([a-z0-9]{20})(?:\/.*)?$/,
    );
    if (!match)
      throw new SupabaseConfigurationError(
        "SUPABASE_URL_INVALID",
        "Alamat dashboard bukan Project URL Supabase yang valid.",
      );
    parsed = new URL("https://" + match[1] + ".supabase.co");
    normalizedDashboardUrl = true;
  }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
  if (
    (parsed.protocol !== "https:" && !(local && parsed.protocol === "http:")) ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new SupabaseConfigurationError(
      "SUPABASE_URL_INVALID",
      "Gunakan Project URL API tanpa path, query, atau kredensial tambahan.",
    );
  }
  if (key.startsWith("sb_secret_"))
    throw new SupabaseConfigurationError(
      "SUPABASE_KEY_PRIVILEGED",
      "Gunakan publishable/anon key. Secret atau service-role key tidak boleh dipakai untuk koneksi aplikasi ini.",
    );
  if (key.startsWith("eyJ")) {
    try {
      const payload = JSON.parse(
        atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      ) as { role?: string };
      if (payload.role === "service_role")
        throw new SupabaseConfigurationError(
          "SUPABASE_KEY_PRIVILEGED",
          "Gunakan anon key, bukan service-role key.",
        );
    } catch (e) {
      if (e instanceof SupabaseConfigurationError) throw e;
      throw new SupabaseConfigurationError(
        "SUPABASE_KEY_INVALID",
        "Public API key tidak valid. Salin ulang dari proyek Supabase yang sama.",
      );
    }
  }
  if (/\s/.test(key))
    throw new SupabaseConfigurationError(
      "SUPABASE_KEY_INVALID",
      "Public API key berisi spasi atau baris tambahan. Salin nilainya saja.",
    );
  return { url: parsed.origin, key, normalizedDashboardUrl };
}
