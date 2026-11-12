import Link from "next/link";
import { Heart, ImageOff, MessageCircle } from "lucide-react";
import type { FeedPost } from "@/lib/types";
import { formatCount, publicImageUrl } from "@/lib/utils";

export function PostGrid({
  posts,
  emptyText = "Belum ada post",
}: {
  posts: FeedPost[];
  emptyText?: string;
}) {
  if (!posts.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center text-muted">
        <span className="rounded-full border-2 border-foreground p-4 text-foreground">
          <ImageOff className="h-8 w-8" />
        </span>
        <p className="text-lg font-bold text-foreground">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 md:gap-1">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/p/${post.id}`}
          className="group relative aspect-square overflow-hidden bg-surface"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={publicImageUrl("posts", post.image_path)}
            alt={post.caption ?? `Post oleh ${post.author.username}`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 hidden items-center justify-center gap-6 bg-black/35 font-bold text-white group-hover:flex">
            <span className="flex items-center gap-1.5">
              <Heart className="h-5 w-5 fill-white" /> {formatCount(post.like_count)}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-5 w-5 -scale-x-100 fill-white" /> {formatCount(post.comment_count)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
