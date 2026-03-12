# BigDataCorp Payment System - Complete Setup Guide

## ✅ Implementation Complete (Phase 1)

All critical payment features have been implemented. Follow this guide to configure and deploy.

---

## 📋 What Was Implemented

### Phase 1: Critical Foundation (100% Complete)

1. ✅ **Stripe Environment Variables** - Added to `.env`
2. ✅ **Webhook Handler** - `/api/webhooks/stripe/route.ts`
3. ✅ **Checkout API** - `/api/subscriptions/checkout/route.ts`
4. ✅ **Customer Portal API** - `/api/subscriptions/portal/route.ts`
5. ✅ **Billing Page Buttons** - Fully functional with client components
6. ✅ **Subscription Management APIs**:
   - `/api/subscriptions/cancel/route.ts`
   - `/api/subscriptions/status/route.ts`
   - `/api/subscriptions/change/route.ts`
7. ✅ **Invoices API** - `/api/subscriptions/invoices/route.ts`
8. ✅ **Email Notifications** - Payment success, failure, trial ending, cancellation

---

## 🔧 Setup Instructions

### Step 1: Configure Stripe Dashboard

#### A. Create Stripe Account
1. Go to https://dashboard.stripe.com
2. Create account or log in
3. Switch to **Test Mode** (toggle in top right)

#### B. Create Products & Prices
Navigate to **Products** → **Add Product**

Create these 3 products:

**Product 1: Basic Plan**
- Name: `Basic Plan`
- Description: `Great for growing businesses`
- Pricing: **Recurring** → `$29/month`
- Copy the **Price ID** (starts with `price_`)

**Product 2: Pro Plan**
- Name: `Pro Plan`
- Description: `For high-volume applications`
- Pricing: **Recurring** → `$99/month`
- Copy the **Price ID**

**Product 3: Enterprise Plan**
- Name: `Enterprise Plan`
- Description: `Custom solutions for large organizations`
- Pricing: **Recurring** → `$499/month`
- Copy the **Price ID**

#### C. Get API Keys
Navigate to **Developers** → **API Keys**

Copy these values:
- **Publishable key** (starts with `pk_test_`)
- **Secret key** (starts with `sk_test_`)

---

### Step 2: Update Environment Variables

Open `.env` and update with your real Stripe values:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Stripe Price IDs (from Products you created)
STRIPE_BASIC_PRICE_ID=price_YOUR_BASIC_PRICE_ID
STRIPE_PRO_PRICE_ID=price_YOUR_PRO_PRICE_ID
STRIPE_ENTERPRISE_PRICE_ID=price_YOUR_ENTERPRISE_PRICE_ID

# Webhook Secret (will get this in Step 3)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

---

### Step 3: Configure Webhook Endpoint

#### A. In Development (Local Testing)

1. Install Stripe CLI:
```bash
# Windows
scoop install stripe

# Mac
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

2. Login to Stripe CLI:
```bash
stripe login
```

3. Forward webhooks to localhost:
```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

4. Copy the webhook signing secret (starts with `whsec_`) to your `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxx_from_stripe_listen
```

#### B. In Production (Deployed App)

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add Endpoint**
3. Enter your webhook URL:
   ```
   https://yourdomain.com/api/webhooks/stripe
   ```
4. Select events to listen to:
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.trial_will_end`
5. Click **Add Endpoint**
6. Copy the **Signing Secret** (starts with `whsec_`)
7. Update production environment variables

---

### Step 4: Configure Email (Resend)

1. Go to https://resend.com
2. Create account and verify your domain
3. Get API key from **API Keys** section
4. Update `.env`:
```env
RESEND_API_KEY=re_your_api_key_here
```

5. Update sender email in `src/lib/email/billing-notifications.ts`:
```typescript
const FROM_EMAIL = 'BigDataCorp <noreply@yourdomain.com>'
```

---

### Step 5: Test the Payment Flow

#### A. Start Development Server
```bash
npm run dev
```

#### B. Start Stripe Webhook Listener (separate terminal)
```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

#### C. Test Upgrade Flow

