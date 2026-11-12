# dumbgram

Aplikasi berbagi foto ala Instagram, dibuat dengan **Next.js 16** (App Router, Server Actions, Cache Components) dan **Supabase** (Postgres, Auth, Storage).

## Fitur

- Daftar / masuk / keluar (Supabase Auth, email + kata sandi)
- Feed beranda dari akun yang diikuti, ditambah saran akun
- Unggah foto + caption (gambar dikecilkan di browser sebelum diunggah)
- Like (juga double-tap pada gambar), komentar, simpan post (bookmark), salin tautan
- Halaman profil: grid post, tab "Tersimpan", jumlah post/pengikut/mengikuti
- Follow / unfollow, daftar pengikut & mengikuti
- Notifikasi like, komentar, dan pengikut baru (badge real-time, filter per jenis, tombol "Ikuti balik")
- Jelajahi (grid semua post) dan pencarian pengguna
- Edit profil (username, nama, bio, situs web, foto profil)
- Tautan `@mention` di caption & komentar, mode gelap otomatis, responsif (mobile & desktop)

## Struktur

```
supabase/
  config.toml                         # konfigurasi Supabase CLI (lokal)
  migrations/20261112000000_init_dumbgram.sql
  migrations/20261113000000_notifications.sql
src/
  proxy.ts                            # refresh sesi & proteksi route (pengganti middleware)
  app/
    (auth)/login, (auth)/signup
    (main)/                           # beranda, explore, search, create, settings, notifications
    (main)/[username]/                # profil, followers, following
    (main)/p/[id]/                    # detail post
    actions/                          # server actions: auth, posts, profile, notifications
    auth/confirm/route.ts             # callback konfirmasi email
  components/                         # UI
  lib/supabase/                       # klien Supabase (browser, server, proxy)
  lib/queries.ts                      # query data sisi server
```

### Skema database (migrasi)

| Tabel         | Isi                                                              |
| ------------- | ---------------------------------------------------------------- |
| `profiles`    | profil publik, dibuat otomatis oleh trigger saat user mendaftar  |
| `posts`       | `image_path` (di bucket `posts`), `caption`                      |
| `likes`       | PK (`user_id`, `post_id`)                                        |
| `comments`    | komentar; bisa dihapus penulis atau pemilik post                 |
| `follows`     | PK (`follower_id`, `following_id`), tidak bisa follow diri sendiri |
| `saved_posts` | bookmark, hanya terlihat oleh pemiliknya                         |
| `notifications` | dibuat otomatis oleh trigger saat like / komentar / follow; hilang lagi saat unlike / unfollow / komentar dihapus. Hanya terlihat oleh penerimanya, disiarkan lewat Realtime |

Semua tabel memakai **Row Level Security**. Bucket storage `posts` dan `avatars` bersifat publik untuk dibaca; user hanya bisa menulis ke folder `<user_id>/` miliknya.

## Menjalankan

```bash
npm install
cp .env.example .env.local
```

### Opsi A — Supabase cloud

1. Buat project di <https://supabase.com/dashboard>.
2. Isi `.env.local` dengan **Project URL** dan **Publishable key** (Project Settings → API Keys).
3. Jalankan migrasi ke project tersebut:

   ```bash
   npx supabase login
   npm run db:link -- --project-ref <project-ref>
   npm run db:push
   ```

4. Di Dashboard → Authentication → URL Configuration, set **Site URL** ke `http://localhost:3000` dan tambahkan `http://localhost:3000/auth/confirm` di **Redirect URLs**.
   (Untuk pengembangan, kamu bisa mematikan "Confirm email" di Authentication → Sign In / Providers → Email agar bisa langsung masuk setelah daftar.)

### Opsi B — Supabase lokal (butuh Docker)

```bash
npm run db:start      # menjalankan Supabase lokal + menerapkan migrasi
```

Salin `API URL` dan `Publishable key` dari output ke `.env.local`. Studio tersedia di <http://127.0.0.1:54323>.

### Start

```bash
npm run dev
```

Buka <http://localhost:3000>.

## Script database

| Perintah                     | Fungsi                                              |
| ---------------------------- | --------------------------------------------------- |
| `npm run db:start` / `db:stop` | menyalakan / mematikan Supabase lokal             |
| `npm run db:reset`           | reset DB lokal & jalankan ulang semua migrasi       |
| `npm run db:new -- <nama>`   | membuat file migrasi baru di `supabase/migrations`  |
| `npm run db:push`            | menerapkan migrasi ke project cloud yang di-link    |
| `npm run db:types`           | generate tipe TypeScript dari DB lokal              |
