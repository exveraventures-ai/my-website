-- ============================================================================
-- AUTO-CONFIRM APPROVED USERS
-- ============================================================================
-- This script automatically confirms users who have been approved by admin
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Step 1: Create function to auto-confirm approved users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Check if user email is in approved users table
  IF EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = NEW.email 
    AND is_approved = true
  ) THEN
    -- Auto-confirm the user (no email confirmation needed)
    NEW.email_confirmed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create trigger to run on new auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- DONE! Now all approved users will be auto-confirmed when they sign up
-- ============================================================================

-- Test: Check if trigger was created successfully
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Should show: on_auth_user_created | INSERT | users | EXECUTE FUNCTION public.handle_new_user()
