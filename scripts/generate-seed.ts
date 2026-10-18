import { writeFileSync } from "node:fs";
import { sampleProducts, categories } from "../lib/data";
const quote = (v: unknown) => "'" + String(v).replaceAll("'", "''") + "'";
let sql =
  "-- Reproducible illustrative catalogue. Run after migration.\nbegin;\n";
for (const c of categories)
  sql += `insert into public.categories(slug,name) values(${quote(c.slug)},${quote(c.name)}) on conflict(slug) do nothing;\n`;
for (const p of sampleProducts) {
  sql += `insert into public.products(id,name,slug,category,description,specifications,image,daily_price,weekly_price,deposit,available,badge) values(${quote(p.id)},${quote(p.name)},${quote(p.slug)},${quote(p.category)},${quote(p.description)},${quote(JSON.stringify(p.specifications))}::jsonb,${quote(p.image)},${p.daily_price},${p.weekly_price},${p.deposit},${p.available},${p.badge ? quote(p.badge) : "null"}) on conflict(id) do nothing;\n`;
  sql += `insert into public.inventory_quantities(product_id,quantity) values(${quote(p.id)},${p.quantity}) on conflict(product_id) do nothing;\n`;
  sql += `insert into public.product_images(product_id,url) select ${quote(p.id)},${quote(p.image)} where not exists(select 1 from public.product_images where product_id=${quote(p.id)});\n`;
}
writeFileSync("supabase/seed.sql", sql + "commit;\n");
console.log("Seed SQL generated");
