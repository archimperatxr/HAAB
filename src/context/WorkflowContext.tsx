import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UpdateRequest {
  id: string;
  customerName: string;
  accountNumber: string;
  updateType: 'personal_info' | 'contact_info' | 'address' | 'employment';
  fieldsToUpdate: Record<string, any>;
  customerInstruction: string;
  initiatorId: string;
  initiatorName: string;
  assignedSupervisorId?: string;
  assignedSupervisorName?: string;
  status: 'draft' | 'pending' | 'in_review' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  reviewNotes?: string;
  rejectionReason?: string;
  attachments: string[];
}

interface WorkflowContextType {
  requests: UpdateRequest[];
  addRequest: (request: Omit<UpdateRequest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRequest: (id: string, updates: Partial<UpdateRequest>) => void;
  deleteRequest: (id: string) => void;
  approveRequest: (id: string, notes?: string) => void;
  rejectRequest: (id: string, reason: string) => void;
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<UpdateRequest[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const storedRequests = localStorage.getItem('haab-requests');
    if (storedRequests) {
      setRequests(JSON.parse(storedRequests));
    } else {
      // Initialize with sample data
      const sampleRequests: UpdateRequest[] = [
        {
          id: 'REQ-001',
          customerName: 'Alice Johnson',
          accountNumber: '1234567890',
          updateType: 'contact_info',
          fieldsToUpdate: {
            email: 'alice.new@email.com',
            phone: '+1-555-0123'
          },
          customerInstruction: 'Please update my email and phone number as per the attached form.',
          initiatorId: '1',
          initiatorName: 'John Doe',
          assignedSupervisorId: '2',
          assignedSupervisorName: 'Sarah Manager',
          status: 'pending',
          priority: 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attachments: []
        },
        {
          id: 'REQ-002',
          customerName: 'Bob Smith',
          accountNumber: '0987654321',
          updateType: 'address',
          fieldsToUpdate: {
            street: '123 New Street',
            city: 'New City',
            zipCode: '12345'
          },
          customerInstruction: 'Customer has moved to new address. Please update all records.',
          initiatorId: '1',
          initiatorName: 'John Doe',
          assignedSupervisorId: '2',
          assignedSupervisorName: 'Sarah Manager',
          status: 'in_review',
          priority: 'high',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          attachments: []
        }
      ];
      setRequests(sampleRequests);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever requests change
    localStorage.setItem('haab-requests', JSON.stringify(requests));
  }, [requests]);

  const addRequest = (requestData: Omit<UpdateRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRequest: UpdateRequest = {
      ...requestData,
      id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRequests(prev => [...prev, newRequest]);
  };

  const updateRequest = (id: string, updates: Partial<UpdateRequest>) => {
    setRequests(prev => prev.map(req => 
      req.id === id 
        ? { ...req, ...updates, updatedAt: new Date().toISOString() }
        : req
    ));
  };

  const deleteRequest = (id: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));
  };

  const approveRequest = (id: string, notes?: string) => {
    updateRequest(id, {
      status: 'approved',
      reviewNotes: notes
    });
  };

  const rejectRequest = (id: string, reason: string) => {
    updateRequest(id, {
      status: 'rejected',
      rejectionReason: reason
    });
  };

  return (
    <WorkflowContext.Provider value={{
      requests,
      addRequest,
      updateRequest,
      deleteRequest,
      approveRequest,
      rejectRequest
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