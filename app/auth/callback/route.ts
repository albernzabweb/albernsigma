import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { safeNext } from "@/lib/utils";
export async function GET(request: Request) {
  const u = new URL(request.url);
  const code = u.searchParams.get("code");
  if (code) {
    const db = await supabase();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(safeNext(u.searchParams.get("next")), u.origin),
      );
  }
  return NextResponse.redirect(new URL("/login?error=confirmation", u.origin));
}
