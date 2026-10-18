-- ALNUDIV: initial setup, safe to re-run against the matching ALNUDIV schema.
-- Run the entire file as database owner. No DROP TABLE / TRUNCATE / data reset.
begin;

-- Fail before changing a same-named table belonging to another schema/application.
-- IF NOT EXISTS alone would hide missing/incompatible columns.
do $alnudiv_preflight$
declare expected jsonb := '{"profiles":{"id":"uuid","name":"text","phone":"text","role":"text","created_at":"timestamp with time zone","updated_at":"timestamp with time zone"},"categories":{"slug":"text","name":"text"},"products":{"id":"uuid","name":"text","slug":"text","category":"text","description":"text","specifications":"jsonb","image":"text","daily_price":"bigint","weekly_price":"bigint","deposit":"bigint","available":"boolean","badge":"text","created_at":"timestamp with time zone","updated_at":"timestamp with time zone"},"product_images":{"id":"uuid","product_id":"uuid","url":"text","position":"integer"},"inventory_quantities":{"product_id":"uuid","quantity":"integer","updated_at":"timestamp with time zone"},"bookings":{"id":"uuid","customer_id":"uuid","product_id":"uuid","start_date":"date","end_date":"date","rental_days":"integer","subtotal":"bigint","delivery_fee":"bigint","deposit":"bigint","total":"bigint","payment_status":"text","rental_status":"text","customer_name":"text","phone":"text","fulfillment":"text","address":"text","notes":"text","hold_until":"timestamp with time zone","created_at":"timestamp with time zone","updated_at":"timestamp with time zone"},"booking_status_history":{"id":"uuid","booking_id":"uuid","status":"text","actor_id":"uuid","created_at":"timestamp with time zone"},"simulated_payments":{"id":"uuid","booking_id":"uuid","customer_id":"uuid","method":"text","amount":"bigint","created_at":"timestamp with time zone"}}'::jsonb; tbl record; col record; actual text; unexpected text;
begin
 for tbl in select key,value from jsonb_each(expected) loop
  if to_regclass('public.' || tbl.key) is not null then
   if not exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname=tbl.key and c.relkind='r') then
    raise exception 'ALNUDIV: public.% sudah ada tetapi bukan tabel biasa. Setup dihentikan tanpa menghapus data.',tbl.key;
   end if;
   for col in select key,value from jsonb_each_text(tbl.value) loop
    select format_type(a.atttypid,a.atttypmod) into actual from pg_attribute a where a.attrelid=to_regclass('public.' || tbl.key) and a.attname=col.key and a.attnum>0 and not a.attisdropped;
    if actual is distinct from col.value then
     raise exception 'ALNUDIV: struktur public.% tidak cocok. Kolom % seharusnya %, ditemukan %. Data tidak dihapus; periksa struktur tabel yang sudah ada.',tbl.key,col.key,col.value,coalesce(actual,'tidak ada');
    end if;
   end loop;
  end if;
 end loop;
 select string_agg(p.schemaname || '.' || p.tablename || ':' || p.policyname,', ') into unexpected from pg_policies p where p.schemaname='public' and expected ? p.tablename and p.policyname not in ('categories_read','products_read','images_read','inventory_read','profiles_read','profiles_update','bookings_read','history_read','payments_read');
 if unexpected is not null then raise exception 'ALNUDIV: ditemukan kebijakan akses lain (%). Setup dihentikan agar aturan akses yang sudah ada dapat ditinjau.',unexpected;end if;
end;
$alnudiv_preflight$;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null default '' check(length(name)<=100), phone text not null default '' check(length(phone)<=20),
 role text not null default 'customer' check(role in ('customer','admin')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.categories(slug text primary key,name text not null);
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 3 and 120),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),category text not null references public.categories(slug),
 description text not null, specifications jsonb not null default '{}',image text not null,
 daily_price bigint not null check(daily_price between 1000 and 100000000),weekly_price bigint not null check(weekly_price between 1000 and 700000000),
 deposit bigint not null check(deposit between 0 and 100000000), available boolean not null default true,badge text,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table if not exists public.product_images(id uuid primary key default gen_random_uuid(),product_id uuid not null references public.products(id) on delete cascade,url text not null,position int not null default 0);
