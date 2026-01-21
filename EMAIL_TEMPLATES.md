# Email Templates Guide

This document contains the HTML email templates for Burnout IQ email notifications. These templates should be set up in EmailJS.

## Setup Instructions

1. **Install EmailJS dependency** (if not already installed):
   ```bash
   npm install @emailjs/browser
   ```

2. **Sign up for EmailJS** at https://www.emailjs.com (free tier: 200 emails/month)

3. **Create email service** in EmailJS dashboard:
   - Connect your email provider (Gmail, Outlook, etc.)
   - Copy your Service ID

4. **Create TWO email templates** using the HTML below:
   - **Template 1**: Admin Notification (required)
   - **Template 2**: User Confirmation (required)
   - Template 3 (Approval/Welcome) is optional - nice to have but not critical

5. **Add environment variables** to `.env.local`:
   ```bash
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
   NEXT_PUBLIC_EMAILJS_TEMPLATE_REQUEST_ID=your_request_template_id
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ADMIN_NOTIFICATION_ID=your_admin_template_id
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
   NEXT_PUBLIC_ADMIN_EMAIL=alex.f.nash@gmail.com
   
   # Optional (only if you set up Template 3):
   # NEXT_PUBLIC_EMAILJS_TEMPLATE_APPROVAL_ID=your_approval_template_id
   ```

---

## Template 1: Admin Notification (New Access Request)

**Template Name:** `admin_notification`  
**Subject:** `New Access Request: {{user_name}}`  
**To Email:** `{{to_email}}` (set to your admin email)

### HTML Template:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Access Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e7;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #1d1d1f; letter-spacing: -0.02em;">
                Burnout <span style="color: #06B6D4; font-weight: 800;">IQ</span>
              </h1>
              <p style="margin: 12px 0 0; font-size: 16px; color: #6e6e73;">Admin Notification</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px; font-size: 24px; font-weight: 600; color: #1d1d1f;">
                New Access Request Received
              </h2>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #1d1d1f;">
                A new user has requested access to Burnout IQ:
              </p>
              
              <!-- User Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                <tr>
                  <td style="padding-bottom: 12px;">
                    <strong style="color: #6e6e73; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Name</strong>
                    <p style="margin: 4px 0 0; font-size: 16px; color: #1d1d1f; font-weight: 600;">{{user_name}}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px;">
                    <strong style="color: #6e6e73; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Email</strong>
                    <p style="margin: 4px 0 0; font-size: 16px; color: #1d1d1f;">{{user_email}}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px;">
                    <strong style="color: #6e6e73; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Position</strong>
                    <p style="margin: 4px 0 0; font-size: 16px; color: #1d1d1f;">{{position}}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px;">
                    <strong style="color: #6e6e73; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Company</strong>
                    <p style="margin: 4px 0 0; font-size: 16px; color: #1d1d1f;">{{company}}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px;">
                    <strong style="color: #6e6e73; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Firm Type</strong>
                    <p style="margin: 4px 0 0; font-size: 16px; color: #1d1d1f;">{{firm_type}}</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong style="color: #6e6e73; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Region</strong>
                    <p style="margin: 4px 0 0; font-size: 16px; color: #1d1d1f;">{{region}}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px; border-top: 1px solid #e5e5e7;">
                    <strong style="color: #6e6e73; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Requested</strong>
                    <p style="margin: 4px 0 0; font-size: 16px; color: #1d1d1f;">{{request_date}}</p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{admin_url}}" style="display: inline-block; padding: 16px 32px; background-color: #4F46E5; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                      Review Request →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f5f5f7; border-top: 1px solid #e5e5e7; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #6e6e73;">
                You received this notification because you are an administrator of Burnout IQ.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Template 2: User Confirmation (Access Request Received)

**Template Name:** `access_request_confirmation`  
**Subject:** `Thank you for requesting access to Burnout IQ`  
**To Email:** `{{to_email}}`

