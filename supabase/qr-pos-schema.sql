-- Enable uuid if not already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE member_qr_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  token_id TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired')),
  last_scanned_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  scan_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE member_checkins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  qr_code_id UUID REFERENCES member_qr_codes(id) ON DELETE SET NULL,
  scanned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  location TEXT DEFAULT 'Main Entrance',
  device_name TEXT,
  entry_status TEXT NOT NULL CHECK (entry_status IN ('approved', 'denied')),
  denial_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE member_deals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  deal_type TEXT NOT NULL CHECK (deal_type IN ('percentage', 'fixed', 'bogo', 'free_entry', 'free_upgrade', 'event_discount', 'locker_discount', 'birthday', 'vip_only', 'promotion')),
  discount_value DECIMAL(10,2),
  eligible_plans TEXT[] DEFAULT ARRAY['classic', 'premium', 'elite'],
  start_date DATE,
  end_date DATE,
  usage_limit INTEGER,
  per_member_limit INTEGER DEFAULT 1,
  pos_product_id TEXT,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deal_redemptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  deal_id UUID REFERENCES member_deals(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  checkin_id UUID REFERENCES member_checkins(id) ON DELETE SET NULL,
  pos_transaction_id TEXT,
  redemption_date TIMESTAMPTZ DEFAULT NOW(),
  discount_amount DECIMAL(10,2),
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'voided')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pos_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('square', 'clover', 'toast', 'lightspeed', 'shopify', 'custom')),
  display_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  is_connected BOOLEAN DEFAULT false,
  webhook_url TEXT,
  last_synced_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pos_sync_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  integration_id UUID REFERENCES pos_integrations(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pos_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pos_provider TEXT,
  pos_transaction_id TEXT,
  amount DECIMAL(10,2),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  items JSONB DEFAULT '[]',
  deal_id UUID REFERENCES member_deals(id) ON DELETE SET NULL,
  checkin_id UUID REFERENCES member_checkins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE qr_scan_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  token_id TEXT,
  scanned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_member_qr_codes_user_id ON member_qr_codes(user_id);
CREATE INDEX idx_member_qr_codes_token_id ON member_qr_codes(token_id);
CREATE INDEX idx_member_checkins_user_id ON member_checkins(user_id);
CREATE INDEX idx_member_checkins_check_in_time ON member_checkins(check_in_time);
CREATE INDEX idx_deal_redemptions_user_id ON deal_redemptions(user_id);
CREATE INDEX idx_deal_redemptions_deal_id ON deal_redemptions(deal_id);
CREATE INDEX idx_qr_scan_attempts_token_id ON qr_scan_attempts(token_id);
CREATE INDEX idx_qr_scan_attempts_created_at ON qr_scan_attempts(created_at);

-- RLS
ALTER TABLE member_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scan_attempts ENABLE ROW LEVEL SECURITY;

-- member_qr_codes policies
CREATE POLICY "Users can view own QR code" ON member_qr_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all QR codes" ON member_qr_codes FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin', 'staff')));
CREATE POLICY "Service role full access on member_qr_codes" ON member_qr_codes USING (auth.role() = 'service_role');

-- member_checkins policies
CREATE POLICY "Users can view own checkins" ON member_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff can create and view checkins" ON member_checkins FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin', 'staff')));
CREATE POLICY "Service role full access on member_checkins" ON member_checkins USING (auth.role() = 'service_role');

-- member_deals policies
CREATE POLICY "Anyone can view active deals" ON member_deals FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage deals" ON member_deals FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin')));
CREATE POLICY "Service role full access on member_deals" ON member_deals USING (auth.role() = 'service_role');

-- deal_redemptions policies
CREATE POLICY "Users can view own redemptions" ON deal_redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff can manage redemptions" ON deal_redemptions FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin', 'staff')));
CREATE POLICY "Service role full access on deal_redemptions" ON deal_redemptions USING (auth.role() = 'service_role');

-- pos_integrations policies (super_admin only for write)
CREATE POLICY "Admins can view POS integrations" ON pos_integrations FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin')));
CREATE POLICY "Super admins can manage POS integrations" ON pos_integrations FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "Service role full access on pos_integrations" ON pos_integrations USING (auth.role() = 'service_role');

-- pos_sync_logs
CREATE POLICY "Admins can view sync logs" ON pos_sync_logs FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin')));
CREATE POLICY "Service role full access on pos_sync_logs" ON pos_sync_logs USING (auth.role() = 'service_role');

-- pos_transactions
CREATE POLICY "Users can view own transactions" ON pos_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON pos_transactions FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin')));
CREATE POLICY "Service role full access on pos_transactions" ON pos_transactions USING (auth.role() = 'service_role');

-- qr_scan_attempts
CREATE POLICY "Admins can view scan attempts" ON qr_scan_attempts FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin')));
CREATE POLICY "Service role full access on qr_scan_attempts" ON qr_scan_attempts USING (auth.role() = 'service_role');