create table if not exists public.inventory_quantities(product_id uuid primary key references public.products(id) on delete cascade,quantity int not null check(quantity between 0 and 999),updated_at timestamptz not null default now());
create table if not exists public.bookings (
 id uuid primary key default gen_random_uuid(),customer_id uuid not null references public.profiles(id),product_id uuid not null references public.products(id),
 start_date date not null,end_date date not null,rental_days int not null check(rental_days between 1 and 90),
 subtotal bigint not null check(subtotal>0),delivery_fee bigint not null check(delivery_fee in(0,35000)),deposit bigint not null check(deposit>=0),total bigint not null check(total=subtotal+delivery_fee+deposit),
 payment_status text not null default 'unpaid' check(payment_status in('unpaid','paid')),
 rental_status text not null default 'Menunggu Pembayaran' check(rental_status in('Menunggu Pembayaran','Menunggu Konfirmasi','Diproses','Siap Diambil','Dalam Pengiriman','Sedang Disewa','Menunggu Pengembalian','Selesai','Dibatalkan')),
 customer_name text not null check(length(customer_name) between 2 and 100), phone text not null check(length(phone) between 8 and 20),
 fulfillment text not null check(fulfillment in('pickup','delivery')),address text not null default '',notes text not null default '' check(length(notes)<=1000),
 hold_until timestamptz not null default (now()+interval '30 minutes'),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check(end_date>=start_date),check(rental_days=end_date-start_date+1),check((payment_status='unpaid' and rental_status in('Menunggu Pembayaran','Dibatalkan')) or payment_status='paid')
);
create table if not exists public.booking_status_history(id uuid primary key default gen_random_uuid(),booking_id uuid not null references public.bookings(id),status text not null,actor_id uuid references public.profiles(id),created_at timestamptz not null default now());
create table if not exists public.simulated_payments(id uuid primary key default gen_random_uuid(),booking_id uuid not null unique references public.bookings(id),customer_id uuid not null references public.profiles(id),method text not null check(method in('QRIS Demo','Bank Transfer Demo','E-Wallet Demo')),amount bigint not null check(amount>0),created_at timestamptz not null default now());
create index if not exists products_category_idx on public.products(category);
create index if not exists bookings_customer_idx on public.bookings(customer_id,created_at desc);
create index if not exists bookings_product_dates_idx on public.bookings(product_id,start_date,end_date) where rental_status not in('Selesai','Dibatalkan');
create index if not exists booking_history_idx on public.booking_status_history(booking_id,created_at);
create index if not exists payment_customer_idx on public.simulated_payments(customer_id);
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$begin new.updated_at=now();return new;end;$$;
drop trigger if exists profiles_updated on public.profiles;
create trigger profiles_updated before update on public.profiles for each row execute function public.touch_updated_at();
drop trigger if exists products_updated on public.products;
create trigger products_updated before update on public.products for each row execute function public.touch_updated_at();
drop trigger if exists inventory_updated on public.inventory_quantities;
create trigger inventory_updated before update on public.inventory_quantities for each row execute function public.touch_updated_at();
drop trigger if exists bookings_updated on public.bookings;
create trigger bookings_updated before update on public.bookings for each row execute function public.touch_updated_at();
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$begin insert into public.profiles(id,name) values(new.id,left(coalesce(new.raw_user_meta_data->>'name',''),100)) on conflict(id) do nothing;return new;end;$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
-- Backfill accounts registered before the initial setup; preserve roles and profiles.
insert into public.profiles(id,name) select id,left(coalesce(raw_user_meta_data->>'name',''),100) from auth.users on conflict(id) do nothing;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.profiles where id=auth.uid() and role='admin');$$;
create or replace function public.record_booking_status() returns trigger language plpgsql security definer set search_path='' as $$begin if TG_OP='INSERT' or new.rental_status is distinct from old.rental_status then insert into public.booking_status_history(booking_id,status,actor_id) values(new.id,new.rental_status,auth.uid());end if;return new;end;$$;
drop trigger if exists booking_status_recorded on public.bookings;
create trigger booking_status_recorded after insert or update on public.bookings for each row execute function public.record_booking_status();
-- Private helper: peak simultaneous use per day, not the sum of all overlaps.
create or replace function public.remaining_units(p_product_id uuid,p_start date,p_end date,p_exclude uuid default null) returns int language sql stable security definer set search_path='' as $$
 select greatest(0,coalesce((select quantity from public.inventory_quantities where product_id=p_product_id),0)-coalesce((
 select max(occupied) from (select d.rental_day,count(b.id)::int occupied from generate_series(p_start::timestamp,p_end::timestamp,interval '1 day') d(rental_day)
 left join public.bookings b on b.product_id=p_product_id and (p_exclude is null or b.id<>p_exclude) and d.rental_day::date between b.start_date and b.end_date
 and b.rental_status not in('Selesai','Dibatalkan') and (b.payment_status='paid' or b.hold_until>now()) group by d.rental_day) counts),0))::int;
