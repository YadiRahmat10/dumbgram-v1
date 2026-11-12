export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

/** false jika env Supabase belum diisi (atau masih nilai contoh dari .env.example). */
export const isSupabaseConfigured =
  /^https?:\/\//.test(SUPABASE_URL) &&
  SUPABASE_KEY.length > 0 &&
  !SUPABASE_URL.includes("xxxxxxxx") &&
  !SUPABASE_KEY.includes("xxxxxxxx");
