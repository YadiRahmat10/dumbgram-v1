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

  const stats3 = (
    <ul className="grid grid-cols-3 gap-2 text-center">
      {statItems.map((s) => {
        const inner = (
          <>
            <b className="block text-lg leading-tight">{formatCount(s.value)}</b>
            <span className="text-xs text-muted">{s.label}</span>
          </>
        );
        return (
          <li key={s.label}>
            {s.href ? (
              <Link href={s.href} className="block rounded-xl bg-surface-2 px-3 py-2.5 transition hover:bg-border">
                {inner}
              </Link>
            ) : (
              <div className="rounded-xl bg-surface-2 px-3 py-2.5">{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="mx-auto max-w-[960px] md:px-6 md:pt-10">
      <header className="relative overflow-hidden px-4 pb-6 pt-6 md:card md:px-10 md:py-10">
        <div
          aria-hidden
          className="brand-gradient-diagonal pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full opacity-20 blur-3xl"
        />
        <div className="relative flex items-center gap-5 md:gap-12">
          <Avatar profile={profile} size={140} ring className="hidden md:inline-block" />
          <Avatar profile={profile} size={80} ring className="md:hidden" />

          <section className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-xl font-bold md:text-2xl">{profile.username}</h1>
              {isMe ? (
                <Link href="/settings" className="btn-secondary py-2">
                  Edit profil
                </Link>
              ) : (
                <FollowButton targetId={profile.id} following={following} />
              )}
            </div>
            <div className="mt-3 hidden text-sm md:block">
              <ProfileBio profile={profile} />
            </div>
            <div className="mt-5 hidden max-w-md md:block">{stats3}</div>
          </section>
        </div>

        <div className="relative mt-4 text-sm md:hidden">
          <ProfileBio profile={profile} />
        </div>
        <div className="relative mt-4 md:hidden">{stats3}</div>
      </header>

      <nav className="mt-2 flex justify-center gap-10 border-b border-border text-xs font-bold uppercase tracking-widest md:mt-6">
        <ProfileTab href={`/${profile.username}`} active={!showSaved}>
          <Grid3x3 className="h-4 w-4" /> Post
        </ProfileTab>
        {isMe && (
          <ProfileTab href={`/${profile.username}?tab=saved`} active={showSaved}>
            <Bookmark className="h-4 w-4" /> Tersimpan
          </ProfileTab>
        )}
      </nav>

      <div className="pt-1 md:pt-4">
        <PostGrid
          posts={posts}
          emptyText={showSaved ? "Belum ada post tersimpan" : isMe ? "Bagikan foto pertamamu" : "Belum ada post"}
        />
      </div>
    </div>
  );
}

function ProfileTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-1.5 py-4 transition ${
        active ? "text-foreground" : "text-muted hover:text-foreground"
      }`}
    >
      {children}
      {active && <span className="brand-gradient absolute inset-x-0 -bottom-px h-0.5 rounded-full" aria-hidden />}
    </Link>
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
      {profile.bio && <p className="mt-1 whitespace-pre-line leading-relaxed text-foreground/85">{profile.bio}</p>}
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
