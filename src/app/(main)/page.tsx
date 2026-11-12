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
    <div className="mx-auto flex max-w-[960px] justify-center gap-10 sm:px-4 sm:pt-6 md:pt-10">
      <section className="w-full max-w-[500px]">
        {!feed.length && (
          <div className="gradient-border mx-3 mb-6 rounded-2xl p-6 sm:mx-0">
            <p className="text-lg font-bold">
              Selamat datang di <span className="text-brand-gradient">DumbGram</span> 👋
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Ikuti orang lain untuk melihat foto mereka di sini, atau bagikan karya pertamamu.
            </p>
            <Link href="/create" className="btn-primary mt-4">
              Bagikan foto
            </Link>
          </div>
        )}
        {!feed.length && posts.length > 0 && (
          <h2 className="mb-3 px-4 text-xs font-bold uppercase tracking-widest text-muted sm:px-1">
            Post terbaru
          </h2>
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>

      <aside className="hidden w-80 shrink-0 lg:block">
        <div className="sticky top-10 space-y-4">
          <div className="card flex items-center gap-3 p-4">
            <Link href={`/${me.username}`}>
              <Avatar profile={me} size={48} ring />
            </Link>
            <div className="min-w-0 text-sm leading-tight">
              <Link href={`/${me.username}`} className="block truncate font-bold hover:text-accent">
                {me.username}
              </Link>
              <p className="mt-0.5 truncate text-muted">{me.full_name}</p>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="card p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold">Disarankan untukmu</span>
                <Link href="/search" className="text-xs font-semibold text-accent hover:text-accent-hover">
                  Lihat semua
                </Link>
              </div>
              {suggestions.map((p) => (
                <UserRow key={p.id} profile={p} viewerId={me.id} following={false} avatarSize={36} />
              ))}
            </div>
          )}

          <p className="px-1 text-xs text-muted">
            © {new Date().getFullYear()} <span className="font-brand">DumbGram</span>
          </p>
        </div>
      </aside>
    </div>
  );
}
