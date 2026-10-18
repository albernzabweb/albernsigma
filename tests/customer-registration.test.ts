import { test } from "node:test";
import assert from "node:assert/strict";
import {
  registrationSchema,
  customerNext,
  confirmationUrl,
  registrationError,
} from "../lib/customer-registration";
import { safeNext } from "../lib/utils";
const valid = {
  name: "  Customer Baru  ",
  email: "  CUSTOMER@example.com ",
  password: "ValidPass123!",
  confirm_password: "ValidPass123!",
};
test("Self-service registration normalizes identity and never accepts admin metadata", () => {
  const data = registrationSchema.parse({
    ...valid,
    role: "admin",
    is_admin: true,
  });
  assert.equal(data.name, "Customer Baru");
  assert.equal(data.email, "customer@example.com");
  assert.equal("role" in data, false);
  assert.equal("is_admin" in data, false);
});
test("Registration rejects mismatched, weak passwords and incomplete names", () => {
  assert.equal(
    registrationSchema.safeParse({ ...valid, confirm_password: "different" })
      .success,
    false,
  );
  assert.equal(
    registrationSchema.safeParse({
      ...valid,
      password: "short",
      confirm_password: "short",
    }).success,
    false,
  );
  assert.equal(
    registrationSchema.safeParse({ ...valid, name: " " }).success,
    false,
  );
});
test("New customers return to their booking or dashboard, never the admin area or another site", () => {
  assert.equal(customerNext("/admin"), "/dashboard");
  assert.equal(customerNext("/admin/products"), "/dashboard");
  assert.equal(customerNext("/admin#products"), "/dashboard");
  assert.equal(customerNext("https://other.example"), "/dashboard");
  assert.equal(
    customerNext("/booking/abc?start=2030-01-01"),
    "/booking/abc?start=2030-01-01",
  );
  assert.equal(safeNext("/\t/other.example"), "/dashboard");
  assert.equal(safeNext("/\n/other.example"), "/dashboard");
});
test("Email confirmation callback keeps the customer destination on the configured site", () => {
  const url = new URL(
    confirmationUrl(
      "https://alnudiv.vercel.app/",
      "/booking/abc?start=2030-01-01",
    ),
  );
  assert.equal(url.origin, "https://alnudiv.vercel.app");
  assert.equal(url.pathname, "/auth/callback");
  assert.equal(url.searchParams.get("next"), "/booking/abc?start=2030-01-01");
  assert.equal(
    new URL(
      confirmationUrl("https://alnudiv.vercel.app", "/admin"),
    ).searchParams.get("next"),
    "/dashboard",
  );
  assert.throws(() => confirmationUrl(undefined, "/dashboard"));
  assert.throws(() => confirmationUrl("javascript:alert(1)", "/dashboard"));
});
test("Provider restrictions are actionable without leaking raw messages", () => {
  assert.match(
    registrationError({ code: "signup_disabled" }),
    /belum diaktifkan/,
  );
  assert.match(registrationError({ status: 429 }), /Terlalu banyak/);
  assert.match(
    registrationError({ code: "email_address_not_authorized" }),
    /layanan email/,
  );
  assert.equal(
    registrationError({ message: "private diagnostic data" }).includes(
      "private diagnostic data",
    ),
    false,
  );
});
