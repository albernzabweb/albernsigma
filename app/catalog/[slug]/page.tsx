import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import { getProduct, getProducts } from "@/lib/queries";
import { categories } from "@/lib/data";
import { Gallery, RentalSelector } from "@/components/forms";
import { ProductCard } from "@/components/product-card";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const related = (await getProducts()).filter(
    (x) => x.category === p.category && x.id !== p.id,
  );
  return (
    <>
      <div className="container" style={{ paddingTop: 30 }}>
        <div className="breadcrumb">
          <Link href="/">Beranda</Link>
          <ChevronRight size={12} />
          <Link href="/catalog">Katalog</Link>
          <ChevronRight size={12} />
          <span>{p.name}</span>
        </div>
        <div className="detail-layout">
          <div>
            <Gallery product={p} />
            <div className="alert">
              Gambar merupakan ilustrasi. Spesifikasi dan kondisi unit perlu
              dikonfirmasi sebelum sewa operasional.
            </div>
          </div>
          <div className="detail-copy">
            <span className="eyebrow">
              {categories.find((c) => c.slug === p.category)?.name}
            </span>
            <h1>{p.name}</h1>
            <span className="availability-pill">
              <Check size={13} />
              {p.available && p.quantity > 0
                ? p.quantity + " unit dalam inventori"
                : "Stok belum tersedia"}
            </span>
            <p>{p.description}</p>
            <div className="spec-grid">
              {Object.entries(p.specifications).map(([k, v]) => (
                <div key={k}>
                  <small>{k}</small>
                  <b>{v}</b>
                </div>
              ))}
            </div>
            <RentalSelector product={p} />
          </div>
        </div>
      </div>
      <section className="section section-soft">
        <div className="container">
          <div className="section-heading">
            <h2>Lebih banyak pilihan untukmu.</h2>
            <Link className="text-link" href="/catalog">
              Jelajahi katalog
            </Link>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
