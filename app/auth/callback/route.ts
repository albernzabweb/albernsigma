import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { safeNext } from "@/lib/utils";
export async function GET(request: Request) {
  const u = new URL(request.url);
  const next = safeNext(u.searchParams.get("next"));
  const code = u.searchParams.get("code");
  const token_hash = u.searchParams.get("token_hash");
  const type = u.searchParams.get("type");
  if (code || token_hash) {
    const db = await supabase();
    const result = code
      ? await db.auth.exchangeCodeForSession(code)
      : token_hash && (type === "signup" || type === "email")
        ? await db.auth.verifyOtp({ token_hash, type })
        : null;
    if (result && !result.error)
      return NextResponse.redirect(new URL(next, u.origin));
  }
  const login = new URL("/login", u.origin);
  login.searchParams.set("error", "confirmation");
  login.searchParams.set("next", next);
  return NextResponse.redirect(login);
}
