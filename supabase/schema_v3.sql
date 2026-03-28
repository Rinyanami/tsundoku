-- 在已有数据库上追加执行

-- 给 books 表加 category 字段
alter table public.books add column if not exists category text default 'other';

-- 标签表
create table if not exists public.tags (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  count integer default 0
);

alter table public.tags enable row level security;
create policy "Tags readable by all" on public.tags for select using (true);
create policy "Authenticated can create tags" on public.tags for insert with check (auth.uid() is not null);
create policy "Authenticated can update tags" on public.tags for update using (auth.uid() is not null);

-- 书目标签关联表
create table if not exists public.book_tags (
  book_id text references public.books(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  primary key (book_id, tag_id, user_id)
);

alter table public.book_tags enable row level security;
create policy "Book tags readable by all" on public.book_tags for select using (true);
create policy "Users can add tags" on public.book_tags for insert with check (auth.uid() = user_id);
create policy "Users can remove own tags" on public.book_tags for delete using (auth.uid() = user_id);
