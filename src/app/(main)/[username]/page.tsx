import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bookmark, Grid3x3 } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { FollowButton } from "@/components/follow-button";
import { ProfileSkeleton } from "@/components/skeletons";
import { PostGrid } from "@/components/post-grid";
import { getPostsByUser, getProfileByUsername, getProfileStats, getSavedPosts, isFollowing } from "@/lib/queries";
import { getCurrentUser } from "@/lib/supabase/server";
import { formatCount } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/[username]">): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(decodeURIComponent(username));
  if (!profile) return { title: "Halaman tidak ditemukan" };
  return {
    title: profile.full_name ? `${profile.full_name} (@${profile.username})` : `@${profile.username}`,
    description: profile.bio ?? undefined,
  };
}

export default function ProfilePage({ params, searchParams }: PageProps<"/[username]">) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Profile params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Profile({ params, searchParams }: PageProps<"/[username]">) {
  const [{ username }, { tab }] = await Promise.all([params, searchParams]);
  const profile = await getProfileByUsername(decodeURIComponent(username));
  if (!profile) notFound();

  const user = (await getCurrentUser())!;
  const isMe = user.id === profile.id;
  const showSaved = isMe && tab === "saved";

  const [stats, following, posts] = await Promise.all([
    getProfileStats(profile.id),
    isMe ? Promise.resolve(false) : isFollowing(user.id, profile.id),
    showSaved ? getSavedPosts(user.id) : getPostsByUser(profile.id, user.id),
  ]);

  const statItems = [
    { label: "post", value: stats.posts, href: null },
    { label: "pengikut", value: stats.followers, href: `/${profile.username}/followers` },
    { label: "mengikuti", value: stats.following, href: `/${profile.username}/following` },
  ];

  return (
    <div className="mx-auto max-w-[935px] md:px-5 md:pt-8">
      <header className="flex items-center gap-6 px-4 pt-5 md:gap-20 md:px-12 md:pb-10">
        <Avatar profile={profile} size={150} className="hidden md:inline-block" />
        <Avatar profile={profile} size={80} className="md:hidden" />

        <section className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3 md:gap-5">
            <h1 className="truncate text-xl">{profile.username}</h1>
            {isMe ? (
              <Link href="/settings" className="btn-secondary">
                Edit profil
              </Link>
            ) : (
              <FollowButton targetId={profile.id} following={following} />
            )}
          </div>

          <ul className="mt-5 hidden gap-10 md:flex">
            {statItems.map((s) => (
              <li key={s.label}>
                {s.href ? (
                  <Link href={s.href}>
                    <b>{formatCount(s.value)}</b> {s.label}
                  </Link>
                ) : (
                  <>
                    <b>{formatCount(s.value)}</b> {s.label}
                  </>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-5 hidden text-sm md:block">
            <ProfileBio profile={profile} />
          </div>
        </section>
      </header>

      <div className="px-4 py-4 text-sm md:hidden">
        <ProfileBio profile={profile} />
      </div>

      <ul className="flex border-t border-border py-3 text-center text-sm md:hidden">
        {statItems.map((s) => (
          <li key={s.label} className="flex-1 leading-tight">
            {s.href ? (
              <Link href={s.href}>
                <b className="block">{formatCount(s.value)}</b>
                <span className="text-muted">{s.label}</span>
              </Link>
            ) : (
              <>
                <b className="block">{formatCount(s.value)}</b>
                <span className="text-muted">{s.label}</span>
              </>
            )}
          </li>
        ))}
      </ul>

      <nav className="flex justify-center gap-14 border-t border-border text-xs font-semibold uppercase tracking-widest">
        <Link
          href={`/${profile.username}`}
          className={`-mt-px flex items-center gap-1.5 border-t py-4 ${
            !showSaved ? "border-foreground" : "border-transparent text-muted"
          }`}
        >
          <Grid3x3 className="h-4 w-4" /> Post
        </Link>
        {isMe && (
          <Link
            href={`/${profile.username}?tab=saved`}
            className={`-mt-px flex items-center gap-1.5 border-t py-4 ${
              showSaved ? "border-foreground" : "border-transparent text-muted"
            }`}
          >
            <Bookmark className="h-4 w-4" /> Tersimpan
          </Link>
        )}
      </nav>

      <PostGrid
        posts={posts}
        emptyText={showSaved ? "Belum ada post tersimpan" : isMe ? "Bagikan foto pertamamu" : "Belum ada post"}
      />
    </div>
  );
}

function ProfileBio({
  profile,
}: {
  profile: { full_name: string | null; bio: string | null; website: string | null };
}) {
  return (
    <>
      {profile.full_name && <p className="font-semibold">{profile.full_name}</p>}
      {profile.bio && <p className="whitespace-pre-line">{profile.bio}</p>}
      {profile.website && (
        <a
          href={profile.website}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="font-semibold text-accent hover:underline"
        >
          {profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </a>
      )}
    </>
  );
}
