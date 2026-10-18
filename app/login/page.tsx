import Image from "next/image";
import { AuthForm } from "@/components/auth-form";
import { configured } from "@/lib/supabase";
import { safeNext } from "@/lib/utils";
export const metadata = { title: "Masuk" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const q = await searchParams;
  return (
    <div className="container auth-wrap">
      <div className="auth-story">
        <span className="eyebrow">WELCOME TO ALNUDIV</span>
        <h1>
          Ide berikutnya
          <br />
          menunggumu.
        </h1>
        <p>Sewa teknologi, tanpa ribet. Wujudkan satu ide lagi hari ini.</p>
        <Image
          width={520}
          height={360}
          unoptimized
          src="/products/kamera-lensa.svg"
          alt="Ilustrasi kamera"
        />
      </div>
      <div>
        {q.error && (
          <div className="alert error">
            Tautan konfirmasi tidak valid atau kedaluwarsa. Masuk dengan emailmu
            untuk meminta tautan konfirmasi yang baru.
          </div>
        )}
        <AuthForm next={safeNext(q.next)} configured={configured()} />
      </div>
    </div>
  );
}