$$;
create or replace function public.validate_dates(p_start date,p_end date) returns void language plpgsql set search_path='' as $$begin
 if p_start is null or p_end is null or p_start<(now() at time zone 'Asia/Jakarta')::date or p_end<p_start or p_end-p_start+1>90 then raise exception 'Tanggal tidak valid. Sewa harus dimulai hari ini atau setelahnya, selama 1–90 hari.';end if;
end;$$;
create or replace function public.check_availability(p_product_id uuid,p_start date,p_end date) returns int language plpgsql security definer set search_path='' as $$begin
 perform public.validate_dates(p_start,p_end);
 if not exists(select 1 from public.products where id=p_product_id and available) then return 0;end if;
 return public.remaining_units(p_product_id,p_start,p_end);
end;$$;
create or replace function public.create_booking(p_product_id uuid,p_start date,p_end date,p_name text,p_phone text,p_fulfillment text,p_address text,p_notes text default '') returns uuid language plpgsql security definer set search_path='' as $$
 declare p public.products;bid uuid;days int;fee bigint;begin
 if auth.uid() is null then raise exception 'Silakan masuk terlebih dahulu.';end if;
 perform public.validate_dates(p_start,p_end);
 if p_name is null or length(trim(p_name)) not between 2 and 100 or p_phone is null or p_phone !~ '^\+?[0-9 -]{8,20}$' or p_fulfillment is null or p_fulfillment not in('pickup','delivery') or p_address is null or length(p_address)>500 or p_notes is null or length(p_notes)>1000 or (p_fulfillment='delivery' and length(trim(p_address))<10) then raise exception 'Data penyewa tidak lengkap atau tidak valid.';end if;
 -- Same product lock used by payment and admin edits; serializes competing writers.
 perform pg_advisory_xact_lock(hashtextextended(p_product_id::text,0));
 select * into p from public.products where id=p_product_id;
 if not found or not p.available then raise exception 'Produk tidak tersedia.';end if;
 if public.remaining_units(p_product_id,p_start,p_end)<1 then raise exception 'Stok habis untuk tanggal pilihanmu.';end if;
 days=p_end-p_start+1;fee=case when p_fulfillment='delivery' then 35000 else 0 end;
 insert into public.bookings(customer_id,product_id,start_date,end_date,rental_days,subtotal,delivery_fee,deposit,total,customer_name,phone,fulfillment,address,notes)
 values(auth.uid(),p.id,p_start,p_end,days,p.daily_price*days,fee,p.deposit,p.daily_price*days+fee+p.deposit,trim(p_name),p_phone,p_fulfillment,p_address,p_notes) returning id into bid;
 return bid;end;$$;
