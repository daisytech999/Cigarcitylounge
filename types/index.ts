export type UserRole = 'member' | 'admin' | 'super_admin' | 'staff'
export type MembershipStatus = 'active' | 'inactive' | 'pending' | 'cancelled' | 'paused'
export type LockerStatus = 'available' | 'pending_assignment' | 'assigned' | 'reserved' | 'maintenance' | 'unavailable'
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'incomplete' | 'trialing'
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
export type SupportStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface Profile {
  id: string; user_id: string; first_name: string; last_name: string; email: string
  phone: string | null; date_of_birth: string | null; address: string | null
  city: string | null; state: string | null; zip_code: string | null
  emergency_contact_name: string | null; emergency_contact_phone: string | null
  profile_image_url: string | null; member_id: string; role: UserRole
  membership_status: MembershipStatus; membership_accepted_at: string | null
  rules_accepted_at: string | null; age_verified: boolean; notes: string | null
  created_at: string; updated_at: string
}

export interface MembershipPlan {
  id: string; name: string; slug: string; description: string
  price_monthly: number; price_yearly: number | null
  stripe_price_id_monthly: string | null; stripe_price_id_yearly: string | null
  stripe_product_id: string | null; features: string[]; locker_included: boolean
  guest_passes_per_month: number; is_active: boolean; display_order: number
  created_at: string; updated_at: string
}

export interface Subscription {
  id: string; user_id: string; plan_id: string; stripe_subscription_id: string | null
  stripe_customer_id: string | null; status: SubscriptionStatus
  billing_cycle: 'monthly' | 'yearly'; current_period_start: string | null
  current_period_end: string | null; cancel_at_period_end: boolean
  cancelled_at: string | null; created_at: string; updated_at: string
  membership_plan?: MembershipPlan
}

export interface Locker {
  id: string; locker_number: string; size: 'small' | 'medium' | 'large'
  location: string | null; status: LockerStatus; notes: string | null
  created_at: string; updated_at: string
}

export interface LockerAssignment {
  id: string; locker_id: string; user_id: string; assigned_at: string
  is_complimentary: boolean; monthly_fee: number; status: 'active' | 'inactive'
  created_at: string; locker?: Locker; profile?: Profile
}

export interface LockerRequest {
  id: string; user_id: string; request_type: 'new' | 'change' | 'additional'
  notes: string | null; status: 'pending' | 'approved' | 'denied'
  created_at: string; updated_at: string; profile?: Profile
}

export interface Cigar {
  id: string; brand: string; name: string; size: string | null
  strength: 'mild' | 'medium' | 'full' | null; wrapper: string | null
  binder: string | null; filler: string | null; country_of_origin: string | null
  flavor_notes: string | null; price: number | null; price_display: string
  availability_status: 'available' | 'limited' | 'out_of_stock'
  is_featured: boolean; is_new_arrival: boolean; is_member_only: boolean
  category_id: string | null; description: string | null; is_active: boolean
  created_at: string; updated_at: string; images?: CigarImage[]; category?: CigarCategory
}

export interface CigarImage {
  id: string; cigar_id: string; image_url: string; is_primary: boolean
  display_order: number; created_at: string
}

export interface CigarCategory {
  id: string; name: string; slug: string; description: string | null; created_at: string
}

export interface Event {
  id: string; title: string; description: string | null; banner_image_url: string | null
  event_date: string; start_time: string; end_time: string | null; location: string | null
  dress_code: string | null; is_members_only: boolean; capacity: number | null
  rsvp_count: number; status: EventStatus; created_by: string | null
  created_at: string; updated_at: string
}

export interface EventRSVP {
  id: string; event_id: string; user_id: string; status: 'confirmed' | 'cancelled'
  created_at: string; updated_at: string; event?: Event; profile?: Profile
}

export interface GalleryImage {
  id: string; image_url: string; caption: string | null
  category: 'cigar' | 'lounge' | 'event'; is_featured: boolean; is_hero: boolean
  display_order: number; is_active: boolean; created_at: string
}

export interface Notification {
  id: string; user_id: string; title: string; message: string
  type: 'info' | 'success' | 'warning' | 'error'; is_read: boolean
  link: string | null; created_at: string
}

export interface SupportRequest {
  id: string; user_id: string; subject: string; message: string
  category: 'membership' | 'locker' | 'account' | 'billing' | 'other'
  status: SupportStatus; admin_notes: string | null
  created_at: string; updated_at: string; profile?: Profile
}

export interface WebsiteSetting { key: string; value: string; updated_at: string }

export interface ContactMessage {
  id: string; name: string; email: string; phone: string | null
  subject: string; message: string; is_read: boolean; created_at: string
}

export interface CigarPreference {
  id: string; user_id: string; favorite_brands: string[]
  preferred_strength: 'mild' | 'medium' | 'full' | null
  preferred_wrapper: string | null; favorite_drink_pairing: string | null
  notes: string | null; updated_at: string
}

export interface AdminRole {
  id: string; user_id: string
  role: 'super_admin' | 'membership_manager' | 'locker_manager' | 'event_manager' | 'content_manager' | 'staff'
  permissions: string[]; created_at: string
}
