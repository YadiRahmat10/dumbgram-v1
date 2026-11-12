import Link from "next/link";

export function Logo({ className = "text-3xl" }: { className?: string }) {
  return (
    <Link href="/" className={`font-brand leading-none tracking-tight ${className}`}>
      dumbgram
    </Link>
  );
}
