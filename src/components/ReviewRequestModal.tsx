import React, { useState } from 'react';
import { X, Check, XIcon, AlertCircle, FileText, Image, Eye, User, Briefcase, Tag, Paperclip } from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

interface ReviewRequestModalProps {
  requestId: string;
  onClose: () => void;
}

export function ReviewRequestModal({ requestId, onClose }: ReviewRequestModalProps) {
  const { requests, updateRequest, approveRequest, rejectRequest } = useWorkflow();
  const [action, setAction] = useState<'review' | 'approve' | 'reject'>('review');
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewingAttachment, setViewingAttachment] = useState<{name: string, type: string, data: string} | null>(null);

  const request = requests.find(req => req.id === requestId);
  if (!request) return null;

  // Function to get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const handleStartReview = () => {
    updateRequest(requestId, { status: 'in_review' });
    setAction('review');
  };

  const handleApproveClick = () => {
    setAction('approve');
  };

  const handleApprove = () => {
    approveRequest(requestId, notes);
    onClose();
  };

  const handleReject = () => {
    if (rejectionReason.trim()) {
      rejectRequest(requestId, rejectionReason);
      onClose();
    }
  };

  // Helper for displaying fields to update
  const formatFieldName = (name: string) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">Review Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex space-x-6">
            {/* Request Details Section */}
            <div className="flex-1 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Information</h3>
                <dl className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{request.customer_name}</dd>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Paperclip className="h-5 w-5 text-gray-500" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Account Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{request.account_number}</dd>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-5 w-5 text-gray-500" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Request Type</dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">
                        {request.update_type.replace(/_/g, ' ')}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Tag className="h-5 w-5 text-gray-500" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Priority</dt>
                      <dd className={`mt-1 text-xs font-semibold px-2 py-1 rounded-full w-fit ${getPriorityColor(request.priority)}`}>
                        {request.priority.toUpperCase()}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              {/* Fields to Update */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Proposed Changes</h3>
                <dl className="space-y-3">
                  {Object.entries(request.fields_to_update).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <dt className="font-medium text-gray-700">{formatFieldName(key)}:</dt>
                      <dd className="text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Customer Instruction and Attachments */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Customer Instruction</h3>
                  <p className="mt-2 text-gray-700 italic border-l-4 border-gray-200 pl-4">{request.customer_instruction}</p>
                </div>
                {request.attachments && request.attachments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Attachments</h3>
                    <div className="flex flex-wrap gap-2">
                      {request.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center bg-gray-100 rounded-lg p-2">
                          <Paperclip className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700">{`Attachment ${index + 1}`}</span>
                          <button
                            onClick={() => setViewingAttachment({
                              name: `Attachment ${index + 1}`,
                              type: 'application/octet-stream', // Mock type
                              data: attachment, // The URL/data
                            })}
                            className="ml-2 text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Review Action Section */}
            <div className="w-96 p-6 border-l border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Action</h3>
              {/* Conditional rendering based on request status */}
              {request.status === 'pending' || request.status === 'draft' ? (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium">Request pending review</p>
                    <p className="text-sm mt-1">Please start the review process to proceed.</p>
                    <button
                      onClick={handleStartReview}
                      className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Start Review
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Notes input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reviewer Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Add your notes here..."
                    />
                  </div>

                  {/* Action buttons */}
                  {action === 'review' && (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleApproveClick}
                        className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        <Check className="h-5 w-5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => setAction('reject')}
                        className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        <XIcon className="h-5 w-5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}

                  {/* Approve confirmation */}
                  {action === 'approve' && (
                    <div id="approval-notes-section">
                      <div className="mt-4 flex items-center justify-end space-x-3">
                        <button
                          onClick={() => setAction('review')}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleApprove}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          Confirm Approval
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reject form */}
                  {action === 'reject' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason *
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        placeholder="Please explain why this request is being rejected..."
                        required
                      />
                      <div className="mt-4 flex items-center justify-end space-x-3">
                        <button
                          onClick={() => setAction('review')}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={!rejectionReason.trim()}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attachment Preview Modal */}
      {viewingAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl max-h-[90vh] w-full mx-auto overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{viewingAttachment.name}</h3>
              <button
                onClick={() => setViewingAttachment(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 max-h-[calc(90vh-120px)] overflow-auto flex items-center justify-center">
              {viewingAttachment.data && (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Attachment preview is not fully implemented.</p>
                  <p className="text-sm text-gray-500 mt-2">Data URL: {viewingAttachment.data.substring(0, 50)}...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
