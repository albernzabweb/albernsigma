import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  hasSupabaseEnvironment,
  resolveSupabaseConfig,
} from "./supabase-config";
export function supabaseEnvironment() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}
export function configured() {
  return hasSupabaseEnvironment(supabaseEnvironment());
}
export async function supabase() {
  const config = resolveSupabaseConfig(supabaseEnvironment());
  const store = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) =>
            store.set(name, value, options),
          );
        } catch {
          /* Server components cannot write cookies; proxy refreshes sessions. */
        }
      },
    },
  });
}
