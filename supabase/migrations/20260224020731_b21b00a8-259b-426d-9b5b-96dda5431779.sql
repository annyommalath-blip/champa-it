
-- Add delivery and payment fields to orders
ALTER TABLE public.orders 
ADD COLUMN delivery_method text NOT NULL DEFAULT 'pickup',
ADD COLUMN delivery_fee numeric NOT NULL DEFAULT 0,
ADD COLUMN payment_screenshot text NULL;

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-screenshots', 'payment-screenshots', true);

-- Allow authenticated users to upload payment screenshots
CREATE POLICY "Users can upload payment screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-screenshots' AND auth.uid() IS NOT NULL);

-- Allow anyone to view payment screenshots
CREATE POLICY "Anyone can view payment screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-screenshots');
