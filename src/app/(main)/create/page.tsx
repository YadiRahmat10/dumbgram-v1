import { Suspense } from "react";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/supabase/server";
import { CreatePostForm } from "./create-post-form";

export const metadata: Metadata = { title: "Buat post" };

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-[860px] px-4 py-6 md:py-12">
      <Suspense fallback={<div className="aspect-[4/3] animate-pulse rounded-xl bg-surface" />}>
        <CreateForm />
      </Suspense>
    </div>
  );
}

async function CreateForm() {
  const user = (await getCurrentUser())!;
  return <CreatePostForm userId={user.id} />;
}