create or replace function public.simulate_payment(p_booking_id uuid,p_method text) returns void language plpgsql security definer set search_path='' as $$
 declare b public.bookings;pid uuid;begin
 if auth.uid() is null then raise exception 'Silakan masuk terlebih dahulu.';end if;
 select product_id into pid from public.bookings where id=p_booking_id and customer_id=auth.uid();
 if pid is null then raise exception 'Pesanan tidak ditemukan.';end if;
 perform pg_advisory_xact_lock(hashtextextended(pid::text,0));
 select * into b from public.bookings where id=p_booking_id and customer_id=auth.uid() for update;
 if p_method is null or p_method not in('QRIS Demo','Bank Transfer Demo','E-Wallet Demo') then raise exception 'Metode simulasi tidak valid.';end if;
 if b.rental_status='Dibatalkan' then raise exception 'Pesanan sudah dibatalkan.';end if;
 if b.payment_status='paid' then return;end if; -- Idempotent, unique payment per booking.
 if b.hold_until<=now() or b.start_date<(now() at time zone 'Asia/Jakarta')::date then raise exception 'Waktu pemesanan berakhir. Silakan buat pesanan baru.';end if;
 if not exists(select 1 from public.products where id=pid and available) or public.remaining_units(pid,b.start_date,b.end_date,b.id)<1 then raise exception 'Stok tidak tersedia. Hubungi administrator.';end if;
 insert into public.simulated_payments(booking_id,customer_id,method,amount) values(b.id,auth.uid(),p_method,b.total);
 update public.bookings set payment_status='paid',rental_status='Menunggu Konfirmasi' where id=b.id;
 end;$$;
create or replace function public.admin_update_booking(p_booking_id uuid,p_status text) returns void language plpgsql security definer set search_path='' as $$
 declare b public.bookings;pid uuid;expected text;begin
 if not public.is_admin() then raise exception 'Akses administrator diperlukan.';end if;
 select product_id into pid from public.bookings where id=p_booking_id;
 if pid is null then raise exception 'Pesanan tidak ditemukan.';end if;
 perform pg_advisory_xact_lock(hashtextextended(pid::text,0));
 select * into b from public.bookings where id=p_booking_id for update;
 if p_status=b.rental_status then return;end if;
 if p_status='Dibatalkan' and b.rental_status in('Menunggu Pembayaran','Menunggu Konfirmasi','Diproses','Siap Diambil','Dalam Pengiriman') then
 update public.bookings set rental_status=p_status where id=b.id;return;end if;
 expected=case b.rental_status when 'Menunggu Konfirmasi' then 'Diproses' when 'Diproses' then case when b.fulfillment='pickup' then 'Siap Diambil' else 'Dalam Pengiriman' end when 'Siap Diambil' then 'Sedang Disewa' when 'Dalam Pengiriman' then 'Sedang Disewa' when 'Sedang Disewa' then 'Menunggu Pengembalian' when 'Menunggu Pengembalian' then 'Selesai' else null end;
 if p_status is null or expected is null or p_status<>expected or b.payment_status<>'paid' then raise exception 'Transisi status tidak diizinkan. Ikuti urutan dan pembayaran demo terlebih dahulu.';end if;
 update public.bookings set rental_status=p_status where id=b.id;
 end;$$;
create or replace function public.admin_save_product(p_data jsonb) returns uuid language plpgsql security definer set search_path='' as $$
 declare pid uuid;qty int;peak int;begin
 if not public.is_admin() then raise exception 'Akses administrator diperlukan.';end if;
 pid=coalesce(nullif(p_data->>'id','')::uuid,gen_random_uuid());qty=(p_data->>'quantity')::int;
 if qty is null or qty not between 0 and 999 or length(p_data->>'description') not between 10 and 2000 or not ((p_data->>'image') ~ '^(/products/[a-z-]+\.svg|https://[a-z0-9-]+\.supabase\.co/storage/v1/object/public/product-images/.+)$') then raise exception 'Data produk tidak valid.';end if;
 perform pg_advisory_xact_lock(hashtextextended(pid::text,0));
 -- Sweep event endpoints across all future reservations to reject under-provisioning.
 select coalesce(max(occupied),0)::int into peak from (
 select d.rental_day,count(b.id) occupied from (select distinct greatest(start_date,(now() at time zone 'Asia/Jakarta')::date) as rental_day from public.bookings where product_id=pid and end_date>=(now() at time zone 'Asia/Jakarta')::date) d
 left join public.bookings b on b.product_id=pid and d.rental_day between b.start_date and b.end_date and b.rental_status not in('Selesai','Dibatalkan') and (b.payment_status='paid' or b.hold_until>now()) group by d.rental_day) t;
 if qty<peak then raise exception 'Stok tidak boleh lebih kecil dari unit yang sudah dipesan (%).',peak;end if;
 insert into public.products(id,name,slug,category,description,image,daily_price,weekly_price,deposit,available) values(pid,p_data->>'name',p_data->>'slug',p_data->>'category',p_data->>'description',p_data->>'image',(p_data->>'daily_price')::bigint,(p_data->>'weekly_price')::bigint,(p_data->>'deposit')::bigint,(p_data->>'available')::boolean)
 on conflict(id) do update set name=excluded.name,slug=excluded.slug,category=excluded.category,description=excluded.description,image=excluded.image,daily_price=excluded.daily_price,weekly_price=excluded.weekly_price,deposit=excluded.deposit,available=excluded.available;
 insert into public.inventory_quantities(product_id,quantity) values(pid,qty) on conflict(product_id) do update set quantity=excluded.quantity;
 delete from public.product_images where product_id=pid;
 insert into public.product_images(product_id,url) values(pid,p_data->>'image');
 return pid;end;$$;
