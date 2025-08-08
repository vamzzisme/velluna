-- Create a compact backend to persist Velluna OS data per user handle (no Supabase Auth used yet)
-- 1) Helper function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2) User data table to store filesystem JSON, photos list (URLs), and wallpaper URL
CREATE TABLE IF NOT EXISTS public.user_data (
  user_id TEXT PRIMARY KEY,
  fs_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  wallpaper_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security but allow anon for now (since we don't use Supabase Auth yet)
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- Policies: allow anyone to read/write (can be tightened when auth is added)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_data' AND policyname = 'Anyone can read user_data'
  ) THEN
    CREATE POLICY "Anyone can read user_data" ON public.user_data FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_data' AND policyname = 'Anyone can insert user_data'
  ) THEN
    CREATE POLICY "Anyone can insert user_data" ON public.user_data FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_data' AND policyname = 'Anyone can update user_data'
  ) THEN
    CREATE POLICY "Anyone can update user_data" ON public.user_data FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Trigger for updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_data_updated_at'
  ) THEN
    CREATE TRIGGER trg_user_data_updated_at
    BEFORE UPDATE ON public.user_data
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 3) Storage buckets for photos and wallpapers
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('wallpapers', 'wallpapers', true)
ON CONFLICT (id) DO NOTHING;

-- Public policies for buckets (since no auth yet)
-- SELECT
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view photos'
  ) THEN
    CREATE POLICY "Public can view photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'photos');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view wallpapers'
  ) THEN
    CREATE POLICY "Public can view wallpapers"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'wallpapers');
  END IF;
END $$;

-- INSERT
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can upload photos'
  ) THEN
    CREATE POLICY "Public can upload photos" 
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'photos');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can upload wallpapers'
  ) THEN
    CREATE POLICY "Public can upload wallpapers" 
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'wallpapers');
  END IF;
END $$;

-- UPDATE (allow replacing files)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can update photos'
  ) THEN
    CREATE POLICY "Public can update photos"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'photos')
    WITH CHECK (bucket_id = 'photos');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can update wallpapers'
  ) THEN
    CREATE POLICY "Public can update wallpapers"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'wallpapers')
    WITH CHECK (bucket_id = 'wallpapers');
  END IF;
END $$;