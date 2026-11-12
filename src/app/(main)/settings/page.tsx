import { Suspense } from "react";
import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/supabase/server";
import { FormSkeleton } from "@/components/skeletons";
import { PageHeading } from "@/components/page-heading";
import { EditProfileForm } from "./edit-profile-form";

export const metadata: Metadata = { title: "Edit profil" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[640px] px-4 py-6 md:py-12">
      <PageHeading title="Edit profil" subtitle="Atur bagaimana orang lain melihatmu di DumbGram." />
      <Suspense fallback={<FormSkeleton />}>
        <SettingsForm />
      </Suspense>
    </div>
  );
}

async function SettingsForm() {
  const profile = (await getCurrentProfile())!;
  return <EditProfileForm profile={profile} />;
}