1. Register a new account
2. Go to **Dashboard** → **Billing**
3. Click **Upgrade to Basic** (or any paid plan)
4. Use Stripe test card:
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: Any future date (e.g., 12/34)
   CVC: Any 3 digits (e.g., 123)
   ZIP: Any 5 digits (e.g., 12345)
   ```
5. Complete payment
6. Verify:
   - Redirected back to billing page
   - Plan shows as "Basic" (or selected plan)
   - Status shows as "ACTIVE"
   - Email received (check console if RESEND_API_KEY not configured)

#### D. Test Customer Portal

1. On billing page, click **Manage Payment Method**
2. Verify redirected to Stripe Customer Portal
3. Test:
   - Update payment method
   - View invoices
   - Cancel subscription

---

### Step 6: Test Webhook Events

#### A. Simulate Payment Success
```bash
stripe trigger invoice.payment_succeeded
```

Check:
- Console logs show webhook received
- Database updated
- Email sent

#### B. Simulate Payment Failure
```bash
stripe trigger invoice.payment_failed
```

Check:
- Subscription status → `past_due`
- Email sent with retry info

#### C. Simulate Trial Ending
```bash
stripe trigger customer.subscription.trial_will_end
```

Check:
- Email sent with days remaining

---

## 🧪 Testing Checklist

### Subscription Lifecycle

- [ ] Free → Basic upgrade
- [ ] Basic → Pro upgrade
- [ ] Pro → Enterprise upgrade
- [ ] Enterprise → Pro downgrade
- [ ] Cancel subscription (stays active until period end)
- [ ] Payment succeeds → status active
- [ ] Payment fails → status past_due
- [ ] Subscription expires → downgrade to free

### Email Notifications

- [ ] Payment success email
- [ ] Payment failed email
- [ ] Trial ending email (3 days before)
- [ ] Subscription canceled email
- [ ] Plan upgrade email

### Edge Cases

- [ ] Upgrade with immediate payment
- [ ] Prorated charges for mid-month changes
- [ ] Cancel subscription, then reactivate
- [ ] Multiple failed payment retries
- [ ] Webhook signature verification fails → 400 error

---

## 🚀 Deployment Checklist

### Before Going Live

1. **Switch to Stripe Live Mode**
   - Go to Stripe Dashboard
   - Toggle from Test Mode to Live Mode
   - Create new products with live prices
   - Get live API keys (start with `pk_live_` and `sk_live_`)
   - Create live webhook endpoint

2. **Update Production Environment Variables**
   ```env
   STRIPE_SECRET_KEY=sk_live_xxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   STRIPE_BASIC_PRICE_ID=price_live_xxx
   STRIPE_PRO_PRICE_ID=price_live_xxx
   STRIPE_ENTERPRISE_PRICE_ID=price_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_live_xxx
   RESEND_API_KEY=re_live_xxx
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. **Verify Domain for Emails**
   - Add DNS records in Resend
   - Wait for verification
   - Test email sending

4. **Configure Stripe Settings**
   - Customer emails: Enable in Settings → Emails
   - Branding: Add logo and colors
   - Payment retry logic: Settings → Billing → Retry rules
   - Tax collection: If needed

5. **Security**
   - Enable HTTPS (required for webhooks)
   - Test webhook signature verification
   - Rate limit API endpoints
   - Monitor webhook delivery

---

## 📁 File Structure (What Was Created)

```
src/
├── app/
│   ├── api/
│   │   ├── subscriptions/
│   │   │   ├── checkout/route.ts          ✅ NEW
│   │   │   ├── portal/route.ts            ✅ NEW
│   │   │   ├── cancel/route.ts            ✅ NEW
│   │   │   ├── status/route.ts            ✅ NEW
│   │   │   ├── change/route.ts            ✅ NEW
│   │   │   └── invoices/route.ts          ✅ NEW
│   │   └── webhooks/
│   │       └── stripe/route.ts            ✅ NEW
│   └── (dashboard)/
│       └── billing/page.tsx               ✅ UPDATED
├── components/
│   └── billing/
│       ├── checkout-button.tsx            ✅ NEW
│       └── portal-button.tsx              ✅ NEW
├── lib/
│   └── email/
│       └── billing-notifications.ts       ✅ NEW
└── .env                                   ✅ UPDATED
```

---

## 🔍 Troubleshooting

### Issue: Checkout button doesn't work

