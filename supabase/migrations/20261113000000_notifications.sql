-- =====================================================================
-- dumbgram: notifikasi untuk follow, like, dan komentar
-- Baris dibuat oleh trigger (security definer), bukan oleh klien.
-- =====================================================================

create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  recipient_id  uuid not null references public.profiles (id) on delete cascade,
  actor_id      uuid not null references public.profiles (id) on delete cascade,
  type          text not null,
  post_id       uuid references public.posts (id) on delete cascade,
  comment_id    uuid references public.comments (id) on delete cascade,
  read_at       timestamptz,
  created_at    timestamptz not null default now(),

  constraint notification_type check (type in ('follow', 'like', 'comment')),
  constraint no_self_notification check (recipient_id <> actor_id),
  constraint notification_target check (
    (type = 'follow'  and post_id is null and comment_id is null) or
    (type = 'like'    and post_id is not null and comment_id is null) or
    (type = 'comment' and post_id is not null and comment_id is not null)
  )
);

comment on table public.notifications is 'Notifikasi untuk pemilik akun: follow, like, komentar.';

create index notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);
create index notifications_recipient_unread_idx
  on public.notifications (recipient_id) where read_at is null;
create index notifications_actor_id_idx on public.notifications (actor_id);
create index notifications_post_id_idx on public.notifications (post_id);
create index notifications_comment_id_idx on public.notifications (comment_id);

-- Satu notifikasi per like / follow (tidak dobel).
create unique index notifications_like_unique
  on public.notifications (actor_id, post_id) where type = 'like';
create unique index notifications_follow_unique
  on public.notifications (actor_id, recipient_id) where type = 'follow';

-- ---------------------------------------------------------------------
-- TRIGGERS
-- ---------------------------------------------------------------------

-- LIKE: beri tahu pemilik post; hapus notifikasi saat unlike.
create or replace function public.notify_like()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner uuid;
begin
  if tg_op = 'INSERT' then
    select p.user_id into v_owner from public.posts p where p.id = new.post_id;
    if v_owner is not null and v_owner <> new.user_id then
      insert into public.notifications (recipient_id, actor_id, type, post_id)
      values (v_owner, new.user_id, 'like', new.post_id)
      on conflict (actor_id, post_id) where type = 'like' do nothing;
    end if;
    return new;
  end if;

  delete from public.notifications n
  where n.type = 'like' and n.actor_id = old.user_id and n.post_id = old.post_id;
  return old;
end;
$$;

create trigger likes_notify
  after insert or delete on public.likes
  for each row execute function public.notify_like();

-- KOMENTAR: beri tahu pemilik post. Notifikasi ikut terhapus (cascade)
-- saat komentar dihapus.
create or replace function public.notify_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner uuid;
begin
  select p.user_id into v_owner from public.posts p where p.id = new.post_id;
  if v_owner is not null and v_owner <> new.user_id then
    insert into public.notifications (recipient_id, actor_id, type, post_id, comment_id)
    values (v_owner, new.user_id, 'comment', new.post_id, new.id);
  end if;
  return new;
end;
$$;

create trigger comments_notify
  after insert on public.comments
  for each row execute function public.notify_comment();

-- FOLLOW: beri tahu user yang di-follow; hapus notifikasi saat unfollow.
create or replace function public.notify_follow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (recipient_id, actor_id, type)
    values (new.following_id, new.follower_id, 'follow')
    on conflict (actor_id, recipient_id) where type = 'follow' do nothing;
    return new;
  end if;

  delete from public.notifications n
  where n.type = 'follow' and n.actor_id = old.follower_id and n.recipient_id = old.following_id;
  return old;
end;
$$;

create trigger follows_notify
  after insert or delete on public.follows
  for each row execute function public.notify_follow();

-- Fungsi trigger tidak perlu dipanggil langsung lewat API.
revoke execute on function public.notify_like() from public, anon, authenticated;
revoke execute on function public.notify_comment() from public, anon, authenticated;
revoke execute on function public.notify_follow() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.notifications enable row level security;

create policy "User hanya melihat notifikasinya sendiri"
  on public.notifications for select
  to authenticated
  using ((select auth.uid()) = recipient_id);

create policy "User dapat menandai notifikasinya sudah dibaca"
  on public.notifications for update
  to authenticated
  using ((select auth.uid()) = recipient_id)
  with check ((select auth.uid()) = recipient_id);

create policy "User dapat menghapus notifikasinya sendiri"
  on public.notifications for delete
  to authenticated
  using ((select auth.uid()) = recipient_id);

-- Klien tidak boleh membuat notifikasi, dan hanya boleh mengubah read_at.
revoke insert, update on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;

-- ---------------------------------------------------------------------
-- REALTIME: badge notifikasi diperbarui langsung
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.notifications;

-- ---------------------------------------------------------------------
-- Route /notifications tidak boleh dipakai sebagai username
-- ---------------------------------------------------------------------
alter table public.profiles drop constraint username_not_reserved;
alter table public.profiles add constraint username_not_reserved check (
  username not in (
    'explore', 'search', 'create', 'p', 'login', 'signup', 'auth',
    'settings', 'api', 'admin', 'about', 'help', 'notifications'
  )
);
