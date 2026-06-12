-- =============================================
-- 一生モノの一皿 — Supabase セットアップSQL
-- Supabase ダッシュボード > SQL Editor に貼り付けて実行
-- =============================================

-- 1. プロフィールテーブル
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text not null default '匿名',
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. 投稿テーブル
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  restaurant_name text not null,
  location text not null default '',
  cuisine text not null default 'その他',
  rating int not null check (rating between 1 and 5),
  dish text,
  comment text,
  image_url text,
  created_at timestamptz default now()
);

-- 3. いいねテーブル
create table if not exists likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

-- 4. Row Level Security（セキュリティ設定）

-- profiles
alter table profiles enable row level security;
create policy "誰でも閲覧可" on profiles for select using (true);
create policy "本人のみ編集" on profiles for update using (auth.uid() = id);
create policy "登録時に作成" on profiles for insert with check (auth.uid() = id);

-- posts
alter table posts enable row level security;
create policy "誰でも閲覧可" on posts for select using (true);
create policy "ログイン済みが投稿可" on posts for insert with check (auth.uid() = user_id);
create policy "本人のみ削除可" on posts for delete using (auth.uid() = user_id);

-- likes
alter table likes enable row level security;
create policy "誰でも閲覧可" on likes for select using (true);
create policy "ログイン済みがいいね可" on likes for insert with check (auth.uid() = user_id);
create policy "本人のみ削除可" on likes for delete using (auth.uid() = user_id);

-- 5. likes のカウント集計ビュー
create or replace view likes_count as
  select post_id, count(*) as count from likes group by post_id;

-- 6. 新規ユーザー登録時に自動でプロフィールを作成するトリガー
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- =============================================
-- 画像ストレージの設定（SQL Editorではなく
-- Supabase > Storage から手動で行ってください）：
--
-- 1. Storage > New bucket
-- 2. 名前: restaurant-images
-- 3. Public bucket: ON（チェックを入れる）
-- 4. Policies > New policy > 「認証済みユーザーはアップロード可」を追加
-- =============================================
