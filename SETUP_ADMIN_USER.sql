-- Setup Admin User: alex.f.nash@gmail.com
-- Run this in Supabase SQL Editor after running the main migration

-- First, ensure the user exists (if they've already requested access)
-- If not, create a user record manually or they can request access first

-- Set alex.f.nash@gmail.com as admin and approved
UPDATE users
SET is_admin = true, is_approved = true
WHERE email = 'alex.f.nash@gmail.com';

-- If the user doesn't exist in the users table yet, you may need to:
-- 1. Have them request access first, then run this UPDATE
-- 2. Or manually insert their record:
-- INSERT INTO users (id, email, is_admin, is_approved, created_at)
-- VALUES (gen_random_uuid(), 'alex.f.nash@gmail.com', true, true, NOW())
-- ON CONFLICT (email) DO UPDATE
-- SET is_admin = true, is_approved = true;

-- Verify the admin user was created
SELECT email, is_admin, is_approved, created_at
FROM users
WHERE email = 'alex.f.nash@gmail.com';

