"use server";

import { createClient, getCurrentUser } from "@/lib/supabase/server";

/**
 * Tandai semua notifikasi sebagai sudah dibaca. Sengaja tanpa revalidatePath:
 * halaman notifikasi tetap menyorot item "baru" selama sedang dilihat, dan
 * badge di navigasi direset di sisi klien.
 */
export async function markNotificationsRead() {
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .is("read_at", null);
}
