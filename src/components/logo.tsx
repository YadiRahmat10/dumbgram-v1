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
    <span className={`text-brand-gradient neon-glow inline-block w-fit pr-1 font-brand leading-normal ${className}`}>
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
