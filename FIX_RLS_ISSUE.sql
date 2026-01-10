-- Fix RLS Policy Issue for Admin Access
-- This fixes the problem where admins can't see access requests
-- Run this in Supabase SQL Editor

-- First, check if your admin user's ID matches their auth.uid()
-- The issue is likely that users.id doesn't match auth.uid()

-- OPTION 1: Update the RLS policy to check by email instead of ID
-- Drop the existing policy
DROP POLICY IF EXISTS "Admins can view all access requests" ON access_requests;
DROP POLICY IF EXISTS "Admins can update access requests" ON access_requests;

-- Create new policy that checks by email (more reliable)
CREATE POLICY "Admins can view all access requests"
ON access_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.email = auth.email() 
    AND users.is_admin = true
  )
);

CREATE POLICY "Admins can update access requests"
ON access_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.email = auth.email() 
    AND users.is_admin = true
  )
);

-- OPTION 2: If Option 1 doesn't work, ensure admin user's ID matches auth.uid()
-- First, find your admin user's auth.uid() from the auth.users table:
-- SELECT id, email FROM auth.users WHERE email = 'alex.f.nash@gmail.com';
-- Then update the users table to match:
-- UPDATE users 
-- SET id = (SELECT id FROM auth.users WHERE email = 'alex.f.nash@gmail.com')
-- WHERE email = 'alex.f.nash@gmail.com';

-- OPTION 3: Temporarily disable RLS for testing (NOT RECOMMENDED FOR PRODUCTION)
-- ALTER TABLE access_requests DISABLE ROW LEVEL SECURITY;

-- Verify the policies are working:
-- SELECT * FROM pg_policies WHERE tablename = 'access_requests';

