import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: 'initiator' | 'supervisor' | 'admin';
  department: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface UpdateRequest {
  id: string;
  customer_name: string;
  account_number: string;
  update_type: 'personal_info' | 'contact_info' | 'address' | 'employment';
  fields_to_update: Record<string, any>;
  customer_instruction: string;
  initiator_id: string;
  assigned_supervisor_id?: string;
  status: 'draft' | 'pending' | 'in_review' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  review_notes?: string;
  rejection_reason?: string;
  attachments: string[];
  created_at: string;
  updated_at: string;
  // Joined fields
  initiator?: User;
  assigned_supervisor?: User;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, any>;
  created_at: string;
  user?: User;
}

// Auth helper functions
export const signInWithPassword = async (username: string, password: string) => {
  // For demo purposes, we'll simulate authentication
  // In production, you would use Supabase Auth
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('status', 'active');
    //.single();

  if (error || !user) {
    throw new Error('Invalid credentials');
  }

  // Update last login
  await supabase
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', user.id);

  return user;
};

export const signOut = async () => {
  // Clear any local session data
  localStorage.removeItem('haab-user');
};

// Audit logging
export const createAuditLog = async (
  userId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  details: Record<string, any> = {}
) => {
  try {
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details
      });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};