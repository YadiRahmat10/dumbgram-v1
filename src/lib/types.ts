export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  website: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type PostAuthor = Pick<Profile, "id" | "username" | "full_name" | "avatar_url">;

export type FeedPost = {
  id: string;
  user_id: string;
  image_path: string;
  caption: string | null;
  created_at: string;
  author: PostAuthor;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
  saved_by_me: boolean;
};

export type CommentWithAuthor = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  author: PostAuthor;
};

export type ActionState = { error?: string; message?: string } | undefined;
