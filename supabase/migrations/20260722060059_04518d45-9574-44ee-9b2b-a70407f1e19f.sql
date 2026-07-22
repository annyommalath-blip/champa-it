DROP POLICY IF EXISTS "Authenticated admins can upload hero images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated admins can update hero images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated admins can delete hero images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

CREATE POLICY "Admins can upload hero images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hero-images'
  AND (
    owner = auth.uid()
    OR owner_id = auth.uid()::text
  )
  AND (
    auth.jwt() ->> 'email' = 'annyommalath@gmail.com'
    OR public.has_role(auth.uid(), 'approved_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
);

CREATE POLICY "Admins can update hero images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'hero-images'
  AND (
    auth.jwt() ->> 'email' = 'annyommalath@gmail.com'
    OR public.has_role(auth.uid(), 'approved_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
)
WITH CHECK (
  bucket_id = 'hero-images'
  AND (
    owner = auth.uid()
    OR owner_id = auth.uid()::text
  )
  AND (
    auth.jwt() ->> 'email' = 'annyommalath@gmail.com'
    OR public.has_role(auth.uid(), 'approved_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
);

CREATE POLICY "Admins can delete hero images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'hero-images'
  AND (
    auth.jwt() ->> 'email' = 'annyommalath@gmail.com'
    OR public.has_role(auth.uid(), 'approved_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
);

CREATE POLICY "Admins can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (
    owner = auth.uid()
    OR owner_id = auth.uid()::text
  )
  AND (
    auth.jwt() ->> 'email' = 'annyommalath@gmail.com'
    OR public.has_role(auth.uid(), 'approved_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
);

CREATE POLICY "Admins can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (
    auth.jwt() ->> 'email' = 'annyommalath@gmail.com'
    OR public.has_role(auth.uid(), 'approved_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
)
WITH CHECK (
  bucket_id = 'product-images'
  AND (
    owner = auth.uid()
    OR owner_id = auth.uid()::text
  )
  AND (
    auth.jwt() ->> 'email' = 'annyommalath@gmail.com'
    OR public.has_role(auth.uid(), 'approved_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
);

CREATE POLICY "Admins can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (
    auth.jwt() ->> 'email' = 'annyommalath@gmail.com'
    OR public.has_role(auth.uid(), 'approved_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
);