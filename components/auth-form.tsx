"use client";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Mail,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { authenticate, resendConfirmation } from "@/lib/actions";
import { customerNext } from "@/lib/customer-registration";
import { Button } from "./ui/button";
export function AuthForm({
  register = false,
  next = "/dashboard",
  configured = true,
}: {
  register?: boolean;
  next?: string;
  configured?: boolean;
}) {
  const [pending, run] = useTransition();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (cooldown < 1) return;
    const timer = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  if (confirmation)
    return (
      <div className="auth-form">
        <div className="registration-icon">
          <Mail size={25} />
        </div>
        <span className="eyebrow">AKUN CUSTOMER / KONFIRMASI EMAIL</span>
        <h2>Satu langkah lagi.</h2>
        <p>
          Klik tautan konfirmasi yang dikirim ke <strong>{email}</strong>.
          Setelah itu akunmu aktif otomatis—tanpa persetujuan admin.
        </p>
        <div className="alert success" role="status">
          {message ||
            "Periksa inbox dan folder spam. Setelah konfirmasi, kamu bisa masuk dan mulai menyewa."}
        </div>
        <ol className="registration-steps">
          <li>
            <span>1</span>Buka email konfirmasi pendaftaran.
          </li>
          <li>
            <span>2</span>Klik tautan konfirmasi pendaftaran.
          </li>
          <li>
            <span>3</span>Masuk dan kelola pesananmu sendiri.
          </li>
        </ol>
        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}
        <Button className="full-width" asChild>
          <Link href={"/login?next=" + encodeURIComponent(customerNext(next))}>
            Sudah Konfirmasi? Masuk <ArrowUpRight size={17} />
          </Link>
        </Button>
        <Button
          className="full-width"
          variant="outline"
          disabled={pending || cooldown > 0}
          onClick={() => {
            const f = new FormData();
            f.set("email", email);
            f.set("next", customerNext(next));
            run(async () => {
              setError("");
              const r = await resendConfirmation(f);
              setCooldown(60);
              if (r.error) setError(r.error);
              else setMessage(r.message ?? "Periksa emailmu.");
            });
          }}
        >
          {pending
            ? "Mengirim…"
            : cooldown > 0
              ? `Kirim Ulang dalam ${cooldown} dtk`
              : "Kirim Ulang Email Konfirmasi"}
        </Button>
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setConfirmation(false);
            setError("");
            setMessage("");
          }}
        >
          <ArrowLeft size={14} /> Kembali ke formulir
        </button>
      </div>
    );
  return (
    <form
      className="auth-form"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        f.set("next", register ? customerNext(next) : next);
        if (register && f.get("password") !== f.get("confirm_password")) {
          setError("Konfirmasi kata sandi belum sama.");
          return;
        }
        run(async () => {
          setError("");
          setMessage("");
          const r = await authenticate(f, register);
          if (r.requiresConfirmation && r.email) {
            setEmail(r.email);
            setMessage(r.message ?? "");
            setCooldown(register ? 60 : 0);
            setConfirmation(true);
            return;
          }
          if (r.error) setError(r.error);
          if (r.message) setMessage(r.message);
          if (r.redirect) {
            router.push(r.redirect);
            router.refresh();
          }
        });
      }}
    >
      <h2>{register ? "Buat akun customer." : "Senang kamu kembali."}</h2>
      <p>
        {register
          ? "Daftar sendiri, simpan profilmu, dan kelola semua pesanan dari satu akun."
          : "Masuk untuk melanjutkan rencana dan pesananmu."}
      </p>
      {!configured && (
        <div className="alert">
          Pendaftaran dan login belum aktif. Silakan hubungi pengelola situs.
        </div>
      )}
      {register && (
        <>
          <div className="registration-note">
            <Check size={15} /> Profil customer dibuat otomatis. Tidak perlu
            menghubungi admin.
          </div>
          <div className="field">
            <label htmlFor="name">Nama lengkap</label>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              placeholder="Nama kamu"
            />
          </div>
        </>
      )}
      <div className="field">
        <label htmlFor="email">Alamat email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="kamu@contoh.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="password">Kata sandi</label>
        <div className="password-input">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            maxLength={128}
            autoComplete={register ? "new-password" : "current-password"}
            placeholder="Minimal 8 karakter"
          />
          <button
            type="button"
            aria-label={
              showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
            }
            aria-pressed={showPassword}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>
      {register && (
        <div className="field">
          <label htmlFor="confirm_password">Ulangi kata sandi</label>
          <input
            id="confirm_password"
            name="confirm_password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            placeholder="Ketik ulang kata sandimu"
          />
          <small>
            Gunakan email yang bisa kamu akses untuk konfirmasi jika diperlukan.
          </small>
        </div>
      )}
      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="alert success" role="status">
          {message}
        </div>
      )}
      <Button
        type="submit"
        className="full-width"
        disabled={pending || !configured}
      >
        {pending ? "Sebentar…" : register ? "Daftar sebagai Customer" : "Masuk"}
        <ArrowUpRight size={17} />
      </Button>
      <p className="auth-switch">
        {register ? "Sudah punya akun? " : "Belum punya akun? "}
        <Link
          href={`${register ? "/login" : "/register"}?next=${encodeURIComponent(customerNext(next))}`}
        >
          {register ? "Masuk di sini" : "Daftar sendiri di sini"}
        </Link>
      </p>
      <p className="note center">MODE DEMO — Tidak Ada Transaksi Nyata</p>
    </form>
  );
}
