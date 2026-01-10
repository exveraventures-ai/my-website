# Supabase Database Schema Documentation

## Required Tables and Columns

### 1. `users` Table

**Required Columns:**
- `id` (UUID, Primary Key) - User's unique identifier
- `email` (TEXT, Unique) - User's email address
- `first_name` (TEXT) - User's first name
- `last_name` (TEXT) - User's last name
- `position` (TEXT) - User's job position (e.g., "Analyst", "VP")
- `company` (TEXT) - User's company/firm name
- `firm_type` (TEXT) - Type of firm (e.g., "Investment Banking", "PE")
- `region` (TEXT) - Geographic region
- `is_pro` (BOOLEAN, Default: false) - Whether user has Pro subscription
- `is_approved` (BOOLEAN, Default: false) - **CRITICAL**: Whether user's access request has been approved
- `is_admin` (BOOLEAN, Default: false) - **CRITICAL**: Whether user has admin privileges
- `created_at` (TIMESTAMP) - When user record was created
- `default_start_time` (TEXT) - Default work start time (e.g., "09:30")
- `default_end_time` (TEXT) - Default work end time (e.g., "21:30")
- `weekly_target_hours` (INTEGER) - User's weekly target hours

**Indexes:**
- Primary key on `id`
- Unique index on `email`
- Index on `is_approved` for faster filtering
- Index on `is_admin` for faster admin queries

### 2. `access_requests` Table

**Required Columns:**
- `id` (UUID, Primary Key) - Request's unique identifier
- `email` (TEXT, NOT NULL) - Email of requester
- `first_name` (TEXT) - Requester's first name
- `last_name` (TEXT) - Requester's last name
- `position` (TEXT) - Requester's position
- `company` (TEXT) - Requester's company
- `firm_type` (TEXT) - Type of firm
- `region` (TEXT) - Geographic region
- `status` (TEXT, Default: 'pending') - Status: 'pending', 'approved', or 'rejected'
- `created_at` (TIMESTAMP, Default: NOW()) - When request was submitted
- `reviewed_at` (TIMESTAMP) - When request was reviewed (null if pending)
- `reviewed_by` (UUID, Foreign Key → users.id) - Admin who reviewed the request
- `notes` (TEXT) - Optional notes from admin

**Indexes:**
- Primary key on `id`
- Index on `status` for filtering by status
- Index on `email` for checking duplicates

**Constraints:**
- `status` must be one of: 'pending', 'approved', 'rejected'

### 3. `work_logs` Table (if not already exists)

**Required Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `date` (DATE) - Date of work log
- `hours` (DECIMAL) - Hours worked
- `start_time` (TEXT) - Start time (e.g., "09:30")
- `end_time` (TEXT) - End time (e.g., "21:30")
- `deal_nickname` (TEXT, Optional) - Deal/project name
- `created_at` (TIMESTAMP) - When log was created
- `updated_at` (TIMESTAMP) - When log was last updated

**Indexes:**
- Primary key on `id`
- Index on `user_id` for faster user queries
- Index on `date` for date range queries
- Composite index on `(user_id, date)` for user-specific date queries

## Row Level Security (RLS) Policies

### `users` Table Policies

1. **Approved users can view own profile:**
   ```sql
   CREATE POLICY "Approved users can view own profile"
   ON users FOR SELECT
   TO authenticated
   USING (
     (id = auth.uid() AND is_approved = true) OR
     (is_admin = true)
   );
   ```

2. **Approved users can update own profile:**
   ```sql
   CREATE POLICY "Approved users can update own profile"
   ON users FOR UPDATE
   TO authenticated
   USING (
     (id = auth.uid() AND is_approved = true) OR
     (is_admin = true)
   );
   ```

### `access_requests` Table Policies

1. **Anyone can request access (insert):**
   ```sql
   CREATE POLICY "Anyone can request access"
   ON access_requests FOR INSERT
   TO anon
   WITH CHECK (true);
   ```

2. **Only admins can view all requests:**
   ```sql
   CREATE POLICY "Admins can view all access requests"
   ON access_requests FOR SELECT
   TO authenticated
   USING (
     EXISTS (
       SELECT 1 FROM users 
       WHERE users.id = auth.uid() 
       AND users.is_admin = true
     )
   );
   ```

3. **Only admins can update requests:**
   ```sql
   CREATE POLICY "Admins can update access requests"
   ON access_requests FOR UPDATE
   TO authenticated
   USING (
     EXISTS (
       SELECT 1 FROM users 
       WHERE users.id = auth.uid() 
       AND users.is_admin = true
     )
   );
   ```

## Critical Fields for Access Control

### For Users:
- **`is_approved`**: Must be `true` for user to access protected pages
- **`is_admin`**: Must be `true` for user to access `/admin` page

### For Access Requests:
- **`status`**: Tracks approval state ('pending', 'approved', 'rejected')
- **`reviewed_by`**: Tracks which admin reviewed the request
- **`reviewed_at`**: Timestamp of review

## Admin Workflow

When an admin approves a request:
1. Update `access_requests.status` to 'approved'
2. Set `access_requests.reviewed_by` to admin's user ID
3. Set `access_requests.reviewed_at` to current timestamp
4. Create or update `users` record with:
   - `email` from request
   - `is_approved = true`
   - Profile data from request
5. Create Supabase Auth account for user (via admin panel or manually)
6. Link `users.id` to auth.uid()

## Setup Checklist

- [ ] Run `migration_add_access_control.sql`
- [ ] Verify `users` table has `is_approved` and `is_admin` columns
- [ ] Verify `access_requests` table exists with all required columns
- [ ] Set up RLS policies on both tables
- [ ] Run `SETUP_ADMIN_USER.sql` to set alex.f.nash@gmail.com as admin
- [ ] Verify admin user can access `/admin` page
- [ ] Test access request flow
- [ ] Test approval flow

