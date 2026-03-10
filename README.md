# BigDataCorp - API Rental Platform

A complete API rental platform built with Next.js, Supabase, and shadcn/ui. Users can subscribe to data API services, manage API keys, track usage, and handle billing.

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database & Auth:** Supabase (PostgreSQL + Authentication)
- **UI Components:** shadcn/ui (Radix UI + Tailwind CSS)
- **Payment:** Stripe
- **Rate Limiting:** Upstash Redis
- **Email:** Resend
- **Deployment:** Vercel

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify-email/
│   │   └── reset-password/
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── overview/        # Dashboard home
│   │   ├── keys/            # API key management
│   │   ├── usage/           # Usage analytics
│   │   ├── billing/         # Subscription & billing
│   │   └── settings/        # User settings
│   ├── (marketing)/         # Public pages
│   │   ├── pricing/
│   │   ├── docs/
│   │   └── about/
│   └── api/
│       ├── v1/              # Public API endpoints (require API key)
│       ├── auth/            # Auth endpoints
│       ├── keys/            # API key management endpoints
│       ├── subscriptions/   # Subscription management
│       ├── usage/           # Usage analytics endpoints
│       └── webhooks/        # Stripe webhooks
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard/           # Dashboard components
│   ├── marketing/           # Marketing components
│   └── admin/               # Admin panel components
├── lib/
│   ├── supabase/           # Supabase client & utilities
│   ├── stripe/             # Stripe client & utilities
│   ├── redis/              # Redis client & rate limiting
│   ├── validations/        # Zod schemas
│   └── utils/              # Utility functions
├── types/                   # TypeScript types
└── hooks/                   # Custom React hooks
```

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API and copy:
   - Project URL
   - anon/public key
   - service_role key (keep this secret!)
3. Run the database migration:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

### 3. Set Up Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Get your API keys from Dashboard > Developers > API keys
3. Create products and prices for each plan:
   - Basic: $29/month
   - Pro: $99/month
   - Enterprise: $499/month
4. Copy the Price IDs
5. Set up webhooks at Dashboard > Developers > Webhooks:
   - Endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Events to listen:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

### 4. Set Up Upstash Redis

1. Create account at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the REST URL and token

### 5. Set Up Resend

1. Create account at [resend.com](https://resend.com)
2. Verify your domain
3. Get your API key

### 6. Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# Upstash Redis
UPSTASH_REDIS_URL=https://...
UPSTASH_REDIS_TOKEN=...

# Resend
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7. Generate TypeScript Types

```bash
npm run supabase:types
```

### 8. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run supabase:types  # Generate types from Supabase schema
```

## 🏗️ Database Schema

### Tables

#### users
- Extended from `auth.users`
- Additional fields: name, cpf_cnpj, phone, account_type

#### subscriptions
- Links user to subscription plan
- Stores Stripe customer and subscription IDs
- Tracks billing periods

#### api_keys
- Stores hashed API keys (never plaintext)
- Supports multiple keys per user
- Tracks permissions and usage

#### api_usage_logs
- Logs every API request
- Tracks endpoint, status, response time
- Used for analytics and billing

#### rate_limits
- Defines rate limits per plan
- Per-minute, per-day, per-month limits

### Row Level Security (RLS)

All tables have RLS enabled. Users can only access their own data.

## 🔐 Security Features

- API keys stored as bcrypt hashes
- Row Level Security on all tables
- Rate limiting on all API endpoints
- Input validation with Zod
- HTTPS only (enforced by Vercel)
- Stripe webhook signature verification
- CORS properly configured

## 📊 Subscription Plans

| Plan | Price | Requests/Day | Features |
|------|-------|--------------|----------|
| Free | $0 | 100 | Basic API access, Community support |
| Basic | $29 | 10,000 | Full API access, Email support |
| Pro | $99 | 100,000 | Priority support, Advanced analytics, Webhooks |
| Enterprise | $499 | Unlimited | Dedicated support, SLA, Custom integrations |

## 🔄 Rate Limiting

Rate limits are enforced using Upstash Redis with sliding window counters:
- Per-minute limits
- Per-day limits
- Per-month limits

When exceeded, API returns `429 Too Many Requests` with `Retry-After` header.

## 📧 Email Templates

Using Resend for transactional emails:
- Welcome email
- Email verification
- Password reset
- Subscription confirmations
- Payment receipts
- Usage warnings
- Billing reminders

## 🎨 UI Components

Built with shadcn/ui - components are copied into your codebase and fully customizable:
- Button, Card, Badge, Input, Label
- Dialog, Dropdown Menu, Popover
- Table, Tabs, Toast
- Progress bars, Charts (with recharts)

## 📈 Analytics & Monitoring

- API usage tracking per endpoint
- Success/error rates
- Response time monitoring
- Real-time usage dashboards
- Export to CSV

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables in Production

- Use Vercel's environment variable UI
- Never commit secrets to git
- Separate dev/staging/production configs

## 🔧 Development Workflow

1. Create feature branch
2. Develop locally with hot reload
3. Test thoroughly
4. Push and create PR
5. Preview deployment automatic
6. Merge to main → auto-deploy

## 📖 API Documentation

API docs are available at `/docs` with:
- Authentication guide
- Endpoint reference
- Code examples (cURL, JavaScript, Python)
- Rate limiting details
- Error codes reference

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

- Documentation: `/docs`
- Email: support@bigdatacorp.com
- Dashboard: Access support tickets in `/dashboard/settings`

## 🎯 Roadmap

- [ ] Add more API endpoints
- [ ] Implement webhooks for customers
- [ ] Add team/organization accounts
- [ ] Build mobile app
- [ ] Add more payment methods
- [ ] Implement usage-based billing
- [ ] Add API playground
- [ ] Create SDKs for popular languages

---

Built with ❤️ using Next.js, Supabase, and shadcn/ui
# Trigger rebuild