-- Explicit table privileges. No browser can write booking, stock, payment, history, or role fields.
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory_quantities enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.simulated_payments enable row level security;
revoke all on public.profiles,public.categories,public.products,public.product_images,public.inventory_quantities,public.bookings,public.booking_status_history,public.simulated_payments from anon,authenticated;
grant select on public.categories,public.products,public.product_images,public.inventory_quantities to anon,authenticated;
grant select on public.profiles,public.bookings,public.booking_status_history,public.simulated_payments to authenticated;
grant update(name,phone) on public.profiles to authenticated;
drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories for select to anon,authenticated using(true);
drop policy if exists products_read on public.products;
create policy products_read on public.products for select to anon,authenticated using(true);
drop policy if exists images_read on public.product_images;
create policy images_read on public.product_images for select to anon,authenticated using(true);
drop policy if exists inventory_read on public.inventory_quantities;
create policy inventory_read on public.inventory_quantities for select to anon,authenticated using(true);
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using(id=(select auth.uid()) or (select public.is_admin()));
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
drop policy if exists bookings_read on public.bookings;
create policy bookings_read on public.bookings for select to authenticated using(customer_id=(select auth.uid()) or (select public.is_admin()));
drop policy if exists history_read on public.booking_status_history;
create policy history_read on public.booking_status_history for select to authenticated using(exists(select 1 from public.bookings b where b.id=booking_id and (b.customer_id=(select auth.uid()) or (select public.is_admin()))));
drop policy if exists payments_read on public.simulated_payments;
create policy payments_read on public.simulated_payments for select to authenticated using(customer_id=(select auth.uid()) or (select public.is_admin()));
revoke all on function public.touch_updated_at(),public.handle_new_user(),public.is_admin(),public.record_booking_status(),public.remaining_units(uuid,date,date,uuid),public.validate_dates(date,date),public.check_availability(uuid,date,date),public.create_booking(uuid,date,date,text,text,text,text,text),public.simulate_payment(uuid,text),public.admin_update_booking(uuid,text),public.admin_save_product(jsonb) from public,anon,authenticated;
grant execute on function public.is_admin(),public.create_booking(uuid,date,date,text,text,text,text,text),public.simulate_payment(uuid,text),public.admin_update_booking(uuid,text),public.admin_save_product(jsonb) to authenticated;
grant execute on function public.check_availability(uuid,date,date) to anon,authenticated;
-- Public product imagery. Only administrators can create/remove assets; no SVG uploads.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
drop policy if exists product_images_public on storage.objects;
create policy product_images_public on storage.objects for select to anon,authenticated using(bucket_id='product-images');
drop policy if exists product_images_admin_insert on storage.objects;
create policy product_images_admin_insert on storage.objects for insert to authenticated with check(bucket_id='product-images' and (select public.is_admin()));
drop policy if exists product_images_admin_delete on storage.objects;
create policy product_images_admin_delete on storage.objects for delete to authenticated using(bucket_id='product-images' and (select public.is_admin()));
commit;

