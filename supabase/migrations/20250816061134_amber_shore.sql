/*
  # Seed Initial Data for H.A.A-B Workflow System

  1. Initial Users
    - Create demo users for each role
    - Set up proper authentication data

  2. Sample Update Requests
    - Create sample requests for demonstration
    - Show different statuses and priorities
*/

-- Insert demo users
INSERT INTO users (id, username, full_name, email, role, department, status, last_login) VALUES
  ('11111111-1111-1111-1111-111111111111', 'john.doe', 'John Doe', 'john.doe@haab.com', 'initiator', 'Customer Service', 'active', now()),
  ('22222222-2222-2222-2222-222222222222', 'sarah.manager', 'Sarah Manager', 'sarah.manager@haab.com', 'supervisor', 'Operations', 'active', now() - interval '2 hours'),
  ('33333333-3333-3333-3333-333333333333', 'admin.user', 'Admin User', 'admin@haab.com', 'admin', 'IT', 'active', now()),
  ('44444444-4444-4444-4444-444444444444', 'jane.smith', 'Jane Smith', 'jane.smith@haab.com', 'initiator', 'Customer Service', 'inactive', null),
  ('55555555-5555-5555-5555-555555555555', 'mike.supervisor', 'Mike Supervisor', 'mike.supervisor@haab.com', 'supervisor', 'Operations', 'active', now() - interval '1 day');

-- Insert sample update requests
INSERT INTO update_requests (
  id, customer_name, account_number, update_type, fields_to_update, 
  customer_instruction, initiator_id, assigned_supervisor_id, 
  status, priority, created_at, updated_at
) VALUES
  (
    'REQ-001',
    'Alice Johnson',
    '1234567890',
    'contact_info',
    '{"email": "alice.new@email.com", "phone": "+1-555-0123"}',
    'Please update my email and phone number as per the attached form.',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'pending',
    'medium',
    now() - interval '2 hours',
    now() - interval '2 hours'
  ),
  (
    'REQ-002',
    'Bob Smith',
    '0987654321',
    'address',
    '{"street": "123 New Street", "city": "New City", "zipCode": "12345"}',
    'Customer has moved to new address. Please update all records.',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'in_review',
    'high',
    now() - interval '1 day',
    now() - interval '30 minutes'
  ),
  (
    'REQ-003',
    'Carol Davis',
    '1122334455',
    'personal_info',
    '{"firstName": "Caroline", "lastName": "Davis-Wilson"}',
    'Name change due to marriage. Please update first name and add hyphenated last name.',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'approved',
    'low',
    now() - interval '3 days',
    now() - interval '1 day'
  ),
  (
    'REQ-004',
    'David Wilson',
    '5566778899',
    'employment',
    '{"employer": "Tech Corp Inc", "jobTitle": "Senior Developer", "annualIncome": "95000"}',
    'Employment update - new job with higher salary.',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'rejected',
    'medium',
    now() - interval '2 days',
    now() - interval '1 day'
  );

-- Update the rejected request with rejection reason
UPDATE update_requests 
SET rejection_reason = 'Insufficient documentation provided. Please submit employment verification letter and recent pay stub.'
WHERE id = 'REQ-004';

-- Update the approved request with review notes
UPDATE update_requests 
SET review_notes = 'Verified against marriage certificate. All documentation is in order.'
WHERE id = 'REQ-003';

-- Insert some audit log entries
INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Request Approved', 'update_request', 'REQ-003', '{"customer_name": "Carol Davis", "update_type": "personal_info"}'),
  ('22222222-2222-2222-2222-222222222222', 'Request Rejected', 'update_request', 'REQ-004', '{"customer_name": "David Wilson", "reason": "Insufficient documentation"}'),
  ('22222222-2222-2222-2222-222222222222', 'Review Started', 'update_request', 'REQ-002', '{"customer_name": "Bob Smith", "update_type": "address"}'),
  ('11111111-1111-1111-1111-111111111111', 'Request Created', 'update_request', 'REQ-001', '{"customer_name": "Alice Johnson", "update_type": "contact_info"}'),
  ('33333333-3333-3333-3333-333333333333', 'User Login', 'user', '33333333-3333-3333-3333-333333333333', '{"login_time": "2024-01-15T10:30:00Z"}');