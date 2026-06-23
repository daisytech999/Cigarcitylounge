# Cigar City Lounge — Membership Website

A luxury cigar lounge membership platform built with Next.js 14, Supabase, and Stripe.

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS (custom gold/charcoal palette)
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security)
- **Payments**: Stripe (subscription billing + webhooks)
- **Email**: Resend
- **Deployment**: Vercel

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account with subscription products created
- A [Resend](https://resend.com) account and verified sending domain

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create these in your Stripe dashboard)
STRIPE_CLASSIC_MONTHLY_PRICE_ID=price_...
STRIPE_CLASSIC_YEARLY_PRICE_ID=price_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_...
STRIPE_ELITE_MONTHLY_PRICE_ID=price_...
STRIPE_ELITE_YEARLY_PRICE_ID=price_...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# App
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## Database Setup

1. Open the Supabase SQL Editor for your project.
2. Run the full schema file:

```bash
# Copy contents of supabase/schema.sql and execute in the SQL Editor
```

This creates all tables, indexes, RLS policies, and seeds the 3 default membership plans.

### Storage Buckets

In your Supabase dashboard, create a public storage bucket named **`gallery`** for gallery images.

---

## Stripe Setup

### 1. Create Products & Prices

In the Stripe Dashboard, create three subscription products:

| Product | Monthly Price | Yearly Price |
|---------|--------------|______________|
| Classic Membership | $79/mo | $790/yr |
| Premium Membership | $149/mo | $1490/yr |
| Elite Membership | $249/mo | $2490/yr |

Copy the Price IDs (starting with `price_`) into your `.env.local`.

### 2. Configure Webhook

In Stripe Dashboard → Webhooks → Add endpoint:

- **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
- **Events to listen for**:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

Copy the webhook signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.

---

## Local Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Testing Stripe Webhooks Locally

Use the Stripe CLI to forward webhook events:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use test card `4242 4242 4242 4242` with any future expiry and CVC.

---

## Deployment on Vercel

### 1. Import the Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework Preset: **Next.js** (auto-detected)

### 2. Configure Environment Variables

In Vercel project settings → Environment Variables, add all variables from `.env.local`.

Set `NEXT_PUBLIC_SITE_URL` to your production domain (e.g., `https://cigarcitylounge.com`).

### 3. Deploy

Click **Deploy**. Vercel will build and deploy automatically on every push to `main`.

### 4. Update Stripe Webhook

After deploying, update your Stripe webhook endpoint URL to your production domain.

---

## Registration Flow

1. **Visitor** selects a membership plan on `/membership`
2. **Stripe Checkout** processes payment — webhook fires `checkout.session.completed`
3. Webhook creates a `pending_registrations` record
4. Stripe redirects to `/register?session_id=<id>`
5. **Member completes 4-step form**: credentials → personal info → address → agreements
6. Account is created in Supabase, subscription linked, welcome email sent
7. Member is redirected to `/dashboard`

---

## Admin Access

To grant admin access to a user, update their role in the `profiles` table:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```

Valid roles: `member`, `admin`, `super_admin`, `staff`

Admins access the dashboard at `/admin`.

---

## Project Structure

```
app/
  (public pages: home, membership, cigars, events, contact, login, register)
  dashboard/         # Member portal
  admin/             # Admin portal
  api/               # API routes (Stripe webhook, register, admin)
components/
  layout/            # Navbar, Footer, DashboardLayout, AdminLayout
  ui/                # Badge, Button, Card, Input, Modal, etc.
lib/
  supabase/          # Browser, server, and admin clients
  stripe/            # Stripe client
  email/             # Resend email templates
  utils.ts           # Shared utilities
types/
  index.ts           # TypeScript types for all domain models
supabase/
  schema.sql         # Full database schema + RLS policies
middleware.ts        # Route protection
```

---

## Security

- No card data stored — all payment processing handled by Stripe
- Stripe webhook signature verification on every webhook event
- Row Level Security enabled on all Supabase tables
- Protected routes via Next.js middleware (auth + role checks)
- Admin locker assignment only — members cannot self-assign lockers
- Age verification required during registration (21+)
