import { chromium } from "playwright";
import assert from "node:assert/strict";
const base = "http://127.0.0.1:3000";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1080 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(base, { waitUntil: "networkidle" });
await page.locator("h1").waitFor();
await page.waitForTimeout(1800);
for (
  let y = 0;
  y < (await page.evaluate(() => document.body.scrollHeight));
  y += 700
) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(100);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1000);
await page.screenshot({ path: "../ALNUDIV-desktop.png", fullPage: true });
await page.screenshot({ path: "../ALNUDIV-preview.png" });
assert.equal(await page.locator("h1").count(), 1);
await page.goto(base + "/catalog", { waitUntil: "networkidle" });
assert.equal(await page.locator(".product-card").count(), 18);
await page.selectOption("#category", "kamera-lensa");
await page.waitForFunction(
  () => document.querySelectorAll(".product-card").length === 3,
);
assert.equal(await page.locator(".product-card").count(), 3);
await page.fill("#search", "Sony");
await page.waitForFunction(
  () => document.querySelectorAll(".product-card").length === 1,
);
assert.equal(await page.locator(".product-card").count(), 1);
await page.locator(".product-card").click();
await page.waitForURL("**/catalog/sony-alpha-a7-iv");
await page.fill("#start", "2030-01-01");
await page.fill("#end", "2030-01-03");
assert.match(
  await page.locator(".price-line.total").innerText(),
  /2\.250\.000/,
);
await page.selectOption("#fulfillment", "delivery");
assert.match(
  await page.locator(".price-line.total").innerText(),
  /2\.285\.000/,
);
await page.getByRole("link", { name: "Sewa Sekarang" }).click();
await page.waitForURL("**/login?next=*");
assert.match(page.url(), /start%3D2030-01-01/);
assert.match(page.url(), /fulfillment%3Ddelivery/);
await page.goto(base + "/catalog", { waitUntil: "networkidle" });
await page.fill("#search", "not-a-product");
await page.getByText("Belum ketemu yang kamu cari.").waitFor();
for (const path of [
  "/",
  "/catalog",
  "/categories/drone",
  "/catalog/sony-alpha-a7-iv",
  "/how-it-works",
  "/about",
  "/contact",
  "/faq",
  "/register",
]) {
  const r = await page.goto(base + path);
  assert.equal(r.status(), 200, path);
}
for (const path of [
  "/dashboard",
  "/dashboard/bookings",
  "/dashboard/profile",
  "/admin",
  "/admin/products",
  "/admin/products/new",
  "/admin/inventory",
  "/admin/bookings",
  "/admin/bookings/00000000-0000-4000-8000-000000000000",
  "/checkout/00000000-0000-4000-8000-000000000000",
  "/booking/success/00000000-0000-4000-8000-000000000000",
]) {
  await page.goto(base + path);
  await page.waitForURL("**/login?next=*");
  assert.match(page.url(), /\/login\?next=/, path);
}
const missing = await page.goto(base + "/catalog/does-not-exist");
assert.ok([200, 404].includes(missing.status()));
await page.getByText("Halaman ini di luar jangkauan.").waitFor();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base, { waitUntil: "networkidle" });
assert.equal(
  await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  ),
  false,
);
await page.getByRole("button", { name: "Buka menu" }).click();
await page
  .getByRole("navigation", { name: "Navigasi seluler" })
  .getByRole("link", { name: "Jelajahi Alat" })
  .click();
await page.waitForURL("**/catalog");
await page.goto(base, { waitUntil: "networkidle" });
for (
  let y = 0;
  y < (await page.evaluate(() => document.body.scrollHeight));
  y += 650
) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(100);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(700);
await page.screenshot({ path: "../ALNUDIV-mobile.png", fullPage: true });
await page.emulateMedia({ reducedMotion: "reduce" });
await page.goto(base + "/faq");
await page.getByRole("button", { name: "Apakah ada deposit jaminan?" }).focus();
await page.keyboard.press("Enter");
await page
  .getByText("Ya. Setiap alat memiliki deposit", { exact: false })
  .waitFor();
await page.addInitScript(() => {
  HTMLCanvasElement.prototype.getContext = () => null;
});
await page.goto(base, { waitUntil: "networkidle" });
await page.locator(".static-camera").waitFor();
await page.route("**/products/drone.svg", (route) => route.abort());
await page.goto(base + "/catalog");
await page.locator(".product-card").first().waitFor();
await page.waitForFunction(() => Array.from(document.querySelectorAll(".product-art.drone img")).every(img => img.getAttribute("src") === "/products/kamera-lensa.svg" && img.complete && img.naturalWidth > 0));
assert.deepEqual(errors, []);
console.log(
  JSON.stringify(
    {
      result: "passed",
      checks: [
        "18 products",
        "category filter",
        "search",
        "empty state",
        "detail direct route",
        "inclusive price",
        "delivery fee",
        "booking dates preserved through login",
        "public routes",
        "protected route redirects",
        "404",
        "mobile menu",
        "no mobile overflow",
        "FAQ keyboard primitive",
        "reduced motion",
        "WebGL fallback",
        "missing image resilience",
      ],
      pageErrors: errors,
    },
    null,
    2,
  ),
);
await browser.close();

