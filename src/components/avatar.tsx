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

const COLORS = [
  "bg-rose-500", "bg-orange-500", "bg-amber-500", "bg-emerald-500",
  "bg-teal-500", "bg-sky-500", "bg-indigo-500", "bg-violet-500", "bg-fuchsia-500",
];

export function Avatar({ profile, size = 32, ring = false, className = "" }: Props) {
  const src = avatarSrc(profile.avatar_url);
  const color = COLORS[profile.username.charCodeAt(0) % COLORS.length];

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
      className={`flex h-full w-full select-none items-center justify-center rounded-full font-semibold uppercase text-white ${color}`}
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

  return (
    <span
      className={`inline-block shrink-0 rounded-full bg-linear-to-tr from-sky-400 via-indigo-500 to-fuchsia-500 p-[2px] ${className}`}
      style={{ width: size + 6, height: size + 6 }}
    >
      <span className="block h-full w-full rounded-full bg-background p-[2px]">{inner}</span>
    </span>
  );
}
