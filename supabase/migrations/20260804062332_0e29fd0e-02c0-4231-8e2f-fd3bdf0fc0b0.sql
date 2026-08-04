ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS shipping_returns TEXT,
  ADD COLUMN IF NOT EXISTS warranty_info TEXT;