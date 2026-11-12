import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "Setup" };

export default function SetupPage() {
  if (isSupabaseConfigured) redirect("/");

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-12">
      <Logo href={null} className="text-5xl" />
      <div className="space-y-2">
        <h1 className="text-xl font-bold">Supabase belum dikonfigurasi</h1>
        <p className="text-muted">
          Variabel <code>NEXT_PUBLIC_SUPABASE_URL</code> dan{" "}
          <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> belum diisi.
        </p>
      </div>
      <ol className="list-decimal space-y-3 pl-5 text-sm">
        <li>
          Buat file <code className="rounded bg-surface px-1">.env.local</code> di root project
          (salin dari <code className="rounded bg-surface px-1">.env.example</code>).
        </li>
        <li>
          Isi dengan <b>Project URL</b> dan <b>Publishable key</b> dari Supabase Dashboard → Project
          Settings → API Keys.
          <pre className="mt-2 overflow-x-auto rounded-lg bg-surface p-3 text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...`}
          </pre>
        </li>
        <li>
          Terapkan migrasi: <code className="rounded bg-surface px-1">npx supabase login</code>,{" "}
          <code className="rounded bg-surface px-1">npm run db:link -- --project-ref &lt;ref&gt;</code>,{" "}
          <code className="rounded bg-surface px-1">npm run db:push</code>
        </li>
        <li>
          Restart <code className="rounded bg-surface px-1">npm run dev</code> lalu muat ulang halaman ini.
        </li>
      </ol>
    </main>
  );
}
