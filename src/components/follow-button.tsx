"use client";

import { useOptimistic, useTransition } from "react";
import { setFollow } from "@/app/actions/profile";

export function FollowButton({
  targetId,
  following,
  size = "md",
  followLabel = "Ikuti",
}: {
  targetId: string;
  following: boolean;
  size?: "sm" | "md";
  /** Teks tombol saat belum mengikuti, mis. "Ikuti balik". */
  followLabel?: string;
}) {
  const [, startTransition] = useTransition();
  const [isFollowing, setOptimistic] = useOptimistic(following);

  function toggle() {
    const next = !isFollowing;
    startTransition(async () => {
      setOptimistic(next);
      await setFollow(targetId, next);
    });
  }

  if (size === "sm") {
    return (
      <button
        type="button"
        onClick={toggle}
        className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
          isFollowing
            ? "border border-border text-foreground/80 hover:border-muted hover:text-foreground"
            : "brand-gradient text-white hover:brightness-110"
        }`}
      >
        {isFollowing ? "Mengikuti" : followLabel}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={isFollowing ? "btn-secondary min-w-28" : "btn-primary min-w-28"}
    >
      {isFollowing ? "Mengikuti" : followLabel}
    </button>
  );
}
