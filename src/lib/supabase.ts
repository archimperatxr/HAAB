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

/**
 * Signs a user in using Supabase's built-in authentication.
 * This is a secure alternative to the previous demo function.
 * @param username The user's username (treated as the email address).
 * @param password The user's password.
 * @returns A promise that resolves with the User object on success.
 * @throws An error if the sign-in fails.
 */
/**
 * Signs a user in using Supabase's built-in authentication.
 * This is a secure alternative to the previous demo function.
 * @param username The user's username (treated as the email address).
 * @param password The user's password.
 * @returns A promise that resolves with the User object on success.
 * @throws An error if the sign-in fails.
 */
export const signInWithPassword = async (username: string, password: string) => {
  // Use Supabase's native authentication method.
  // NOTE: Supabase Auth uses 'email' as the primary identifier.
  // We'll map the 'username' field to 'email' here.
  const { data, error } = await supabase.auth.signInWithPassword({
    email: username,
    password: password,
  });

  if (error) {
    // Supabase returns specific error messages that are more secure
    // than exposing internal details. We can re-throw this.
    throw new Error(error.message);
  }

  // Debugging: Log the access token to inspect its claims
  if (data.session) {
    console.log("Access Token:", data.session.access_token);
  }

  // The 'user' object from auth is slightly different from our custom User interface.
  // We'll need to fetch the user details from our public 'users' table
  // to get their full_name, role, etc.
  if (data.user) {
    const { data: userDetails, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError || !userDetails) {
      throw new Error('Failed to retrieve user details.');
    }

    return userDetails;
  }

  // Fallback in case the user object is not available
  throw new Error('Login failed: User object not found.');
};
/**
 * Signs the currently authenticated user out.
 * @returns A promise that resolves when the sign-out is complete.
 */
export const signOut = async () => {
  // Use Supabase's native sign out method to clear the session.
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Failed to sign out:', error);
  }
};

/**
 * Creates an audit log entry for a specific user action.
 * @param userId The ID of the user performing the action.
 * @param action The action performed (e.g., 'created_request').
 * @param resourceType The type of resource the action was performed on.
 * @param resourceId The ID of the resource (optional).
 * @param details Additional details about the action (optional).
 */
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

/**
 * Fetches all audit logs from the database, ordered by creation time.
 * This function should be protected by an RLS policy to ensure only
 * authorized users can access it.
 * @returns A promise that resolves with an array of AuditLog objects.
 * @throws An error if the fetch fails.
 */
export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch audit logs: ' + error.message);
  }

  return data;
};

/**
 * Fetches users based on the current user's role and permissions.
 * @param currentUser The current authenticated user
 * @returns A promise that resolves with an array of User objects
 */
export const fetchUsersForRole = async (currentUser: User): Promise<User[]> => {
  let query = supabase.from('users').select('*');

  if (currentUser.role === 'admin') {
    // Admins can see all users
    query = query.order('created_at', { ascending: false });
  } else if (currentUser.role === 'initiator') {
    // Initiators can see themselves and supervisors
    query = query.or(`id.eq.${currentUser.id},role.eq.supervisor`);
  } else if (currentUser.role === 'supervisor') {
    // Supervisors can see themselves and users who have sent requests to them
    const { data: requestUsers, error: requestError } = await supabase
      .from('update_requests')
      .select('initiator_id')
      .eq('assigned_supervisor_id', currentUser.id);

    if (requestError) {
      throw new Error('Failed to fetch request users: ' + requestError.message);
    }

    const initiatorIds = requestUsers.map(req => req.initiator_id);
    const userIds = [currentUser.id, ...initiatorIds];
    
    query = query.in('id', userIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error('Failed to fetch users: ' + error.message);
  }

  return data || [];
};