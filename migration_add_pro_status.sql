-- Migration: Add pro status column to users table
-- Run this in your Supabase SQL Editor

-- Add is_pro column with default false
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false;

-- Update existing users to false (all start as free)
UPDATE users
SET is_pro = false
WHERE is_pro IS NULL;



