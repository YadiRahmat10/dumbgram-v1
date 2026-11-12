import "server-only";
import { createClient } from "./supabase/server";
import type { CommentWithAuthor, FeedPost, NotificationItem, NotificationType, Profile } from "./types";

type Supabase = Awaited<ReturnType<typeof createClient>>;

const POST_SELECT = `
  id, user_id, image_path, caption, created_at,
  author:profiles!posts_user_id_fkey ( id, username, full_name, avatar_url ),
  likes ( count ),
  comments ( count )
`;

type RawPost = Omit<FeedPost, "like_count" | "comment_count" | "liked_by_me" | "saved_by_me"> & {
  likes: { count: number }[];
  comments: { count: number }[];
};

/** Tambahkan jumlah like/komentar dan status like/simpan milik user. */
async function hydrate(
  supabase: Supabase,
  rows: RawPost[] | null,
  viewerId: string | null,
): Promise<FeedPost[]> {
  if (!rows?.length) return [];
  const ids = rows.map((r) => r.id);

  let liked = new Set<string>();
  let saved = new Set<string>();
  if (viewerId) {
    const [likesRes, savedRes] = await Promise.all([
      supabase.from("likes").select("post_id").eq("user_id", viewerId).in("post_id", ids),
      supabase.from("saved_posts").select("post_id").eq("user_id", viewerId).in("post_id", ids),
    ]);
    liked = new Set((likesRes.data ?? []).map((r) => r.post_id as string));
    saved = new Set((savedRes.data ?? []).map((r) => r.post_id as string));
  }

  return rows.map(({ likes, comments, ...rest }) => ({
    ...rest,
    like_count: likes?.[0]?.count ?? 0,
    comment_count: comments?.[0]?.count ?? 0,
    liked_by_me: liked.has(rest.id),
    saved_by_me: saved.has(rest.id),
  }));
}

export async function getFeedPosts(viewerId: string, limit = 30) {
  const supabase = await createClient();
  const { data: following } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", viewerId);

  const authorIds = [viewerId, ...(following ?? []).map((f) => f.following_id as string)];

  const { data } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .in("user_id", authorIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  return hydrate(supabase, data as unknown as RawPost[], viewerId);
}

export async function getExplorePosts(viewerId: string | null, limit = 60) {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (viewerId) query = query.neq("user_id", viewerId);
  const { data } = await query;
  return hydrate(supabase, data as unknown as RawPost[], viewerId);
}

export async function getPostsByUser(userId: string, viewerId: string | null) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return hydrate(supabase, data as unknown as RawPost[], viewerId);
}

export async function getSavedPosts(viewerId: string) {
  const supabase = await createClient();
  const { data: saved } = await supabase
    .from("saved_posts")
    .select("post_id, created_at")
    .eq("user_id", viewerId)
    .order("created_at", { ascending: false });
  const ids = (saved ?? []).map((s) => s.post_id as string);
  if (!ids.length) return [];
  const { data } = await supabase.from("posts").select(POST_SELECT).in("id", ids);
  const posts = await hydrate(supabase, data as unknown as RawPost[], viewerId);
  const order = new Map(ids.map((id, i) => [id, i]));
  return posts.sort((a, b) => order.get(a.id)! - order.get(b.id)!);
}

export async function getPost(postId: string, viewerId: string | null) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("id", postId)
    .maybeSingle();
  if (!data) return null;
  const [post] = await hydrate(supabase, [data as unknown as RawPost], viewerId);
  return post;
}

export async function getComments(postId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select(
      "id, post_id, user_id, body, created_at, author:profiles!comments_user_id_fkey ( id, username, full_name, avatar_url )",
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  return (data ?? []) as unknown as CommentWithAuthor[];
}

export async function getProfileByUsername(username: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  return data as Profile | null;
}

export async function getProfileStats(userId: string) {
  const supabase = await createClient();
  const [posts, followers, following] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
  ]);
  return {
    posts: posts.count ?? 0,
    followers: followers.count ?? 0,
    following: following.count ?? 0,
  };
}

export async function isFollowing(followerId: string, followingId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  return Boolean(data);
}

export async function getFollowList(userId: string, kind: "followers" | "following") {
  const supabase = await createClient();
  const query =
    kind === "followers"
      ? supabase
          .from("follows")
          .select("created_at, profile:profiles!follows_follower_id_fkey ( id, username, full_name, avatar_url )")
          .eq("following_id", userId)
      : supabase
          .from("follows")
          .select("created_at, profile:profiles!follows_following_id_fkey ( id, username, full_name, avatar_url )")
          .eq("follower_id", userId);
  const { data } = await query.order("created_at", { ascending: false });
  return ((data ?? []) as unknown as { profile: Profile }[]).map((r) => r.profile);
}

/** Id user yang di-follow oleh viewer (untuk menampilkan tombol follow yang benar). */
export async function getFollowingIds(viewerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", viewerId);
  return new Set((data ?? []).map((r) => r.following_id as string));
}

export async function getSuggestedProfiles(viewerId: string, limit = 5) {
  const supabase = await createClient();
  const following = await getFollowingIds(viewerId);
  const exclude = [viewerId, ...following];
  const { data } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .not("id", "in", `(${exclude.join(",")})`)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Profile[];
}

export async function searchProfiles(term: string, limit = 30) {
  const supabase = await createClient();
  const q = term.trim().replace(/[%_,()]/g, "");
  if (!q) return [];
  const { data } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
    .limit(limit);
  return (data ?? []) as Profile[];
}

const NOTIFICATION_SELECT = `
  id, type, created_at, read_at,
  actor:profiles!notifications_actor_id_fkey ( id, username, full_name, avatar_url ),
  post:posts ( id, image_path ),
  comment:comments ( body )
`;

export async function getNotifications(
  userId: string,
  type?: NotificationType,
  limit = 60,
) {
  const supabase = await createClient();
  let query = supabase
    .from("notifications")
    .select(NOTIFICATION_SELECT)
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (type) query = query.eq("type", type);
  const { data } = await query;
  return (data ?? []) as unknown as NotificationItem[];
}

export async function getUnreadNotificationCount(userId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .is("read_at", null);
  return count ?? 0;
}
