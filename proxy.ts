import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  hasSupabaseEnvironment,
  resolveSupabaseConfig,
} from "./lib/supabase-config";
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store");
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
  if (!hasSupabaseEnvironment(env)) return response;
  // A configuration issue must reach the page/action's readable error handling.
  let config;
  try {
    config = resolveSupabaseConfig(env);
  } catch {
    return response;
  }
  const db = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        response.headers.set("Cache-Control", "private, no-store");
        values.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  await db.auth.getUser();
  return response;
}
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/booking/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
  ],
};