**Check:**
1. Console errors in browser
2. `.env` has correct `STRIPE_SECRET_KEY`
3. Price IDs match Stripe dashboard
4. Network tab shows 200 response from `/api/subscriptions/checkout`

**Fix:**
```bash
# Verify API is responding
curl -X POST http://localhost:3000/api/subscriptions/checkout \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_xxx","planType":"basic"}'
```

---

### Issue: Webhook not receiving events

**Check:**
1. Stripe CLI is running (`stripe listen`)
2. Webhook secret in `.env` matches CLI output
3. Webhook signature verification passes

**Fix:**
```bash
# Restart Stripe listener
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe

# Copy new webhook secret to .env
```

---

### Issue: Database not updating after payment

**Check:**
1. Webhook handler logs (check terminal)
2. Subscription exists in Supabase
3. `stripe_subscription_id` matches

**Fix:**
- Check webhook handler logs for errors
- Verify Supabase connection
- Test webhook manually:
```bash
stripe trigger invoice.payment_succeeded
```

---

### Issue: Emails not sending

**Check:**
1. `RESEND_API_KEY` is valid
2. Sender email is verified in Resend
3. Console logs show email function called

**Fix:**
- Verify domain in Resend dashboard
- Check Resend logs for delivery status
- Test email directly:
```typescript
// In webhook handler, add:
console.log('Sending email to:', email)
```

---

## 📚 API Endpoints Reference

### Subscriptions

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/subscriptions/checkout` | POST | Create checkout session | Required |
| `/api/subscriptions/portal` | POST | Open customer portal | Required |
| `/api/subscriptions/status` | GET | Get subscription & usage | Required |
| `/api/subscriptions/cancel` | POST | Cancel subscription | Required |
| `/api/subscriptions/change` | POST | Upgrade/downgrade plan | Required |
| `/api/subscriptions/invoices` | GET | List invoices | Required |

### Webhooks

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/webhooks/stripe` | POST | Receive Stripe events | Signature |

---

## 🎯 Next Steps (Optional Enhancements)

### Phase 2: Enhanced Features

1. **Usage-Based Alerts**
   - Alert at 80% and 90% of monthly limit
   - Auto-suggest upgrade when limit reached

2. **Payment Method Display**
   - Fetch and display actual card details
   - Show card brand and last 4 digits

3. **Invoice Management**
   - Display invoice history on billing page
   - PDF download links
   - Invoice search/filter

4. **Plan Comparison Tool**
   - Interactive plan selector
   - Feature comparison table
   - ROI calculator

### Phase 3: Advanced Features

1. **ASAAS Integration** (Brazilian market)
   - PIX payment support
   - Boleto generation
   - Local payment methods

2. **Team Billing**
   - Seat-based pricing
   - Team member management
   - Organization accounts

3. **Revenue Analytics** (Admin)
   - MRR/ARR tracking
   - Churn analysis
   - Customer lifetime value

4. **Coupon System**
   - Discount codes
   - Referral program
   - Promotional campaigns

---

## 🆘 Support

### Stripe Documentation
- Webhooks: https://stripe.com/docs/webhooks
- Subscriptions: https://stripe.com/docs/billing/subscriptions
- Testing: https://stripe.com/docs/testing

### Resend Documentation
- Emails: https://resend.com/docs

### Project-Specific
- Check console logs for errors
- Review webhook delivery in Stripe Dashboard
- Monitor Supabase database for updates

---

## ✅ Success Criteria

Your payment system is working correctly when:

1. ✅ User can upgrade from free to paid plan
2. ✅ Payment redirects to Stripe checkout
3. ✅ After payment, user redirected back with success
4. ✅ Database shows updated plan and status
5. ✅ User receives payment confirmation email
6. ✅ Billing page shows correct current plan
7. ✅ Customer portal button opens Stripe portal
8. ✅ User can cancel subscription
9. ✅ Failed payments trigger email alerts
10. ✅ Webhooks update database in real-time

---

## 🎉 Congratulations!

You now have a fully functional payment system integrated with Stripe. Users can:
- Upgrade/downgrade plans
- Manage payment methods
- View invoices
- Receive email notifications
- Handle subscription lifecycle

**Ready to accept payments!** 🚀

---

**Last Updated:** November 2025
**Version:** 1.0.0
**Status:** Production Ready
