
-- validate_order_total is trigger-only; revoke direct execution entirely
REVOKE ALL ON FUNCTION public.validate_order_total() FROM PUBLIC, anon, authenticated;

-- has_role and get_user_role are referenced by RLS policies; RLS evaluation
-- requires the invoker to hold EXECUTE. Remove the default PUBLIC grant so
-- only explicitly listed roles can call them.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC;

-- handle_new_user is a trigger; ensure no direct callers.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
