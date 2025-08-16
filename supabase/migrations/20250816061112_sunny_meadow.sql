/*
  # H.A.A-B Workflow System Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `full_name` (text)
      - `email` (text, unique)
      - `role` (enum: initiator, supervisor, admin)
      - `department` (text)
      - `status` (enum: active, inactive)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `last_login` (timestamp)

    - `update_requests`
      - `id` (text, primary key)
      - `customer_name` (text)
      - `account_number` (text)
      - `update_type` (enum: personal_info, contact_info, address, employment)
      - `fields_to_update` (jsonb)
      - `customer_instruction` (text)
      - `initiator_id` (uuid, foreign key)
      - `assigned_supervisor_id` (uuid, foreign key)
      - `status` (enum: draft, pending, in_review, approved, rejected)
      - `priority` (enum: low, medium, high)
      - `review_notes` (text)
      - `rejection_reason` (text)
      - `attachments` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `audit_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `action` (text)
      - `resource_type` (text)
      - `resource_id` (text)
      - `details` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Users can only see their own data or data they're authorized to access
    - Supervisors can see requests assigned to them
    - Admins can see all data
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('initiator', 'supervisor', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE update_type AS ENUM ('personal_info', 'contact_info', 'address', 'employment');
CREATE TYPE request_status AS ENUM ('draft', 'pending', 'in_review', 'approved', 'rejected');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'initiator',
  department text NOT NULL,
  status user_status NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Update requests table
CREATE TABLE IF NOT EXISTS update_requests (
  id text PRIMARY KEY,
  customer_name text NOT NULL,
  account_number text NOT NULL,
  update_type update_type NOT NULL,
  fields_to_update jsonb NOT NULL DEFAULT '{}',
  customer_instruction text NOT NULL,
  initiator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_supervisor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status request_status NOT NULL DEFAULT 'draft',
  priority priority_level NOT NULL DEFAULT 'medium',
  review_notes text,
  rejection_reason text,
  attachments text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update requests policies
CREATE POLICY "Initiators can read own requests"
  ON update_requests
  FOR SELECT
  TO authenticated
  USING (initiator_id = auth.uid());

CREATE POLICY "Supervisors can read assigned requests"
  ON update_requests
  FOR SELECT
  TO authenticated
  USING (assigned_supervisor_id = auth.uid());

CREATE POLICY "Admins can read all requests"
  ON update_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Initiators can create requests"
  ON update_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (initiator_id = auth.uid());

CREATE POLICY "Initiators can update own draft requests"
  ON update_requests
  FOR UPDATE
  TO authenticated
  USING (initiator_id = auth.uid() AND status = 'draft');

CREATE POLICY "Supervisors can update assigned requests"
  ON update_requests
  FOR UPDATE
  TO authenticated
  USING (assigned_supervisor_id = auth.uid());

CREATE POLICY "Admins can manage all requests"
  ON update_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Audit logs policies
CREATE POLICY "Users can read own audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "All authenticated users can create audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_update_requests_initiator ON update_requests(initiator_id);
CREATE INDEX IF NOT EXISTS idx_update_requests_supervisor ON update_requests(assigned_supervisor_id);
CREATE INDEX IF NOT EXISTS idx_update_requests_status ON update_requests(status);
CREATE INDEX IF NOT EXISTS idx_update_requests_created_at ON update_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON update_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();