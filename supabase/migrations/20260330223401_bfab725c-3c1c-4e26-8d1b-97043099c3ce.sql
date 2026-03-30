
-- 1. Fix settings: mark public settings vs private, restrict public read to non-sensitive keys
-- Instead of splitting tables, we restrict the public SELECT to known safe keys
DROP POLICY IF EXISTS "Anyone can read settings" ON public.settings;
CREATE POLICY "Anyone can read public settings"
  ON public.settings FOR SELECT
  USING (
    -- Only allow public read for known safe setting keys
    key IN ('company_name', 'company_description', 'banner_text', 'banner_enabled', 'hero_slides', 'trusted_partners', 'site_title', 'site_description', 'theme', 'currency')
    -- Admins can read all settings
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'approved_admin'::app_role)
  );

-- 2. Fix chat_conversations INSERT: allow authenticated users and anonymous guests
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.chat_conversations;
CREATE POLICY "Users and guests can create conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (
    -- Authenticated users can create conversations for themselves
    (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
    -- Anonymous guests can create conversations (guest chat popup)
    OR auth.uid() IS NULL
  );

-- 3. Fix notifications INSERT: only allow inserting notifications for yourself or admins
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'approved_admin'::app_role)
    OR user_id = auth.uid()
  );

-- 4. Remove redundant service_role ALL policy on notifications (service role bypasses RLS)
DROP POLICY IF EXISTS "Service role notifications" ON public.notifications;
