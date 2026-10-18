import Image from "next/image";
import { AuthForm } from "@/components/auth-form";
import { configured } from "@/lib/supabase";
import { safeNext } from "@/lib/utils";
export const metadata = { title: "Buat Akun" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const q = await searchParams;
  return (
    <div className="container auth-wrap">
      <div className="auth-story">
        <span className="eyebrow">MAKE ROOM FOR YOUR IDEAS</span>
        <h1>
          Mulai kecil.
          <br />
          Berkarya besar.
        </h1>
        <p>Alat premium untuk setiap perjalanan kreatifmu.</p>
        <Image
          width={520}
          height={360}
          unoptimized
          src="/products/drone.svg"
          alt="Ilustrasi drone"
        />
      </div>
      <AuthForm register next={safeNext(q.next)} configured={configured()} />
    </div>
  );
}
