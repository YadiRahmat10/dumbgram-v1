-- =====================================================================
-- dumbgram: skema awal
-- profiles, posts, likes, comments, follows, saved_posts + storage
-- =====================================================================

-- ---------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text not null unique,
  full_name   text,
  bio         text,
  website     text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint username_format check (username ~ '^[a-z0-9._]{3,30}$'),
  -- nama yang bentrok dengan route aplikasi
  constraint username_not_reserved check (
    username not in (
      'explore', 'search', 'create', 'p', 'login', 'signup', 'auth',
      'settings', 'api', 'admin', 'about', 'help'
    )
  ),
  constraint bio_length check (char_length(bio) <= 150),
  constraint full_name_length check (char_length(full_name) <= 60)
);

comment on table public.profiles is 'Profil publik untuk setiap user auth.';

-- ---------------------------------------------------------------------
-- POSTS
-- ---------------------------------------------------------------------
create table public.posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  image_path  text not null,
  caption     text,
  created_at  timestamptz not null default now(),

  constraint caption_length check (char_length(caption) <= 2200)
);

create index posts_user_id_created_at_idx on public.posts (user_id, created_at desc);
create index posts_created_at_idx on public.posts (created_at desc);

-- ---------------------------------------------------------------------
-- LIKES
-- ---------------------------------------------------------------------
create table public.likes (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  post_id     uuid not null references public.posts (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index likes_post_id_idx on public.likes (post_id);

-- ---------------------------------------------------------------------
-- COMMENTS
-- ---------------------------------------------------------------------
create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now(),

  constraint body_length check (char_length(trim(body)) between 1 and 2200)
);

create index comments_post_id_created_at_idx on public.comments (post_id, created_at);
create index comments_user_id_idx on public.comments (user_id);

-- ---------------------------------------------------------------------
-- FOLLOWS
-- ---------------------------------------------------------------------
create table public.follows (
  follower_id   uuid not null references public.profiles (id) on delete cascade,
  following_id  uuid not null references public.profiles (id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

create index follows_following_id_idx on public.follows (following_id);

-- ---------------------------------------------------------------------
-- SAVED POSTS (bookmark)
-- ---------------------------------------------------------------------
create table public.saved_posts (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  post_id     uuid not null references public.posts (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index saved_posts_post_id_idx on public.saved_posts (post_id);

-- =====================================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================================

-- updated_at otomatis
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- buat profil otomatis saat user mendaftar
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username text;
begin
  v_username := lower(coalesce(
    nullif(new.raw_user_meta_data ->> 'username', ''),
    'user_' || substr(replace(new.id::text, '-', ''), 1, 10)
  ));

  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    v_username,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles    enable row level security;
alter table public.posts       enable row level security;
alter table public.likes       enable row level security;
alter table public.comments    enable row level security;
alter table public.follows     enable row level security;
alter table public.saved_posts enable row level security;

-- PROFILES
create policy "Profil dapat dilihat semua orang"
  on public.profiles for select
  using (true);

create policy "User dapat mengubah profilnya sendiri"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- POSTS
create policy "Post dapat dilihat semua orang"
  on public.posts for select
  using (true);

create policy "User dapat membuat post sendiri"
  on public.posts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "User dapat mengubah post sendiri"
  on public.posts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "User dapat menghapus post sendiri"
  on public.posts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- LIKES
create policy "Like dapat dilihat semua orang"
  on public.likes for select
  using (true);

create policy "User dapat like atas namanya sendiri"
  on public.likes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "User dapat unlike miliknya sendiri"
  on public.likes for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- COMMENTS
create policy "Komentar dapat dilihat semua orang"
  on public.comments for select
  using (true);

create policy "User dapat berkomentar atas namanya sendiri"
  on public.comments for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Penulis komentar atau pemilik post dapat menghapus komentar"
  on public.comments for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    or (select auth.uid()) = (select p.user_id from public.posts p where p.id = comments.post_id)
  );

-- FOLLOWS
create policy "Follow dapat dilihat semua orang"
  on public.follows for select
  using (true);

create policy "User dapat follow atas namanya sendiri"
  on public.follows for insert
  to authenticated
  with check ((select auth.uid()) = follower_id);

create policy "User dapat unfollow miliknya sendiri"
  on public.follows for delete
  to authenticated
  using ((select auth.uid()) = follower_id);

-- SAVED POSTS (privat)
create policy "User hanya melihat simpanannya sendiri"
  on public.saved_posts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "User dapat menyimpan post"
  on public.saved_posts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "User dapat menghapus simpanan"
  on public.saved_posts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- =====================================================================
-- STORAGE: bucket gambar post & avatar
-- File disimpan di folder <user_id>/<nama-file>
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('posts',   'posts',   true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('avatars', 'avatars', true, 2097152,  array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Gambar dumbgram dapat dilihat publik"
  on storage.objects for select
  using (bucket_id in ('posts', 'avatars'));

create policy "User mengunggah ke foldernya sendiri"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('posts', 'avatars')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "User mengubah file di foldernya sendiri"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('posts', 'avatars')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "User menghapus file di foldernya sendiri"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('posts', 'avatars')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
