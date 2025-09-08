import React, { useState } from 'react';
import { X, Check, XIcon, AlertCircle, FileText, Image, Eye } from 'lucide-react';
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

  const handleStartReview = () => {
    updateRequest(requestId, { status: 'in_review' });
    setAction('review');
  };

  const handleApproveClick = () => {
    setAction('approve');
    // Auto-scroll to approval notes after a short delay to allow DOM update
    setTimeout(() => {
      const approvalSection = document.getElementById('approval-notes-section');
      if (approvalSection) {
        approvalSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
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

  const getFileIcon = (type: string) => {
    if (type && typeof type === 'string' && type.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-600" />;
    }
    return <FileText className="h-4 w-4 text-red-600" />;
  };

  const handleViewAttachment = (attachment: {name: string, type: string, data: string}) => {
    setViewingAttachment(attachment);
  };

  // Enhanced attachment parsing with better error handling
  const attachments = React.useMemo(() => {
    if (!request.attachments) return [];
    
    // If it's already an array, return it
    if (Array.isArray(request.attachments)) {
      return request.attachments;
    }
    
    // If it's a string, try to parse it as JSON
    if (typeof request.attachments === 'string') {
      try {
        const parsed = JSON.parse(request.attachments);
        if (Array.isArray(parsed)) {
          return parsed;
        } else if (parsed && typeof parsed === 'object') {
          return [parsed];
        }
        return [];
      } catch (error) {
        console.error('Error parsing attachments JSON:', error);
        return [];
      }
    }
    
    // If it's a single object, wrap it in an array
    if (typeof request.attachments === 'object' && request.attachments !== null) {
      return [request.attachments];
    }
    
    return [];
  }, [request.attachments]);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Review Request #{request.id}</h2>
                <p className="text-gray-600">{request.customer_name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Request Status */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  request.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {request.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  request.priority === 'high' ? 'bg-red-100 text-red-800' :
                  request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {request.priority.toUpperCase()} PRIORITY
                </span>
              </div>
            </div>

            {/* Request Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Name:</span>
                      <p className="text-gray-900">{request.customer_name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Account Number:</span>
                      <p className="text-gray-900 font-mono">{request.account_number}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Update Type:</span>
                      <p className="text-gray-900 capitalize">{request.update_type.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Initiated by:</span>
                      <p className="text-gray-900">{request.initiator?.full_name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Created:</span>
                      <p className="text-gray-900">{new Date(request.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Last Updated:</span>
                      <p className="text-gray-900">{new Date(request.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Fields to Update</h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    {Object.entries(request.fields_to_update).map(([field, value]) => 
                      value && (
                        <div key={field} className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {field.replace(/([A-Z])/g, ' $1')}:
                          </span>
                          <span className="text-sm text-gray-900 text-right max-w-xs break-words">
                            {value}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {request.review_notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Previous Review Notes</h3>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-800">{request.review_notes}</p>
                    </div>
                  </div>
                )}

                {request.rejection_reason && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Rejection Reason</h3>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-red-800">{request.rejection_reason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Instruction */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Instruction</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <p className="text-yellow-800">{request.customer_instruction}</p>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {request.attachments && request.attachments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Supporting Documents</h3>
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {request.attachments.map((attachmentString, index) => {
					  try {
					  const attachment = JSON.parse(attachmentString);
					  return (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(attachment?.type)}
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                              {attachment?.name || 'Unknown file'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {attachment?.type || 'Unknown type'}
                            </p>
                          </div>
                        </div>
                        {attachment && (
                          <button
                            onClick={() => handleViewAttachment(attachment)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </button>
                        )}
                      </div>
					  } catch (error) {
					console.error('Error parsing attachment data:', error);
                    return (
                      <div key={index} className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                        <span className="text-sm text-red-800">Invalid attachment</span>
                      </div>
                    );
				  }
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {request.status === 'pending' && (
              <div className="flex items-center justify-center space-x-4 mb-6">
                <button
                  onClick={handleStartReview}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <FileText className="h-5 w-5" />
                  <span>Start Review</span>
                </button>
              </div>
            )}

            {request.status === 'in_review' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={handleApproveClick}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      action === 'approve' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    <Check className="h-5 w-5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => setAction('reject')}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      action === 'reject' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    <XIcon className="h-5 w-5" />
                    <span>Reject</span>
                  </button>
                </div>

                {action === 'approve' && (
                  <div id="approval-notes-section">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      placeholder="Add any notes about the approval..."
                    />
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
      
      {/* Attachment Viewer Modal */}
      {viewingAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl max-h-[90vh] w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {getFileIcon(viewingAttachment.type)}
                <h3 className="text-lg font-semibold text-gray-900">{viewingAttachment.name}</h3>
              </div>
              <button
                onClick={() => setViewingAttachment(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-auto bg-gray-50">
              {viewingAttachment.type && viewingAttachment.type.startsWith('image/') ? (
                <img
                  src={viewingAttachment.data}
                  alt={viewingAttachment.name}
                  className="max-w-full h-auto mx-auto rounded-lg shadow-lg bg-white"
                />
              ) : viewingAttachment.type === 'application/pdf' ? (
                <iframe
                  src={viewingAttachment.data}
                  className="w-full h-[600px] border-0 rounded-lg shadow-lg"
                  title={viewingAttachment.name}
                />
              ) : (
                <div className="text-center py-16 bg-white rounded-lg">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Not Available</h3>
                  <p className="text-gray-600">This file type cannot be previewed in the browser</p>
                  <p className="text-sm text-gray-500 mt-2">File type: {viewingAttachment.type}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}