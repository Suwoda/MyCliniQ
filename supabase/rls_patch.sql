-- MyCliniQ - Database RLS Patch
-- Run this in your Supabase SQL Editor to resolve the "infinite recursion detected" error.

-- 1. Create helper functions marked as SECURITY DEFINER to query profiles table safely
create or replace function public.get_my_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer;

create or replace function public.is_active_staff()
returns boolean as $$
  select exists (
    select 1 from public.profiles 
    where id = auth.uid() and is_active = true
  );
$$ language sql security definer;

-- 2. Drop existing problematic policies on profiles
drop policy if exists "Allow managers to insert/update profiles" on public.profiles;

-- 3. Re-create the manager profile policy safely using the helper function
create policy "Allow managers to insert/update profiles" on public.profiles
  for all using (
    public.get_my_role() = 'manager'
  );
