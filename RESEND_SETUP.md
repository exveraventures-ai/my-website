# Resend Email Setup (Free & Works in Production!)

## Why Resend?

- ✅ **100% Free** for 3,000 emails/month
- ✅ **No domain restrictions** - works on any domain
- ✅ **Server-side** - more secure and reliable
- ✅ **Better deliverability** than EmailJS
- ✅ **No CORS issues**

## Quick Setup (5 minutes):

### 1. Sign Up for Resend

1. Go to https://resend.com/signup
2. Sign up with your email
3. Verify your email

### 2. Get API Key

1. Go to https://resend.com/api-keys
2. Click **"Create API Key"**
3. Name it: `Burnout IQ Production`
4. Click **"Create"**
5. **Copy the API key** (starts with `re_...`)

### 3. Add to Vercel

Add these 2 environment variables in Vercel:

**Variable 1:**
```
Name: RESEND_API_KEY
Value: re_your_api_key_here
```

**Variable 2:**
```
Name: NEXT_PUBLIC_SITE_URL
Value: https://your-domain.vercel.app
```

(Replace with your actual Vercel URL or custom domain)

Select: **Production, Preview, and Development**

### 4. Redeploy

After adding the variables, redeploy your site in Vercel.

## That's It!

Emails will now work in production! 

### Default "From" Address

Initially, emails will come from:
```
Burnout IQ <onboarding@resend.dev>
```

### To Use Your Own Domain (Optional):

1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Add your domain (e.g., `burnoutiq.com`)
4. Add the DNS records Resend provides
5. Update the API route to use your domain:
   ```javascript
   from: 'Burnout IQ <noreply@burnoutiq.com>'
   ```

## Testing Locally:

Add to your `.env.local`:
```
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then restart your dev server.

## What Changed:

- ❌ Removed EmailJS (client-side, domain restrictions)
- ✅ Added Resend (server-side, no restrictions)
- ✅ Created `/api/send-email` route
- ✅ Works on localhost AND production!

## Email Flow:

1. **User requests access** → API sends email to admin
2. **Admin approves** → API sends welcome email to user

Both use the same API route at `/api/send-email`.
