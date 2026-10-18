import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function money(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}
export function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(
    new Date(),
  );
}
export function dateLabel(s: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(s + "T00:00:00Z"));
}
export function safeNext(v: unknown) {
  return typeof v === "string" &&
    v.startsWith("/") &&
    !v.startsWith("//") &&
    !v.includes("\\") &&
    !Array.from(v).some((c) => c.charCodeAt(0) <= 32 || c.charCodeAt(0) === 127)
    ? v
    : "/dashboard";
}
