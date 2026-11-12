import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { CommentForm } from "@/components/comment-form";
import { DeleteCommentButton, DeletePostButton } from "@/components/delete-buttons";
import { FollowButton } from "@/components/follow-button";
import { PostGrid } from "@/components/post-grid";
import { PostInteractions } from "@/components/post-interactions";
import { PostSkeleton } from "@/components/skeletons";
import { RichText } from "@/components/rich-text";
import { getComments, getPost, getPostsByUser, isFollowing } from "@/lib/queries";
import { getCurrentUser } from "@/lib/supabase/server";
import { publicImageUrl, timeAgo } from "@/lib/utils";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: PageProps<"/p/[id]">): Promise<Metadata> {
  const { id } = await params;
  if (!UUID.test(id)) return {};
  const post = await getPost(id, null);
  if (!post) return {};
  return {
    title: `${post.author.username}${post.caption ? `: “${post.caption.slice(0, 60)}”` : ""}`,
  };
}

export default function PostPage({ params }: PageProps<"/p/[id]">) {
  return (
    <Suspense fallback={<PostSkeleton />}>
      <PostDetail params={params} />
    </Suspense>
  );
}

async function PostDetail({ params }: Pick<PageProps<"/p/[id]">, "params">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const user = (await getCurrentUser())!;
  const post = await getPost(id, user.id);
  if (!post) notFound();

  const isOwner = post.user_id === user.id;
  const [comments, following, morePosts] = await Promise.all([
    getComments(post.id),
    isOwner ? Promise.resolve(false) : isFollowing(user.id, post.user_id),
    getPostsByUser(post.user_id, user.id),
  ]);
  const others = morePosts.filter((p) => p.id !== post.id).slice(0, 6);
  const { author } = post;

  const header = (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
      <Link href={`/${author.username}`}>
        <Avatar profile={author} size={32} ring />
      </Link>
      <Link href={`/${author.username}`} className="text-sm font-semibold hover:text-accent">
        {author.username}
      </Link>
      {!isOwner && (
        <>
          <div className="ml-auto">
            <FollowButton targetId={author.id} following={following} size="sm" />
          </div>
        </>
      )}
      {isOwner && (
        <div className="ml-auto">
          <DeletePostButton postId={post.id} />
        </div>
      )}
    </div>
  );

  const body = (
    <ul className="space-y-5 py-3 text-sm md:px-1">
      {post.caption && (
        <li className="flex gap-3">
          <Avatar profile={author} size={32} />
          <div className="min-w-0">
            <p className="whitespace-pre-line break-words">
              <Link href={`/${author.username}`} className="mr-1 font-semibold">
                {author.username}
              </Link>
              <RichText text={post.caption} />
            </p>
            <time className="text-xs text-muted" dateTime={post.created_at}>
              {timeAgo(post.created_at, true)}
            </time>
          </div>
        </li>
      )}
      {comments.map((c) => (
        <li key={c.id} className="group flex gap-3">
          <Link href={`/${c.author.username}`}>
            <Avatar profile={c.author} size={32} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="whitespace-pre-line break-words">
              <Link href={`/${c.author.username}`} className="mr-1 font-semibold">
                {c.author.username}
              </Link>
              <RichText text={c.body} />
            </p>
            <time className="text-xs text-muted" dateTime={c.created_at}>
              {timeAgo(c.created_at, true)}
            </time>
          </div>
          {(c.user_id === user.id || isOwner) && <DeleteCommentButton commentId={c.id} />}
        </li>
      ))}
      {!post.caption && comments.length === 0 && (
        <li className="py-10 text-center">
          <p className="text-lg font-bold">Belum ada komentar</p>
          <p className="text-muted">Mulai percakapan.</p>
        </li>
      )}
    </ul>
  );

  const footer = (
    <>
      <time className="block px-4 pb-2 text-[11px] uppercase tracking-wide text-muted" dateTime={post.created_at}>
        {new Date(post.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
      </time>
      <CommentForm postId={post.id} inputId="comment-input" variant="bordered" />
    </>
  );

  return (
    <div className="mx-auto max-w-[1000px] md:px-6 md:py-10">
      <PostInteractions
        variant="detail"
        postId={post.id}
        imageUrl={publicImageUrl("posts", post.image_path)}
        alt={post.caption ?? `Foto oleh ${author.username}`}
        liked={post.liked_by_me}
        saved={post.saved_by_me}
        likeCount={post.like_count}
        commentInputId="comment-input"
        header={header}
        body={body}
        footer={footer}
      />

      {others.length > 0 && (
        <section className="mt-12 px-1 md:px-0">
          <h2 className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-muted md:px-0">
            Lebih banyak dari{" "}
            <Link href={`/${author.username}`} className="text-brand-gradient normal-case tracking-normal">
              {author.username}
            </Link>
          </h2>
          <PostGrid posts={others} />
        </section>
      )}
    </div>
  );
}
