import { Suspense } from "react";
import { FollowList } from "@/components/follow-list";
import { ListSkeleton } from "@/components/skeletons";

export const metadata = { title: "Mengikuti" };

export default function FollowingPage({ params }: PageProps<"/[username]/following">) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[480px] px-4 py-6 md:py-10">
          <ListSkeleton />
        </div>
      }
    >
      <FollowingContent params={params} />
    </Suspense>
  );
}

async function FollowingContent({ params }: Pick<PageProps<"/[username]/following">, "params">) {
  const { username } = await params;
  return <FollowList username={username} kind="following" />;
}
