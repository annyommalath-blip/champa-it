DROP POLICY IF EXISTS "Guests can read own conversation by token" ON public.chat_conversations;
DROP POLICY IF EXISTS "Guests can read own conversation messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users and guests can create conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Participants and admins can send messages" ON public.chat_messages;

CREATE POLICY "Users can create own conversations" ON public.chat_conversations
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Participants and admins can send messages" ON public.chat_messages
FOR INSERT TO authenticated WITH CHECK (
  ((sender_type <> 'admin') OR current_user_has_role('super_admin') OR current_user_has_role('approved_admin')
    OR (sender_type = 'admin' AND sender_id IS NULL AND conversation_id IN (SELECT id FROM public.chat_conversations WHERE user_id = auth.uid())
        AND NOT EXISTS (SELECT 1 FROM public.chat_messages m WHERE m.conversation_id = chat_messages.conversation_id)))
  AND (current_user_has_role('super_admin') OR current_user_has_role('approved_admin')
    OR conversation_id IN (SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()))
);

CREATE OR REPLACE FUNCTION public.create_guest_conversation(_name text, _greeting text)
RETURNS TABLE(id uuid, guest_token uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid; _tok uuid := gen_random_uuid();
BEGIN
  IF coalesce(btrim(_name),'') = '' OR length(_name) > 100 THEN RAISE EXCEPTION 'Invalid name'; END IF;
  INSERT INTO public.chat_conversations (guest_name, user_id, guest_token)
  VALUES (btrim(_name), NULL, _tok) RETURNING chat_conversations.id INTO _id;
  IF coalesce(btrim(_greeting),'') <> '' THEN
    INSERT INTO public.chat_messages (conversation_id, sender_type, content)
    VALUES (_id, 'admin', left(_greeting, 1000));
  END IF;
  RETURN QUERY SELECT _id, _tok;
END $$;

CREATE OR REPLACE FUNCTION public.get_guest_messages(_conversation_id uuid, _token uuid)
RETURNS SETOF public.chat_messages
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.* FROM public.chat_messages m
  JOIN public.chat_conversations c ON c.id = m.conversation_id
  WHERE c.id = _conversation_id AND c.user_id IS NULL AND c.guest_token IS NOT NULL AND c.guest_token = _token
  ORDER BY m.created_at
$$;

CREATE OR REPLACE FUNCTION public.send_guest_message(_conversation_id uuid, _token uuid, _content text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF coalesce(btrim(_content),'') = '' OR length(_content) > 4000 THEN RAISE EXCEPTION 'Invalid message'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.chat_conversations WHERE id = _conversation_id AND user_id IS NULL
                 AND guest_token IS NOT NULL AND guest_token = _token AND status <> 'closed') THEN
    RAISE EXCEPTION 'Conversation not found';
  END IF;
  INSERT INTO public.chat_messages (conversation_id, sender_type, content) VALUES (_conversation_id, 'guest', btrim(_content));
END $$;

REVOKE ALL ON FUNCTION public.create_guest_conversation(text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_guest_messages(uuid,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.send_guest_message(uuid,uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_guest_conversation(text,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_guest_messages(uuid,uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.send_guest_message(uuid,uuid,text) TO anon, authenticated;