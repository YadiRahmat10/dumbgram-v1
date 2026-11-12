import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { getCurrentProfile } from "@/lib/supabase/server";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<NavSkeleton />}>
        <NavWithProfile />
      </Suspense>
      <main className="pb-16 md:pb-0 md:pl-[72px] xl:pl-60">{children}</main>
    </div>
  );
}

async function NavWithProfile() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return <Nav profile={profile} />;
}

function NavSkeleton() {
  return (
    <>
      <div className="sticky top-0 z-30 h-14 border-b border-border bg-background md:hidden" />
      <div className="fixed inset-y-0 left-0 z-30 hidden w-[72px] border-r border-border bg-background md:block xl:w-60" />
      <div className="fixed inset-x-0 bottom-0 z-30 h-12 border-t border-border bg-background md:hidden" />
    </>
  );
}
