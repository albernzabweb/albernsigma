import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const setup = () =>
  readFile("supabase/migrations/202610180001_initial.sql", "utf8");
const seed = () => readFile("supabase/seed.sql", "utf8");
async function fresh() {
  const db = new PGlite();
  await db.waitReady;
  await db.exec(`create role anon;create role authenticated;create schema auth;create schema storage;grant usage on schema public,auth,storage to anon,authenticated;
create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text);alter table storage.objects enable row level security;`);
  return db;
}
const customer = "20000000-0000-4000-8000-000000000001";
const product = "10000000-0000-4000-8000-000000000001";
test("Re-run setup and seed with existing profiles, roles, stock, paid booking and history: no data changes", async () => {
  const db = await fresh();
  try {
    await db.exec(await setup());
    await db.exec(await seed());
    await db.query(
      `insert into auth.users(id,raw_user_meta_data) values($1,'{"name":"Existing customer"}')`,
      [customer],
    );
    await db.query(
      `update public.profiles set role='admin',phone='08123456789' where id=$1`,
      [customer],
    );
    await db.query(
      `update public.inventory_quantities set quantity=2 where product_id=$1`,
      [product],
    );
    await db.query(`select set_config('request.jwt.claim.sub',$1,false)`, [
      customer,
    ]);
    const booking = await db.query<{ id: string }>(
      `select public.create_booking($1,(now() at time zone 'Asia/Jakarta')::date+1,(now() at time zone 'Asia/Jakarta')::date+2,'Existing customer','08123456789','pickup','','Existing note') as id`,
      [product],
    );
    await db.query(`select public.simulate_payment($1,'QRIS Demo')`, [
      booking.rows[0].id,
    ]);
    const tables = [
      "profiles",
      "categories",
      "products",
      "inventory_quantities",
      "product_images",
      "bookings",
      "booking_status_history",
      "simulated_payments",
    ];
    async function snapshot() {
      const result: Record<string, unknown> = {};
      for (const table of tables) {
        const r = await db.query(
          `select to_jsonb(t) as row from public.${table} t order by to_jsonb(t)::text`,
        );
        result[table] = r.rows;
      }
      return result;
    }
    const before = await snapshot();
    await db.exec(await setup());
    await db.exec(await seed());
    assert.deepEqual(await snapshot(), before);
    const triggers = await db.query<{ count: number }>(
      `select count(*)::int count from pg_trigger where not tgisinternal and tgname in('profiles_updated','products_updated','inventory_updated','bookings_updated','on_auth_user_created','booking_status_recorded')`,
    );
    assert.equal(triggers.rows[0].count, 6);
  } finally {
    await db.close();
  }
});
test("Matching profiles table alone is preserved and missing ALNUDIV tables are installed", async () => {
  const db = await fresh();
  try {
    const sql = await setup();
    const match = sql.match(
      /create table if not exists public\.profiles \([\s\S]*?\n\);/,
    );
    assert.ok(match);
    await db.exec(match[0]);
    await db.query(
      `insert into auth.users(id,raw_user_meta_data) values($1,'{"name":"Before setup"}')`,
      [customer],
    );
    await db.exec(sql);
    const r = await db.query<{ name: string; role: string }>(
      `select name,role from public.profiles where id=$1`,
      [customer],
    );
    assert.deepEqual(r.rows[0], { name: "Before setup", role: "customer" });
    await db.exec(await seed());
    const products = await db.query<{ count: number }>(
      "select count(*)::int count from public.products",
    );
    assert.equal(products.rows[0].count, 18);
  } finally {
    await db.close();
  }
});
test("Unrelated profiles schema is rejected without deleting existing rows or creating app tables", async () => {
  const db = await fresh();
  try {
    await db.exec(
      "create table public.profiles(id uuid primary key,nickname text)",
    );
    await db.query(
      `insert into public.profiles(id,nickname) values($1,'Keep this data')`,
      [customer],
    );
    await assert.rejects(
      () => setup().then((sql) => db.exec(sql)),
      /struktur public.profiles tidak cocok/,
    );
    await db.exec("rollback");
    const r = await db.query<{ nickname: string }>(
      `select nickname from public.profiles where id=$1`,
      [customer],
    );
    assert.equal(r.rows[0].nickname, "Keep this data");
    const tables = await db.query<{ missing: boolean }>(
      `select to_regclass('public.bookings') is null as missing`,
    );
    assert.equal(tables.rows[0].missing, true);
  } finally {
    await db.close();
  }
});
test("Unexpected pre-existing RLS policies are not silently overwritten", async () => {
  const db = await fresh();
  try {
    await db.exec(await setup());
    await db.exec(
      `create policy existing_policy on public.profiles for select to authenticated using(true)`,
    );
    await assert.rejects(
      () => setup().then((sql) => db.exec(sql)),
      /kebijakan akses lain/,
    );
    await db.exec("rollback");
    const r = await db.query<{ count: number }>(
      `select count(*)::int count from pg_policies where tablename='profiles' and policyname='existing_policy'`,
    );
    assert.equal(r.rows[0].count, 1);
  } finally {
    await db.close();
  }
});
