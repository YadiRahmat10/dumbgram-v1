import { Suspense } from "react";
import type { Metadata } from "next";
import { GridSkeleton } from "@/components/skeletons";
import { PostGrid } from "@/components/post-grid";
import { getExplorePosts } from "@/lib/queries";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Jelajahi" };

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-[935px] md:px-4 md:py-8">
      <Suspense fallback={<GridSkeleton />}>
        <ExploreGrid />
      </Suspense>
    </div>
  );
}

async function ExploreGrid() {
  const user = await getCurrentUser();
  const posts = await getExplorePosts(user?.id ?? null);
  return <PostGrid posts={posts} emptyText="Belum ada yang bisa dijelajahi" />;
}