### HTML Template:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access Request Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e7;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #1d1d1f; letter-spacing: -0.02em;">
                Burnout <span style="color: #06B6D4; font-weight: 800;">IQ</span>
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px; font-size: 24px; font-weight: 600; color: #1d1d1f;">
                Thank you for your interest, {{to_name}}!
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #1d1d1f;">
                We've received your access request and will review it shortly. Here's what you submitted:
              </p>
              
              <!-- Request Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                <tr>
                  <td style="padding-bottom: 8px;">
                    <span style="color: #6e6e73; font-size: 14px;">Position:</span>
                    <span style="color: #1d1d1f; font-size: 16px; font-weight: 600; margin-left: 8px;">{{position}}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 8px;">
                    <span style="color: #6e6e73; font-size: 14px;">Company:</span>
                    <span style="color: #1d1d1f; font-size: 16px; font-weight: 600; margin-left: 8px;">{{company}}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span style="color: #6e6e73; font-size: 14px;">Region:</span>
                    <span style="color: #1d1d1f; font-size: 16px; font-weight: 600; margin-left: 8px;">{{region}}</span>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #1d1d1f;">
                We'll review your request and get back to you within <strong>24-48 hours</strong> with a decision. You'll receive an email notification once your access has been approved.
              </p>
              
              <!-- Feature Preview -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%); border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #ffffff;">
                      What's Next?
                    </h3>
                    <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: rgba(255,255,255,0.9);">
                      ✓ Track your working hours with precision<br>
                      ✓ Analyze burnout risk with comprehensive metrics<br>
                      ✓ Compare with peers in your industry<br>
                      ✓ Maintain sustainable work-life balance
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Learn More Link -->
              <p style="margin: 0; font-size: 14px; color: #6e6e73; text-align: center;">
                <a href="{{features_url}}" style="color: #4F46E5; text-decoration: none; font-weight: 500;">
                  Learn more about our features →
                </a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f5f5f7; border-top: 1px solid #e5e5e7; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #6e6e73;">
                Questions? Contact us at support@burnoutiQ.com
              </p>
              <p style="margin: 0; font-size: 12px; color: #86868b;">
                © 2025 Burnout IQ. Built for sustainable high performance.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Template 3: User Approval/Welcome Email

**Template Name:** `access_approved`  
**Subject:** `🎉 Your Burnout IQ access has been approved!`  
**To Email:** `{{to_email}}`

### HTML Template:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 600px;">
          <!-- Header with gradient -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0 0 12px; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                Burnout <span style="color: #ffffff; font-weight: 800;">IQ</span>
              </h1>
              <p style="margin: 0; font-size: 18px; color: rgba(255,255,255,0.9); font-weight: 500;">
                Welcome aboard! 🎉
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; font-size: 28px; font-weight: 600; color: #1d1d1f;">
                Great news, {{to_name}}!
              </h2>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #1d1d1f;">
                Your access request to <strong>Burnout IQ</strong> has been approved! You can now log in and start tracking your working hours, analyzing your burnout risk, and maintaining a sustainable work-life balance.
              </p>
              
              <!-- Primary CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="{{login_url}}" style="display: inline-block; padding: 16px 32px; background-color: #4F46E5; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 17px; font-weight: 600; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                      Sign In to Get Started →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Feature Overview -->
              <h3 style="margin: 0 0 20px; font-size: 20px; font-weight: 600; color: #1d1d1f;">
                Key Features You Can Access:
              </h3>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding-bottom: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="40" valign="top">
                          <div style="width: 32px; height: 32px; background-color: #4F46E5; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">⏱️</div>
                        </td>
                        <td style="padding-left: 16px;">
                          <h4 style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1d1d1f;">Track Hours</h4>
                          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #6e6e73;">Log daily work hours with smart rolling averages and intensity tracking. See L7D totals and historical trends.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="40" valign="top">
                          <div style="width: 32px; height: 32px; background-color: #06B6D4; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">📊</div>
                        </td>
                        <td style="padding-left: 16px;">
                          <h4 style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1d1d1f;">Dashboard & Analytics</h4>
                          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #6e6e73;">View comprehensive statistics, workload intensity, and weekly projections based on your patterns.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="40" valign="top">
                          <div style="width: 32px; height: 32px; background-color: #34C759; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">⚠️</div>
                        </td>
                        <td style="padding-left: 16px;">
                          <h4 style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1d1d1f;">Burnout Risk Assessment</h4>
                          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #6e6e73;">Get comprehensive burnout risk scoring that factors in weekly averages, late-night hours, and recovery time.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="40" valign="top">
                          <div style="width: 32px; height: 32px; background-color: #FF9500; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">👥</div>
                        </td>
                        <td style="padding-left: 16px;">
                          <h4 style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1d1d1f;">Peer Comparisons</h4>
                          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #6e6e73;">Anonymously benchmark against Associates, VPs, and Partners in your region and firm type.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Quick Links -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; border-radius: 8px; padding: 20px;">
                <tr>
                  <td>
                    <h4 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #1d1d1f;">Quick Links:</h4>
                    <p style="margin: 0 0 8px; font-size: 14px; color: #6e6e73;">
                      <a href="{{dashboard_url}}" style="color: #4F46E5; text-decoration: none; font-weight: 500;">Dashboard</a> • 
                      <a href="{{hours_url}}" style="color: #4F46E5; text-decoration: none; font-weight: 500;">Track Hours</a> • 
                      <a href="{{features_url}}" style="color: #4F46E5; text-decoration: none; font-weight: 500;">Features</a>
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Password Info -->
              <div style="margin-top: 32px; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                <p style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #92400e;">
                  Don't have a password yet?
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #78350f;">
                  Click "Forgot Password" on the <a href="{{login_url}}" style="color: #b45309; text-decoration: none; font-weight: 500;">login page</a> to set up your password, or contact support for assistance.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f5f5f7; border-top: 1px solid #e5e5e7; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #6e6e73;">
                Questions? Contact us at support@burnoutiQ.com
              </p>
              <p style="margin: 0; font-size: 12px; color: #86868b;">
                © 2025 Burnout IQ. Built for sustainable high performance.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## EmailJS Template Variables Reference

