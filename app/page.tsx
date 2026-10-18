import { Counter } from "@/components/counter";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Camera,
  Laptop,
  Gamepad2,
  Projector,
  Speaker,
  Plane,
  ShieldCheck,
  Truck,
  CalendarDays,
  ArrowRight,
  Check,
  Quote,
  Sparkles,
  CirclePlay,
} from "lucide-react";
import { getProducts } from "@/lib/queries";
import { categories } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { Faq } from "@/components/ui/faq";
import { Button } from "@/components/ui/button";
import { CameraHero } from "@/components/camera-hero";
const icons = [Camera, Laptop, Plane, Projector, Gamepad2, Speaker];
export default async function Home() {
  const products = await getProducts();
  return (
    <>
      <section className="hero">
        <div className="hero-grid container">
          <Reveal className="hero-copy">
            <span className="eyebrow hero-eyebrow">
              <span className="pulse-dot" /> IDE BESAR, TANPA BATAS
            </span>
            <h1>
              Teknologi Premium,
              <br />
              Kini Bisa Kamu
              <br />
              <span>Sewa.</span>
            </h1>
            <p className="hero-sub">
              Sewa kamera, laptop, drone, konsol game, hingga perlengkapan event
              dengan mudah, cepat, dan fleksibel.
            </p>
            <div className="hero-buttons">
              <Button asChild>
                <Link href="/catalog">
                  Jelajahi Katalog <ArrowUpRight size={18} />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/how-it-works">
                  <CirclePlay size={19} /> Cara Kerja
                </Link>
              </Button>
            </div>
            <div className="hero-proof">
              <div className="avatar-group">
                <span>AN</span>
                <span>RA</span>
                <span>DI</span>
                <span>+</span>
              </div>
              <div>
                <strong>Ruang untuk semua kreator.</strong>
                <small>Mulai dari satu ide, jadi karya luar biasa.</small>
              </div>
            </div>
            <div className="hero-mini">
              <span>
                <Check size={14} /> Alat terawat
              </span>
              <span>
                <Check size={14} /> Sewa fleksibel
              </span>
              <span>
                <Check size={14} /> Harga transparan
              </span>
            </div>
          </Reveal>
          <div className="hero-visual">
            <div className="orb orb-one" />
            <div className="orb orb-two" />
            <span className="visual-index">THE CREATOR’S CHOICE / 01</span>
            <CameraHero />
            <div className="floating-card float-availability">
              <span className="check-circle">
                <Check size={14} />
              </span>
              <div>
                <strong>Siap untuk beraksi.</strong>
                <small>Alat premium, kondisi prima</small>
              </div>
            </div>
            <div className="floating-card float-price">
              <span className="eyebrow">SONY ALPHA A7 IV · HARGA DEMO</span>
              <div>
                <strong>Rp250.000</strong>
                <small> / hari</small>
              </div>
              <span>
                Full-frame 33 MP <i /> 4K 60p <ArrowUpRight size={18} />
              </span>
            </div>
            <div className="visual-caption">
              <span>
                01 <i /> 03
              </span>
              <small>Geser kursor. Eksplorasi setiap sudut.</small>
            </div>
          </div>
        </div>
        <div className="hero-bottom container">
          <span>
            BUKAN SEKADAR ALAT.
            <br />
            <b>PARTNER UNTUK IDE BESARMU.</b>
          </span>
          <div className="brand-rail">
            <b>SONY</b>
            <b className="canon">Canon</b>
            <b>FUJIFILM</b>
            <b className="dji">dji</b>
            <b>Apple</b>
            <b>JBL</b>
          </div>
        </div>
      </section>
      <section className="section container">
        <Reveal>
          <div className="section-heading">
            <div>
              <span className="eyebrow">CARI YANG KAMU BUTUHKAN</span>
              <h2>Satu ide. Banyak kemungkinan.</h2>
            </div>
            <Link className="text-link" href="/catalog">
              Semua kategori <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
        <div className="category-grid">
          {categories.map((c, i) => {
            const Icon = icons[i];
            return (
              <Link
                key={c.slug}
                href={"/categories/" + c.slug}
                className="category-card"
              >
                <span className="category-icon">
                  <Icon size={26} />
                </span>
                <h3>{c.name}</h3>
                <span className="category-description">{c.description}</span>
                <ArrowUpRight className="category-arrow" size={17} />
              </Link>
            );
          })}
        </div>
      </section>
      <section className="section section-soft">
        <div className="container">
          <Reveal>
            <div className="section-heading">
              <div>
                <span className="eyebrow">PILIHAN PALING DICARI</span>
                <h2>Siap jadi bagian dari ceritamu.</h2>
                <p>Peralatan pilihan untuk karya yang lebih dari biasa.</p>
              </div>
              <Link className="text-link" href="/catalog">
                Lihat semua alat <ArrowUpRight size={18} />
              </Link>
            </div>
          </Reveal>
          <div className="product-grid">
            {[products[0], products[6], products[3], products[12]]
              .filter(Boolean)
              .map((p) => (
                <Reveal key={p.id}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
          </div>
          <p className="demo-price-note">
            Harga ilustratif untuk demonstrasi. Gambar produk merupakan
            ilustrasi.
          </p>
        </div>
      </section>
      <section className="section container benefits-section">
        <Reveal>
          <span className="eyebrow">LEBIH MUDAH. LEBIH MUNGKIN.</span>
          <h2>
            Fokus pada karyamu.
            <br />
            <span className="muted">Urusan alat, biar kami.</span>
          </h2>
          <p>Punya akses ke teknologi terbaik, tanpa harus memilikinya.</p>
          <Button variant="outline" asChild>
            <Link href="/about">
              Kenali Albencam <ArrowUpRight size={17} />
            </Link>
          </Button>
        </Reveal>
        <div className="benefits-grid">
          {[
            [
              ShieldCheck,
              "Kualitas yang bisa diandalkan",
              "Setiap alat diperiksa dan dirawat agar siap mendukung rencanamu.",
            ],
            [
              CalendarDays,
              "Sesuai waktu & kebutuhanmu",
              "Pilih tanggal dan durasi sewa. Sehari atau seminggu, kamu tentukan.",
            ],
            [
              Truck,
              "Sampai di tempatmu",
              "Ambil sendiri atau pilih pengiriman. Semuanya dalam satu pemesanan.",
            ],
            [
              Sparkles,
              "Tanpa biaya tersembunyi",
              "Harga sewa, deposit, dan ongkir terlihat jelas sebelum checkout.",
            ],
          ].map(([Icon, title, desc]) => {
            const I = Icon as typeof ShieldCheck;
            return (
              <Reveal key={String(title)} className="benefit">
                <span>
                  <I size={23} />
                </span>
                <h3>{String(title)}</h3>
                <p>{String(desc)}</p>
              </Reveal>
            );
          })}
        </div>
      </section>
      <section className="section how-section">
        <div className="container">
          <Reveal className="center">
            <span className="eyebrow">SESEDERHANA ITU</span>
            <h2>Dari rencana, jadi nyata.</h2>
            <p>Tiga langkah kecil menuju karya besarmu.</p>
          </Reveal>
          <div className="steps">
            {[
              [
                "01",
                "Temukan alatmu",
                "Jelajahi koleksi dan pilih yang paling pas untuk kebutuhanmu.",
              ],
              [
                "02",
                "Atur waktu sewamu",
                "Pilih tanggal, isi data diri, dan tinjau rincian pesanan.",
              ],
              [
                "03",
                "Siap. Mulai berkarya.",
                "Selesaikan pembayaran demo, lalu pantau pesananmu.",
              ],
            ].map(([n, h, p]) => (
              <Reveal key={n} className="step">
                <span>{n}</span>
                <h3>{h}</h3>
                <p>{p}</p>
                <ArrowRight size={22} />
              </Reveal>
            ))}
          </div>
          <div className="center">
            <Link href="/how-it-works" className="text-link">
              Pelajari cara sewa <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="collection">
          <div>
            <span className="eyebrow">THE WEEKEND COLLECTION</span>
            <h2>
              Akhir pekan.
              <br />
              Cerita baru.
            </h2>
            <p>
              Dari menangkap senja hingga game night bersama teman. Bikin waktu
              luangmu lebih berkesan.
            </p>
            <Button asChild>
              <Link href="/categories/konsol-game">
                Bikin rencanamu <ArrowUpRight size={17} />
              </Link>
            </Button>
          </div>
          <div className="collection-art">
            <Image
              width={520}
              height={360}
              unoptimized
              src="/products/konsol-game.svg"
              alt="Ilustrasi konsol game"
            />
            <span className="collection-sticker">
              PLAY MORE.
              <br />
              <b>OWN LESS.</b>
            </span>
          </div>
        </div>
      </section>
      <section className="container stats">
        <div>
          <span className="eyebrow">DIRANCANG UNTUK BERKEMBANG</span>
          <small>Angka ilustratif, bukan capaian operasional.</small>
        </div>
        {[
          ["1.000+", "Ide yang ingin diwujudkan"],
          ["18", "Peralatan dalam katalog demo"],
          ["6", "Kategori untuk dieksplorasi"],
        ].map(([n, s]) => (
          <div key={n}>
            <strong>
              <Counter
                value={parseInt(n.replace(/[^0-9]/g, ""), 10)}
                suffix={n.includes("+") ? "+" : ""}
              />
            </strong>
            <span>{s}</span>
          </div>
        ))}
      </section>
      <section className="section container">
        <Reveal className="section-heading">
          <div>
            <span className="eyebrow">CERITA DARI PARA KREATOR</span>
            <h2>Alatnya disewa. Kesannya menetap.</h2>
          </div>
          <span className="sample-label">Testimoni contoh / ilustratif</span>
        </Reveal>
        <div className="testimonials">
          {[
            [
              "AN",
              "Andini",
              "Content Creator",
              "Bisa coba kamera yang selama ini aku incar untuk proyek akhir pekan. Alurnya praktis dan semua biayanya jelas dari awal.",
            ],
            [
              "RA",
              "Raka",
              "Mahasiswa & Filmmaker",
              "Buat tugas film kampus, alat yang tepat bikin perbedaan besar. Konsep sewanya membantu kami fokus ke cerita.",
            ],
            [
              "DI",
              "Dimas",
              "Freelance Designer",
              "Butuh laptop kencang untuk presentasi klien. Senang ada pilihan sewa yang fleksibel tanpa komitmen jangka panjang.",
            ],
          ].map(([initial, n, role, q]) => (
            <Reveal className="testimonial" key={n}>
              <Quote size={25} />
              <p>“{q}”</p>
              <div>
                <span className="avatar">{initial}</span>
                <span>
                  <strong>{n}</strong>
                  <small>{role} · profil contoh</small>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="section container faq-section">
        <Reveal>
          <span className="eyebrow">MASIH PENASARAN?</span>
          <h2>
            Pertanyaanmu,
            <br />
            terjawab di sini.
          </h2>
          <p>Semua yang perlu kamu tahu sebelum mulai.</p>
          <Link href="/faq" className="text-link">
            Lihat semua FAQ <ArrowUpRight size={17} />
          </Link>
        </Reveal>
        <Faq limit={4} />
      </section>
      <section className="container cta-wrap">
        <div className="cta">
          <span className="eyebrow">YOUR NEXT BIG THING STARTS HERE</span>
          <h2>
            Idemu terlalu bagus
            <br />
            untuk ditunda.
          </h2>
          <p>Temukan teknologi yang kamu butuhkan. Mulai hari ini.</p>
          <Button asChild>
            <Link href="/catalog">
              Temukan Alatmu <ArrowUpRight size={18} />
            </Link>
          </Button>
          <span className="cta-orbit" />
        </div>
      </section>
    </>
  );
}
