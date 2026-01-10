# Simple Step-by-Step Setup Guide

## Step 1: Set Up Database (5 minutes)

1. **Go to your Supabase Dashboard**
   - Open https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration**
   - Copy and paste the entire contents of `migration_add_access_control.sql`
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - You should see "Success. No rows returned"

4. **Set Yourself as Admin**
   - In the same SQL Editor, copy and paste this:
   ```sql
   UPDATE users
   SET is_admin = true, is_approved = true
   WHERE email = 'alex.f.nash@gmail.com';
   ```
   - Click "Run"
   - If you get an error saying the user doesn't exist, that's okay - you'll create it in Step 2

---

## Step 2: Test Request Access (2 minutes)

1. **Start Your Local Server**
   ```bash
   npm run dev
   ```

2. **Open in Browser**
   - Go to http://localhost:3000
   - Click "Request Access"

3. **Submit Test Request**
   - Fill out the form (NO PASSWORD NEEDED)
   - Use a test email like `test@example.com`
   - Click "Submit Access Request"

---

## Step 3: Test Admin Panel (3 minutes)

1. **Make Sure You're Set as Admin**
   - If you already have an account with alex.f.nash@gmail.com:
     - Log in normally
     - You should be redirected to `/admin` page
   
   - If you don't have an account yet:
     - First request access with alex.f.nash@gmail.com (Step 2)
     - Then in Supabase Dashboard → Table Editor → `users` table
     - Find your user row
     - Set `is_admin = true` and `is_approved = true`
     - Now log in → should go to `/admin`

2. **Test Admin Panel**
   - You should see your test request from Step 2
   - Click "Approve" on the test request
   - The request status should change to "approved"

---

## Step 4: Verify New User Has 0 Hours (2 minutes)

1. **Create Test User Account** (if needed)
   - The approved user from Step 3 needs an auth account
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Add user" → Enter the email → Set a temporary password
   - OR use the "Invite" feature to send them an invite email

2. **Log in as Test User**
   - Log out of admin account
   - Log in with the test user email
   - Go to `/hours` page

3. **Verify Display**
   - Should see `0 hrs` (not 84 hours) for all metrics
   - L7D Total: 0 hrs
   - L7D Daily Avg: 0 hrs
   - Historical Avg: 0 hrs

---

## Step 5: Set Up Email Notifications (Optional - 10 minutes)

Choose ONE option:

### Option A: Quick Setup with EmailJS (Easiest)

1. **Sign up at EmailJS**
   - Go to https://www.emailjs.com
   - Create free account (200 emails/month free)

2. **Create Email Service**
   - Dashboard → Add New Service → EmailJS
   - Connect your email (Gmail, Outlook, etc.)

3. **Create Email Template**
   - Templates → Create New Template
   - Use this template:
   ```
   Subject: New Access Request - {{user_name}}
   
   Hi Alex,
   
   New access request received:
   
   Name: {{user_name}}
   Email: {{user_email}}
   Position: {{position}}
   Company: {{company}}
   Region: {{region}}
   
   Review at: https://your-domain.com/admin
   ```
   - Set "To Email" as: alex.f.nash@gmail.com

4. **Get Your Keys**
   - Settings → API Keys
   - Copy: Service ID, Template ID, Public Key

5. **Add to Request Access Page** (I can help with this if needed)
   - Install: `npm install @emailjs/browser`
   - Add email sending code to form submission

### Option B: Use Zapier (No Coding)

1. **Sign up at Zapier.com**
   - Create free account

2. **Create New Zap**
   - Trigger: "Supabase" → "New Row"
   - Action: "Email" → "Send Outbound Email"

3. **Connect Supabase**
   - Table: `access_requests`
   - Event: Row Created

4. **Set Up Email**
   - To: alex.f.nash@gmail.com
   - Subject: New Access Request
   - Body: Include all fields from request

---

## Step 6: Verify Everything Works (3 minutes)

✅ **Checklist:**
- [ ] Can request access without password
- [ ] Admin panel accessible when logged in as admin
- [ ] Can approve/reject requests
- [ ] New users see 0 hours (not 84)
- [ ] Admin menu appears in profile dropdown (👑 Admin Panel)
- [ ] Email notifications working (if set up)

---

## Troubleshooting

**"I can't access /admin page"**
→ Make sure `is_admin = true` in Supabase `users` table

**"New users can't log in"**
→ You need to create their auth account in Supabase Dashboard → Authentication

**"Still seeing 84 hours"**
→ Clear browser cache and reload the page

**"Admin menu not showing"**
→ Make sure you're logged in and `userProfile.is_admin` is true

---

## That's It! 🎉

Once you complete Steps 1-4, your system is functional. Step 5 (email notifications) is optional but recommended.

If you get stuck on any step, let me know which step and I'll help!

