import Link from "next/link";
import type { FeedPost } from "@/lib/types";
import { formatCount, publicImageUrl, timeAgo } from "@/lib/utils";
import { Avatar } from "./avatar";
import { CommentForm } from "./comment-form";
import { PostInteractions } from "./post-interactions";
import { RichText } from "./rich-text";

export function PostCard({ post }: { post: FeedPost }) {
  const { author } = post;
  return (
    <article className="border-b border-border pb-4 sm:card sm:mb-6 sm:overflow-hidden sm:pb-1">
      <header className="flex items-center gap-3 px-4 py-3">
        <Link href={`/${author.username}`}>
          <Avatar profile={author} size={34} ring />
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <Link href={`/${author.username}`} className="block truncate text-sm font-semibold hover:text-accent">
            {author.username}
          </Link>
          {author.full_name && <p className="truncate text-xs text-muted">{author.full_name}</p>}
        </div>
        <Link href={`/p/${post.id}`} className="shrink-0 text-xs text-muted hover:text-foreground">
          <time dateTime={post.created_at} title={new Date(post.created_at).toLocaleString("id-ID")}>
            {timeAgo(post.created_at, true)}
          </time>
        </Link>
      </header>

      <PostInteractions
        postId={post.id}
        imageUrl={publicImageUrl("posts", post.image_path)}
        alt={post.caption ?? `Foto oleh ${post.author.username}`}
        liked={post.liked_by_me}
        saved={post.saved_by_me}
        likeCount={post.like_count}
      />

      <div className="space-y-1.5 px-4 pb-2 pt-1 text-sm">
        {post.caption && (
          <p className="whitespace-pre-line break-words leading-relaxed">
            <Link href={`/${post.author.username}`} className="mr-1.5 font-semibold">
              {post.author.username}
            </Link>
            <RichText text={post.caption} />
          </p>
        )}
        {post.comment_count > 0 && (
          <Link href={`/p/${post.id}`} className="block text-muted hover:text-foreground">
            Lihat {post.comment_count === 1 ? "1 komentar" : `semua ${formatCount(post.comment_count)} komentar`}
          </Link>
        )}
      </div>
      <div className="px-3">
        <CommentForm postId={post.id} />
      </div>
    </article>
  );
}
