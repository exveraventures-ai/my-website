# Email Notifications Setup Guide

## Overview
Set up email notifications to receive alerts when users request access to Burnout IQ.

## Option 1: Supabase Database Webhooks (Recommended)

### Step 1: Create a Supabase Edge Function
Create a new Edge Function in Supabase to handle access request notifications.

**File: `supabase/functions/new-access-request/index.ts`**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'alex.f.nash@gmail.com'

serve(async (req) => {
  try {
    const { record } = await req.json()
    
    // Send email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Burnout IQ <notifications@burnoutiQ.com>',
        to: [ADMIN_EMAIL],
        subject: `New Access Request: ${record.first_name} ${record.last_name}`,
        html: `
          <h2>New Access Request</h2>
          <p><strong>Name:</strong> ${record.first_name} ${record.last_name}</p>
          <p><strong>Email:</strong> ${record.email}</p>
          <p><strong>Position:</strong> ${record.position || 'N/A'}</p>
          <p><strong>Company:</strong> ${record.company || 'N/A'}</p>
          <p><strong>Firm Type:</strong> ${record.firm_type || 'N/A'}</p>
          <p><strong>Region:</strong> ${record.region || 'N/A'}</p>
          <p><strong>Requested:</strong> ${new Date(record.created_at).toLocaleString()}</p>
          <br>
          <a href="https://your-domain.com/admin" style="padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 8px;">
            Review Request
          </a>
        `,
      }),
    })

    const emailData = await emailResponse.json()
    
    return new Response(
      JSON.stringify({ success: true, emailId: emailData.id }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### Step 2: Set Up Database Webhook in Supabase
1. Go to Supabase Dashboard → Database → Webhooks
2. Create new webhook:
   - **Name**: `new_access_request_email`
   - **Table**: `access_requests`
   - **Events**: `INSERT`
   - **HTTP Request URL**: `https://your-project.supabase.co/functions/v1/new-access-request`
   - **HTTP Request Method**: `POST`
   - **HTTP Request Headers**: 
     ```
     Authorization: Bearer YOUR_SUPABASE_ANON_KEY
     ```

### Step 3: Set Up Resend API (Email Service)
1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to Supabase Edge Function secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=your_resend_api_key
   supabase secrets set ADMIN_EMAIL=alex.f.nash@gmail.com
   ```

### Step 4: Deploy Edge Function
```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy new-access-request
```

## Option 2: Simple Zapier/Make.com Integration

### Using Zapier:
1. Create a new Zap
2. **Trigger**: Supabase → New Row
   - Table: `access_requests`
   - Event: Row Created
3. **Action**: Email → Send Outbound Email
   - Configure email template with request details
   - Send to: alex.f.nash@gmail.com

### Using Make.com (formerly Integromat):
1. Create a new Scenario
2. **Trigger**: Supabase → Watch Rows
   - Table: `access_requests`
3. **Action**: Email → Send Email
   - Configure email template
   - Send to: alex.f.nash@gmail.com

## Option 3: PostgreSQL Trigger + Email Function

### Step 1: Create Email Function (requires pg_net extension)
```sql
-- Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to send email via HTTP
CREATE OR REPLACE FUNCTION notify_new_access_request()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://hooks.zapier.com/hooks/catch/YOUR_ZAPIER_WEBHOOK_ID/';
BEGIN
  PERFORM
    net.http_post(
      url := webhook_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'first_name', NEW.first_name,
        'last_name', NEW.last_name,
        'position', NEW.position,
        'company', NEW.company,
        'firm_type', NEW.firm_type,
        'region', NEW.region,
        'created_at', NEW.created_at
      )
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER access_request_notification
  AFTER INSERT ON access_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_access_request();
```

## Option 4: Simple Client-Side Notification (Quick Start)

For a quick solution, you can use a service like:
- **EmailJS** (Free tier: 200 emails/month)
- **Formspree** (Free tier: 50 submissions/month)
- **SendGrid** (Free tier: 100 emails/day)

### Using EmailJS:
1. Sign up at [emailjs.com](https://www.emailjs.com)
2. Create email template
3. Add to request access page:
```javascript
import emailjs from '@emailjs/browser'

// In handleSubmit after creating access request:
emailjs.send(
  'YOUR_SERVICE_ID',
  'YOUR_TEMPLATE_ID',
  {
    to_email: 'alex.f.nash@gmail.com',
    user_name: `${formData.first_name} ${formData.last_name}`,
    user_email: formData.email,
    position: formData.position,
    company: formData.company,
    region: formData.region,
  },
  'YOUR_PUBLIC_KEY'
)
```

## Recommended Setup

**For Production**: Use Option 1 (Supabase Edge Functions + Resend)
- Most reliable
- Integrated with your Supabase setup
- Professional email delivery
- Customizable templates

**For Quick Testing**: Use Option 4 (EmailJS)
- Fastest to set up
- No backend required
- Good for testing

## Email Template Example

```html
Subject: New Access Request - [Name]

Hi Alex,

A new user has requested access to Burnout IQ:

Name: [First Name] [Last Name]
Email: [Email]
Position: [Position]
Company: [Company]
Firm Type: [Firm Type]
Region: [Region]
Requested: [Date/Time]

Review and approve at: https://your-domain.com/admin

Thanks,
Burnout IQ System
```

## Testing

After setting up, test by:
1. Submitting a test access request
2. Verify email is received
3. Check email formatting and links
4. Verify admin panel link works correctly

