
DROP POLICY IF EXISTS "Guests can read own conversation by token" ON public.chat_conversations;
CREATE POLICY "Guests can read own conversation by token"
ON public.chat_conversations FOR SELECT TO anon
USING (auth.uid() IS NULL AND guest_token IS NOT NULL);

DROP POLICY IF EXISTS "Guests can read own conversation messages" ON public.chat_messages;
CREATE POLICY "Guests can read own conversation messages"
ON public.chat_messages FOR SELECT TO anon
USING (auth.uid() IS NULL);

DROP POLICY IF EXISTS "Participants and admins can send messages" ON public.chat_messages;
CREATE POLICY "Participants and admins can send messages"
ON public.chat_messages FOR INSERT TO public
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.has_role(auth.uid(), 'approved_admin'::app_role)
  OR (conversation_id IN (SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()))
  OR auth.uid() IS NULL
);
