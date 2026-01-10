# Email Setup Guide - Access Request Notifications

## Overview
Set up automated emails for:
1. **Email 1**: When user requests access (Thank you for your interest)
2. **Email 2**: When admin approves request (Your access has been approved)

## Option 1: EmailJS (Recommended - Easiest)

### Step 1: Sign Up for EmailJS
1. Go to https://www.emailjs.com
2. Create free account (200 emails/month free)
3. Verify your email

### Step 2: Create Email Service
1. Dashboard → **Add New Service**
2. Choose your email provider (Gmail, Outlook, etc.)
3. Connect your email account
4. Copy your **Service ID**

### Step 3: Create Email Templates

#### Template 1: Access Request Confirmation
1. Go to **Email Templates** → **Create New Template**
2. **Template Name**: `access_request_confirmation`
3. **Subject**: `Thank you for requesting access to Burnout IQ`
4. **Content**:
```
Hi {{to_name}},

Thank you for your interest in Burnout IQ!

We've received your access request and will review it shortly. Here's what you submitted:

Name: {{user_name}}
Email: {{user_email}}
Position: {{position}}
Company: {{company}}
Region: {{region}}

We'll get back to you within 24-48 hours with a decision.

Best regards,
The Burnout IQ Team
```
5. **To Email**: `{{to_email}}`
6. **From Name**: `Burnout IQ`
7. **From Email**: Your connected email
8. Copy the **Template ID**

#### Template 2: Approval Notification
1. Create another template
2. **Template Name**: `access_approved`
3. **Subject**: `Your Burnout IQ access has been approved!`
4. **Content**:
```
Hi {{to_name}},

Great news! Your access request to Burnout IQ has been approved.

You can now log in to start tracking your working hours and analyzing your burnout risk.

Login here: {{login_url}}

If you don't have a password yet, you can:
1. Use "Forgot Password" on the login page, or
2. Contact support for assistance

Welcome to Burnout IQ!

Best regards,
The Burnout IQ Team
```
5. Copy the **Template ID**

### Step 4: Get Your Public Key
1. Go to **Account** → **General**
2. Copy your **Public Key**

### Step 5: Add to Your Project
1. Create `.env.local` file in your project root:
```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_REQUEST_ID=your_request_template_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_APPROVAL_ID=your_approval_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

2. Install EmailJS in your project:
```bash
npm install @emailjs/browser
```

3. Add EmailJS script to your app. Create or update `app/layout.jsx`:
```javascript
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

Or add to `app/layout.tsx` if using TypeScript.

4. Initialize EmailJS in your pages. Add to `app/request-access/page.jsx` and `app/admin/page.jsx`:
```javascript
useEffect(() => {
  if (typeof window !== 'undefined') {
    window.emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY)
  }
}, [])
```

### Step 6: Test
1. Submit a test access request
2. Check the email inbox
3. Approve the request as admin
4. Check for approval email

---

## Option 2: Webhook (Zapier/Make.com)

### Using Zapier:
1. Create Zap
2. **Trigger**: Supabase → New Row in `access_requests`
3. **Action**: Email → Send Outbound Email
4. Configure email template with request details

### Using Make.com:
1. Create Scenario
2. **Trigger**: Supabase → Watch Rows
3. **Action**: Email → Send Email
4. Configure template

---

## Option 3: Supabase Edge Functions (Advanced)

See `EMAIL_NOTIFICATIONS_SETUP.md` for detailed Edge Function setup with Resend API.

---

## Email Templates Preview

### Email 1: Access Request Confirmation
**Subject**: Thank you for requesting access to Burnout IQ

**Body**:
```
Hi [Name],

Thank you for your interest in Burnout IQ!

We've received your access request and will review it shortly. Here's what you submitted:

Name: [Name]
Email: [Email]
Position: [Position]
Company: [Company]
Region: [Region]

We'll get back to you within 24-48 hours with a decision.

Best regards,
The Burnout IQ Team
```

### Email 2: Approval Notification
**Subject**: Your Burnout IQ access has been approved!

**Body**:
```
Hi [Name],

Great news! Your access request to Burnout IQ has been approved.

You can now log in to start tracking your working hours and analyzing your burnout risk.

Login here: [Login URL]

If you don't have a password yet, you can:
1. Use "Forgot Password" on the login page, or
2. Contact support for assistance

Welcome to Burnout IQ!

Best regards,
The Burnout IQ Team
```

---

## Troubleshooting

**Emails not sending?**
- Check browser console for errors
- Verify EmailJS keys are correct in `.env.local`
- Make sure EmailJS script is loaded
- Check EmailJS dashboard for delivery status

**Template variables not working?**
- Make sure variable names match exactly (case-sensitive)
- Use double curly braces: `{{variable_name}}`

**Rate limits?**
- EmailJS free tier: 200 emails/month
- Consider upgrading or using alternative service

---

## Quick Start Checklist

- [ ] Sign up for EmailJS
- [ ] Create email service
- [ ] Create 2 email templates
- [ ] Get Service ID, Template IDs, and Public Key
- [ ] Add to `.env.local`
- [ ] Install `@emailjs/browser`
- [ ] Add EmailJS script to layout
- [ ] Initialize EmailJS in pages
- [ ] Test request submission email
- [ ] Test approval email

