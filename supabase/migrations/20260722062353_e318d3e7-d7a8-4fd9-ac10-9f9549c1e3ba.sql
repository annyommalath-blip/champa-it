DROP POLICY IF EXISTS "Anyone can read public settings" ON public.settings;

CREATE POLICY "Anyone can read public settings"
ON public.settings
FOR SELECT
TO public
USING (
  key = ANY (ARRAY[
    'company_name',
    'company_description',
    'banner_text',
    'banner_enabled',
    'hero_slides',
    'trusted_partners',
    'savings_banners',
    'site_title',
    'site_description',
    'theme',
    'currency',
    'chat_greeting'
  ])
  OR (auth.uid() IS NOT NULL AND key = 'payment_info')
  OR public.current_user_has_role('super_admin'::app_role)
  OR public.current_user_has_role('approved_admin'::app_role)
);