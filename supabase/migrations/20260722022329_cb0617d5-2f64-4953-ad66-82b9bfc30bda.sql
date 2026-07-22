ALTER TABLE public.products ADD COLUMN IF NOT EXISTS condition text NOT NULL DEFAULT 'new';
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_condition_check;
ALTER TABLE public.products ADD CONSTRAINT products_condition_check CHECK (condition IN ('new','refurbished','clearance','open_box','pre_loved'));
CREATE INDEX IF NOT EXISTS products_condition_idx ON public.products(condition);