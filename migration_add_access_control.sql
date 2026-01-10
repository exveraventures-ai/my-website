-- Migration: Add access control system
-- Run this in your Supabase SQL Editor

-- 1. Add approval status to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Update existing users to be approved (if you want to keep current users)
-- UPDATE users SET is_approved = true WHERE is_approved IS NULL;

-- 2. Create access_requests table
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  position TEXT,
  company TEXT,
  firm_type TEXT,
  region TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  notes TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_email ON access_requests(email);

-- 3. Add RLS policies for access_requests
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (request access)
CREATE POLICY "Anyone can request access"
ON access_requests
FOR INSERT
TO anon
WITH CHECK (true);

-- Only admins can view all requests
CREATE POLICY "Admins can view all access requests"
ON access_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  )
);

-- Only admins can update requests (approve/reject)
CREATE POLICY "Admins can update access requests"
ON access_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  )
);

-- 4. Update RLS on users table to only allow approved users to see their own data
-- (You may need to adjust existing policies)

-- Allow users to see only their own profile if approved
CREATE POLICY "Approved users can view own profile"
ON users
FOR SELECT
TO authenticated
USING (
  (id = auth.uid() AND is_approved = true) OR
  (is_admin = true)
);

-- Allow users to update only their own profile if approved
CREATE POLICY "Approved users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (
  (id = auth.uid() AND is_approved = true) OR
  (is_admin = true)
);

-- Note: You'll need to create an admin user manually or via Supabase dashboard
-- Example: UPDATE users SET is_admin = true, is_approved = true WHERE email = 'admin@yourdomain.com';

