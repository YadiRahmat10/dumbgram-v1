import { Suspense } from "react";
import type { Metadata } from "next";
import { GridSkeleton } from "@/components/skeletons";
import { PostGrid } from "@/components/post-grid";
import { PageHeading } from "@/components/page-heading";
import { getExplorePosts } from "@/lib/queries";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Jelajahi" };

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-[1000px] px-2 py-4 md:px-6 md:py-10">
      <PageHeading title="Jelajahi" subtitle="Temukan karya terbaru dari semua orang." className="px-2 md:px-0" />
      <Suspense fallback={<GridSkeleton />}>
        <ExploreGrid />
      </Suspense>
    </div>
  );
}

async function ExploreGrid() {
  const user = await getCurrentUser();
  const posts = await getExplorePosts(user?.id ?? null);
  return <PostGrid posts={posts} layout="masonry" emptyText="Belum ada yang bisa dijelajahi" />;
}
