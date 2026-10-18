"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type Product, type Booking, categories } from "@/lib/data";
import { money, today } from "@/lib/utils";
import {
  rentalDays,
  calculatePrice,
  bookingSchema,
  statuses,
} from "@/lib/validation";
import {
  checkAvailability,
  createBooking,
  simulatePayment,
  updateProfile,
  updateBookingStatus,
  saveProduct,
  uploadProductImage,
} from "@/lib/actions";
import { Button } from "./ui/button";
import { ProductImage } from "./product-image";
export function Field({
  label,
  id,
  children,
  error,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <span role="alert" className="field-error">
          {error}
        </span>
      )}
    </div>
  );
}
export function RentalSelector({ product: p }: { product: Product }) {
  const [start, setStart] = useState(today());
  const [end, setEnd] = useState(today());
  const [delivery, setDelivery] = useState(false);
  const [result, setResult] = useState("");
  const [pending, run] = useTransition();
  const days = rentalDays(start, end);
  const valid = days >= 1 && days <= 90 && start >= today();
  const price = valid
    ? calculatePrice(p.daily_price, days, p.deposit, delivery)
    : null;
  return (
    <div className="price-panel">
      <div className="price-heading">
        <div>
          <strong>{money(p.daily_price)}</strong>
          <small> / hari</small>
        </div>
        <span>HARGA DEMO</span>
      </div>
      <div className="field-grid">
        <Field label="Mulai sewa" id="start">
          <input
            type="date"
            id="start"
            min={today()}
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              setResult("");
            }}
          />
        </Field>
        <Field label="Selesai sewa" id="end">
          <input
            type="date"
            id="end"
            min={start || today()}
            value={end}
            onChange={(e) => {
              setEnd(e.target.value);
              setResult("");
            }}
          />
        </Field>
      </div>
      <Field label="Penerimaan alat" id="fulfillment">
        <select
          id="fulfillment"
          value={delivery ? "delivery" : "pickup"}
          onChange={(e) => setDelivery(e.target.value === "delivery")}
        >
          <option value="pickup">Ambil sendiri · gratis</option>
          <option value="delivery">Pengiriman · Rp35.000</option>
        </select>
      </Field>
      <button
        className="text-button"
        disabled={!valid || pending}
        onClick={() =>
          run(async () => {
            const r = await checkAvailability(p.id, start, end);
            setResult(
              r.error ?? `${r.remaining} unit tersedia pada tanggal pilihanmu.`,
            );
          })
        }
      >
        {pending ? "Memeriksa…" : "Periksa ketersediaan tanggal"}
      </button>
      {result && (
        <div className="alert" role="status">
          {result}
        </div>
      )}
      {price ? (
        <>
          <div className="price-line">
            <span>Sewa {days} hari (inklusif)</span>
            <strong>{money(price.subtotal)}</strong>
          </div>
          <div className="price-line">
            <span>Deposit dapat dikembalikan</span>
            <strong>{money(p.deposit)}</strong>
          </div>
          <div className="price-line">
            <span>Pengiriman</span>
            <strong>{money(price.delivery_fee)}</strong>
          </div>
          <div className="price-line total">
            <span>Total awal</span>
            <strong>{money(price.total)}</strong>
          </div>
        </>
      ) : (
        <div className="alert error">
          Pilih tanggal valid dengan durasi 1–90 hari.
        </div>
      )}
      {valid && p.available && p.quantity > 0 ? (
        <Button className="full-width" asChild>
          <Link
            href={`/booking/${p.id}?start=${start}&end=${end}&fulfillment=${delivery ? "delivery" : "pickup"}`}
          >
            Sewa Sekarang <ArrowUpRight size={18} />
          </Link>
        </Button>
      ) : (
        <Button disabled className="full-width">
          {p.quantity === 0
            ? "Stok sedang tidak tersedia"
            : "Pilih tanggal valid"}
        </Button>
      )}
      <p className="note" style={{ marginTop: 12 }}>
        Harga mingguan referensi: {money(p.weekly_price)}. Checkout demo
        menghitung tarif harian × durasi. Ketersediaan final diverifikasi saat
        pemesanan.
      </p>
    </div>
  );
}
export function Gallery({ product: p }: { product: Product }) {
  const [angle, setAngle] = useState(0);
  return (
    <>
      <div className="detail-art">
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `rotate(${angle === 1 ? -12 : angle === 2 ? 10 : 0}deg) scale(${angle === 2 ? 1.15 : 1})`,
            transition: "transform .35s",
          }}
        >
          <ProductImage
            src={p.image}
            alt={`Ilustrasi ${p.name}, sudut ${angle + 1}`}
            priority
          />
        </div>
        <span className="product-tag">
          Ilustrasi produk · bukan foto unit aktual
        </span>
      </div>
      <div className="detail-thumbs">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            className={angle === i ? "selected" : ""}
            aria-label={`Lihat sudut ilustrasi ${i + 1}`}
            aria-pressed={angle === i}
            onClick={() => setAngle(i)}
          >
            <ProductImage src={p.image} alt="" />
          </button>
        ))}
      </div>
    </>
  );
}
export function BookingForm({
  product: p,
  start,
  end,
  fulfillment,
  name,
  phone,
}: {
  product: Product;
  start: string;
  end: string;
  fulfillment: string;
  name: string;
  phone: string;
}) {
  const router = useRouter();
  const [pending, run] = useTransition();
  const [error, setError] = useState("");
  const f = useForm<
    z.input<typeof bookingSchema>,
    unknown,
    z.output<typeof bookingSchema>
  >({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      product_id: p.id,
      start_date: start,
      end_date: end,
      customer_name: name,
      phone,
      fulfillment: fulfillment === "delivery" ? "delivery" : "pickup",
      address: "",
      notes: "",
    },
  });
  const values = useWatch({ control: f.control });
  const days = rentalDays(values.start_date ?? "", values.end_date ?? "");
  const price =
    days >= 1 && days <= 90
      ? calculatePrice(
          p.daily_price,
          days,
          p.deposit,
          values.fulfillment === "delivery",
        )
      : null;
  return (
    <form
      onSubmit={f.handleSubmit((data) =>
        run(async () => {
          setError("");
          const form = new FormData();
          Object.entries(data).forEach(([k, v]) => form.set(k, v));
          const r = await createBooking(form);
          if (r.error) {
            setError(r.error);
            toast.error(r.error);
          } else if (r.id) router.push("/checkout/" + r.id);
        }),
      )}
      className="form-shell"
    >
      <div className="form-card">
        <h2>Rencanakan sewamu.</h2>
        <p className="note">
          Tanggal awal dan akhir dihitung sebagai hari sewa. Satu pesanan untuk
          satu unit alat.
        </p>
        <h3>01 / Waktu sewa</h3>
        <input type="hidden" {...f.register("product_id")} />
        <div className="field-grid">
          <Field
            label="Mulai sewa"
            id="start_date"
            error={f.formState.errors.start_date?.message}
          >
            <input
              type="date"
              id="start_date"
              min={today()}
              {...f.register("start_date")}
            />
          </Field>
          <Field
            label="Selesai sewa"
            id="end_date"
            error={f.formState.errors.end_date?.message}
          >
            <input
              type="date"
              id="end_date"
              min={values.start_date}
              {...f.register("end_date")}
            />
          </Field>
        </div>
        <h3>02 / Data penyewa</h3>
        <Field
          label="Nama lengkap"
          id="customer_name"
          error={f.formState.errors.customer_name?.message}
        >
          <input
            id="customer_name"
            autoComplete="name"
            {...f.register("customer_name")}
          />
        </Field>
        <Field
          label="Nomor telepon"
          id="phone"
          error={f.formState.errors.phone?.message}
        >
          <input id="phone" autoComplete="tel" {...f.register("phone")} />
        </Field>
        <h3>03 / Penerimaan alat</h3>
        <Field label="Metode penerimaan" id="fulfillment">
          <select id="fulfillment" {...f.register("fulfillment")}>
            <option value="pickup">Ambil sendiri · gratis</option>
            <option value="delivery">Dikirim · Rp35.000 (demo)</option>
          </select>
        </Field>
        {values.fulfillment === "delivery" && (
          <Field
            label="Alamat lengkap"
            id="address"
            error={f.formState.errors.address?.message}
          >
            <textarea
              id="address"
              autoComplete="street-address"
              {...f.register("address")}
            />
          </Field>
        )}
        <Field label="Catatan tambahan (opsional)" id="notes">
          <textarea id="notes" maxLength={1000} {...f.register("notes")} />
        </Field>
        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}
      </div>
      <aside className="order-summary">
        <div className="summary-product">
          <div className="mini-art">
            <ProductImage src={p.image} alt={"Ilustrasi " + p.name} />
          </div>
          <div>
            <h3>{p.name}</h3>
            <p>{money(p.daily_price)} / hari · harga demo</p>
          </div>
        </div>
        {price ? (
          <>
            <div className="price-line">
              <span>Sewa {days} hari</span>
              <strong>{money(price.subtotal)}</strong>
            </div>
            <div className="price-line">
              <span>Deposit jaminan</span>
              <strong>{money(price.deposit)}</strong>
            </div>
            <div className="price-line">
              <span>Pengiriman</span>
              <strong>{money(price.delivery_fee)}</strong>
            </div>
            <div className="price-line total">
              <span>Total awal</span>
              <strong>{money(price.total)}</strong>
            </div>
          </>
        ) : (
          <div className="alert error">Lengkapi tanggal yang valid.</div>
        )}
        <Button type="submit" disabled={pending} className="full-width">
          {pending ? "Memeriksa stok…" : "Lanjut ke Checkout"}
          <ArrowUpRight size={17} />
        </Button>
        <p className="note" style={{ marginTop: 15 }}>
          <ShieldCheck
            size={13}
            style={{ display: "inline", verticalAlign: "middle" }}
          />{" "}
          Harga dan stok diverifikasi di server. Pesanan menahan stok selama 30
          menit sebelum pembayaran demo.
        </p>
        <div className="alert">MODE DEMO — Tidak Ada Transaksi Nyata</div>
      </aside>
    </form>
  );
}
export function PaymentForm({ booking: b }: { booking: Booking }) {
  const [method, setMethod] = useState("QRIS Demo");
  const [pending, run] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  if (b.payment_status === "paid")
    return (
      <Button asChild>
        <Link href={"/booking/success/" + b.id}>
          Lihat konfirmasi demo <Check size={17} />
        </Link>
      </Button>
    );
  const expired = new Date(b.hold_until) < new Date();
  return (
    <div>
      <div className="alert">
        MODE DEMO — Tidak Ada Transaksi Nyata. Tidak perlu transfer atau
        memindai kode apa pun.
      </div>
      <h3>Metode pembayaran simulasi</h3>
      <div className="payment-options">
        {["QRIS Demo", "Bank Transfer Demo", "E-Wallet Demo"].map((m) => (
          <label key={m}>
            <input
              type="radio"
              name="method"
              value={m}
              checked={method === m}
              onChange={() => setMethod(m)}
            />
            <span>{m}</span>
          </label>
        ))}
      </div>
      {expired && (
        <div className="alert error">
          Waktu pemesanan berakhir. Buat pesanan baru untuk memeriksa stok
          kembali.
        </div>
      )}
      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}
      <Button
        className="full-width"
        disabled={pending || expired || b.rental_status === "Dibatalkan"}
        onClick={() =>
          run(async () => {
            const r = await simulatePayment(b.id, method);
            if (r.error) setError(r.error);
            else {
              toast.success("Simulasi pembayaran berhasil");
              router.push("/booking/success/" + b.id);
              router.refresh();
            }
          })
        }
      >
        {pending ? "Memproses simulasi…" : "Simulasikan Pembayaran Berhasil"}
        <Check size={17} />
      </Button>
      <p className="note" style={{ marginTop: 15 }}>
        Batas waktu:{" "}
        {new Date(b.hold_until).toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        })}{" "}
        WIB. Ini adalah konfirmasi simulasi, bukan bukti transaksi bank.
      </p>
    </div>
  );
}
export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [pending, run] = useTransition();
  return (
    <form
      className="form-card"
      onSubmit={(e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        run(async () => {
          const r = await updateProfile(d);
          if (r.error) toast.error(r.error);
          else toast.success(r.message);
        });
      }}
    >
      <h2>Profilmu.</h2>
      <Field label="Nama lengkap" id="name">
        <input
          id="name"
          name="name"
          defaultValue={name}
          required
          minLength={2}
        />
      </Field>
      <Field label="Nomor telepon" id="phone">
        <input id="phone" name="phone" defaultValue={phone} maxLength={20} />
      </Field>
      <Button disabled={pending}>Simpan Perubahan</Button>
    </form>
  );
}
export function StatusForm({ id, status }: { id: string; status: string }) {
  const [pending, run] = useTransition();
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        run(async () => {
          const r = await updateBookingStatus(d);
          if (r.error) toast.error(r.error);
          else {
            toast.success(r.message);
            router.refresh();
          }
        });
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Field id="status" label="Ubah status pesanan">
        <select id="status" name="status" defaultValue={status}>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Field>
      <Button disabled={pending}>Perbarui Status</Button>
      <p className="note" style={{ marginTop: 12 }}>
        Server hanya mengizinkan transisi berikutnya yang sah. Pembayaran hanya
        melalui simulasi milik pelanggan.
      </p>
    </form>
  );
}
export function ProductForm({ product: p }: { product?: Product }) {
  const [pending, run] = useTransition();
  const [image, setImage] = useState(p?.image ?? "/products/kamera-lensa.svg");
  const router = useRouter();
  return (
    <form
      className="form-card"
      onSubmit={(e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        d.set("image", image);
        run(async () => {
          const r = await saveProduct(d);
          if (r.error) toast.error(r.error);
          else {
            toast.success(r.message);
            router.push("/admin/products");
            router.refresh();
          }
        });
      }}
    >
      <h2>{p ? "Edit produk & stok" : "Tambah peralatan baru"}</h2>
      <input type="hidden" name="id" value={p?.id ?? ""} />
      <div className="field-grid">
        <Field id="name" label="Nama produk">
          <input id="name" name="name" defaultValue={p?.name} required />
        </Field>
        <Field id="slug" label="Slug URL">
          <input
            id="slug"
            name="slug"
            defaultValue={p?.slug}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            required
          />
        </Field>
      </div>
      <Field id="category" label="Kategori">
        <select id="category" name="category" defaultValue={p?.category}>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field id="description" label="Deskripsi">
        <textarea
          id="description"
          name="description"
          defaultValue={p?.description}
          minLength={10}
          required
        />
      </Field>
      <div className="field-grid">
        {[
          ["daily_price", "Harga harian", p?.daily_price ?? 100000],
          [
            "weekly_price",
            "Harga mingguan referensi",
            p?.weekly_price ?? 600000,
          ],
          ["deposit", "Deposit", p?.deposit ?? 500000],
          ["quantity", "Jumlah unit", p?.quantity ?? 1],
        ].map(([id, label, v]) => (
          <Field id={String(id)} key={id} label={String(label)}>
            <input
              type="number"
              id={String(id)}
              name={String(id)}
              defaultValue={Number(v)}
              min={0}
              required
            />
          </Field>
        ))}
      </div>
      <Field id="image" label="Gambar produk">
        <select
          id="image"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        >
          {image.startsWith("https://") && (
            <option value={image}>Gambar unggahan</option>
          )}
          {categories.map((c) => (
            <option key={c.slug} value={"/products/" + c.slug + ".svg"}>
              Ilustrasi {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field id="upload" label="Unggah gambar ke Supabase Storage">
        <input
          id="upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const d = new FormData();
            d.set("file", file);
            const r = await uploadProductImage(d);
            if (r.error) toast.error(r.error);
            else if (r.message) {
              setImage(r.message);
              toast.success("Gambar berhasil diunggah");
            }
          }}
        />
      </Field>
      <label className="check-label">
        <input
          type="checkbox"
          name="available"
          defaultChecked={p?.available ?? true}
        />{" "}
        Aktif dan dapat dipesan
      </label>
      <div className="inline-actions">
        <Button disabled={pending}>Simpan Produk</Button>
        <Button asChild variant="outline">
          <Link href="/admin/products">Kembali</Link>
        </Button>
      </div>
    </form>
  );
}
