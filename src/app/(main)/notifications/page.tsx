import { Suspense } from "react";
import type { Metadata } from "next";
import { BellOff } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { ListSkeleton } from "@/components/skeletons";
import { getFollowingIds, getNotifications } from "@/lib/queries";
import { getCurrentUser } from "@/lib/supabase/server";
import type { NotificationItem, NotificationType } from "@/lib/types";
import { MarkNotificationsRead } from "./mark-read";
import { FilterTabs, NotificationRow } from "./notification-row";

export const metadata: Metadata = { title: "Notifikasi" };

const EMPTY: Record<"all" | NotificationType, string> = {
  all: "Belum ada notifikasi. Saat ada yang menyukai, mengomentari, atau mengikutimu, kabarnya muncul di sini.",
  like: "Belum ada yang menyukai postmu.",
  comment: "Belum ada komentar di postmu.",
  follow: "Belum ada pengikut baru.",
};

const isType = (v: unknown): v is NotificationType => v === "like" || v === "comment" || v === "follow";

export default function NotificationsPage({ searchParams }: PageProps<"/notifications">) {
  return (
    <div className="mx-auto max-w-[640px] px-4 py-6 md:py-10">
      <PageHeading title="Notifikasi" subtitle="Like, komentar, dan pengikut baru untukmu." />
      <Suspense
        fallback={
          <>
            <FilterTabs />
            <div className="card px-4 py-2">
              <ListSkeleton count={5} />
            </div>
          </>
        }
      >
        <Notifications searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Notifications({ searchParams }: Pick<PageProps<"/notifications">, "searchParams">) {
  const { type } = await searchParams;
  const filter = isType(type) ? type : undefined;
  const user = (await getCurrentUser())!;
  const [items, followingIds] = await Promise.all([
    getNotifications(user.id, filter),
    getFollowingIds(user.id),
  ]);

  return (
    <>
      <FilterTabs active={filter ?? "all"} />
      <MarkNotificationsRead latestId={items[0]?.id ?? null} />

      {items.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
          <span className="gradient-border rounded-full p-5">
            <BellOff className="h-8 w-8 text-accent" />
          </span>
          <p className="max-w-xs text-sm leading-relaxed text-muted">{EMPTY[filter ?? "all"]}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupByTime(items).map((group) => (
            <section key={group.label}>
              <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-muted">{group.label}</h2>
              <ul className="card divide-y divide-border overflow-hidden">
                {group.items.map((n) => (
                  <NotificationRow key={n.id} n={n} following={followingIds.has(n.actor.id)} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

const DAY = 24 * 60 * 60 * 1000;

function groupByTime(items: NotificationItem[]) {
  const now = Date.now();
  const buckets = [
    { label: "Terbaru", max: DAY, items: [] as NotificationItem[] },
    { label: "Minggu ini", max: 7 * DAY, items: [] as NotificationItem[] },
    { label: "Bulan ini", max: 30 * DAY, items: [] as NotificationItem[] },
    { label: "Sebelumnya", max: Infinity, items: [] as NotificationItem[] },
  ];
  for (const item of items) {
    const age = now - new Date(item.created_at).getTime();
    buckets.find((b) => age < b.max)!.items.push(item);
  }
  return buckets.filter((b) => b.items.length);
}
