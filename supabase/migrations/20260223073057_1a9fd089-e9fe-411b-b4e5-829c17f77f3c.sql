
-- =============================================
-- PHASE 1: Full Database Schema for Champa PE
-- =============================================

-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('customer', 'pending_admin', 'approved_admin', 'super_admin');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create has_role() security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Create get_user_role() helper (returns highest role)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'approved_admin' THEN 2
      WHEN 'pending_admin' THEN 3
      WHEN 'customer' THEN 4
    END
  LIMIT 1
$$;

-- 5. RLS policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'approved_admin'));

CREATE POLICY "Super admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 6. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Profiles RLS
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'approved_admin'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow service role inserts (for trigger)
CREATE POLICY "Service role full access profiles"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. Trigger: auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role app_role;
  _is_admin_request BOOLEAN;
BEGIN
  -- Check if user signed up requesting admin access (from raw_user_meta_data)
  _is_admin_request := COALESCE((NEW.raw_user_meta_data->>'is_admin_request')::boolean, false);

  -- Determine role
  IF NEW.email = 'annyommalath@gmail.com' THEN
    _role := 'super_admin';
  ELSIF _is_admin_request THEN
    _role := 'pending_admin';
  ELSE
    _role := 'customer';
  END IF;

  -- Create profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );

  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  -- If admin request, create admin_request record
  IF _is_admin_request AND NEW.email != 'annyommalath@gmail.com' THEN
    INSERT INTO public.admin_requests (user_id, reason)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'admin_reason', 'No reason provided'));
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  long_description TEXT DEFAULT '',
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Uncategorized',
  images TEXT[] DEFAULT ARRAY['/placeholder.svg'],
  specs JSONB DEFAULT '{}',
  in_stock BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC(2,1) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Products RLS: everyone can read, admins can manage
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'approved_admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'approved_admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'approved_admin') OR public.has_role(auth.uid(), 'super_admin'));

-- 9. Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT DEFAULT '',
  customer_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'approved_admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'approved_admin') OR public.has_role(auth.uid(), 'super_admin'));

-- 10. Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  reference_id TEXT DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role notifications"
  ON public.notifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 11. Admin requests table
CREATE TABLE public.admin_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests"
  ON public.admin_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage requests"
  ON public.admin_requests FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Service role admin requests"
  ON public.admin_requests FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 12. Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'approved_admin'));

CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'approved_admin'));

-- 13. Settings table
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can read settings"
  ON public.settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON public.settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'approved_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'approved_admin'));

-- 14. Update existing chat_conversations
ALTER TABLE public.chat_conversations
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS assigned_admin_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT '';

-- 15. Update existing chat_messages
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS sender_name TEXT DEFAULT '';

-- 16. Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND (public.has_role(auth.uid(), 'approved_admin') OR public.has_role(auth.uid(), 'super_admin')));

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND (public.has_role(auth.uid(), 'approved_admin') OR public.has_role(auth.uid(), 'super_admin')));

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND (public.has_role(auth.uid(), 'approved_admin') OR public.has_role(auth.uid(), 'super_admin')));

