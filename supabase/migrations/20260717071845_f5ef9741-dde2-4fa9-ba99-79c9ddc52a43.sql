
-- Allow guest checkout
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_email text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_phone text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_token uuid DEFAULT gen_random_uuid();

-- Replace INSERT policy to allow guest orders (user_id NULL for anon, or match auth.uid() for authed)
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users and guests can create orders"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL AND guest_email IS NOT NULL)
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

GRANT INSERT ON public.orders TO anon;

-- Storage: allow guest uploads to a guest-scoped folder in payment-screenshots
DROP POLICY IF EXISTS "Guests can upload payment screenshots" ON storage.objects;
CREATE POLICY "Guests can upload payment screenshots"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (
    bucket_id = 'payment-screenshots'
    AND (storage.foldername(name))[1] = 'guest'
  );

-- Allow admins to view guest folder screenshots (already covered by admin policy on payment-screenshots, but ensure)
