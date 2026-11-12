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
    <article className="border-b border-border pb-4 md:pb-5">
      <header className="flex items-center gap-3 px-3 py-3 md:px-1">
        <Link href={`/${author.username}`}>
          <Avatar profile={author} size={32} ring />
        </Link>
        <div className="flex min-w-0 items-center gap-1 text-sm">
          <Link href={`/${author.username}`} className="truncate font-semibold hover:opacity-70">
            {author.username}
          </Link>
          <span className="text-muted">•</span>
          <Link href={`/p/${post.id}`} className="text-muted hover:opacity-70">
            <time dateTime={post.created_at} title={new Date(post.created_at).toLocaleString("id-ID")}>
              {timeAgo(post.created_at, true)}
            </time>
          </Link>
        </div>
      </header>

      <div className="md:overflow-hidden md:rounded-md md:border md:border-border">
      <PostInteractions
        postId={post.id}
        imageUrl={publicImageUrl("posts", post.image_path)}
        alt={post.caption ?? `Foto oleh ${post.author.username}`}
        liked={post.liked_by_me}
        saved={post.saved_by_me}
        likeCount={post.like_count}
      />
      <div className="space-y-1 px-3 pb-2 pt-1 text-sm md:px-2">
        {post.caption && (
          <p className="whitespace-pre-line break-words">
            <Link href={`/${post.author.username}`} className="mr-1 font-semibold">
              {post.author.username}
            </Link>
            <RichText text={post.caption} />
          </p>
        )}
        {post.comment_count > 0 && (
          <Link href={`/p/${post.id}`} className="block text-muted">
            Lihat {post.comment_count === 1 ? "1 komentar" : `semua ${formatCount(post.comment_count)} komentar`}
          </Link>
        )}
      </div>
      <div className="px-2 md:px-1">
        <CommentForm postId={post.id} />
      </div>
      </div>
    </article>
  );
}
