-- 在已有数据库基础上执行这段 SQL（追加，不是替换）

-- 公开短评表
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  book_id text references public.books(id) not null,
  rating integer check (rating >= 1 and rating <= 10),
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, book_id)
);

alter table public.reviews enable row level security;

-- 所有人可读评论
create policy "Reviews readable by all"
  on public.reviews for select using (true);

-- 用户只能写自己的评论
create policy "Users insert own reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "Users delete own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- 用户名表（可选展示名）
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles readable by all"
  on public.profiles for select using (true);

create policy "Users manage own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- updated_at trigger for reviews
create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function update_updated_at();
