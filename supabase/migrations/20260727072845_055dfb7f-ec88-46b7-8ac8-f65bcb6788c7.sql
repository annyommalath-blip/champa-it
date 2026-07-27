CREATE OR REPLACE FUNCTION public.notify_super_admin_new_admin_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _sa RECORD;
  _email text;
  _name text;
BEGIN
  SELECT email, full_name INTO _email, _name FROM public.profiles WHERE user_id = NEW.user_id;

  FOR _sa IN SELECT user_id FROM public.user_roles WHERE role = 'super_admin' LOOP
    INSERT INTO public.notifications (user_id, type, title, message, reference_id)
    VALUES (
      _sa.user_id,
      'admin_request',
      'New admin access request',
      COALESCE(NULLIF(_name, ''), COALESCE(_email, 'A user')) || ' signed up and is awaiting your approval.',
      NEW.id::text
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_admin_request_created ON public.admin_requests;
CREATE TRIGGER on_admin_request_created
AFTER INSERT ON public.admin_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_super_admin_new_admin_request();