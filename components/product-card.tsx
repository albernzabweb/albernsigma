import Link from "next/link";
import { ArrowUpRight, Check, Star } from "lucide-react";
import { type Product, categories } from "@/lib/data";
import { money } from "@/lib/utils";
import { ProductImage } from "./product-image";
export function ProductCard({ product: p }: { product: Product }) {
  return (
    <Link href={"/catalog/" + p.slug} className="product-card">
      <div className={"product-art " + p.category}>
        <ProductImage src={p.image} alt={"Ilustrasi " + p.name} />
        <span
          className={
            "stock " + (!p.available || p.quantity === 0 ? "sold" : "")
          }
        >
          <i />
          {p.available && p.quantity > 0 ? "Tersedia" : "Sedang disewa"}
        </span>
        {p.badge && <span className="product-tag">{p.badge}</span>}
        <span className="card-arrow">
          <ArrowUpRight size={20} />
        </span>
      </div>
      <div className="product-info">
        <div className="product-eyebrow">
          {categories.find((c) => c.slug === p.category)?.name}
          <span>
            <Star size={12} /> Demo
          </span>
        </div>
        <h3>{p.name}</h3>
        <p>{Object.values(p.specifications).slice(0, 2).join(" · ")}</p>
        <div className="product-price">
          <strong>
            {money(p.daily_price)}
            <small> / hari</small>
          </strong>
          <span>
            <Check size={12} /> Siap pakai
          </span>
        </div>
      </div>
    </Link>
  );
}
