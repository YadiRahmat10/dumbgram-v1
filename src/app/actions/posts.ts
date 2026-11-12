"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function createPost(imagePath: string, caption: string): Promise<ActionState> {
  const user = await requireUser();
  // Gambar harus berada di folder milik user sendiri.
  if (!imagePath.startsWith(`${user.id}/`)) return { error: "Path gambar tidak valid." };
  if (caption.length > 2200) return { error: "Caption maksimal 2.200 karakter." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({ user_id: user.id, image_path: imagePath, caption: caption.trim() || null })
    .select("id")
    .single();

  if (error) {
    await supabase.storage.from("posts").remove([imagePath]);
    return { error: "Gagal membuat post. Coba lagi." };
  }

  revalidatePath("/", "layout");
  redirect(`/p/${data.id}`);
}

export async function deletePost(postId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id)
    .select("image_path")
    .maybeSingle();

  if (post?.image_path) {
    await supabase.storage.from("posts").remove([post.image_path]);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  revalidatePath("/", "layout");
  redirect(profile ? `/${profile.username}` : "/");
}

export async function setLike(postId: string, like: boolean) {
  const user = await requireUser();
  const supabase = await createClient();
  if (like) {
    await supabase
      .from("likes")
      .upsert({ user_id: user.id, post_id: postId }, { ignoreDuplicates: true });
  } else {
    await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", postId);
  }
  revalidatePath("/", "layout");
}

export async function setSaved(postId: string, save: boolean) {
  const user = await requireUser();
  const supabase = await createClient();
  if (save) {
    await supabase
      .from("saved_posts")
      .upsert({ user_id: user.id, post_id: postId }, { ignoreDuplicates: true });
  } else {
    await supabase.from("saved_posts").delete().eq("user_id", user.id).eq("post_id", postId);
  }
  revalidatePath("/", "layout");
}

export async function addComment(
  postId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Komentar tidak boleh kosong." };
  if (body.length > 2200) return { error: "Komentar terlalu panjang." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, user_id: user.id, body });
  if (error) return { error: "Gagal mengirim komentar." };

  revalidatePath("/", "layout");
  return { message: "ok" };
}

export async function deleteComment(commentId: string) {
  await requireUser();
  const supabase = await createClient();
  // RLS memastikan hanya penulis komentar / pemilik post yang bisa menghapus.
  await supabase.from("comments").delete().eq("id", commentId);
  revalidatePath("/", "layout");
}
