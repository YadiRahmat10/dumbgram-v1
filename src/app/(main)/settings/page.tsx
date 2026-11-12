import { Suspense } from "react";
import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/supabase/server";
import { FormSkeleton } from "@/components/skeletons";
import { EditProfileForm } from "./edit-profile-form";

export const metadata: Metadata = { title: "Edit profil" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[640px] px-4 py-6 md:py-12">
      <h1 className="mb-8 text-xl font-bold">Edit profil</h1>
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
