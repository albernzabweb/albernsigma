"use client";
import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import { categories, type Product } from "@/lib/data";
import { ProductCard } from "./product-card";
import { money } from "@/lib/utils";
export function Catalog({
  products,
  category = "",
}: {
  products: Product[];
  category?: string;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(category);
  const [price, setPrice] = useState(500000);
  const [available, setAvailable] = useState(false);
  const [sort, setSort] = useState("featured");
  const list = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (!cat || p.category === cat) &&
            p.name.toLowerCase().includes(q.toLowerCase()) &&
            p.daily_price <= price &&
            (!available || (p.available && p.quantity > 0)),
        )
        .sort((a, b) =>
          sort === "price-asc"
            ? a.daily_price - b.daily_price
            : sort === "price-desc"
              ? b.daily_price - a.daily_price
              : sort === "name"
                ? a.name.localeCompare(b.name)
                : 0,
        ),
    [products, q, cat, price, available, sort],
  );
  function clear() {
    setQ("");
    setCat(category);
    setPrice(500000);
    setAvailable(false);
    setSort("featured");
  }
  return (
    <div className="catalog-layout">
      <aside className="filters">
        <h3>
          <SlidersHorizontal size={18} /> Temukan yang tepat
        </h3>
        <label htmlFor="search">Cari peralatan</label>
        <div className="search-input">
          <Search size={18} />
          <input
            id="search"
            placeholder="Kamera, laptop, drone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <label htmlFor="category">Kategori</label>
        <select
          id="category"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <label htmlFor="price">Harga maksimal / hari</label>
        <input
          id="price"
          type="range"
          min="50000"
          max="500000"
          step="25000"
          value={price}
          onChange={(e) => setPrice(+e.target.value)}
        />
        <p className="range-label">
          <span>Rp50.000</span>
          <strong>{money(price)}</strong>
        </p>
        <label className="check-label">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
          />{" "}
          Hanya yang tersedia
        </label>
        <button className="text-button" onClick={clear}>
          <X size={15} /> Hapus filter
        </button>
        <div className="filter-help">
          <span>Butuh inspirasi?</span>
          <p>Alat yang tepat adalah awal dari karya hebat.</p>
        </div>
      </aside>
      <div>
        <div className="catalog-toolbar">
          <span>
            <b>{list.length}</b> alat untuk ide besarmu
          </span>
          <label>
            <ArrowUpDown size={16} />
            <select
              aria-label="Urutkan produk"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="featured">Rekomendasi</option>
              <option value="price-asc">Harga terendah</option>
              <option value="price-desc">Harga tertinggi</option>
              <option value="name">Nama A–Z</option>
            </select>
          </label>
        </div>
        {list.length ? (
          <div className="product-grid catalog-grid">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={36} />
            <h2>Belum ketemu yang kamu cari.</h2>
            <p>Coba kata kunci lain atau longgarkan filter.</p>
            <button onClick={clear} className="button button-primary">
              Atur ulang filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
