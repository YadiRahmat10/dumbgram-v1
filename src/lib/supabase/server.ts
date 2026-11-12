import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

export async function createClient() {
  // Data Supabase selalu per-request; auth-js juga memakai Date.now() untuk cek
  // kedaluwarsa sesi, yang dengan Cache Components hanya boleh setelah connection().
  await connection();
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Dipanggil dari Server Component: aman diabaikan karena
          // proxy sudah me-refresh sesi.
        }
      },
    },
  });
}

/** User yang sedang login (sudah diverifikasi ke server Auth), di-cache per request. */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Profil milik user yang sedang login, di-cache per request. */
export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data;
});
