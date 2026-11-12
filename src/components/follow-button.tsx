"use client";

import { useOptimistic, useTransition } from "react";
import { setFollow } from "@/app/actions/profile";

export function FollowButton({
  targetId,
  following,
  size = "md",
}: {
  targetId: string;
  following: boolean;
  size?: "sm" | "md";
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
        className={`text-xs font-semibold transition ${
          isFollowing ? "text-foreground hover:text-muted" : "text-accent hover:text-foreground"
        }`}
      >
        {isFollowing ? "Mengikuti" : "Ikuti"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={isFollowing ? "btn-secondary min-w-28" : "btn-primary min-w-28"}
    >
      {isFollowing ? "Mengikuti" : "Ikuti"}
    </button>
  );
}
