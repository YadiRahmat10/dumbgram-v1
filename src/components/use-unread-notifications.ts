"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Jumlah notifikasi belum dibaca, diperbarui real-time lewat Supabase Realtime.
 * Selama halaman /notifications terbuka, badge disembunyikan dan notifikasi
 * baru langsung dimuat ulang ke daftar.
 */
export function useUnreadNotifications(userId: string, initial: number) {
  const pathname = usePathname();
  const router = useRouter();
  const onPage = pathname === "/notifications";

  const [count, setCount] = useState(initial);
  // Sinkronkan saat layout server dirender ulang dengan angka terbaru.
  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setCount(initial);
  }
  // Membuka halaman notifikasi = semuanya dianggap sudah dibaca.
  if (onPage && count !== 0) setCount(0);

  const onPageRef = useRef(onPage);
  useEffect(() => {
    onPageRef.current = onPage;
  }, [onPage]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${userId}` },
        async () => {
          if (onPageRef.current) {
            router.refresh();
            return;
          }
          const { count: fresh } = await supabase
            .from("notifications")
            .select("id", { count: "exact", head: true })
            .eq("recipient_id", userId)
            .is("read_at", null);
          setCount(fresh ?? 0);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  return onPage ? 0 : count;
}
