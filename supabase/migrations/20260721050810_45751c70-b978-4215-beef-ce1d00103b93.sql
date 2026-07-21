
-- 1) admin_invites table
CREATE TABLE public.admin_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_invites TO authenticated;
GRANT ALL ON public.admin_invites TO service_role;

ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin manages invites" ON public.admin_invites
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- 2) Update handle_new_user: if the sign-up email matches an invite, mark as pending_admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role app_role;
  _is_admin_request BOOLEAN;
  _invited BOOLEAN;
BEGIN
  _is_admin_request := COALESCE((NEW.raw_user_meta_data->>'is_admin_request')::boolean, false);
  _invited := EXISTS (
    SELECT 1 FROM public.admin_invites
    WHERE lower(email) = lower(NEW.email) AND used_at IS NULL
  );

  IF NEW.email = 'annyommalath@gmail.com' THEN
    _role := 'super_admin';
  ELSIF _invited OR _is_admin_request THEN
    _role := 'pending_admin';
  ELSE
    _role := 'customer';
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone'
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  IF (_invited OR _is_admin_request) AND NEW.email != 'annyommalath@gmail.com' THEN
    INSERT INTO public.admin_requests (user_id, reason)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'admin_reason',
                             CASE WHEN _invited THEN 'Invited by Super Admin' ELSE 'No reason provided' END));

    IF _invited THEN
      UPDATE public.admin_invites
      SET used_at = now(), used_by = NEW.id
      WHERE lower(email) = lower(NEW.email);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 3) Restrict Bank Transfer Details (payment_info) writes to super_admin only
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;

CREATE POLICY "Admins manage general settings" ON public.settings
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'approved_admin'::app_role))
    AND (has_role(auth.uid(), 'super_admin'::app_role) OR key <> 'payment_info')
  )
  WITH CHECK (
    (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'approved_admin'::app_role))
    AND (has_role(auth.uid(), 'super_admin'::app_role) OR key <> 'payment_info')
  );
