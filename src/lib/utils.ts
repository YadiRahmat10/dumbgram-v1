import { SUPABASE_URL } from "./supabase/env";

export function publicImageUrl(bucket: "posts" | "avatars", path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export function timeAgo(date: string | Date, short = false) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 1000),
  );
  const units: [number, string, string][] = [
    [60 * 60 * 24 * 365, "tahun", "thn"],
    [60 * 60 * 24 * 7, "minggu", "mg"],
    [60 * 60 * 24, "hari", "h"],
    [60 * 60, "jam", "j"],
    [60, "menit", "m"],
  ];
  for (const [size, long, abbr] of units) {
    const value = Math.floor(seconds / size);
    if (value >= 1) return short ? `${value}${abbr}` : `${value} ${long} lalu`;
  }
  return short ? "baru" : "baru saja";
}

export function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}jt`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}rb`;
  return n.toLocaleString("id-ID");
}

export const USERNAME_REGEX = /^[a-z0-9._]{3,30}$/;
