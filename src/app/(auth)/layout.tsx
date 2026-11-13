import { Logo } from "@/components/logo";

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=600&q=70&auto=format&fit=crop`;

type Photo = { id: string; grow: number; alt: string; filter?: string };

// Tiga kolom dengan tinggi foto berbeda agar terlihat seperti masonry.
const COLUMNS: Photo[][] = [
  [
    { id: "1432405972618-c60b0225b8f9", grow: 5, alt: "Air terjun di tengah hutan" },
    { id: "1506794778202-cad84cf45f1d", grow: 4, alt: "Potret pria", filter: "grayscale" },
    { id: "1520250497591-112f2f40a3f4", grow: 4, alt: "Resor tropis dengan kolam renang" },
  ],
  [
    { id: "1505142468610-359e7d316be0", grow: 7, alt: "Ombak pantai dari udara" },
    { id: "1507525428034-b723cf961d3e", grow: 6, alt: "Pantai saat matahari terbenam" },
  ],
  [
    { id: "1534528741775-53994a69daeb", grow: 4, alt: "Potret wanita", filter: "grayscale" },
    { id: "1558981806-ec527fa84c39", grow: 5, alt: "Pengendara motor di jalan", filter: "sepia" },
    { id: "1448375240586-882707db888b", grow: 4, alt: "Hutan pinus" },
  ],
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
    >
      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <Logo href={null} className="text-5xl" />
          <h1 className="mt-8 text-4xl font-bold leading-tight tracking-tight sm:text-[2.6rem]">
            Share your best photos or videos
          </h1>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Join now, share your creations with another people and enjoy other creations.
          </p>
          <div className="mt-8">{children}</div>
        </div>
      </section>

      <aside aria-hidden className="hidden h-screen gap-2 overflow-hidden py-6 pr-6 lg:sticky lg:top-0 lg:grid lg:grid-cols-3">
        {COLUMNS.map((column, i) => (
          <div key={i} className="flex min-h-0 flex-col gap-2">
            {column.map((photo) => (
              <div
                key={photo.id}
                className="group relative min-h-0 overflow-hidden bg-surface"
                style={{ flexGrow: photo.grow, flexBasis: 0 }}
              >
                <img
                  src={unsplash(photo.id)}
                  alt={photo.alt}
                  loading="lazy"
                  className={`absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 ${photo.filter ?? ""}`}
                />
              </div>
            ))}
          </div>
        ))}
      </aside>
    </main>
  );
}
