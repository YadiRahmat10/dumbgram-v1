import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { getUnreadNotificationCount } from "@/lib/queries";
import { getCurrentProfile } from "@/lib/supabase/server";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<NavSkeleton />}>
        <NavWithProfile />
      </Suspense>
      <main className="pb-20 md:pb-0 md:pl-19 xl:pl-64">{children}</main>
    </div>
  );
}

async function NavWithProfile() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  const unreadCount = await getUnreadNotificationCount(profile.id);
  return <Nav profile={profile} unreadCount={unreadCount} />;
}

function NavSkeleton() {
  return (
    <>
      <div className="sticky top-0 z-30 h-14 border-b border-border bg-background md:hidden" />
      <div className="fixed inset-y-0 left-0 z-30 hidden w-19 border-r border-border bg-background md:block xl:w-64" />
      <div className="fixed inset-x-0 bottom-0 z-30 h-16 border-t border-border bg-background md:hidden" />
    </>
  );
}
