import { Suspense } from "react";
import type { Metadata } from "next";
import Form from "next/form";
import { Search } from "lucide-react";
import { ListSkeleton } from "@/components/skeletons";
import { UserRow } from "@/components/user-row";
import { PageHeading } from "@/components/page-heading";
import { getFollowingIds, getSuggestedProfiles, searchProfiles } from "@/lib/queries";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Cari" };

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="mx-auto max-w-[600px] px-4 py-6 md:py-10">
      <PageHeading title="Cari" subtitle="Temukan kreator dan teman baru." />
      <Suspense
        fallback={
          <>
            <div className="input mb-6 h-12 rounded-xl" />
            <ListSkeleton />
          </>
        }
      >
        <SearchContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchContent({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const { q } = await searchParams;
  const term = typeof q === "string" ? q : "";
  const user = (await getCurrentUser())!;

  const [results, followingIds] = await Promise.all([
    term ? searchProfiles(term) : getSuggestedProfiles(user.id, 15),
    getFollowingIds(user.id),
  ]);

  return (
    <>
      <Form className="relative mb-6" action="/search">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          name="q"
          defaultValue={term}
          placeholder="Cari username atau nama"
          autoComplete="off"
          autoFocus
          className="input rounded-xl py-3.5 pl-11"
        />
      </Form>

      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
        {term ? "Hasil" : "Orang yang mungkin kamu kenal"}
      </h2>
      {results.length === 0 ? (
        <p className="card py-12 text-center text-sm text-muted">
          {term ? `Tidak ada hasil untuk “${term}”.` : "Belum ada pengguna lain."}
        </p>
      ) : (
        <div className="card px-4 py-2">
          {results.map((p) => (
            <UserRow key={p.id} profile={p} viewerId={user.id} following={followingIds.has(p.id)} />
          ))}
        </div>
      )}
    </>
  );
}
