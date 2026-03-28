-- Run this in your Supabase project's SQL Editor

-- Books cache (data from Google Books API)
create table if not exists public.books (
  id text primary key,
  title text not null,
  authors text[] default '{}',
  description text,
  thumbnail text,
  published_date text,
  page_count integer,
  categories text[] default '{}',
  created_at timestamptz default now()
);

-- User shelf items
create table if not exists public.shelf_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  book_id text references public.books(id) not null,
  status text not null check (
    status in ('want_to_read', 'reading', 'completed', 'on_hold', 'dropped')
  ),
  rating integer check (rating >= 1 and rating <= 10),
  review text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, book_id)
);

-- Enable Row Level Security
alter table public.books enable row level security;
alter table public.shelf_items enable row level security;

-- Books: anyone can read, authenticated users can insert
create policy "Books readable by all"
  on public.books for select using (true);

create policy "Authenticated users can cache books"
  on public.books for insert
  with check (auth.uid() is not null);

-- Shelf items: users can only access their own
create policy "Users view own shelf"
  on public.shelf_items for select
  using (auth.uid() = user_id);

create policy "Users insert to own shelf"
  on public.shelf_items for insert
  with check (auth.uid() = user_id);

create policy "Users update own shelf"
  on public.shelf_items for update
  using (auth.uid() = user_id);

create policy "Users delete from own shelf"
  on public.shelf_items for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger shelf_items_updated_at
  before update on public.shelf_items
  for each row execute function update_updated_at();
