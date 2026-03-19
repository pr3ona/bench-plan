-- Create profiles table that extends auth.users
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  full_name   text,
  avatar_url  text,
  role        text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read profiles (needed for assignment dropdowns)
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
