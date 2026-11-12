"use client";

import { useEffect } from "react";
import { markNotificationsRead } from "@/app/actions/notifications";

/** Menandai notifikasi sudah dibaca setelah halaman tampil (dan saat ada yang baru). */
export function MarkNotificationsRead({ latestId }: { latestId: string | null }) {
  useEffect(() => {
    if (latestId) markNotificationsRead();
  }, [latestId]);
  return null;
}
