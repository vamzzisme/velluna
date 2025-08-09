-- Ensure user_data table exists for storing per-user OS state
create table if not exists public.user_data (
  user_id text primary key,
  fs_json jsonb not null default '{}'::jsonb,
  photos jsonb not null default '[]'::jsonb,
  wallpaper_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on user_data
alter table public.user_data enable row level security;

-- Create permissive policies if they don't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_data' AND polname = 'Anyone can read user_data'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can read user_data" ON public.user_data FOR SELECT USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_data' AND polname = 'Anyone can insert user_data'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can insert user_data" ON public.user_data FOR INSERT WITH CHECK (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_data' AND polname = 'Anyone can update user_data'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can update user_data" ON public.user_data FOR UPDATE USING (true) WITH CHECK (true)';
  END IF;
END$$;

-- Update updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_data_updated_at'
  ) THEN
    EXECUTE 'CREATE TRIGGER trg_user_data_updated_at
      BEFORE UPDATE ON public.user_data
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column()';
  END IF;
END$$;

-- Ensure storage buckets exist
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('wallpapers', 'wallpapers', true)
on conflict (id) do nothing;

-- Public read access for photos and wallpapers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND polname = 'Public can view photos'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view photos" ON storage.objects FOR SELECT USING (bucket_id = ''photos'')';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND polname = 'Public can view wallpapers'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view wallpapers" ON storage.objects FOR SELECT USING (bucket_id = ''wallpapers'')';
  END IF;
END$$;