import React, { useState } from 'react';
import { User } from '../App';
import { useWorkflow } from '../context/WorkflowContext';
import { Search, Filter, FileText, Clock, Eye, Check, X, AlertCircle } from 'lucide-react';
import { ReviewRequestModal } from './ReviewRequestModal';

interface SupervisorWorkspaceProps {
  user: User;
}

export function SupervisorWorkspace({ user }: SupervisorWorkspaceProps) {
  const { requests } = useWorkflow();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const supervisorRequests = requests.filter(req => req.assignedSupervisorId === user.id);
  
  const filteredRequests = supervisorRequests.filter(req => {
    const matchesSearch = req.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.accountNumber.includes(searchTerm) ||
                         req.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
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

  const pendingCount = supervisorRequests.filter(req => req.status === 'pending').length;
  const inReviewCount = supervisorRequests.filter(req => req.status === 'in_review').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Supervisor Review</h1>
        <p className="text-gray-600 mt-2">Review and approve customer information update requests</p>
        
        {/* Alert for pending requests */}
        {pendingCount > 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800">
              You have <span className="font-semibold">{pendingCount}</span> pending request{pendingCount !== 1 ? 's' : ''} awaiting review.
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{supervisorRequests.length}</h3>
              <p className="text-gray-600">Total Assigned</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-lg p-3 mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{pendingCount}</h3>
              <p className="text-gray-600">Pending Review</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-orange-100 rounded-lg p-3 mr-4">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{inReviewCount}</h3>
              <p className="text-gray-600">In Review</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3 mr-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {supervisorRequests.filter(req => req.status === 'approved').length}
              </h3>
              <p className="text-gray-600">Approved</p>
            </div>
          </div>
        </div>
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
                <option value="pending">Pending</option>
                <option value="in_review">In Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-600">
            {supervisorRequests.length === 0 
              ? "No requests have been assigned to you yet."
              : "No requests match your search criteria."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(request => (
            <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`rounded-lg p-2 border-2 ${getPriorityColor(request.priority)}`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">Request #{request.id}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                          {request.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{request.customerName} • {request.accountNumber}</p>
                      <p className="text-sm text-gray-500">Initiated by {request.initiatorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Update Type</p>
                    <p className="font-medium capitalize">{request.updateType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Updated</p>
                    <p className="font-medium">{new Date(request.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Customer Instruction</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{request.customerInstruction}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Fields to Update</p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    {Object.entries(request.fieldsToUpdate).map(([field, value]) => 
                      value && (
                        <div key={field} className="flex justify-between py-1">
                          <span className="text-sm text-gray-700 capitalize">{field.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="text-sm font-medium text-gray-900">{value}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    Last updated {new Date(request.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedRequest(request.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Review</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedRequest && (
        <ReviewRequestModal
          requestId={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}