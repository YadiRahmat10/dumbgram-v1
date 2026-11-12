import { publicImageUrl } from "@/lib/utils";

type Props = {
  profile: { username: string; avatar_url: string | null };
  size?: number;
  ring?: boolean;
  className?: string;
};

export function avatarSrc(avatarUrl: string | null) {
  if (!avatarUrl) return null;
  return avatarUrl.startsWith("http") ? avatarUrl : publicImageUrl("avatars", avatarUrl);
}

// Gradien placeholder senada dengan warna brand.
const GRADIENTS = [
  "from-[#4fd6f7] to-[#8a8dff]",
  "from-[#8a8dff] to-[#f2679f]",
  "from-[#f2679f] to-[#ffcf70]",
  "from-[#4fd6f7] to-[#f2679f]",
  "from-[#8a8dff] to-[#ffcf70]",
];

export function Avatar({ profile, size = 32, ring = false, className = "" }: Props) {
  const src = avatarSrc(profile.avatar_url);
  const gradient = GRADIENTS[profile.username.charCodeAt(0) % GRADIENTS.length];

  const inner = src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Foto profil ${profile.username}`}
      width={size}
      height={size}
      className="h-full w-full rounded-full object-cover"
    />
  ) : (
    <span
      className={`flex h-full w-full select-none items-center justify-center rounded-full bg-linear-to-br font-bold uppercase text-white ${gradient}`}
      style={{ fontSize: Math.max(10, size * 0.42) }}
      aria-label={`Foto profil ${profile.username}`}
    >
      {profile.username[0]}
    </span>
  );

  if (!ring) {
    return (
      <span className={`inline-block shrink-0 ${className}`} style={{ width: size, height: size }}>
        {inner}
      </span>
    );
  }

  const pad = size >= 80 ? 3 : 2;
  return (
    <span
      className={`brand-gradient-diagonal inline-block shrink-0 rounded-full ${className}`}
      style={{ width: size + pad * 4, height: size + pad * 4, padding: pad }}
    >
      <span className="block h-full w-full rounded-full bg-background" style={{ padding: pad }}>
        {inner}
      </span>
    </span>
  );
}
