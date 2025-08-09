-- Idempotent policies using correct column names from pg_policies (policyname)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_data' AND policyname = 'Anyone can read user_data'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can read user_data" ON public.user_data FOR SELECT USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_data' AND policyname = 'Anyone can insert user_data'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can insert user_data" ON public.user_data FOR INSERT WITH CHECK (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_data' AND policyname = 'Anyone can update user_data'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can update user_data" ON public.user_data FOR UPDATE USING (true) WITH CHECK (true)';
  END IF;
END$$;