ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'LAK';

CREATE OR REPLACE FUNCTION public.validate_order_total()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  computed_total numeric := 0;
  item jsonb;
  product_price numeric;
  product_currency text;
  order_currency text := NULL;
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
    SELECT price, upper(coalesce(currency, 'LAK')) INTO product_price, product_currency
    FROM public.products
    WHERE id = (item->>'product_id')::uuid;
    IF product_price IS NULL THEN
      RAISE EXCEPTION 'Unknown product in order: %', (item->>'product_id');
    END IF;

    IF order_currency IS NULL THEN
      order_currency := product_currency;
    ELSIF order_currency <> product_currency THEN
      RAISE EXCEPTION 'All items in an order must share the same currency (% vs %)', order_currency, product_currency;
    END IF;

    qty := COALESCE((item->>'quantity')::numeric, 0);
    IF qty <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity for item %', (item->>'product_id');
    END IF;
    computed_total := computed_total + (product_price * qty);
    NEW.items := jsonb_set(NEW.items, ARRAY[(
      (SELECT (idx - 1)::text
       FROM jsonb_array_elements(NEW.items) WITH ORDINALITY AS x(v, idx)
       WHERE (x.v->>'product_id') = (item->>'product_id')
       LIMIT 1)
    ), 'price'], to_jsonb(product_price), true);
  END LOOP;

  NEW.currency := order_currency;

  IF NEW.delivery_method = 'delivery' THEN
    computed_delivery_fee := CASE order_currency
      WHEN 'LAK' THEN 20000
      WHEN 'THB' THEN 35
      WHEN 'USD' THEN 1
      ELSE 0
    END;
  ELSE
    computed_delivery_fee := 0;
  END IF;

  NEW.delivery_fee := computed_delivery_fee;
  NEW.total := computed_total + computed_delivery_fee;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS validate_order_total_trigger ON public.orders;
CREATE TRIGGER validate_order_total_trigger
BEFORE INSERT OR UPDATE OF items, delivery_method ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.validate_order_total();