import Link from "next/link";
import { Heart, ImageOff, MessageCircle } from "lucide-react";
import type { FeedPost } from "@/lib/types";
import { formatCount, publicImageUrl } from "@/lib/utils";

export function PostGrid({
  posts,
  emptyText = "Belum ada post",
  layout = "square",
}: {
  posts: FeedPost[];
  emptyText?: string;
  /** "masonry" mengikuti rasio asli foto, seperti grid di halaman login. */
  layout?: "square" | "masonry";
}) {
  if (!posts.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="gradient-border rounded-full p-5">
          <ImageOff className="h-8 w-8 text-accent" />
        </span>
        <p className="text-lg font-bold">{emptyText}</p>
      </div>
    );
  }

  if (layout === "masonry") {
    return (
      <div className="columns-2 gap-2 md:columns-3 md:gap-3">
        {posts.map((post) => (
          <Tile key={post.id} post={post} className="mb-2 break-inside-avoid md:mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicImageUrl("posts", post.image_path)}
              alt={post.caption ?? `Post oleh ${post.author.username}`}
              loading="lazy"
              className="block w-full transition duration-500 group-hover:scale-[1.03]"
            />
          </Tile>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2">
      {posts.map((post) => (
        <Tile key={post.id} post={post} className="aspect-square md:rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={publicImageUrl("posts", post.image_path)}
            alt={post.caption ?? `Post oleh ${post.author.username}`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        </Tile>
      ))}
    </div>
  );
}

function Tile({
  post,
  className,
  children,
}: {
  post: FeedPost;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/p/${post.id}`}
      className={`group relative block overflow-hidden rounded-lg bg-surface ${className}`}
    >
      {children}
      <div className="absolute inset-0 flex items-end justify-center gap-5 bg-linear-to-t from-black/75 via-black/20 to-transparent pb-4 text-sm font-bold text-white opacity-0 transition duration-300 group-hover:opacity-100">
        <span className="flex items-center gap-1.5">
          <Heart className="h-4 w-4 fill-white" /> {formatCount(post.like_count)}
        </span>
        <span className="flex items-center gap-1.5">
          <MessageCircle className="h-4 w-4 -scale-x-100 fill-white" /> {formatCount(post.comment_count)}
        </span>
      </div>
    </Link>
  );
}
