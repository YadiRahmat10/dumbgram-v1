import { Suspense } from "react";
import { FollowList } from "@/components/follow-list";
import { ListSkeleton } from "@/components/skeletons";

export const metadata = { title: "Pengikut" };

export default function FollowersPage({ params }: PageProps<"/[username]/followers">) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[480px] px-4 py-6 md:py-10">
          <ListSkeleton />
        </div>
      }
    >
      <FollowersContent params={params} />
    </Suspense>
  );
}

async function FollowersContent({ params }: Pick<PageProps<"/[username]/followers">, "params">) {
  const { username } = await params;
  return <FollowList username={username} kind="followers" />;
}
