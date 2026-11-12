"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, Home, LogOut, Plus, Search, Settings } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Avatar } from "./avatar";
import { Logo } from "./logo";
import { useUnreadNotifications } from "./use-unread-notifications";

type Props = {
  profile: { id: string; username: string; avatar_url: string | null };
  unreadCount: number;
};

const ITEMS = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/search", label: "Cari", icon: Search },
  { href: "/explore", label: "Jelajahi", icon: Compass },
];

export function Nav({ profile, unreadCount }: Props) {
  const pathname = usePathname();
  const unread = useUnreadNotifications(profile.id, unreadCount);
  const bellLabel = unread ? `Notifikasi (${unread} baru)` : "Notifikasi";
  const profileHref = `/${profile.username}`;
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const itemClass = (active: boolean) =>
    `group relative flex items-center gap-4 rounded-xl p-3 text-sm transition ${
      active ? "bg-surface-2 font-bold text-foreground" : "text-foreground/70 hover:bg-surface hover:text-foreground"
    }`;
  const activeBar = (
    <span className="brand-gradient absolute inset-y-2 left-0 w-1 rounded-full" aria-hidden />
  );

  return (
    <>
      {/* Header mobile */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-lg md:hidden">
        <Logo className="text-2xl" />
        <div className="flex items-center gap-1">
          <Link
            href="/notifications"
            aria-label={bellLabel}
            className={`relative rounded-full p-2 hover:bg-surface ${
              isActive("/notifications") ? "text-foreground" : "text-foreground/80"
            }`}
          >
            <Bell className="h-5 w-5" strokeWidth={isActive("/notifications") ? 2.5 : 2} />
            <UnreadBadge count={unread} className="right-0 top-0.5" />
          </Link>
          <Link href="/settings" aria-label="Pengaturan" className="rounded-full p-2 text-foreground/80 hover:bg-surface">
            <Settings className="h-5 w-5" />
          </Link>
          <form action={signOut}>
            <button type="submit" aria-label="Keluar" className="rounded-full p-2 text-foreground/80 hover:bg-surface">
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </div>
      </header>

      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-19 flex-col border-r border-border bg-background px-3 pb-5 pt-7 md:flex xl:w-64 xl:px-4">
        <div className="mb-8 flex justify-center xl:justify-start xl:px-3">
          <div className="hidden xl:block">
            <Logo className="text-[32px]" />
          </div>
          <div className="xl:hidden">
            <Logo compact className="text-3xl" />
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {ITEMS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={itemClass(isActive(href))} title={label}>
              {isActive(href) && activeBar}
              <Icon className="h-6 w-6 shrink-0" strokeWidth={isActive(href) ? 2.5 : 2} />
              <span className="hidden xl:inline">{label}</span>
            </Link>
          ))}
          <Link href="/notifications" className={itemClass(isActive("/notifications"))} title={bellLabel}>
            {isActive("/notifications") && activeBar}
            <span className="relative shrink-0">
              <Bell className="h-6 w-6" strokeWidth={isActive("/notifications") ? 2.5 : 2} />
              <UnreadBadge count={unread} className="-right-2 -top-1.5" />
            </span>
            <span className="hidden xl:inline">Notifikasi</span>
          </Link>
          <Link href={profileHref} className={itemClass(isActive(profileHref))} title="Profil">
            {isActive(profileHref) && activeBar}
            <Avatar profile={profile} size={24} ring={isActive(profileHref)} />
            <span className="hidden xl:inline">Profil</span>
          </Link>

          <Link
            href="/create"
            title="Buat post"
            className={`btn-primary mt-4 h-12 w-12 self-center p-0 xl:h-auto xl:w-full xl:py-3 ${
              isActive("/create") ? "ring-2 ring-white/20 ring-offset-2 ring-offset-background" : ""
            }`}
          >
            <Plus className="h-5 w-5" strokeWidth={2.75} />
            <span className="hidden xl:inline">Buat post</span>
          </Link>
        </nav>

        <div className="flex flex-col gap-1 border-t border-border pt-3">
          <Link href="/settings" className={itemClass(isActive("/settings"))} title="Pengaturan">
            {isActive("/settings") && activeBar}
            <Settings className="h-6 w-6 shrink-0" />
            <span className="hidden xl:inline">Pengaturan</span>
          </Link>
          <form action={signOut}>
            <button type="submit" className={`${itemClass(false)} w-full text-left`} title="Keluar">
              <LogOut className="h-6 w-6 shrink-0" />
              <span className="hidden xl:inline">Keluar</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Tab bar mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-border bg-background/90 px-2 backdrop-blur-lg md:hidden">
        {ITEMS.slice(0, 2).map(({ href, label, icon: Icon }) => (
          <TabLink key={href} href={href} label={label} active={isActive(href)}>
            <Icon className="h-6 w-6" strokeWidth={isActive(href) ? 2.5 : 2} />
          </TabLink>
        ))}
        <Link
          href="/create"
          aria-label="Buat post"
          className="brand-gradient flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_6px_20px_-6px_rgba(242,103,159,0.8)]"
        >
          <Plus className="h-6 w-6" strokeWidth={2.75} />
        </Link>
        <TabLink href="/explore" label="Jelajahi" active={isActive("/explore")}>
          <Compass className="h-6 w-6" strokeWidth={isActive("/explore") ? 2.5 : 2} />
        </TabLink>
        <TabLink href={profileHref} label="Profil" active={isActive(profileHref)}>
          <Avatar profile={profile} size={26} ring={isActive(profileHref)} />
        </TabLink>
      </nav>
    </>
  );
}

function TabLink({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`relative flex flex-col items-center p-2 ${active ? "text-foreground" : "text-foreground/60"}`}
    >
      {children}
      <span
        className={`brand-gradient absolute -bottom-0.5 h-1 w-1 rounded-full transition ${active ? "opacity-100" : "opacity-0"}`}
        aria-hidden
      />
    </Link>
  );
}

function UnreadBadge({ count, className = "" }: { count: number; className?: string }) {
  if (!count) return null;
  return (
    <span
      aria-hidden
      className={`brand-gradient absolute flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white ring-2 ring-background ${className}`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
