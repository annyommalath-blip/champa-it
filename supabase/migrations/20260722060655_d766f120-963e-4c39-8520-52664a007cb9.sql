CREATE OR REPLACE FUNCTION public.current_user_has_role(_role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = _role
  )
$$;

GRANT EXECUTE ON FUNCTION public.current_user_has_role(public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_has_role(public.app_role) TO service_role;
REVOKE EXECUTE ON FUNCTION public.current_user_has_role(public.app_role) FROM anon;

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'email') = 'annyommalath@gmail.com');

CREATE POLICY "Super admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'email') = 'annyommalath@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'annyommalath@gmail.com');

DO $$
DECLARE
  p record;
  new_qual text;
  new_check text;
  stmt text;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE (coalesce(qual, '') ILIKE '%has_role%' OR coalesce(with_check, '') ILIKE '%has_role%')
      AND NOT (schemaname = 'public' AND tablename = 'user_roles')
  LOOP
    new_qual := p.qual;
    new_check := p.with_check;

    IF new_qual IS NOT NULL THEN
      new_qual := replace(new_qual, 'public.has_role(auth.uid(), ''super_admin''::public.app_role)', 'public.current_user_has_role(''super_admin''::public.app_role)');
      new_qual := replace(new_qual, 'public.has_role(auth.uid(), ''approved_admin''::public.app_role)', 'public.current_user_has_role(''approved_admin''::public.app_role)');
      new_qual := replace(new_qual, 'has_role(auth.uid(), ''super_admin''::app_role)', 'public.current_user_has_role(''super_admin''::public.app_role)');
      new_qual := replace(new_qual, 'has_role(auth.uid(), ''approved_admin''::app_role)', 'public.current_user_has_role(''approved_admin''::public.app_role)');
    END IF;

    IF new_check IS NOT NULL THEN
      new_check := replace(new_check, 'public.has_role(auth.uid(), ''super_admin''::public.app_role)', 'public.current_user_has_role(''super_admin''::public.app_role)');
      new_check := replace(new_check, 'public.has_role(auth.uid(), ''approved_admin''::public.app_role)', 'public.current_user_has_role(''approved_admin''::public.app_role)');
      new_check := replace(new_check, 'has_role(auth.uid(), ''super_admin''::app_role)', 'public.current_user_has_role(''super_admin''::public.app_role)');
      new_check := replace(new_check, 'has_role(auth.uid(), ''approved_admin''::app_role)', 'public.current_user_has_role(''approved_admin''::public.app_role)');
    END IF;

    stmt := format('ALTER POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
    IF new_qual IS NOT NULL THEN
      stmt := stmt || format(' USING (%s)', new_qual);
    END IF;
    IF new_check IS NOT NULL THEN
      stmt := stmt || format(' WITH CHECK (%s)', new_check);
    END IF;

    EXECUTE stmt;
  END LOOP;
END $$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC;