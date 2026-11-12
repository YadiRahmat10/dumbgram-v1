"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { USERNAME_REGEX } from "@/lib/utils";

export async function setFollow(targetId: string, follow: boolean) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.id === targetId) return;

  const supabase = await createClient();
  if (follow) {
    await supabase
      .from("follows")
      .upsert({ follower_id: user.id, following_id: targetId }, { ignoreDuplicates: true });
  } else {
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetId);
  }
  revalidatePath("/", "layout");
}

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  let website = String(formData.get("website") ?? "").trim();
  const avatarPath = String(formData.get("avatar_path") ?? "");

  if (!USERNAME_REGEX.test(username)) {
    return { error: "Username 3–30 karakter, hanya huruf kecil, angka, titik, dan garis bawah." };
  }
  if (bio.length > 150) return { error: "Bio maksimal 150 karakter." };
  if (fullName.length > 60) return { error: "Nama maksimal 60 karakter." };
  if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`;
  if (avatarPath && !avatarPath.startsWith(`${user.id}/`)) {
    return { error: "Path avatar tidak valid." };
  }

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      full_name: fullName || null,
      bio: bio || null,
      website: website || null,
      ...(avatarPath ? { avatar_url: avatarPath } : {}),
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") return { error: "Username sudah dipakai." };
    if (error.code === "23514") return { error: "Username tidak diizinkan." };
    return { error: "Gagal menyimpan profil." };
  }

  // Hapus avatar lama jika diganti
  if (avatarPath && current?.avatar_url && current.avatar_url !== avatarPath) {
    await supabase.storage.from("avatars").remove([current.avatar_url]);
  }

  revalidatePath("/", "layout");
  redirect(`/${username}`);
}
