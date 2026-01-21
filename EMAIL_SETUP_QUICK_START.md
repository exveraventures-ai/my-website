# Email Setup - Quick Start Guide

## The Fixed Authentication Flow

### What Changed:
The authentication flow has been updated to properly handle user onboarding. Now when you approve a user, they receive an email with clear instructions on how to set up their password using Supabase's built-in password reset flow.

---

## Minimal Setup (1 Email Template)

You only need **ONE email template** for the system to work:

### Required: Template 2 - Approval/Welcome Email

This is the critical email that tells approved users how to set up their password.

**Steps:**

1. **Create Template in EmailJS**:
   - Template Name: `access_approved`
   - Subject: `🎉 Your Burnout IQ access has been approved!`
   - Copy the HTML from `EMAIL_TEMPLATES.md` → Template 3

2. **Add to `.env.local`**:
   ```bash
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
   NEXT_PUBLIC_EMAILJS_TEMPLATE_APPROVAL_ID=your_template_id
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
   ```

3. **Done!** The flow now works.

---

## How Users Get Set Up (Complete Flow)

### Step 1: User Requests Access
- User fills out form at `/request-access`
- Profile created with `status: 'pending'` in `access_requests` table
- (Optional: Confirmation email sent if you set up Template 3)

### Step 2: You Approve the Request
- Go to `/admin` panel
- Click "Approve" on the pending request
- System does 3 things:
  1. ✅ Creates user profile in `users` table
  2. ✅ Marks request as approved
  3. ✅ **Sends approval email (Template 2)**

### Step 3: User Sets Up Password
User receives the approval email with these instructions:
1. Click "Go to Login Page" button
2. Click "Forgot your password?"
3. Enter their email
4. Supabase sends password reset email
5. User sets password
6. User logs in successfully! 🎉

---

## Why This Works

**Before (Broken Flow):**
- Admin approves → Creates profile BUT no auth account
- User tries to log in → Can't because no credentials exist
- User stuck ❌

**After (Fixed Flow):**
- Admin approves → Creates profile + Sends instructions
- User follows "Forgot Password" flow → Creates auth account
- Supabase sends password reset link → User sets password
- User logs in successfully ✅

---

## Optional: Add More Templates

### Template 1: Admin Notification (Nice to Have)
Get notified when someone requests access.

```bash
NEXT_PUBLIC_EMAILJS_TEMPLATE_ADMIN_NOTIFICATION_ID=your_template_id
NEXT_PUBLIC_ADMIN_EMAIL=alex.f.nash@gmail.com
```

### Template 3: User Confirmation (Optional)
Send a "we received your request" email to users.

```bash
NEXT_PUBLIC_EMAILJS_TEMPLATE_REQUEST_ID=your_template_id
```

---

## Testing The Flow

### Test as a New User:

1. **Request Access**:
   - Go to `/request-access`
   - Fill out form with a test email
   - Submit

2. **Approve as Admin**:
   - Log in as admin
   - Go to `/admin`
   - Click "Approve" on your test request
   - Check the test email inbox for approval email

3. **Set Up Password**:
   - Open the approval email
   - Click "Go to Login Page"
   - Click "Forgot your password?"
   - Enter the test email
   - Check email for Supabase password reset link
   - Set password
   - Log in with new credentials

4. **Success!** ✅
   - You should now be logged in
   - You can access the dashboard, hours tracking, etc.

---

## Troubleshooting

### Users not receiving approval email?
- Check EmailJS dashboard for delivery status
- Verify `NEXT_PUBLIC_EMAILJS_TEMPLATE_APPROVAL_ID` is correct
- Check browser console for errors when approving

### Users can't set password?
- Make sure they're using the "Forgot Password" link on login page
- Verify Supabase email settings are enabled
- Check Supabase dashboard → Authentication → Email Templates
- Ensure "Confirm email" is disabled or users confirm first

### Profile exists but can't log in?
- User needs to complete password reset flow
- They must have an entry in both:
  - `auth.users` table (created by password reset)
  - `public.users` table (created by admin approval)

---

## Current Setup Status

Based on your configuration:

- ✅ EmailJS loaded in app layout
- ✅ Email service functions created
- ✅ Admin approval flow updated
- ✅ Approval email includes password setup instructions
- ⚠️ Need to configure Template 2 (Approval) in EmailJS
- ⚠️ Need to add email environment variables

Once you add the template and env vars, the system is fully operational!
