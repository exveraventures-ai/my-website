# Testing Guide - Access Control System & Updates

## Pre-Testing Setup

### 1. Run Database Migration
Before testing, you need to run the SQL migration in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migration script: `migration_add_access_control.sql`
4. This will:
   - Add `is_approved` and `is_admin` columns to `users` table
   - Create `access_requests` table
   - Set up Row Level Security policies

### 2. Create Your Admin User
After running the migration, create your admin account:

**Option A: Via Supabase SQL Editor**
```sql
-- Replace with your email
UPDATE users 
SET is_admin = true, is_approved = true 
WHERE email = 'your-email@domain.com';

-- If user doesn't exist yet, first sign up through /request-access, then run the UPDATE
```

**Option B: Direct Database Update**
- Go to Supabase Dashboard → Table Editor → `users`
- Find your user or create one
- Set `is_admin = true` and `is_approved = true`

## Testing Checklist

### ✅ Test 1: Landing Page (Public Access)
- [ ] Visit `http://localhost:3000`
- [ ] Verify you can see the landing page without logging in
- [ ] Check that "Request Access" buttons are visible (not "Sign Up")
- [ ] Verify all text shows "Burnout IQ" (not "WorkWell")
- [ ] Check that accent colors are blue (#4F46E5) not red

### ✅ Test 2: Request Access Flow
- [ ] Click "Request Access" from landing page
- [ ] Fill out the form:
  - Email (must be unique)
  - Password
  - First Name, Last Name
  - Position, Company, Region
- [ ] Submit the form
- [ ] Should see success message
- [ ] Check Supabase `access_requests` table - new entry with status='pending'
- [ ] Try to log in immediately - should be blocked with "pending approval" message

### ✅ Test 3: Admin Panel
- [ ] Log in with your admin account
- [ ] Should be automatically redirected to `/admin`
- [ ] Verify you can see:
  - Statistics cards (Pending, Approved, Rejected, Total)
  - Filter tabs (All, Pending, Approved, Rejected)
  - Request cards showing user information
- [ ] Click on a pending request
- [ ] Click "Approve" button
- [ ] Verify:
  - Request status changes to "approved"
  - User's `is_approved` field is set to `true` in `users` table
  - User profile is created/updated with form data

### ✅ Test 4: Approved User Access
- [ ] Log out from admin account
- [ ] Log in with an approved user account
- [ ] Should be redirected to `/dashboard`
- [ ] Verify access to:
  - Dashboard ✅
  - Working Hours ✅
  - Compare ✅
  - Profile ✅
  - Settings ✅
- [ ] Verify all pages load correctly

### ✅ Test 5: Pending User Access
- [ ] Log out
- [ ] Log in with a pending user (not approved)
- [ ] Should see message: "⚠️ Your account is pending approval..."
- [ ] Should be signed out automatically
- [ ] Cannot access any protected pages

### ✅ Test 6: Color Changes (Blue Accents)
Check all pages for blue (#4F46E5) instead of red:
- [ ] Landing page buttons and links
- [ ] Login page submit button
- [ ] Request Access form button
- [ ] Dashboard buttons and accents
- [ ] Hours page buttons
- [ ] Profile page buttons
- [ ] Settings page buttons
- [ ] Upgrade page buttons
- [ ] Chart bars and data visualizations
- [ ] Navigation highlights

### ✅ Test 7: Hours Page - Burnout Risk Assessment
- [ ] Navigate to `/hours` page
- [ ] Find "Burnout Risk Assessment" section
- [ ] **Verify section is COLLAPSED by default** (should show ▼ arrow)
- [ ] Click to expand the section
- [ ] If you're NOT a pro user:
  - Should see clean "Pro Feature" message (no overlapping text)
  - Should see upgrade button in blue
  - Should NOT see content behind the overlay
- [ ] If you ARE a pro user:
  - Should see all burnout risk metrics
  - Should see risk score and recommendations

### ✅ Test 8: WorkWell Removal
Search the entire site for any "WorkWell" references:
- [ ] Landing page header/footer
- [ ] Privacy page
- [ ] Terms page
- [ ] Science page
- [ ] Footer component
- [ ] All should show "Burnout IQ" instead

## Expected Behavior Summary

### Unauthenticated Users:
- ✅ Can view landing page
- ✅ Can request access
- ❌ Cannot access any other pages

### Pending Users (Authenticated but not approved):
- ✅ Can log in (auth succeeds)
- ❌ Immediately signed out with pending message
- ❌ Cannot access any protected pages

### Approved Users:
- ✅ Can log in and access all features
- ✅ Full access to dashboard, hours, compare, profile, settings

### Admin Users:
- ✅ Can log in
- ✅ Automatically redirected to `/admin`
- ✅ Can view and approve/reject access requests
- ✅ Can access all regular user features too

## Troubleshooting

### Issue: Can't log in as admin
**Solution:** Verify in Supabase that your user has both `is_admin = true` AND `is_approved = true`

### Issue: Users can't request access
**Solution:** Check RLS policies in Supabase - the "Anyone can request access" policy should allow INSERT for `anon` role

### Issue: Admin can't see access requests
**Solution:** Verify the RLS policy "Admins can view all access requests" is active and your user's `is_admin = true`

### Issue: Approved users still can't access pages
**Solution:** 
1. Clear browser localStorage: `localStorage.removeItem('burnoutiQ_user_id')`
2. Check `users.is_approved = true` in Supabase
3. Log out and log back in

### Issue: Hours page overlay still overlapping
**Solution:** 
1. Verify `burnoutSectionCollapsed` defaults to `true` in code
2. Clear browser cache and reload
3. Check browser console for JavaScript errors

## Quick Test Commands

```bash
# Start dev server (already running)
npm run dev

# Check for linter errors
npm run lint

# Build for production (test build)
npm run build
```

## Next Steps After Testing

1. ✅ Fix any issues found
2. ✅ Test on different browsers (Chrome, Firefox, Safari)
3. ✅ Test on mobile devices
4. ✅ Deploy to staging/production
5. ✅ Set up first admin user in production

