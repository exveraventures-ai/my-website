-- Test Script: Set current user to Pro
-- Replace 'YOUR_EMAIL@example.com' with your actual email address

-- Set specific user to Pro by email
UPDATE users
SET is_pro = true
WHERE email = 'YOUR_EMAIL@example.com';

-- Verify the update (optional - check the result)
SELECT id, email, is_pro
FROM users
WHERE email = 'YOUR_EMAIL@example.com';

-- To set back to non-Pro (for testing):
-- UPDATE users
-- SET is_pro = false
-- WHERE email = 'YOUR_EMAIL@example.com';


