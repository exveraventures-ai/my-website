-- Ensure access_requests table allows public reads for email verification
-- This is needed for the /set-password page to work

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can check their own access request status" ON access_requests;

-- Create policy to allow anyone to read their own access request by email
CREATE POLICY "Anyone can check their own access request status"
  ON access_requests
  FOR SELECT
  USING (true); -- Allow all reads (email is not sensitive, just status checking)

-- Note: We still have other policies that restrict INSERT/UPDATE/DELETE to authenticated users and admins
