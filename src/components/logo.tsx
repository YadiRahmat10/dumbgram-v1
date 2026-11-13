import Link from "next/link";

/** Logo neon bergradien. `compact` hanya menampilkan huruf "D" (sidebar sempit). */
export function Logo({
  className = "text-3xl",
  compact = false,
  href = "/",
}: {
  className?: string;
  compact?: boolean;
  href?: string | null;
}) {
  const text = (
    // bg-clip-text hanya mewarnai area di dalam kotak elemen; ekor huruf "G" (Pacifico)
    // menjulur keluar, jadi kotaknya diperluas dengan padding lalu dikompensasi margin negatif.
    <span
      className={`text-brand-gradient neon-glow -mx-[0.15em] -mb-[0.3em] inline-block w-fit px-[0.15em] pb-[0.3em] font-brand leading-normal ${className}`}
    >
      {compact ? "D" : "DumbGram"}
    </span>
  );
  if (href === null) return text;
  return (
    <Link href={href} aria-label="DumbGram" className="inline-block">
      {text}
    </Link>
  );
}
