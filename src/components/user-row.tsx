import Link from "next/link";
import type { PostAuthor } from "@/lib/types";
import { Avatar } from "./avatar";
import { FollowButton } from "./follow-button";

export function UserRow({
  profile,
  viewerId,
  following,
  avatarSize = 44,
  subtitle,
}: {
  profile: PostAuthor;
  viewerId?: string;
  following?: boolean;
  avatarSize?: number;
  subtitle?: string;
}) {
  return (
    <div className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-surface-2">
      <Link href={`/${profile.username}`}>
        <Avatar profile={profile} size={avatarSize} />
      </Link>
      <div className="min-w-0 flex-1 text-sm leading-tight">
        <Link href={`/${profile.username}`} className="block truncate font-semibold hover:text-accent">
          {profile.username}
        </Link>
        <p className="mt-0.5 truncate text-xs text-muted">{subtitle ?? profile.full_name ?? ""}</p>
      </div>
      {viewerId && viewerId !== profile.id && following !== undefined && (
        <FollowButton targetId={profile.id} following={following} size="sm" />
      )}
    </div>
  );
}
