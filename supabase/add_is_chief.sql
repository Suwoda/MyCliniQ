-- Alter profiles table to add is_chief column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_chief boolean default false;
