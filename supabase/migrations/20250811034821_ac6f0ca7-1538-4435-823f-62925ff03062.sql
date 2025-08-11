-- Secure user_data table: correct column type and RLS policies
begin;

-- Ensure proper type for user_id
alter table public.user_data
  alter column user_id type uuid using user_id::uuid;

-- Drop overly permissive policies if they exist
do $$
begin
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_data' and policyname = 'Anyone can read user_data') then
    drop policy "Anyone can read user_data" on public.user_data;
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_data' and policyname = 'Anyone can insert user_data') then
    drop policy "Anyone can insert user_data" on public.user_data;
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_data' and policyname = 'Anyone can update user_data') then
    drop policy "Anyone can update user_data" on public.user_data;
  end if;
end $$;

-- Create strict per-user policies
create policy "Users can view their own user_data"
  on public.user_data for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own user_data"
  on public.user_data for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own user_data"
  on public.user_data for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Ensure RLS is enabled
alter table public.user_data enable row level security;

-- Keep updated_at fresh
drop trigger if exists user_data_set_updated_at on public.user_data;
create trigger user_data_set_updated_at
before update on public.user_data
for each row execute function public.update_updated_at_column();

commit;