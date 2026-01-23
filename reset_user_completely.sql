-- ============================================================================
-- COMPLETELY RESET A USER (for testing)
-- ============================================================================
-- Use this when a user is stuck and you need to start fresh
-- Replace 'alexnash99@gmail.com' with the actual email
-- ============================================================================

-- Step 1: Delete the auth user (this removes the broken password)
DELETE FROM auth.users WHERE email = 'alexnash99@gmail.com';

-- Step 2: Check that the user profile still exists in users table
-- (This should still be there from when admin approved them)
SELECT * FROM users WHERE email = 'alexnash99@gmail.com';

-- Step 3: Check that access_request is still approved
SELECT * FROM access_requests WHERE email = 'alexnash99@gmail.com';

-- ============================================================================
-- NOW: Go to /set-password and set a NEW password
-- The trigger will auto-confirm them if you ran auto_confirm_approved_users.sql
-- ============================================================================

-- Step 4 (AFTER setting password): Verify the new auth user was created
SELECT 
  email, 
  email_confirmed_at, 
  confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'alexnash99@gmail.com';

-- If email_confirmed_at is NULL, manually confirm:
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'alexnash99@gmail.com';
