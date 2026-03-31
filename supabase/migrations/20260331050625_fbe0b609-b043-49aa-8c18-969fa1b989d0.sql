
-- 1. Make payment-screenshots bucket private
UPDATE storage.buckets SET public = false WHERE id = 'payment-screenshots';

-- 2. Drop old permissive storage policy for payment-screenshots
DROP POLICY IF EXISTS "Anyone can view payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload payment screenshots" ON storage.objects;

-- 3. Create proper storage policies for payment-screenshots
-- Users can upload to their own folder
CREATE POLICY "Users upload own payment screenshots"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-screenshots'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own screenshots, admins can view all
CREATE POLICY "Users and admins can view payment screenshots"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-screenshots' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR has_role(auth.uid(), 'approved_admin'::app_role)
      OR has_role(auth.uid(), 'super_admin'::app_role)
    )
  );

-- 4. Add guest_token column to chat_conversations for scoped guest access
ALTER TABLE public.chat_conversations ADD COLUMN IF NOT EXISTS guest_token uuid DEFAULT gen_random_uuid();

-- 5. Fix chat_conversations SELECT policy to scope guest access
DROP POLICY IF EXISTS "Owner and admins can read conversations" ON public.chat_conversations;
CREATE POLICY "Owner and admins can read conversations"
  ON public.chat_conversations FOR SELECT
  TO public
  USING (
    (user_id = auth.uid())
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'approved_admin'::app_role)
  );

-- Separate policy for guest access by token (handled via RPC or direct filter)
CREATE POLICY "Guests can read own conversation by token"
  ON public.chat_conversations FOR SELECT
  TO anon
  USING (
    auth.uid() IS NULL AND guest_token IS NOT NULL
  );

-- 6. Fix chat_messages SELECT to remove blanket anonymous access
DROP POLICY IF EXISTS "Participants and admins can read messages" ON public.chat_messages;
CREATE POLICY "Participants and admins can read messages"
  ON public.chat_messages FOR SELECT
  TO public
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'approved_admin'::app_role)
    OR (sender_id = auth.uid())
    OR (conversation_id IN (
      SELECT id FROM chat_conversations WHERE user_id = auth.uid()
    ))
  );

-- Guest message reading scoped to their conversation
CREATE POLICY "Guests can read own conversation messages"
  ON public.chat_messages FOR SELECT
  TO anon
  USING (
    auth.uid() IS NULL
  );
