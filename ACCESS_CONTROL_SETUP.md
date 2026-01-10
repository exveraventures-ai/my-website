# Access Control System Setup Guide

## Overview

The application now requires admin approval before users can access the platform. Users can only view the landing page until they're approved.

## Database Setup

Run the SQL migration file in your Supabase SQL Editor:

```bash
migration_add_access_control.sql
```

This will:
1. Add `is_approved` and `is_admin` columns to the `users` table
2. Create the `access_requests` table
3. Set up Row Level Security (RLS) policies

## Creating Your First Admin User

After running the migration, create your first admin user:

```sql
-- Replace 'your-admin-email@domain.com' with your email
UPDATE users 
SET is_admin = true, is_approved = true 
WHERE email = 'your-admin-email@domain.com';

-- If the user doesn't exist yet, you'll need to:
-- 1. Sign up through the request-access page with your email
-- 2. Then run the UPDATE query above in Supabase SQL Editor
```

## User Flow

### For New Users:
1. Visit landing page (accessible to everyone)
2. Click "Request Access"
3. Fill out profile form (email, password, name, position, company, region)
4. Submit request → Creates auth account and access request
5. Wait for admin approval
6. Once approved, can log in and access the platform

### For Admins:
1. Log in with admin account
2. Automatically redirected to `/admin` page
3. View all access requests (pending, approved, rejected)
4. Approve or reject requests
5. When approving, the user's profile is created/updated with `is_approved = true`

### For Approved Users:
1. Log in normally
2. Redirected to dashboard
3. Can access all features

### For Pending Users:
1. Try to log in
2. See message: "Your account is pending approval"
3. Signed out automatically
4. Must wait for admin approval

## Protected Pages

All pages except these are protected and require approval:
- `/` (landing page)
- `/landing` (landing page alternative)
- `/request-access` (access request form)
- `/login` (login page)
- `/privacy`, `/terms` (if they exist)

Protected pages that check for approval:
- `/dashboard`
- `/hours`
- `/compare`
- `/profile`
- `/settings`
- `/upgrade`
- `/health`
- `/admin` (requires `is_admin = true`)

## Access Request Data

When users request access, the following information is collected:
- Email (used for auth)
- Password (for auth account)
- First Name
- Last Name
- Position (Analyst, Associate, VP, etc.)
- Company/Firm (from predefined list)
- Firm Type (auto-populated based on company)
- Region

All this data is visible to admins in the admin panel.

## Admin Panel Features

The `/admin` page shows:
- Statistics: Pending, Approved, Rejected, Total counts
- Filter tabs: All, Pending, Approved, Rejected
- Request cards with all user information
- Approve/Reject buttons (for pending requests)
- Request timestamps
- Review timestamps

## Row Level Security (RLS)

RLS policies ensure:
- Anyone can create access requests (anon users)
- Only admins can view/update access requests
- Approved users can only see their own profile
- Admins can see all profiles

## Troubleshooting

### User can't log in after being approved
- Check that `users.is_approved = true` in Supabase
- Clear browser localStorage: `localStorage.removeItem('burnoutiQ_user_id')`
- Try logging in again

### Admin can't access admin panel
- Verify `users.is_admin = true` in Supabase
- Check that `users.is_approved = true` (admins also need approval)
- Clear localStorage and log in again

### Access requests not showing in admin panel
- Verify you're logged in as an admin
- Check RLS policies are correctly set
- Verify the `access_requests` table exists and has data

## Security Notes

- Access requests are stored even after approval/rejection (for audit trail)
- Rejected users' auth accounts still exist but they can't log in (will see pending message)
- Admins can re-approve rejected requests if needed
- Password is NOT stored in access_requests (only in Supabase Auth)

