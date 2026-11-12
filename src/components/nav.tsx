"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, LogOut, PlusSquare, Search, Settings } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Avatar } from "./avatar";
import { Logo } from "./logo";

type Props = { profile: { username: string; avatar_url: string | null } };

export function Nav({ profile }: Props) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/search", label: "Cari", icon: Search },
    { href: "/explore", label: "Jelajahi", icon: Compass },
    { href: "/create", label: "Buat", icon: PlusSquare },
  ];
  const profileHref = `/${profile.username}`;
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Header mobile */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:hidden">
        <Logo className="text-2xl" />
        <div className="flex items-center gap-4">
          <Link href="/settings" aria-label="Pengaturan">
            <Settings className="h-6 w-6" />
          </Link>
          <form action={signOut}>
            <button type="submit" aria-label="Keluar">
              <LogOut className="h-6 w-6" />
            </button>
          </form>
        </div>
      </header>

      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[72px] flex-col border-r border-border bg-background px-3 pb-5 pt-8 md:flex xl:w-60">
        <div className="mb-10 px-3">
          <Logo className="hidden text-[28px] xl:inline" />
          <Link href="/" className="font-brand text-2xl xl:hidden" aria-label="dumbgram">
            d
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-4 rounded-lg p-3 transition hover:bg-surface ${
                isActive(href) ? "font-bold" : ""
              }`}
            >
              <Icon
                className="h-6 w-6 transition group-hover:scale-105"
                strokeWidth={isActive(href) ? 2.6 : 2}
              />
              <span className="hidden xl:inline">{label}</span>
            </Link>
          ))}
          <Link
            href={profileHref}
            className={`group flex items-center gap-4 rounded-lg p-3 transition hover:bg-surface ${
              isActive(profileHref) ? "font-bold" : ""
            }`}
          >
            <Avatar
              profile={profile}
              size={24}
              className={isActive(profileHref) ? "rounded-full outline-2 outline-offset-1 outline-foreground" : ""}
            />
            <span className="hidden xl:inline">Profil</span>
          </Link>
        </nav>
        <div className="flex flex-col gap-1">
          <Link
            href="/settings"
            className={`flex items-center gap-4 rounded-lg p-3 transition hover:bg-surface ${
              isActive("/settings") ? "font-bold" : ""
            }`}
          >
            <Settings className="h-6 w-6" />
            <span className="hidden xl:inline">Pengaturan</span>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-4 rounded-lg p-3 text-left transition hover:bg-surface"
            >
              <LogOut className="h-6 w-6" />
              <span className="hidden xl:inline">Keluar</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Tab bar mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-12 items-center justify-around border-t border-border bg-background md:hidden">
        {items.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} aria-label={label} className="p-2">
            <Icon className="h-6 w-6" strokeWidth={isActive(href) ? 2.6 : 2} />
          </Link>
        ))}
        <Link href={profileHref} aria-label="Profil" className="p-2">
          <Avatar
            profile={profile}
            size={26}
            className={isActive(profileHref) ? "rounded-full outline-2 outline-offset-1 outline-foreground" : ""}
          />
        </Link>
      </nav>
    </>
  );
}
