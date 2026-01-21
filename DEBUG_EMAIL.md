# Email Debug Guide

## Current Setup

You have 2 EmailJS templates configured:
1. **admin_notification** - Sends to admin when someone requests access
2. **access_request_confirmat** - Sends to user when approved (welcome email)

## Why Emails Aren't Working - Checklist

### 1. Check Browser Console
Open DevTools (F12) and check for errors when:
- Submitting access request
- Approving a request in admin panel

Look for:
- "EmailJS not configured"
- Network errors
- CORS errors
- Template ID not found

### 2. Verify EmailJS Dashboard
Go to https://dashboard.emailjs.com

**Service:**
- ID: `service_sptnj9x`
- Status: Should be "Active"
- Email provider connected (Gmail, Outlook, etc.)

**Templates:**
- Template 1 ID: `admin_notification`
  - Subject: "New Access Request: {{user_name}}"
  - To: {{to_email}}
  
- Template 2 ID: `access_request_confirmat`
  - Subject: "🎉 Welcome to Burnout IQ - Your access is approved!"
  - To: {{to_email}}

### 3. Check .env.local Variables
```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_sptnj9x
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=4cZSFjlmgHhHTMjQw
NEXT_PUBLIC_EMAILJS_TEMPLATE_ADMIN_NOTIFICATION_ID=admin_notification
NEXT_PUBLIC_EMAILJS_TEMPLATE_APPROVAL_ID=access_request_confirmat
NEXT_PUBLIC_ADMIN_EMAIL=exveraventures@gmail.com
```

### 4. Restart Dev Server
After changing .env.local, you MUST restart:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 5. Test Flow

**Test Admin Notification:**
1. Go to `/request-access`
2. Fill out form and submit
3. Check browser console - should see "Admin notification email sent"
4. Check email: exveraventures@gmail.com
5. If no email, check EmailJS dashboard → History tab for errors

**Test Approval Email:**
1. Go to `/admin`
2. Click "Approve" on a request
3. Check browser console - should see "Approval email sent"
4. Check the user's email inbox
5. If no email, check EmailJS dashboard → History tab

### 6. Common Issues

**"EmailJS not configured"**
- EmailJS script didn't load
- Check Network tab for `email.min.js` - should load from CDN
- Solution: Hard refresh page (Cmd+Shift+R)

**Template not found**
- Template ID doesn't match EmailJS dashboard
- Check exact spelling (case-sensitive!)
- Solution: Verify template IDs in EmailJS dashboard

**CORS Error**
- Domain not whitelisted in EmailJS
- Solution: Add `localhost` and your domain in EmailJS settings → Allowed Origins

**No error but no email**
- EmailJS sent successfully but email provider blocked it
- Check EmailJS dashboard → History
- Check spam folder
- Verify email service is connected in EmailJS

### 7. Quick Test (Browser Console)

Open any page and run in console:
```javascript
window.emailjs.send(
  'service_sptnj9x',
  'admin_notification',
  {
    to_email: 'exveraventures@gmail.com',
    to_name: 'Admin',
    user_name: 'Test User',
    user_email: 'test@example.com',
    position: 'Analyst',
    company: 'Goldman Sachs',
    firm_type: 'Investment Banking',
    region: 'USA - New York',
    request_date: new Date().toLocaleString(),
    admin_url: window.location.origin + '/admin'
  },
  '4cZSFjlmgHhHTMjQw'
).then(
  () => console.log('✓ Email sent!'),
  (err) => console.error('✗ Email failed:', err)
)
```

If this works, the issue is in the app code, not EmailJS setup.
If this fails, the issue is in EmailJS configuration.

### 8. Enable Detailed Logging

Temporarily add this to check what's happening:

In `/app/lib/emailService.js`, update the functions to log more:

```javascript
export const sendAdminNotificationEmail = async (requestData, adminEmail) => {
  console.log('📧 Attempting to send admin email...')
  console.log('Service ID:', process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID)
  console.log('Template ID:', process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ADMIN_NOTIFICATION_ID)
  console.log('Public Key:', process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY)
  console.log('Admin Email:', adminEmail)
  console.log('EmailJS available:', typeof window !== 'undefined' && !!window.emailjs)
  
  // ... rest of function
}
```

This will show you exactly what values are being used.
