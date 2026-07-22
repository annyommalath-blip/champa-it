CREATE OR REPLACE FUNCTION public.notify_new_admin_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _customer_id uuid;
BEGIN
  IF NEW.sender_type <> 'admin' THEN RETURN NEW; END IF;
  SELECT user_id INTO _customer_id FROM public.chat_conversations WHERE id = NEW.conversation_id;
  IF _customer_id IS NULL THEN RETURN NEW; END IF;

  INSERT INTO public.notifications (user_id, type, title, message, reference_id)
  VALUES (_customer_id, 'chat_message', 'New message from support',
          COALESCE(LEFT(NEW.content, 120), ''), NEW.conversation_id::text);

  RETURN NEW;
END;
$function$;