### Template 1 (Admin Notification):
- `{{to_email}}` - Admin email address
- `{{to_name}}` - Admin name (usually "Admin")
- `{{user_name}}` - Full name of requester
- `{{user_email}}` - Email of requester
- `{{position}}` - Position/title
- `{{company}}` - Company name
- `{{firm_type}}` - Firm type category
- `{{region}}` - Geographic region
- `{{request_date}}` - Formatted request date/time
- `{{admin_url}}` - Link to admin panel

### Template 2 (User Confirmation):
- `{{to_email}}` - User email address
- `{{to_name}}` - User's full name
- `{{user_name}}` - User's full name
- `{{user_email}}` - User email address
- `{{position}}` - Position/title
- `{{company}}` - Company name
- `{{region}}` - Geographic region
- `{{login_url}}` - Link to login page
- `{{features_url}}` - Link to features section

### Template 3 (Approval/Welcome):
- `{{to_email}}` - User email address
- `{{to_name}}` - User's full name
- `{{user_name}}` - User's full name
- `{{user_email}}` - User email address
- `{{login_url}}` - Link to login page
- `{{dashboard_url}}` - Link to dashboard
- `{{hours_url}}` - Link to hours tracking page
- `{{features_url}}` - Link to features section
- `{{help_url}}` - Link to help/landing page

---

## Testing Checklist

- [ ] Create Template 1 (Admin Notification) in EmailJS
- [ ] Create Template 2 (User Confirmation) in EmailJS
- [ ] Test admin notification email
- [ ] Test user confirmation email
- [ ] Verify all links work correctly
- [ ] Check email rendering on mobile devices
- [ ] Verify email delivery times
- [ ] Test with different email providers (Gmail, Outlook, etc.)

**Optional:**
- [ ] Create Template 3 (Approval/Welcome) if you want welcome emails
- [ ] Test approval/welcome email

---

## Troubleshooting

**Emails not sending?**
- Check browser console for errors
- Verify EmailJS keys are correct in `.env.local`
- Make sure EmailJS script is loaded (check network tab)
- Verify email service is connected in EmailJS dashboard
- Check EmailJS dashboard for delivery status and errors

**Template variables showing as {{variable_name}}?**
- Ensure variable names match exactly (case-sensitive)
- Use double curly braces: `{{variable_name}}`
- Check that variables are being passed in the templateParams object

**Links not working?**
- Verify `window.location.origin` is correct
- Check that URLs are being constructed properly
- Test links in email clients (some may strip or modify links)
