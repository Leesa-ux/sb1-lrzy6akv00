# Afroé Automation - Quick Start Guide

## 🚀 5-Minute Deployment Guide

### Step 1: Environment Setup (2 min)

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add:
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/afroe"
BREVO_API_KEY="xkeysib-your-key-here"
CRON_SECRET="$(openssl rand -hex 32)"
NEXT_PUBLIC_APP_URL="https://afroe.com"
```

### Step 2: Database Setup (1 min)

```bash
# Generate Prisma client
npx prisma generate

# MongoDB will auto-create collections on first use
```

### Step 3: Deploy (2 min)

```bash
# Install Vercel CLI (if needed)
npm i -g vercel

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard
```

---

## 📧 Brevo Templates Setup

### Quick Template Creation

1. Go to https://brevo.com/campaigns/email-templates
2. Create 6 templates with these IDs:

| ID | Name | Use Template From |
|----|------|-------------------|
| 101 | Welcome | BREVO_TEMPLATES.md → Template #101 |
| 102 | Follow-up 1h | BREVO_TEMPLATES.md → Template #102 |
| 103 | Activation 48h | BREVO_TEMPLATES.md → Template #103 |
| 104 | Milestone | BREVO_TEMPLATES.md → Template #104 |
| 105 | Reminder 5d | BREVO_TEMPLATES.md → Template #105 |
| 106 | Launch Day | BREVO_TEMPLATES.md → Template #106 |

3. Configure Contact Attributes:
   - Go to Contacts > Settings > Contact Attributes
   - Add: FIRSTNAME, ROLE, REF_LINK, POINTS, RANK, REF_COUNT, NEXT_MILESTONE, LAST_REF_AT

---

## 🧪 Quick Test

### Test User Signup

```bash
curl -X POST https://your-domain.com/api/signup-complete \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "phone": "+33612345678",
    "role": "client"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "userId": "mongodb_id",
  "referralCode": "ABC123XYZ",
  "refLink": "https://afroe.com/waitlist?ref=ABC123XYZ"
}
```

**What Should Happen:**
- ✅ User created in MongoDB
- ✅ Welcome email sent
- ✅ Welcome SMS sent
- ✅ Contact synced to Brevo

### Test Referral

```bash
curl -X POST https://your-domain.com/api/webhook/referral-completed \
  -H "Content-Type: application/json" \
  -d '{
    "referrerId": "USER_ID_FROM_SIGNUP",
    "isLaunchDay": false
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "pointsAdded": 2,
  "newTotal": 2,
  "rank": 1
}
```

---

## 📊 Point System Quick Reference

### Pre-Launch (Before Jan 15, 2026)

| Role | Points per Referral |
|------|---------------------|
| Client | +2 |
| Influencer | +15 |
| Pro | +25 |

### Post-Launch (After Jan 15, 2026)

| Role | Points per Referral |
|------|---------------------|
| Client | +10 |
| Influencer | +50 |
| Pro | +100 |

### Launch Day Bonus
**All points earned on Jan 15, 2026 are DOUBLED (x2)**

### Milestones

| Points | Reward |
|--------|--------|
| 10 | Badge + Featured + -10% discount |
| 50 | VIP + IG shoutout + -20% discount |
| 100 | Glow Kit + Coaching + Jackpot ticket + -20% |
| 200 | IRL Event + Press + Co-creation + -50% |

---

## 🤖 Automation Flows

| Flow | Trigger | Schedule |
|------|---------|----------|
| Welcome | Signup | Immediate |
| Follow-up | 1h after signup | Every 30 min |
| Activation | 48h + no referrals | Every 6 hours |
| Milestone | Points threshold | On referral |
| Inactivity | 5+ days inactive | Daily 10 AM |
| Launch Day | Manual trigger | One-time |

---

## 📁 Important Files

### Code Files
- `/lib/automation-service.ts` - Core automation logic
- `/lib/brevo-client.ts` - Brevo API integration
- `/app/api/signup-complete/route.ts` - User signup
- `/app/api/webhook/referral-completed/route.ts` - Referral handler

### Documentation
- `BREVO_TEMPLATES.md` - All email & SMS templates
- `AUTOMATION_SETUP.md` - Complete technical guide
- `IMPLEMENTATION_SUMMARY.md` - Deployment checklist

### Configuration
- `.env.example` - Environment variables template
- `vercel.json` - Cron job configuration
- `prisma/schema.prisma` - Database schema

---

## ⚡ Common Commands

### Local Development
```bash
npm run dev          # Start dev server
npx prisma studio    # Open database GUI
npx prisma generate  # Regenerate Prisma client
```

### Production
```bash
vercel --prod        # Deploy to production
vercel logs          # View deployment logs
vercel env add       # Add environment variable
```

### Testing
```bash
# Test cron job (requires CRON_SECRET)
curl https://your-domain.com/api/cron/inactivity-check \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

---

## 🆘 Quick Troubleshooting

### Emails not sending?
1. Check `BREVO_API_KEY` in Vercel env vars
2. Verify template IDs (101-106) exist in Brevo
3. Check Brevo account credits

### Cron jobs not running?
1. Check `CRON_SECRET` is set in Vercel
2. Verify cron jobs in Vercel dashboard
3. Check deployment logs for errors

### Points not updating?
1. Verify `DATABASE_URL` is correct
2. Check user exists in MongoDB
3. Review API logs in Vercel

---

## 📞 Need Help?

1. **Full Documentation**: See `AUTOMATION_SETUP.md`
2. **Email Templates**: See `BREVO_TEMPLATES.md`
3. **Deployment Details**: See `IMPLEMENTATION_SUMMARY.md`

---

## ✅ Pre-Launch Checklist

- [ ] MongoDB database created and accessible
- [ ] Brevo account set up with API key
- [ ] 6 email templates created in Brevo
- [ ] Contact attributes configured
- [ ] Environment variables set in Vercel
- [ ] Project deployed successfully
- [ ] Test signup completed
- [ ] Test referral completed
- [ ] Cron jobs verified in Vercel dashboard
- [ ] Welcome email received
- [ ] SMS delivery confirmed

**Ready to launch! 🚀**
