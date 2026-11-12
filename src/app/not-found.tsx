import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Logo href={null} className="text-5xl" />
      <p className="text-brand-gradient mt-4 text-7xl font-bold tracking-tight">404</p>
      <h1 className="text-2xl font-bold">Maaf, halaman ini tidak tersedia.</h1>
      <p className="max-w-md text-sm leading-relaxed text-muted">
        Tautan yang kamu ikuti mungkin rusak, atau halaman telah dihapus.
      </p>
      <Link href="/" className="btn-gradient mt-2">
        Kembali ke beranda
      </Link>
    </main>
  );
}
