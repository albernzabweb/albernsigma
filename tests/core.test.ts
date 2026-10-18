import { sampleProducts } from "../lib/data";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { bookingSchema, calculatePrice, rentalDays } from "../lib/validation";
import { today, safeNext } from "../lib/utils";
test("Inclusive rental pricing and deposit, no weekly discount ambiguity", () => {
  assert.equal(rentalDays("2030-01-01", "2030-01-03"), 3);
  assert.deepEqual(calculatePrice(250000, 3, 1500000, true), {
    subtotal: 750000,
    delivery_fee: 35000,
    deposit: 1500000,
    total: 2285000,
  });
  assert.throws(() => calculatePrice(1, 0, 0, false));
});
test("Reject past, reversed, overlong dates and incomplete delivery addresses", () => {
  const b = {
    product_id: "10000000-0000-4000-8000-000000000001",
    start_date: today(),
    end_date: today(),
    customer_name: "Andini",
    phone: "08123456789",
    fulfillment: "pickup",
    address: "",
    notes: "",
  };
  assert.equal(bookingSchema.safeParse(b).success, true);
  assert.equal(
    bookingSchema.safeParse({ ...b, start_date: "2000-01-01" }).success,
    false,
  );
  assert.equal(
    bookingSchema.safeParse({ ...b, end_date: "2000-01-01" }).success,
    false,
  );
  assert.equal(
    bookingSchema.safeParse({ ...b, end_date: "2099-01-01" }).success,
    false,
  );
  assert.equal(
    bookingSchema.safeParse({ ...b, fulfillment: "delivery" }).success,
    false,
  );
});
test("Redirects stay within the same site", () => {
  assert.equal(safeNext("//evil.example"), "/dashboard");
  assert.equal(safeNext("/\\evil.example"), "/dashboard");
  assert.equal(safeNext("https://evil.example"), "/dashboard");
  assert.equal(
    safeNext("/booking/abc?start=2030-01-01"),
    "/booking/abc?start=2030-01-01",
  );
});
test("PostgreSQL migration, RLS, roles, prices, reservations and simulated payments", async (t) => {
  const db = new PGlite();
  await db.waitReady;
  // Supabase-owned schemas represented only for isolated SQL tests, never deployed.
  await db.exec(`create role anon;create role authenticated;create schema auth;create schema storage;grant usage on schema public,auth,storage to anon,authenticated;
 create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text);alter table storage.objects enable row level security;`);
  await db.exec(
    await readFile("supabase/migrations/202610180001_initial.sql", "utf8"),
  );
  await db.exec(await readFile("supabase/seed.sql", "utf8"));
  const a = "20000000-0000-4000-8000-000000000001",
    b = "20000000-0000-4000-8000-000000000002",
    admin = "20000000-0000-4000-8000-000000000003",
    p = "10000000-0000-4000-8000-000000000001";
  await db.query(
    `insert into auth.users(id,raw_user_meta_data) values($1,'{"name":"Andini"}'),($2,'{"name":"Raka","role":"admin"}'),($3,'{"name":"Admin"}')`,
    [a, b, admin],
  );
  await db.query(`update public.profiles set role='admin' where id=$1`, [
    admin,
  ]);
  await db.query(
    `update public.inventory_quantities set quantity=1 where product_id=$1`,
    [p],
  );
  async function as(id: string | null) {
    await db.exec("reset role");
    await db.query(`select set_config('request.jwt.claim.sub',$1,false)`, [
      id ?? "",
    ]);
    await db.exec("set role " + (id ? "authenticated" : "anon"));
  }
  async function scalar(sql: string, args: unknown[] = []) {
    const r = await db.query<Record<string, unknown>>(sql, args);
    return Object.values(r.rows[0])[0];
  }
  const dates = await db.query<{ s: string; e: string }>(
    `select ((now() at time zone 'Asia/Jakarta')::date+2)::text s,((now() at time zone 'Asia/Jakarta')::date+4)::text e`,
  );
  const { s, e } = dates.rows[0];
  async function book(start = s, end = e, product = p) {
    return String(
      await scalar(
        `select public.create_booking($1,$2,$3,'Andini','08123456789','pickup','','')`,
        [product, start, end],
      ),
    );
  }
  await t.test("18 seeded records and six categories", async () => {
    assert.equal(
      Number(await scalar("select count(*) from public.products")),
      18,
    );
    assert.equal(
      Number(await scalar("select count(*) from public.categories")),
      6,
    );
  });
  await as(b);
  await t.test("User metadata cannot promote an administrator", async () =>
    assert.equal(await scalar("select public.is_admin()"), false),
  );
  await t.test(
    "Customers cannot update their role or product prices",
    async () => {
      await assert.rejects(
        () =>
          db.query(`update public.profiles set role='admin' where id=$1`, [b]),
        /permission denied/,
      );
      await assert.rejects(
        () =>
          db.query(`update public.products set daily_price=1 where id=$1`, [p]),
        /permission denied/,
      );
    },
  );
  await as(a);
  const id = await book();
  await t.test(
    "Server computes the stored price and records initial status",
    async () => {
      const r = await db.query<{
        subtotal: number;
        total: number;
        rental_days: number;
      }>(`select subtotal,total,rental_days from public.bookings where id=$1`, [
        id,
      ]);
      assert.equal(Number(r.rows[0].subtotal), 750000);
      assert.equal(Number(r.rows[0].total), 2250000);
      assert.equal(r.rows[0].rental_days, 3);
      assert.equal(
        Number(
          await scalar("select count(*) from public.booking_status_history"),
        ),
        1,
      );
    },
  );
  await t.test("Admin sees another customer's unpaid booking with its product before payment", async () => {
    await as(admin);
    const result = await db.query<{ id: string; customer_id: string; payment_status: string; name: string }>(
      "select b.id,b.customer_id,b.payment_status,p.name from public.bookings b join public.products p on p.id=b.product_id where b.id=$1", [id],
    );
    assert.equal(result.rows.length, 1);
    assert.equal(result.rows[0].customer_id, a);
    assert.equal(result.rows[0].payment_status, "unpaid");
    assert.ok(result.rows[0].name);
    await as(a);
  });
  await t.test(
    "Confirmed or unexpired reservations consume stock",
    async () => {
      await assert.rejects(() => book(), /Stok habis/);
      assert.equal(
        Number(
          await scalar("select public.check_availability($1,$2,$3)", [p, s, e]),
        ),
        0,
      );
    },
  );
  await t.test(
    "Reject SQL-side invalid dates and sold out product",
    async () => {
      await assert.rejects(
        () => book("2000-01-01", "2000-01-02"),
        /Tanggal tidak valid/,
      );
      await assert.rejects(() => book(e, s), /Tanggal tidak valid/);
      await assert.rejects(
        () => book(s, e, "10000000-0000-4000-8000-000000000012"),
        /Stok habis|Produk tidak tersedia/,
      );
    },
  );
  await as(b);
  await t.test(
    "Other customers cannot see bookings, histories, payments, or pay for them",
    async () => {
      assert.equal(
        Number(await scalar("select count(*) from public.bookings")),
        0,
      );
      assert.equal(
        Number(
          await scalar("select count(*) from public.booking_status_history"),
        ),
        0,
      );
      assert.equal(
        Number(await scalar("select count(*) from public.simulated_payments")),
        0,
      );
      await assert.rejects(
        () =>
          db.query("select public.simulate_payment($1,$2)", [id, "QRIS Demo"]),
        /Pesanan tidak ditemukan/,
      );
    },
  );
  await t.test(
    "Non-admin RPC and direct booking/payment writes are rejected",
    async () => {
      await assert.rejects(
        () =>
          db.query("select public.admin_update_booking($1,$2)", [
            id,
            "Diproses",
          ]),
        /administrator/,
      );
      await assert.rejects(
        () =>
          db.query(
            `update public.bookings set payment_status='paid' where id=$1`,
            [id],
          ),
        /permission denied/,
      );
      await assert.rejects(
        () =>
          db.query(
            `insert into public.simulated_payments(booking_id,customer_id,method,amount) values($1,$2,'QRIS Demo',1)`,
            [id, b],
          ),
        /permission denied/,
      );
    },
  );
  await as(a);
  await t.test(
    "Invalid payment method fails; valid payment is idempotent and persists",
    async () => {
      await assert.rejects(
        () =>
          db.query("select public.simulate_payment($1,$2)", [id, "Real bank"]),
        /tidak valid/,
      );
      await db.query("select public.simulate_payment($1,$2)", [
        id,
        "QRIS Demo",
      ]);
      await db.query("select public.simulate_payment($1,$2)", [
        id,
        "QRIS Demo",
      ]);
      assert.equal(
        Number(await scalar("select count(*) from public.simulated_payments")),
        1,
      );
      assert.equal(
        await scalar("select rental_status from public.bookings where id=$1", [
          id,
        ]),
        "Menunggu Konfirmasi",
      );
    },
  );
  await as(admin);
  await t.test("Admin follows valid lifecycle, never skips steps", async () => {
    await assert.rejects(
      () =>
        db.query("select public.admin_update_booking($1,$2)", [id, "Selesai"]),
      /Transisi/,
    );
    await db.query("select public.admin_update_booking($1,$2)", [
      id,
      "Diproses",
    ]);
    assert.equal(
      await scalar("select rental_status from public.bookings where id=$1", [
        id,
      ]),
      "Diproses",
    );
  });
  await as(a);
  await t.test(
    "Customer immediately reads admin changes after refresh",
    async () =>
      assert.equal(
        await scalar("select rental_status from public.bookings where id=$1", [
          id,
        ]),
        "Diproses",
      ),
  );

  await as(admin);
  await t.test(
    "Admin cannot lower inventory below existing reservations",
    async () => {
      await assert.rejects(
        () =>
          db.query("select public.admin_save_product($1::jsonb)", [
            JSON.stringify({ ...sampleProducts[0], quantity: 0 }),
          ]),
        /Stok tidak boleh/,
      );
    },
  );
  await as(a);
  const expiredProduct = "10000000-0000-4000-8000-000000000002";
  const expiredId = await book(s, e, expiredProduct);
  await db.exec("reset role");
  await db.query(
    "update public.bookings set hold_until=now()-interval '1 minute' where id=$1",
    [expiredId],
  );
  await as(a);
  await t.test("Expired holds release stock and cannot be paid", async () => {
    assert.equal(
      Number(
        await scalar("select public.check_availability($1,$2,$3)", [
          expiredProduct,
          s,
          e,
        ]),
      ),
      2,
    );
    await assert.rejects(
      () =>
        db.query("select public.simulate_payment($1,$2)", [
          expiredId,
          "QRIS Demo",
        ]),
      /Waktu pemesanan berakhir/,
    );
  });
  await db.exec("reset role");
  const raceProduct = "10000000-0000-4000-8000-000000000013";
  await db.query(
    "update public.inventory_quantities set quantity=1 where product_id=$1",
    [raceProduct],
  );
  await as(a);
  await t.test(
    "Competing reservation attempts never exceed one unit in isolated PostgreSQL",
    async () => {
      const attempts = await Promise.allSettled([
        book(s, e, raceProduct),
        book(s, e, raceProduct),
      ]);
      assert.equal(attempts.filter((a) => a.status === "fulfilled").length, 1);
      assert.equal(attempts.filter((a) => a.status === "rejected").length, 1);
    },
  );
  await as(null);
  await t.test(
    "Anonymous can read catalog and availability, but not protected data or operations",
    async () => {
      assert.equal(
        Number(await scalar("select count(*) from public.products")),
        18,
      );
      await assert.rejects(
        () => db.query("select * from public.bookings"),
        /permission denied/,
      );
      await assert.rejects(() => book(), /permission denied/);
    },
  );
  await db.close();
});
