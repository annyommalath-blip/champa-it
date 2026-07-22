
-- Enable realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Order status change -> notification
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  _title text;
  _msg text;
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  CASE NEW.status
    WHEN 'confirmed' THEN _title := 'Order confirmed'; _msg := 'Your order has been confirmed by the store.';
    WHEN 'preparing' THEN _title := 'Preparing your order'; _msg := 'The store is preparing your order.';
    WHEN 'shipped'   THEN _title := 'Order shipped'; _msg := 'Your order is on its way.';
    WHEN 'delivered' THEN _title := 'Order delivered'; _msg := 'Your order has been delivered. Enjoy!';
    WHEN 'cancelled' THEN _title := 'Order cancelled'; _msg := 'Your order has been cancelled.';
    ELSE RETURN NEW;
  END CASE;

  INSERT INTO public.notifications (user_id, type, title, message, reference_id)
  VALUES (NEW.user_id, 'order_' || NEW.status, _title, _msg, NEW.id::text);

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_notify_order_status ON public.orders;
CREATE TRIGGER trg_notify_order_status
AFTER INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.notify_order_status_change();

-- Admin chat message -> notification for the customer
CREATE OR REPLACE FUNCTION public.notify_new_admin_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  _customer_id uuid;
BEGIN
  IF NEW.sender_type <> 'admin' THEN RETURN NEW; END IF;
  SELECT user_id INTO _customer_id FROM public.chat_conversations WHERE id = NEW.conversation_id;
  IF _customer_id IS NULL THEN RETURN NEW; END IF;

  INSERT INTO public.notifications (user_id, type, title, message, reference_id)
  VALUES (_customer_id, 'chat_message', 'New message from support',
          COALESCE(LEFT(NEW.message, 120), ''), NEW.conversation_id::text);

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_notify_admin_message ON public.chat_messages;
CREATE TRIGGER trg_notify_admin_message
AFTER INSERT ON public.chat_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_new_admin_message();
