import Link from "next/link";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { FollowButton } from "@/components/follow-button";
import type { NotificationItem, NotificationType } from "@/lib/types";
import { publicImageUrl, timeAgo } from "@/lib/utils";

const FILTERS: { type?: NotificationType; label: string }[] = [
  { label: "Semua" },
  { type: "like", label: "Suka" },
  { type: "comment", label: "Komentar" },
  { type: "follow", label: "Pengikut" },
];

const META = {
  like: { icon: Heart, badge: "bg-like", text: "menyukai postmu." },
  comment: { icon: MessageCircle, badge: "bg-[#4fd6f7]", text: "mengomentari postmu" },
  follow: { icon: UserPlus, badge: "bg-accent", text: "mulai mengikutimu." },
} as const;

export function NotificationRow({ n, following }: { n: NotificationItem; following: boolean }) {
  const meta = META[n.type];
  const Icon = meta.icon;
  const unread = !n.read_at;
  const href = n.type === "follow" || !n.post ? `/${n.actor.username}` : `/p/${n.post.id}`;
  const comment = n.comment?.body;

  return (
    <li className={`relative flex items-center gap-3 px-4 py-3 transition hover:bg-surface-2 ${unread ? "bg-accent/[0.07]" : ""}`}>
      {unread && (
        <span className="brand-gradient absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full" aria-label="Baru" />
      )}

      <Link href={`/${n.actor.username}`} className="relative shrink-0">
        <Avatar profile={n.actor} size={44} />
        <span
          className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-surface ${meta.badge}`}
        >
          <Icon className={`h-3 w-3 text-white ${n.type === "like" ? "fill-white" : ""} ${n.type === "comment" ? "-scale-x-100" : ""}`} strokeWidth={2.5} />
        </span>
      </Link>

      <Link href={href} className="min-w-0 flex-1 text-sm leading-snug">
        <span className="font-semibold">{n.actor.username}</span> {meta.text}
        {comment && (
          <span className="text-foreground/80">
            : “{comment.length > 90 ? `${comment.slice(0, 90)}…` : comment}”
          </span>
        )}{" "}
        <time className="whitespace-nowrap text-xs text-muted" dateTime={n.created_at}>
          {timeAgo(n.created_at, true)}
        </time>
      </Link>

      {n.type === "follow" ? (
        <FollowButton targetId={n.actor.id} following={following} size="sm" followLabel="Ikuti balik" />
      ) : (
        n.post && (
          <Link href={`/p/${n.post.id}`} className="shrink-0 overflow-hidden rounded-lg bg-surface-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicImageUrl("posts", n.post.image_path)}
              alt="Post"
              loading="lazy"
              className="h-11 w-11 object-cover"
            />
          </Link>
        )
      )}
    </li>
  );
}

export function FilterTabs({ active }: { active?: "all" | NotificationType }) {
  return (
    <nav className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1">
      {FILTERS.map((f) => {
        const key = f.type ?? "all";
        const isActive = active === key;
        return (
          <Link
            key={key}
            href={f.type ? `/notifications?type=${f.type}` : "/notifications"}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
              isActive
                ? "brand-gradient text-white shadow-[0_6px_20px_-8px_rgba(242,103,159,0.7)]"
                : "border border-border bg-surface text-foreground/75 hover:text-foreground"
            }`}
          >
            {f.label}
          </Link>
        );
      })}
    </nav>
  );
}
