# Payment System - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Get Stripe Keys (2 min)
1. Go to https://dashboard.stripe.com (test mode)
2. **Developers** → **API Keys**
3. Copy **Publishable** and **Secret** keys

### 2. Create Products (2 min)
1. **Products** → Add 3 products:
   - Basic: $29/month
   - Pro: $99/month
   - Enterprise: $499/month
2. Copy each **Price ID** (price_xxxxx)

### 3. Update .env (30 sec)
```env
STRIPE_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_BASIC_PRICE_ID=price_basic_id
STRIPE_PRO_PRICE_ID=price_pro_id
STRIPE_ENTERPRISE_PRICE_ID=price_enterprise_id
```

### 4. Start Services (30 sec)
```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Webhooks (requires Stripe CLI)
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

Copy webhook secret (whsec_xxx) to `.env` as `STRIPE_WEBHOOK_SECRET`

### 5. Test Payment
1. Go to http://localhost:3000/dashboard/billing
2. Click **Upgrade to Basic**
3. Use test card: `4242 4242 4242 4242`
4. Complete payment
5. ✅ Verify plan updated

---

## 🧪 Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 9995 | Insufficient funds |

Expiry: Any future date (12/34)
CVC: Any 3 digits (123)

---

## 🔗 Key URLs

- Billing Page: `/dashboard/billing`
- Stripe Dashboard: https://dashboard.stripe.com
- Webhook Logs: https://dashboard.stripe.com/test/logs

---

## ⚡ Quick Commands

```bash
# Test webhook
stripe trigger invoice.payment_succeeded

# View webhook logs
stripe logs tail

# Listen for webhooks
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

---

## 🐛 Common Issues

**Checkout button not working?**
→ Check browser console and verify API keys in `.env`

**Webhook not updating DB?**
→ Verify `stripe listen` is running and webhook secret is correct

**Email not sending?**
→ Add `RESEND_API_KEY` to `.env` (optional for testing)

---

## ✅ Success Checklist

- [ ] Stripe keys in `.env`
- [ ] Products created with price IDs
- [ ] Dev server running
- [ ] Stripe CLI listening
- [ ] Test payment completed
- [ ] Database updated
- [ ] Plan shows on billing page

---

**Next:** See `PAYMENT_SETUP_GUIDE.md` for complete documentation
