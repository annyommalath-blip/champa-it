GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

DROP POLICY IF EXISTS "Admins can upload hero images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update hero images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete hero images" ON storage.objects;

CREATE POLICY "Authenticated admins can upload hero images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hero-images'
  AND (
    public.has_role(auth.uid(), 'approved_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
);

CREATE POLICY "Authenticated admins can update hero images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'hero-images'
  AND (
    public.has_role(auth.uid(), 'approved_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
)
WITH CHECK (
  bucket_id = 'hero-images'
  AND (
    public.has_role(auth.uid(), 'approved_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
);

CREATE POLICY "Authenticated admins can delete hero images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'hero-images'
  AND (
    public.has_role(auth.uid(), 'approved_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
);