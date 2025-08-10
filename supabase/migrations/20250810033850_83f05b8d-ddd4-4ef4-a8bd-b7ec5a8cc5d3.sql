-- Ensure table exists (idempotent)
create table if not exists public.user_data (
  user_id text primary key,
  fs_json jsonb not null default '{}'::jsonb,
  photos jsonb not null default '[]'::jsonb,
  wallpaper_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.user_data enable row level security;

-- Trigger for updated_at (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_data_updated_at'
  ) THEN
    CREATE TRIGGER trg_user_data_updated_at
      BEFORE UPDATE ON public.user_data
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- Ensure storage buckets
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('wallpapers', 'wallpapers', true)
on conflict (id) do nothing;

-- Public read access for photos and wallpapers (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view photos'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view photos" ON storage.objects FOR SELECT USING (bucket_id = ''photos'')';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view wallpapers'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view wallpapers" ON storage.objects FOR SELECT USING (bucket_id = ''wallpapers'')';
  END IF;
END$$;