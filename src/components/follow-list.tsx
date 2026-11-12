import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getFollowingIds, getFollowList, getProfileByUsername } from "@/lib/queries";
import { getCurrentUser } from "@/lib/supabase/server";
import { UserRow } from "./user-row";

export async function FollowList({
  username,
  kind,
}: {
  username: string;
  kind: "followers" | "following";
}) {
  const profile = await getProfileByUsername(decodeURIComponent(username));
  if (!profile) notFound();
  const user = (await getCurrentUser())!;
  const [list, followingIds] = await Promise.all([
    getFollowList(profile.id, kind),
    getFollowingIds(user.id),
  ]);

  return (
    <div className="mx-auto max-w-[480px] px-4 py-6 md:py-10">
      <div className="mb-4 flex items-center gap-3">
        <Link href={`/${profile.username}`} aria-label="Kembali">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold">
          {kind === "followers" ? "Pengikut" : "Mengikuti"} · {profile.username}
        </h1>
      </div>
      {list.length === 0 ? (
        <p className="py-16 text-center text-muted">
          {kind === "followers" ? "Belum ada pengikut." : "Belum mengikuti siapa pun."}
        </p>
      ) : (
        list.map((p) => (
          <UserRow key={p.id} profile={p} viewerId={user.id} following={followingIds.has(p.id)} />
        ))
      )}
    </div>
  );
}
