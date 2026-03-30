
-- Fix chat_messages: only conversation participants and admins can read
DROP POLICY IF EXISTS "Anyone can read messages" ON public.chat_messages;
CREATE POLICY "Participants and admins can read messages"
  ON public.chat_messages FOR SELECT
  USING (
    -- Admins can read all
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'approved_admin'::app_role)
    -- The sender can read their own message
    OR sender_id = auth.uid()
    -- The conversation owner can read messages in their conversation
    OR conversation_id IN (
      SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
    )
  );

-- Fix chat_messages: only participants and admins can send
DROP POLICY IF EXISTS "Anyone can send messages" ON public.chat_messages;
CREATE POLICY "Participants and admins can send messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    -- Admins can send to any conversation
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'approved_admin'::app_role)
    -- The conversation owner can send
    OR conversation_id IN (
      SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
    )
    -- Allow anonymous/guest inserts (for the chat popup before login)
    OR auth.uid() IS NULL
  );

-- Fix chat_conversations: only owner and admins can read
DROP POLICY IF EXISTS "Anyone can read their conversation" ON public.chat_conversations;
CREATE POLICY "Owner and admins can read conversations"
  ON public.chat_conversations FOR SELECT
  USING (
    user_id = auth.uid()
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'approved_admin'::app_role)
    -- Allow anonymous users to read (for guest chat popup via realtime)
    OR auth.uid() IS NULL
  );

-- Fix chat_conversations: restrict update to admins only (already correct but tighten)
DROP POLICY IF EXISTS "Admins can update conversations" ON public.chat_conversations;
CREATE POLICY "Admins can update conversations"
  ON public.chat_conversations FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'approved_admin'::app_role)
  );
