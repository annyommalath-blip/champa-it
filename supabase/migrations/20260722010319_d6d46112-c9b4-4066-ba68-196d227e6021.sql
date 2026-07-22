
-- 1. Fix mutable search_path on internal email queue functions
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
 RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$function$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
 RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
 RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
 RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN PERFORM pgmq.create(dlq_name); EXCEPTION WHEN OTHERS THEN NULL; END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN PERFORM pgmq.delete(source_queue, message_id); EXCEPTION WHEN undefined_table THEN NULL; END;
  RETURN new_id;
END;
$function$;

-- 2. Revoke EXECUTE from anon/authenticated on internal server-only functions
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_dispatch() TO service_role;

-- 3. Drop duplicate over-permissive storage upload policy (folder-scoped one remains)
DROP POLICY IF EXISTS "Users can upload payment screenshots" ON storage.objects;

-- 4. Harden guest chat RLS - require matching guest_token supplied via x-guest-token header
DROP POLICY IF EXISTS "Guests can read own conversation by token" ON public.chat_conversations;
CREATE POLICY "Guests can read own conversation by token"
ON public.chat_conversations FOR SELECT TO anon
USING (
  auth.uid() IS NULL
  AND guest_token IS NOT NULL
  AND guest_token::text = COALESCE(
    nullif(current_setting('request.headers', true), '')::json ->> 'x-guest-token',
    ''
  )
);

DROP POLICY IF EXISTS "Guests can read own conversation messages" ON public.chat_messages;
CREATE POLICY "Guests can read own conversation messages"
ON public.chat_messages FOR SELECT TO anon
USING (
  auth.uid() IS NULL
  AND conversation_id IN (
    SELECT id FROM public.chat_conversations
    WHERE guest_token IS NOT NULL
      AND guest_token::text = COALESCE(
        nullif(current_setting('request.headers', true), '')::json ->> 'x-guest-token',
        ''
      )
  )
);

DROP POLICY IF EXISTS "Participants and admins can send messages" ON public.chat_messages;
CREATE POLICY "Participants and admins can send messages"
ON public.chat_messages FOR INSERT TO public
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.has_role(auth.uid(), 'approved_admin'::app_role)
  OR (
    auth.uid() IS NOT NULL
    AND conversation_id IN (
      SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
    )
  )
  OR (
    auth.uid() IS NULL
    AND conversation_id IN (
      SELECT id FROM public.chat_conversations
      WHERE guest_token IS NOT NULL
        AND guest_token::text = COALESCE(
          nullif(current_setting('request.headers', true), '')::json ->> 'x-guest-token',
          ''
        )
    )
  )
);

-- 5. Restrict payment_info in settings to authenticated users + admins (removed from anon-readable list)
DROP POLICY IF EXISTS "Anyone can read public settings" ON public.settings;
CREATE POLICY "Anyone can read public settings"
ON public.settings FOR SELECT TO public
USING (
  key = ANY (ARRAY[
    'company_name','company_description','banner_text','banner_enabled',
    'hero_slides','trusted_partners','site_title','site_description',
    'theme','currency','chat_greeting'
  ])
  OR (auth.uid() IS NOT NULL AND key = 'payment_info')
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.has_role(auth.uid(), 'approved_admin'::app_role)
);
