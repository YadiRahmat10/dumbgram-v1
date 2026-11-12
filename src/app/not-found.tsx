import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-brand text-4xl">dumbgram</p>
      <h1 className="text-2xl font-semibold">Maaf, halaman ini tidak tersedia.</h1>
      <p className="text-muted">
        Tautan yang kamu ikuti mungkin rusak, atau halaman telah dihapus.{" "}
        <Link href="/" className="font-semibold text-accent">
          Kembali ke dumbgram.
        </Link>
      </p>
    </main>
  );
}
