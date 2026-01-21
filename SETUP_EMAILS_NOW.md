# Get Emails Working in 2 Minutes

## The Problem:
EmailJS doesn't allow domain whitelisting on the free tier, so emails work on localhost but not on your production site.

## The Solution:
We switched to **Resend** - it's free, better, and works everywhere with no domain restrictions.

## Setup Steps:

### 1. Sign up for Resend (30 seconds)
Go to: https://resend.com/signup

### 2. Get your API Key (30 seconds)
1. After signing up, go to: https://resend.com/api-keys
2. Click "Create API Key"
3. Name it: `Production`
4. Copy the key (starts with `re_...`)

### 3. Add to Vercel (1 minute)
Go to your Vercel project → Settings → Environment Variables

Add these 2 variables:

**Variable 1:**
```
Name: RESEND_API_KEY
Value: [paste your re_... key here]
Environment: Production, Preview, Development
```

**Variable 2:**
```
Name: NEXT_PUBLIC_SITE_URL  
Value: https://your-actual-vercel-url.vercel.app
Environment: Production, Preview, Development
```

### 4. Redeploy
Click "Redeploy" in Vercel

## Done!

Emails will now work in production. Test by:
1. Going to `/request-access` on your live site
2. Submitting a request
3. Checking `exveraventures@gmail.com` for the admin notification

---

## What Changed:

- ❌ **Removed**: EmailJS (client-side, domain restrictions, doesn't work in prod)
- ✅ **Added**: Resend (server-side, works everywhere, more reliable)
- ✅ **Free**: 3,000 emails/month (way more than you need)
- ✅ **Better**: Higher deliverability, no CORS issues

## Emails sent:

1. **Admin gets email** when user requests access
2. **User gets email** when you approve their request (with password setup instructions)

That's it! No EmailJS templates to configure, no domain whitelisting needed.
