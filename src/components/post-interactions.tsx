"use client";

import Link from "next/link";
import { useOptimistic, useRef, useState, useTransition } from "react";
import { Bookmark, Heart, Link2, MessageCircle } from "lucide-react";
import { setLike, setSaved } from "@/app/actions/posts";
import { formatCount } from "@/lib/utils";

type Props = {
  postId: string;
  imageUrl: string;
  alt: string;
  liked: boolean;
  saved: boolean;
  likeCount: number;
  /** Tampilan grid persegi (detail) vs mengikuti rasio gambar (feed) */
  variant?: "feed" | "detail";
  /** Jika di halaman detail, ikon komentar memfokuskan input. */
  commentInputId?: string;
  /** Slot untuk tampilan detail (desktop: gambar kiri, panel kanan). */
  header?: React.ReactNode;
  body?: React.ReactNode;
  footer?: React.ReactNode;
};

export function PostInteractions({
  postId,
  imageUrl,
  alt,
  liked,
  saved,
  likeCount,
  variant = "feed",
  commentInputId,
  header,
  body,
  footer,
}: Props) {
  const [, startTransition] = useTransition();
  const [state, setOptimistic] = useOptimistic(
    { liked, saved, likeCount },
    (cur, patch: Partial<{ liked: boolean; saved: boolean }>) => {
      const next = { ...cur, ...patch };
      if (patch.liked !== undefined && patch.liked !== cur.liked) {
        next.likeCount = cur.likeCount + (patch.liked ? 1 : -1);
      }
      return next;
    },
  );
  const [burst, setBurst] = useState(0);
  const [bounce, setBounce] = useState(0);
  const [copied, setCopied] = useState(false);
  const lastTap = useRef(0);

  function toggleLike(value = !state.liked) {
    if (value) setBounce((b) => b + 1);
    startTransition(async () => {
      setOptimistic({ liked: value });
      await setLike(postId, value);
    });
  }

  function toggleSave() {
    const value = !state.saved;
    startTransition(async () => {
      setOptimistic({ saved: value });
      await setSaved(postId, value);
    });
  }

  function handleImageTap() {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setBurst((b) => b + 1);
      if (!state.liked) toggleLike(true);
    }
    lastTap.current = now;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/p/${postId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  const iconBtn = "rounded-full p-2 transition hover:bg-surface-2";

  const image = (
    <div
      className={`relative select-none overflow-hidden ${
        variant === "detail" ? "flex items-center justify-center bg-black md:h-full" : "bg-surface-2"
      }`}
      onClick={handleImageTap}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={alt}
        draggable={false}
        className={
          variant === "detail"
            ? "max-h-[85vh] w-full object-contain"
            : "max-h-[585px] w-full object-cover"
        }
      />
      {burst > 0 && (
        <Heart
          key={burst}
          className="animate-heart-pop pointer-events-none absolute left-1/2 top-1/2 -ml-12 -mt-12 h-24 w-24 fill-white text-white drop-shadow-lg"
        />
      )}
    </div>
  );

  const actions = (
    <>
      <div className="flex items-center gap-1 px-2 pt-2">
        <button
          type="button"
          onClick={() => toggleLike()}
          aria-label={state.liked ? "Batal suka" : "Suka"}
          className={iconBtn}
        >
          <Heart
            key={bounce}
            className={`h-6 w-6 ${state.liked ? "animate-like fill-like text-like" : ""}`}
          />
        </button>
        {commentInputId ? (
          <button
            type="button"
            aria-label="Komentar"
            onClick={() => document.getElementById(commentInputId)?.focus()}
            className={iconBtn}
          >
            <MessageCircle className="h-6 w-6 -scale-x-100" />
          </button>
        ) : (
          <Link href={`/p/${postId}`} aria-label="Komentar" className={iconBtn}>
            <MessageCircle className="h-6 w-6 -scale-x-100" />
          </Link>
        )}
        <button
          type="button"
          onClick={copyLink}
          aria-label="Salin tautan"
          className={`relative ${iconBtn}`}
        >
          <Link2 className="h-6 w-6" />
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-surface-2 px-2 py-1 text-xs font-semibold text-foreground shadow-lg ring-1 ring-border">
              Tautan disalin
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={toggleSave}
          aria-label={state.saved ? "Hapus dari simpanan" : "Simpan"}
          className={`ml-auto ${iconBtn}`}
        >
          <Bookmark className={`h-6 w-6 ${state.saved ? "fill-accent text-accent" : ""}`} />
        </button>
      </div>

      <p className="px-4 pt-1 text-sm font-semibold">
        {state.likeCount === 0 ? "Jadilah yang pertama menyukai" : `${formatCount(state.likeCount)} suka`}
      </p>
    </>
  );

  if (variant === "detail") {
    return (
      <div className="grid overflow-hidden md:card md:grid-cols-[minmax(0,1fr)_380px]">
        <div className="md:hidden">{header}</div>
        {image}
        <div className="flex min-h-0 flex-col md:max-h-[85vh] md:border-l md:border-border">
          <div className="hidden md:block">{header}</div>
          <div className="order-2 min-h-0 flex-1 overflow-y-auto px-3 md:order-none md:py-3">{body}</div>
          <div className="order-1 border-border pb-2 md:order-none md:border-t">{actions}</div>
          <div className="order-3 md:order-none">{footer}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {image}
      {actions}
    </>
  );
}
