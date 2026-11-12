import { Suspense } from "react";
import Link from "next/link";
import { FeedSkeleton } from "@/components/skeletons";
import { Avatar } from "@/components/avatar";
import { PostCard } from "@/components/post-card";
import { UserRow } from "@/components/user-row";
import { getExplorePosts, getFeedPosts, getSuggestedProfiles } from "@/lib/queries";
import { getCurrentProfile } from "@/lib/supabase/server";

export default function HomePage() {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <Home />
    </Suspense>
  );
}

async function Home() {
  const me = (await getCurrentProfile())!;
  const [feed, suggestions] = await Promise.all([
    getFeedPosts(me.id),
    getSuggestedProfiles(me.id, 5),
  ]);
  // Feed kosong? tampilkan post terbaru dari semua orang.
  const posts = feed.length ? feed : await getExplorePosts(me.id, 20);

  return (
    <div className="mx-auto flex max-w-[935px] justify-center gap-16 md:px-4 md:pt-8">
      <section className="w-full max-w-[470px]">
        {!feed.length && (
          <div className="mx-3 mb-6 rounded-lg border border-border p-5 text-center md:mx-0">
            <p className="font-semibold">Selamat datang di dumbgram 👋</p>
            <p className="mt-1 text-sm text-muted">
              Ikuti orang lain untuk melihat foto mereka di sini, atau{" "}
              <Link href="/create" className="font-semibold text-accent">
                bagikan foto pertamamu
              </Link>
              .
            </p>
          </div>
        )}
        {!feed.length && posts.length > 0 && (
          <h2 className="mb-2 px-3 text-sm font-semibold text-muted md:px-1">Post terbaru</h2>
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>

      <aside className="hidden w-80 shrink-0 pt-2 lg:block">
        <div className="flex items-center gap-3">
          <Link href={`/${me.username}`}>
            <Avatar profile={me} size={44} />
          </Link>
          <div className="min-w-0 text-sm leading-tight">
            <Link href={`/${me.username}`} className="block truncate font-semibold">
              {me.username}
            </Link>
            <p className="truncate text-muted">{me.full_name}</p>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-muted">Disarankan untuk kamu</span>
              <Link href="/search" className="text-xs font-semibold hover:text-muted">
                Lihat semua
              </Link>
            </div>
            {suggestions.map((p) => (
              <UserRow key={p.id} profile={p} viewerId={me.id} following={false} avatarSize={36} />
            ))}
          </div>
        )}

        <p className="mt-8 text-xs text-muted">© {new Date().getFullYear()} dumbgram</p>
      </aside>
    </div>
  );
}
