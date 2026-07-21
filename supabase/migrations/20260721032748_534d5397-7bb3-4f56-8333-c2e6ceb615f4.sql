
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _role app_role;
  _is_admin_request BOOLEAN;
BEGIN
  _is_admin_request := COALESCE((NEW.raw_user_meta_data->>'is_admin_request')::boolean, false);

  IF NEW.email = 'annyommalath@gmail.com' THEN
    _role := 'super_admin';
  ELSIF _is_admin_request THEN
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

  IF _is_admin_request AND NEW.email != 'annyommalath@gmail.com' THEN
    INSERT INTO public.admin_requests (user_id, reason)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'admin_reason', 'No reason provided'));
  END IF;

  RETURN NEW;
END;
$function$;
