DROP POLICY IF EXISTS "Anyone can read public settings" ON public.settings;
CREATE POLICY "Anyone can read public settings" ON public.settings
FOR SELECT
USING (
  key = ANY (ARRAY[
    'company_name','company_description','banner_text','banner_enabled',
    'hero_slides','trusted_partners','site_title','site_description',
    'theme','currency','chat_greeting'
  ])
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'approved_admin'::app_role)
);