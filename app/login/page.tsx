import Image from "next/image";
import { AuthForm } from "@/components/forms";
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
            Tautan konfirmasi tidak valid atau kedaluwarsa. Silakan masuk atau
            ulangi pendaftaran.
          </div>
        )}
        <AuthForm next={safeNext(q.next)} configured={configured()} />
      </div>
    </div>
  );
}
