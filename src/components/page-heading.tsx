/** Judul halaman dengan garis aksen gradien. */
export function PageHeading({
  title,
  subtitle,
  className = "",
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`mb-6 md:mb-8 ${className}`}>
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
      <span className="brand-gradient mt-2 block h-1 w-12 rounded-full" aria-hidden />
      {subtitle && <p className="mt-3 text-sm text-muted">{subtitle}</p>}
    </div>
  );
}
