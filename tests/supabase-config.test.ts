import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveSupabaseConfig,
  hasSupabaseEnvironment,
  SupabaseConfigurationError,
} from "../lib/supabase-config";
const env = {
  NEXT_PUBLIC_SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_test",
};
test("Dashboard links resolve to the matching Supabase API origin", () => {
  const c = resolveSupabaseConfig({
    ...env,
    NEXT_PUBLIC_SUPABASE_URL:
      "https://supabase.com/dashboard/project/lnelorknbftxifjoerox?showConnect=true",
  });
  assert.equal(c.url, "https://lnelorknbftxifjoerox.supabase.co");
  assert.equal(c.normalizedDashboardUrl, true);
});
test("API URL is preserved, whitespace/quotes stripped, publishable key alias supported", () => {
  assert.equal(
    resolveSupabaseConfig({
      ...env,
      NEXT_PUBLIC_SUPABASE_URL: ' "https://abcdefghijklmnopqrst.supabase.co/" ',
    }).url,
    env.NEXT_PUBLIC_SUPABASE_URL,
  );
  assert.equal(
    resolveSupabaseConfig({
      ...env,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_new",
    }).key,
    "sb_publishable_new",
  );
  assert.equal(resolveSupabaseConfig(env).normalizedDashboardUrl, false);
});
test("Partial or invalid configuration fails rather than silently selecting sample data", () => {
  assert.equal(hasSupabaseEnvironment({}), false);
  assert.equal(
    hasSupabaseEnvironment({ NEXT_PUBLIC_SUPABASE_URL: "https://example.com" }),
    true,
  );
  assert.throws(
    () =>
      resolveSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
      }),
    SupabaseConfigurationError,
  );
  for (const url of [
    "https://supabase.com/dashboard",
    "https://example.com/auth/v1",
    "https://user:pass@example.com",
    "http://example.com",
    "not-a-url",
  ])
    assert.throws(
      () => resolveSupabaseConfig({ ...env, NEXT_PUBLIC_SUPABASE_URL: url }),
      SupabaseConfigurationError,
    );
});
test("Service-role and secret keys are refused; anon JWT and local development remain supported", () => {
  const jwt = (role: string) =>
    "eyJhbGciOiJIUzI1NiJ9." +
    Buffer.from(JSON.stringify({ role })).toString("base64url") +
    ".signature";
  assert.throws(
    () =>
      resolveSupabaseConfig({
        ...env,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: jwt("service_role"),
      }),
    /service-role/,
  );
  assert.throws(
    () =>
      resolveSupabaseConfig({
        ...env,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_secret_private",
      }),
    /service-role/,
  );
  assert.equal(
    resolveSupabaseConfig({
      ...env,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: jwt("anon"),
    }).key,
    jwt("anon"),
  );
  assert.equal(
    resolveSupabaseConfig({
      ...env,
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    }).url,
    "http://127.0.0.1:54321",
  );
});
