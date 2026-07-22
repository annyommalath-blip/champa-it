
-- 1) Chat conversations: guest read scoped by header token
DROP POLICY IF EXISTS "Guests can read own conversation by token" ON public.chat_conversations;
CREATE POLICY "Guests can read own conversation by token"
  ON public.chat_conversations FOR SELECT
  TO anon
  USING (
    auth.uid() IS NULL
    AND guest_token IS NOT NULL
    AND guest_token::text = COALESCE(
      current_setting('request.headers', true)::json->>'x-guest-token',
      ''
    )
    AND COALESCE(current_setting('request.headers', true)::json->>'x-guest-token','') <> ''
  );

-- 2) Chat messages: guest read scoped to conversation by header token
DROP POLICY IF EXISTS "Guests can read own conversation messages" ON public.chat_messages;
CREATE POLICY "Guests can read own conversation messages"
  ON public.chat_messages FOR SELECT
  TO anon
  USING (
    auth.uid() IS NULL
    AND conversation_id IN (
      SELECT id FROM public.chat_conversations
      WHERE guest_token IS NOT NULL
        AND guest_token::text = COALESCE(
          current_setting('request.headers', true)::json->>'x-guest-token',
          ''
        )
        AND COALESCE(current_setting('request.headers', true)::json->>'x-guest-token','') <> ''
    )
  );

-- 3) chat_messages sender_type constraint + INSERT policy preventing 'admin' spoofing
ALTER TABLE public.chat_messages
  DROP CONSTRAINT IF EXISTS chk_chat_messages_sender_type;
ALTER TABLE public.chat_messages
  ADD CONSTRAINT chk_chat_messages_sender_type
  CHECK (sender_type IN ('user','admin','guest','system'));

DROP POLICY IF EXISTS "Participants and admins can send messages" ON public.chat_messages;
CREATE POLICY "Participants and admins can send messages"
  ON public.chat_messages FOR INSERT
  TO public
  WITH CHECK (
    -- sender_type integrity: only admins can post as 'admin'
    (
      sender_type <> 'admin'
      OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'approved_admin'::public.app_role)
    )
    AND (
      public.has_role(auth.uid(), 'super_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'approved_admin'::public.app_role)
      OR conversation_id IN (
        SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
      )
      OR (
        auth.uid() IS NULL
        AND conversation_id IN (
          SELECT id FROM public.chat_conversations
          WHERE guest_token IS NOT NULL
            AND guest_token::text = COALESCE(
              current_setting('request.headers', true)::json->>'x-guest-token',
              ''
            )
            AND COALESCE(current_setting('request.headers', true)::json->>'x-guest-token','') <> ''
        )
      )
    )
  );

-- 4) Orders: server-side recompute of total to prevent client-crafted totals
CREATE OR REPLACE FUNCTION public.validate_order_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  computed_total numeric := 0;
  item jsonb;
  product_price numeric;
  qty numeric;
  computed_delivery_fee numeric := 0;
BEGIN
  IF NEW.items IS NULL OR jsonb_typeof(NEW.items) <> 'array' OR jsonb_array_length(NEW.items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    IF (item->>'product_id') IS NULL THEN
      RAISE EXCEPTION 'Order item missing product_id';
    END IF;
    SELECT price INTO product_price
    FROM public.products
    WHERE id = (item->>'product_id')::uuid;
    IF product_price IS NULL THEN
      RAISE EXCEPTION 'Unknown product in order: %', (item->>'product_id');
    END IF;
    qty := COALESCE((item->>'quantity')::numeric, 0);
    IF qty <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity for item %', (item->>'product_id');
    END IF;
    computed_total := computed_total + (product_price * qty);
    -- Overwrite client-supplied price with authoritative value
    NEW.items := jsonb_set(NEW.items, ARRAY[(  -- replace price on this element
      (SELECT (idx - 1)::text
       FROM jsonb_array_elements(NEW.items) WITH ORDINALITY AS x(v, idx)
       WHERE (x.v->>'product_id') = (item->>'product_id')
       LIMIT 1)
    ), 'price'], to_jsonb(product_price), true);
  END LOOP;

  -- Delivery fee: 20000 for delivery, 0 for pickup
  IF NEW.delivery_method = 'delivery' THEN
    computed_delivery_fee := 20000;
  ELSE
    computed_delivery_fee := 0;
  END IF;

  NEW.delivery_fee := computed_delivery_fee;
  NEW.total := computed_total + computed_delivery_fee;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_order_total ON public.orders;
CREATE TRIGGER trg_validate_order_total
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.validate_order_total();

-- 5) Lock down handle_new_user (trigger-only function)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 6) Storage: drop broad SELECT policies on public buckets (public URLs still work via storage-render)
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view hero images" ON storage.objects;
