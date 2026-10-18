import { createClient } from "@supabase/supabase-js";
import { supabaseEnvironment } from "@/lib/supabase";
import {
  resolveSupabaseConfig,
  SupabaseConfigurationError,
} from "@/lib/supabase-config";
export const dynamic = "force-dynamic";
function reply(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export async function GET() {
  let config;
  try {
    config = resolveSupabaseConfig(supabaseEnvironment());
  } catch (e) {
    return reply(
      {
        status: "error",
        configuration: {
          ok: false,
          code:
            e instanceof SupabaseConfigurationError
              ? e.code
              : "CONFIGURATION_ERROR",
        },
      },
      503,
    );
  }
  const checks = await Promise.allSettled([
    fetch(config.url + "/auth/v1/settings", {
      headers: { apikey: config.key },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
      redirect: "error",
    }).then(async (r) => {
      const settings = r.ok ? await r.json().catch(() => null) : null;
      return {
        ok: r.ok,
        status: r.status,
        signupEnabled:
          typeof settings?.disable_signup === "boolean"
            ? !settings.disable_signup && settings.external?.email !== false
            : null,
        emailConfirmationRequired:
          typeof settings?.mailer_autoconfirm === "boolean"
            ? !settings.mailer_autoconfirm
            : null,
      };
    }),
    createClient(config.url, config.key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            signal: AbortSignal.timeout(10000),
            cache: "no-store",
          }),
      },
    })
      .from("products")
      .select("id,inventory_quantities(quantity)", { count: "exact" })
      .limit(1)
      .then((r) => ({
        ok: !r.error,
        code: r.error?.code ?? null,
        productCount: r.count ?? 0,
      })),
  ]);
  const auth =
    checks[0].status === "fulfilled"
      ? checks[0].value
      : { ok: false, status: 0 };
  const database =
    checks[1].status === "fulfilled"
      ? checks[1].value
      : { ok: false, code: "CONNECTION_FAILED", productCount: 0 };
  const ready = auth.ok && database.ok;
  return reply(
    {
      status: ready ? "ready" : "error",
      configuration: {
        ok: true,
        url: config.url,
        normalizedDashboardUrl: config.normalizedDashboardUrl,
      },
      auth,
      database,
    },
    ready ? 200 : 503,
  );
}
