
-- Drop the overly permissive "Service role full access profiles" policy
-- (service role bypasses RLS anyway, so this is redundant and dangerous)
DROP POLICY IF EXISTS "Service role full access profiles" ON public.profiles;
