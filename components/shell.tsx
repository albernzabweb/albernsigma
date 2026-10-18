"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Aperture,
  ArrowUpRight,
  Menu,
  X,
  Camera,
  ArrowRight,
} from "lucide-react";
import { Button } from "./ui/button";
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="ALNUDIV beranda">
      <span className="brand-mark">
        <Aperture size={23} />
      </span>
      ALNUDIV<span className="brand-dot">.</span>
    </Link>
  );
}
const links = [
  ["/catalog", "Jelajahi Alat"],
  ["/how-it-works", "Cara Sewa"],
  ["/about", "Tentang Kami"],
  ["/faq", "FAQ"],
];
export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <>
      <div className="announcement">
        Lebih banyak karya. Lebih sedikit batas.{" "}
        <Link href="/catalog">
          Temukan alatmu <ArrowUpRight size={12} />
        </Link>
      </div>
      <header className="header">
        <div className="container header-inner">
          <Brand />
          <nav aria-label="Navigasi utama" className="desktop-nav">
            {links.map(([url, text]) => (
              <Link
                className={path === url ? "active" : ""}
                key={url}
                href={url}
              >
                {text}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <Link className="login-link" href="/dashboard">
              Pesanan Saya
            </Link>
            <Button asChild size="sm">
              <Link href="/login">
                Masuk / Daftar <ArrowUpRight size={16} />
              </Link>
            </Button>
          </div>
          <button
            className="mobile-toggle"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav className="mobile-nav" aria-label="Navigasi seluler">
            {[
              ...links,
              ["/dashboard", "Pesanan Saya"],
              ["/login", "Masuk / Daftar"],
            ].map(([url, text]) => (
              <Link key={url} href={url} onClick={() => setOpen(false)}>
                {text}
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="container footer-top">
        <div>
          <Brand />
          <p>
            Teknologi untuk setiap ide.
            <br />
            Sewa alatnya. Wujudkan ceritanya.
          </p>
          <span className="social-icon">
            <Camera size={19} />
          </span>
        </div>
        <div>
          <h4>Eksplorasi</h4>
          <Link href="/catalog">Semua Peralatan</Link>
          <Link href="/categories/kamera-lensa">Kamera & Lensa</Link>
          <Link href="/categories/drone">Drone</Link>
          <Link href="/categories/laptop-komputer">Laptop & Komputer</Link>
        </div>
        <div>
          <h4>ALNUDIV</h4>
          <Link href="/about">Tentang Kami</Link>
          <Link href="/how-it-works">Cara Sewa</Link>
          <Link href="/faq">Pertanyaan Umum</Link>
          <Link href="/contact">Hubungi Kami</Link>
        </div>
        <div className="footer-note">
          <h4>Punya rencana besar?</h4>
          <p>Mulai dengan alat yang tepat.</p>
          <Link href="/catalog">
            Temukan kebutuhanmu <ArrowRight size={17} />
          </Link>
          <small>
            Proyek Innovation & Commercialisation.
            <br />
            Semua harga bersifat ilustratif.
          </small>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} ALNUDIV. Dibuat untuk ide besarmu.
        </span>
        <span>MODE DEMO — Tidak Ada Transaksi Nyata</span>
      </div>
    </footer>
  );
}
