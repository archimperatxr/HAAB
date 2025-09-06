import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, UpdateRequest, createAuditLog } from '../lib/supabase';
import { User } from '../App';

// Re-export the UpdateRequest type from supabase lib
export type { UpdateRequest } from '../lib/supabase';

interface WorkflowContextType {
  requests: UpdateRequest[];
  loading: boolean;
  error: string | null;
  addRequest: (request: Omit<UpdateRequest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRequest: (id: string, updates: Partial<UpdateRequest>) => void;
  deleteRequest: (id: string) => void;
  approveRequest: (id: string, notes?: string) => void;
  rejectRequest: (id: string, reason: string) => void;
  refreshRequests: () => Promise<void>;
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export function WorkflowProvider({ 
  children, 
  currentUser 
}: { 
  children: React.ReactNode;
  currentUser: User | null;
}) {
  const [requests, setRequests] = useState<UpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshRequests = async () => {
    if (!currentUser) {
      setRequests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('update_requests')
        .select(`
          *,
          initiator:users!update_requests_initiator_id_fkey(id, username, full_name, role, department),
          assigned_supervisor:users!update_requests_assigned_supervisor_id_fkey(id, username, full_name, role, department)
        `);

      // Apply role-based filtering
      if (currentUser.role === 'initiator') {
        query = query.eq('initiator_id', currentUser.id);
      } else if (currentUser.role === 'supervisor') {
        query = query.eq('assigned_supervisor_id', currentUser.id);
      }
      // Admins can see all requests (no additional filter)

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshRequests();
  }, [currentUser]);

  const addRequest = async (requestData: Omit<UpdateRequest, 'id' | 'created_at' | 'updated_at'>) => {
    if (!currentUser) return;

    try {
      // Generate request ID
      const requestId = `REQ-${String(Date.now()).slice(-6)}`;

      const { data, error } = await supabase
        .from('update_requests')
        .insert({
          id: requestId,
          customer_name: requestData.customer_name,
          account_number: requestData.account_number,
          update_type: requestData.update_type,
          fields_to_update: requestData.fields_to_update,
          customer_instruction: requestData.customer_instruction,
          initiator_id: currentUser.id,
          assigned_supervisor_id: requestData.assigned_supervisor_id,
          status: requestData.status,
          priority: requestData.priority,
          attachments: JSON.stringify(requestData.attachments)
        })
        .select()
        .single();

      if (error) throw error;

      // Create audit log
      await createAuditLog(
        currentUser.id,
        'Request Created',
        'update_request',
        requestId,
        { customer_name: requestData.customer_name, update_type: requestData.update_type }
      );

      // Refresh requests to get updated data
      await refreshRequests();
    } catch (err) {
      console.error('Error creating request:', err);
      setError(err instanceof Error ? err.message : 'Failed to create request');
    }
  };

  const updateRequest = async (id: string, updates: Partial<UpdateRequest>) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('update_requests')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Create audit log
      await createAuditLog(
        currentUser.id,
        'Request Updated',
        'update_request',
        id,
        updates
      );

      // Refresh requests
      await refreshRequests();
    } catch (err) {
      console.error('Error updating request:', err);
      setError(err instanceof Error ? err.message : 'Failed to update request');
    }
  };

  const deleteRequest = async (id: string) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('update_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Create audit log
      await createAuditLog(
        currentUser.id,
        'Request Deleted',
        'update_request',
        id
      );

      // Refresh requests
      await refreshRequests();
    } catch (err) {
      console.error('Error deleting request:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete request');
    }
  };

  const approveRequest = async (id: string, notes?: string) => {
    await updateRequest(id, {
      status: 'approved',
      review_notes: notes
    });
  };

  const rejectRequest = async (id: string, reason: string) => {
    await updateRequest(id, {
      status: 'rejected',
      rejection_reason: reason
    });
  };

  return (
    <WorkflowContext.Provider value={{
      requests,
      loading,
      error,
      addRequest,
      updateRequest,
      deleteRequest,
      approveRequest,
      rejectRequest,
      refreshRequests
    }}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}