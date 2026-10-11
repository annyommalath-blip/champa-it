DO $$ DECLARE b text; BEGIN
FOREACH b IN ARRAY ARRAY['hero','product'] LOOP
  EXECUTE format('DROP POLICY IF EXISTS "Admins can upload %1$s images" ON storage.objects', b);
  EXECUTE format('DROP POLICY IF EXISTS "Admins can update %1$s images" ON storage.objects', b);
  EXECUTE format('DROP POLICY IF EXISTS "Admins can delete %1$s images" ON storage.objects', b);
  EXECUTE format('CREATE POLICY "Admins can upload %1$s images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = %2$L AND (public.current_user_has_role(''approved_admin'') OR public.current_user_has_role(''super_admin'')))', b, b||'-images');
  EXECUTE format('CREATE POLICY "Admins can update %1$s images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = %2$L AND (public.current_user_has_role(''approved_admin'') OR public.current_user_has_role(''super_admin''))) WITH CHECK (bucket_id = %2$L AND (public.current_user_has_role(''approved_admin'') OR public.current_user_has_role(''super_admin'')))', b, b||'-images');
  EXECUTE format('CREATE POLICY "Admins can delete %1$s images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = %2$L AND (public.current_user_has_role(''approved_admin'') OR public.current_user_has_role(''super_admin'')))', b, b||'-images');
END LOOP; END $$;