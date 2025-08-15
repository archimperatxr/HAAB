import React, { useState } from 'react';
import { User } from '../App';
import { useWorkflow } from '../context/WorkflowContext';
import { Plus, Search, Filter, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { CreateRequestModal } from './CreateRequestModal';

interface InitiatorWorkspaceProps {
  user: User;
}

export function InitiatorWorkspace({ user }: InitiatorWorkspaceProps) {
  const { requests } = useWorkflow();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const myRequests = requests.filter(req => req.initiatorId === user.id);
  
  const filteredRequests = myRequests.filter(req => {
    const matchesSearch = req.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.accountNumber.includes(searchTerm) ||
                         req.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'in_review': return <Clock className="h-5 w-5 text-yellow-600" />;
      default: return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-600 mt-2">Manage your customer information update requests</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Request</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name, account number, or request ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="in_review">In Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-600 mb-6">
            {myRequests.length === 0 
              ? "You haven't created any requests yet. Click 'New Request' to get started."
              : "No requests match your search criteria."
            }
          </p>
          {myRequests.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Create First Request
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredRequests.map(request => (
            <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 rounded-lg p-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Request #{request.id}</h3>
                      <p className="text-sm text-gray-600">{request.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority.toUpperCase()}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Account Number</p>
                    <p className="font-medium">{request.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Update Type</p>
                    <p className="font-medium capitalize">{request.updateType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Assigned Supervisor</p>
                    <p className="font-medium">{request.assignedSupervisorName || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Customer Instruction</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{request.customerInstruction}</p>
                </div>

                {(request.reviewNotes || request.rejectionReason) && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {request.status === 'rejected' ? 'Rejection Reason' : 'Review Notes'}
                    </p>
                    <p className={`text-sm p-3 rounded-lg ${
                      request.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {request.rejectionReason || request.reviewNotes}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {getStatusIcon(request.status)}
                    <span>Updated {new Date(request.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Details
                    </button>
                    {request.status === 'draft' && (
                      <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <CreateRequestModal
          user={user}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}