-- Create a simple per-user data table to persist the OS filesystem and related data
create table if not exists public.user_data (
  user_id uuid primary key,
  fs_json jsonb,
  photos jsonb,
  wallpaper_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.user_data enable row level security;

-- Policies: users can manage only their own row
create policy if not exists "Users can view their own user_data"
  on public.user_data for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert their own user_data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their own user_data"
  on public.user_data for update
  using (auth.uid() = user_id);

-- Trigger to keep updated_at fresh
create trigger if not exists user_data_set_updated_at
before update on public.user_data
for each row execute function public.update_updated_at_column();