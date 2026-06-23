-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- MEMBERSHIP PLANS
CREATE TABLE membership_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  stripe_product_id TEXT,
  features JSONB DEFAULT '[]',
  locker_included BOOLEAN DEFAULT true,
  guest_passes_per_month INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILES
CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  profile_image_url TEXT,
  member_id TEXT UNIQUE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'super_admin', 'staff')),
  membership_status TEXT DEFAULT 'pending' CHECK (membership_status IN ('active', 'inactive', 'pending', 'cancelled', 'paused')),
  membership_accepted_at TIMESTAMPTZ,
  rules_accepted_at TIMESTAMPTZ,
  age_verified BOOLEAN DEFAULT false,
  notes TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIPTIONS
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES membership_plans(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT DEFAULT 'incomplete' CHECK (status IN ('active', 'past_due', 'cancelled', 'incomplete', 'trialing')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK (status IN ('succeeded', 'failed', 'pending', 'refunded')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PENDING REGISTRATIONS
CREATE TABLE pending_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_session_id TEXT UNIQUE,
  plan_id UUID REFERENCES membership_plans(id),
  plan_name TEXT,
  registration_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  completed BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOCKERS
CREATE TABLE lockers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  locker_number TEXT UNIQUE NOT NULL,
  size TEXT DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large')),
  location TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'pending_assignment', 'assigned', 'reserved', 'maintenance', 'unavailable')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOCKER ASSIGNMENTS
CREATE TABLE locker_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  locker_id UUID REFERENCES lockers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_complimentary BOOLEAN DEFAULT true,
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOCKER REQUESTS
CREATE TABLE locker_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_type TEXT CHECK (request_type IN ('new', 'change', 'additional')),
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CIGAR CATEGORIES
CREATE TABLE cigar_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CIGARS
CREATE TABLE cigars (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  size TEXT,
  strength TEXT CHECK (strength IN ('mild', 'medium', 'full')),
  wrapper TEXT,
  binder TEXT,
  filler TEXT,
  country_of_origin TEXT,
  flavor_notes TEXT,
  price DECIMAL(10,2),
  price_display TEXT DEFAULT 'Ask Staff',
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'limited', 'out_of_stock')),
  is_featured BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  is_member_only BOOLEAN DEFAULT false,
  category_id UUID REFERENCES cigar_categories(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CIGAR IMAGES
CREATE TABLE cigar_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cigar_id UUID REFERENCES cigars(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENTS
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  banner_image_url TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT,
  dress_code TEXT,
  is_members_only BOOLEAN DEFAULT false,
  capacity INTEGER,
  rsvp_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENT RSVPS
CREATE TABLE event_rsvps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- GALLERY IMAGES
CREATE TABLE gallery_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  category TEXT CHECK (category IN ('cigar', 'lounge', 'event')),
  is_featured BOOLEAN DEFAULT false,
  is_hero BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPORT REQUESTS
CREATE TABLE support_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'other' CHECK (category IN ('membership', 'locker', 'account', 'billing', 'other')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADMIN ROLES
CREATE TABLE admin_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'membership_manager', 'locker_manager', 'event_manager', 'content_manager', 'staff')),
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOGS
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WEBSITE SETTINGS
CREATE TABLE website_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTACT MESSAGES
CREATE TABLE contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CIGAR PREFERENCES
CREATE TABLE cigar_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  favorite_brands JSONB DEFAULT '[]',
  preferred_strength TEXT CHECK (preferred_strength IN ('mild', 'medium', 'full')),
  preferred_wrapper TEXT,
  favorite_drink_pairing TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_membership_status ON profiles(membership_status);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_locker_assignments_user_id ON locker_assignments(user_id);
CREATE INDEX idx_locker_assignments_locker_id ON locker_assignments(locker_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_event_rsvps_user_id ON event_rsvps(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- SEED DATA
INSERT INTO membership_plans (name, slug, description, price_monthly, price_yearly, features, locker_included, guest_passes_per_month, display_order) VALUES
('Classic', 'classic', 'Perfect for the casual cigar enthusiast looking to enjoy a premium lounge experience.', 79.00, 850.00,
 '["Lounge access during all operating hours","Member pricing on all cigars","Access to member events","One complimentary locker included","Monthly newsletter"]', true, 0, 1),
('Premium', 'premium', 'Elevated membership with priority access and enhanced guest privileges.', 149.00, 1590.00,
 '["All Classic benefits","Priority event access and early registration","Premium member pricing","One complimentary locker included","2 guest passes per month","Quarterly featured cigar selection","Reserved seating option"]', true, 2, 2),
('Elite', 'elite', 'The ultimate Cigar City Lounge experience with VIP treatment and concierge-level service.', 249.00, 2650.00,
 '["All Premium benefits","VIP event access and private gatherings","Maximum member discounts","One complimentary locker included","Unlimited guest passes","Personal cigar consultant","Concierge-level service","Priority reservation benefits","Annual gift selection"]', true, 0, 3);

INSERT INTO website_settings (key, value) VALUES
  ('hero_title', 'Cigar City Lounge'),
  ('hero_subtitle', 'Relax. Connect. Enjoy the Finest Cigars.'),
  ('business_address', '[ADD BUSINESS ADDRESS]'),
  ('business_phone', '[ADD PHONE NUMBER]'),
  ('business_email', '[ADD BUSINESS EMAIL]'),
  ('business_hours', '[ADD BUSINESS HOURS]'),
  ('instagram_url', '#'),
  ('facebook_url', '#'),
  ('minimum_age', '21'),
  ('locker_auto_assign', 'false');

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE locker_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE locker_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE cigar_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin', 'staff')));
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin')));
CREATE POLICY "Service role can do everything on profiles" ON profiles USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON subscriptions FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin')));
CREATE POLICY "Service role full access on subscriptions" ON subscriptions USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin')));
CREATE POLICY "Service role full access on payments" ON payments USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own locker" ON locker_assignments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all lockers" ON locker_assignments FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin')));
CREATE POLICY "Service role full access on locker_assignments" ON locker_assignments USING (auth.role() = 'service_role');

CREATE POLICY "Users can view and create own requests" ON locker_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own requests" ON locker_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all requests" ON locker_requests FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin')));
CREATE POLICY "Service role full access on locker_requests" ON locker_requests USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access on notifications" ON notifications USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own support requests" ON support_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create support requests" ON support_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all support requests" ON support_requests FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin', 'staff')));
CREATE POLICY "Service role full access on support_requests" ON support_requests USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own RSVPs" ON event_rsvps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all RSVPs" ON event_rsvps FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin')));
CREATE POLICY "Service role full access on event_rsvps" ON event_rsvps USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own preferences" ON cigar_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role full access on cigar_preferences" ON cigar_preferences USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin')));
CREATE POLICY "Service role full access on audit_logs" ON audit_logs USING (auth.role() = 'service_role');

ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active plans" ON membership_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage plans" ON membership_plans FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin')));
CREATE POLICY "Service role full access on plans" ON membership_plans USING (auth.role() = 'service_role');

ALTER TABLE cigars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active cigars" ON cigars FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage cigars" ON cigars FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin', 'content_manager')));
CREATE POLICY "Service role full access on cigars" ON cigars USING (auth.role() = 'service_role');

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view upcoming events" ON events FOR SELECT USING (status != 'cancelled');
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin')));
CREATE POLICY "Service role full access on events" ON events USING (auth.role() = 'service_role');

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active gallery images" ON gallery_images FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage gallery" ON gallery_images FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin', 'content_manager')));
CREATE POLICY "Service role full access on gallery" ON gallery_images USING (auth.role() = 'service_role');

ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON website_settings FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Admins can update settings" ON website_settings FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin', 'content_manager')));
CREATE POLICY "Service role full access on settings" ON website_settings USING (auth.role() = 'service_role');

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert contact messages" ON contact_messages FOR INSERT TO PUBLIC WITH CHECK (true);
CREATE POLICY "Admins can view contact messages" ON contact_messages FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin', 'staff')));
CREATE POLICY "Service role full access on contact_messages" ON contact_messages USING (auth.role() = 'service_role');

ALTER TABLE lockers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage lockers" ON lockers FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin')));
CREATE POLICY "Service role full access on lockers" ON lockers USING (auth.role() = 'service_role');

ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on pending_registrations" ON pending_registrations USING (auth.role() = 'service_role');
