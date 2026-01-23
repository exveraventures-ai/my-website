# Disable Email Confirmation in Supabase

The `/set-password` page might require users to confirm their email before they can log in. This is a Supabase setting.

## Fix: Disable Email Confirmation

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. Find **"Confirm email"** setting
4. **Uncheck** "Confirm email"
5. Click **Save**

## Alternative: Use Auto-Confirm

If you want to keep email confirmation enabled for security but auto-confirm approved users, you can use a Supabase Database Function:

```sql
-- Run this in Supabase SQL Editor
-- This function auto-confirms users who have been approved by admin

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Check if user email is in approved users table
  IF EXISTS (
    SELECT 1 FROM users 
    WHERE email = NEW.email 
    AND is_approved = true
  ) THEN
    -- Auto-confirm the user
    NEW.email_confirmed_at = NOW();
    NEW.confirmed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run on new auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Check Current Settings

Run this SQL to see if a user needs confirmation:

```sql
-- Check auth user status
SELECT 
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
WHERE email = 'user@example.com';
```

If `email_confirmed_at` or `confirmed_at` is NULL, the user needs to confirm their email.

## Manual Confirmation (Quick Fix)

If you need to manually confirm a user right now:

```sql
-- Replace with the actual email
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = 'alexnash99@gmail.com';
```
