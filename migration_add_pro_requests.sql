-- Create pro_requests table
CREATE TABLE IF NOT EXISTS pro_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  company text,
  position text,
  status text DEFAULT 'pending', -- pending, approved, rejected
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES users(id)
);

-- Enable RLS
ALTER TABLE pro_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own pro requests
CREATE POLICY "Users can view own pro requests"
  ON pro_requests
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM users WHERE email = pro_requests.email));

-- Policy: Users can create their own pro requests
CREATE POLICY "Users can create own pro requests"
  ON pro_requests
  FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE email = pro_requests.email));

-- Policy: Admins can view all pro requests
CREATE POLICY "Admins can view all pro requests"
  ON pro_requests
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

-- Policy: Admins can update all pro requests
CREATE POLICY "Admins can update all pro requests"
  ON pro_requests
  FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

-- Policy: Admins can delete all pro requests
CREATE POLICY "Admins can delete all pro requests"
  ON pro_requests
  FOR DELETE
  USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

-- Create index for faster lookups
CREATE INDEX idx_pro_requests_user_id ON pro_requests(user_id);
CREATE INDEX idx_pro_requests_email ON pro_requests(email);
CREATE INDEX idx_pro_requests_status ON pro_requests(status);
