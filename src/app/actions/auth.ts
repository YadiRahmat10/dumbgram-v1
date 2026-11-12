"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { USERNAME_REGEX } from "@/lib/utils";

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email dan kata sandi wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      error:
        error.code === "email_not_confirmed"
          ? "Email belum dikonfirmasi. Cek kotak masuk kamu."
          : "Email atau kata sandi salah.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();

  if (!email || !password || !username) {
    return { error: "Email, username, dan kata sandi wajib diisi." };
  }
  if (!USERNAME_REGEX.test(username)) {
    return {
      error: "Username 3–30 karakter, hanya huruf kecil, angka, titik, dan garis bawah.",
    };
  }
  if (password.length < 6) return { error: "Kata sandi minimal 6 karakter." };

  const supabase = await createClient();
  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (taken) return { error: "Username sudah dipakai." };

  const origin = (await headers()).get("origin") ?? "";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, full_name: fullName },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("database error")) {
      return { error: "Username tidak valid atau sudah dipakai." };
    }
    return { error: error.message };
  }

  // Jika konfirmasi email aktif, belum ada sesi.
  if (!data.session) {
    return { message: "Cek email kamu untuk mengonfirmasi akun, lalu masuk." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
