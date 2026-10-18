-- Read-only. Shows structure/access policies, never user records or keys.
select table_name,column_name,data_type,is_nullable from information_schema.columns where table_schema='public' and table_name in ('profiles','categories','products','product_images','inventory_quantities','bookings','booking_status_history','simulated_payments') order by table_name,ordinal_position;
select schemaname,tablename,policyname,cmd,roles from pg_policies where schemaname='public' order by tablename,policyname;