-- 17. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 18. Seed products from mock data
INSERT INTO public.products (id, name, description, long_description, price, category, images, specs, in_stock, rating) VALUES
  (gen_random_uuid(), 'Champa X1 Pro Server', 'Enterprise-grade rack server with cutting-edge performance for data centers.', 'The Champa X1 Pro Server delivers unmatched performance for enterprise workloads. Built with the latest generation processors and high-speed memory, it handles demanding applications with ease.', 4999, 'Servers', ARRAY['/placeholder.svg'], '{"Processor":"64-Core ARM","RAM":"256GB DDR5","Storage":"8TB NVMe SSD","Network":"100GbE"}', true, 4.8),
  (gen_random_uuid(), 'Champa Edge Mini Server', 'Compact edge computing server for branch offices and IoT deployments.', 'Deploy enterprise-grade computing at the edge. The Edge Mini packs server-class performance in a fanless, ruggedized form factor ideal for retail, manufacturing, and remote sites.', 1299, 'Servers', ARRAY['/placeholder.svg'], '{"Processor":"8-Core Intel","RAM":"32GB DDR5","Storage":"1TB NVMe","Form":"Desktop / DIN Rail"}', true, 4.5),
  (gen_random_uuid(), 'SecureNet Firewall 500', 'Advanced next-gen firewall with AI-driven threat detection.', 'SecureNet Firewall 500 uses machine learning to detect and neutralize threats in real-time. With deep packet inspection and zero-trust architecture, your network stays protected 24/7.', 2499, 'Security', ARRAY['/placeholder.svg'], '{"Throughput":"40 Gbps","Connections":"10M concurrent","VPN Tunnels":"5000","Threat DB":"Updated hourly"}', true, 4.6),
  (gen_random_uuid(), 'CloudLink SD-WAN Gateway', 'Intelligent WAN optimization for distributed enterprises.', 'CloudLink SD-WAN Gateway revolutionizes how your branches connect. With intelligent path selection and real-time optimization, experience up to 3x faster cloud application performance.', 1899, 'Networking', ARRAY['/placeholder.svg'], '{"Ports":"8x 10GbE","SD-WAN":"Yes","QoS":"Advanced","Cloud Ready":"AWS, Azure, GCP"}', true, 4.7),
  (gen_random_uuid(), 'Champa Managed Switch 48P', '48-port managed gigabit switch with PoE+ support.', 'The Champa Managed Switch 48P delivers enterprise networking at scale. With full PoE+ budget, VLAN support, and centralized management, it''s the backbone of modern networks.', 749, 'Networking', ARRAY['/placeholder.svg'], '{"Ports":"48x 1GbE + 4x 10GbE SFP+","PoE":"740W budget","Management":"CLI, Web, SNMP","VLAN":"4096"}', true, 4.4),
  (gen_random_uuid(), 'Champa UPS 3000VA', 'Uninterruptible power supply for critical infrastructure.', 'Keep your systems running through any power event. The Champa UPS 3000VA provides clean, reliable power with automatic failover in less than 4ms.', 899, 'Power', ARRAY['/placeholder.svg'], '{"Capacity":"3000VA / 2700W","Runtime":"15 min full load","Transfer":"<4ms","Form":"2U Rack"}', false, 4.5),
  (gen_random_uuid(), 'DataVault NAS Enterprise', 'High-performance network attached storage for enterprises.', 'DataVault NAS Enterprise provides petabyte-scale storage with enterprise-grade reliability. Features RAID 6, snapshots, and seamless cloud tier integration.', 3299, 'Storage', ARRAY['/placeholder.svg'], '{"Bays":"12x 3.5\"","Max Capacity":"192TB","RAID":"0,1,5,6,10","Protocol":"NFS, SMB, iSCSI"}', true, 4.9),
  (gen_random_uuid(), 'Champa Endpoint Security Suite', 'All-in-one endpoint protection with EDR, antivirus, and patch management.', 'Protect every endpoint in your organization. Combines next-gen antivirus, EDR, vulnerability scanning, and automated patch management in a single lightweight agent.', 12, 'Software', ARRAY['/placeholder.svg'], '{"License":"Per seat / month","Platforms":"Windows, macOS, Linux","Management":"Cloud Console","Updates":"Automatic"}', true, 4.7),
  (gen_random_uuid(), 'CloudOps Monitoring Platform', 'Infrastructure monitoring and alerting for hybrid cloud environments.', 'CloudOps gives you real-time visibility into servers, containers, networks, and cloud services. Features customizable dashboards, anomaly detection, and integrations with Slack, PagerDuty, and more.', 29, 'Software', ARRAY['/placeholder.svg'], '{"License":"Per host / month","Metrics":"Unlimited","Retention":"13 months","Integrations":"200+"}', true, 4.6),
  (gen_random_uuid(), 'Champa Backup Pro', 'Enterprise backup and disaster recovery for physical and virtual environments.', 'Automated backup with instant recovery. Supports VMware, Hyper-V, physical servers, and SaaS apps. Offsite replication and immutable storage ensure ransomware resilience.', 499, 'Software', ARRAY['/placeholder.svg'], '{"License":"Per server / year","Recovery":"Instant VM / Bare Metal","Cloud":"AWS S3, Azure Blob","Dedup":"Variable-length"}', true, 4.8),
  (gen_random_uuid(), 'IT Infrastructure Assessment', 'Comprehensive audit of your IT infrastructure with actionable recommendations.', 'Our certified engineers will assess your servers, network, security, and cloud readiness. You''ll receive a detailed report with risk scoring, performance benchmarks, and a prioritized upgrade roadmap.', 2500, 'Services', ARRAY['/placeholder.svg'], '{"Duration":"1-2 weeks","Deliverable":"Assessment Report","Format":"On-site + Remote","Follow-up":"30-day consultation"}', true, 5.0),
  (gen_random_uuid(), 'Managed IT Support Plan', '24/7 proactive monitoring, maintenance, and helpdesk for your entire IT stack.', 'Outsource your IT headaches. Our NOC team monitors your infrastructure around the clock, handles incidents, manages patches, and provides end-user support via phone, email, or chat.', 1500, 'Services', ARRAY['/placeholder.svg'], '{"License":"Per month","SLA":"99.9% uptime","Support":"24/7/365","Includes":"Monitoring, patching, helpdesk"}', true, 4.9),
  (gen_random_uuid(), 'Cloud Migration & Consulting', 'Expert-led cloud migration planning and execution for AWS, Azure, or GCP.', 'Move to the cloud with confidence. Our architects design the migration strategy, handle data transfers, re-platform applications, and train your team — all with minimal downtime.', 5000, 'Services', ARRAY['/placeholder.svg'], '{"Duration":"4-12 weeks","Platforms":"AWS, Azure, GCP","Includes":"Architecture, migration, training","Warranty":"60-day post-migration support"}', true, 4.8);

-- 19. Seed default settings
INSERT INTO public.settings (key, value) VALUES
  ('company_info', '{"name":"Champa Private Enterprise","tagline":"Enterprise Technology Solutions","phone":"+1 (555) 123-4567","email":"info@champa.com","address":"123 Tech Blvd, Silicon Valley, CA 94025"}'),
  ('banner_promos', '[]');
