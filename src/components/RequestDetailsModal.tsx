import React from 'react';
import { X, FileText, User, Calendar, AlertCircle, CheckCircle, XCircle, Clock, Image, Download, Eye } from 'lucide-react';
import { UpdateRequest } from '../context/WorkflowContext';

interface RequestDetailsModalProps {
  request: UpdateRequest;
  onClose: () => void;
}

// Utility function to format a field name into a readable label
const formatFieldName = (fieldName: string) => {
  return fieldName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
};

export function RequestDetailsModal({ request, onClose }: RequestDetailsModalProps) {
  const [viewingAttachment, setViewingAttachment] = React.useState<{name: string, type: string, data: string} | null>(null);

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

  const attachments = request.attachments || [];

  const getFileIcon = (type: string) => {
    if (type && type.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-600" />;
    }
    return <FileText className="h-5 w-5 text-gray-600" />;
  };

  // Helper function to render a detail item with an icon
  const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined }) => {
    if (!value) return null; // Don't render if value is empty or undefined
    return (
      <div className="flex items-start space-x-3">
        <div className="text-gray-500 mt-1">{icon}</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-sm text-gray-900 break-words">{value}</p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-7 w-7" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* General Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem
                icon={<FileText className="h-5 w-5" />}
                label="Request ID"
                value={request.id}
              />
              <DetailItem
                icon={<User className="h-5 w-5" />}
                label="Customer Name"
                value={request.customer_name}
              />
              <DetailItem
                icon={<FileText className="h-5 w-5" />}
                label="Account Number"
                value={request.account_number}
              />
              <DetailItem
                icon={<Calendar className="h-5 w-5" />}
                label="Date Submitted"
                value={new Date(request.created_at).toLocaleString()}
              />
              <DetailItem
                icon={<FileText className="h-5 w-5" />}
                label="Update Type"
                value={request.update_type.replace(/_/g, ' ')}
              />
              <div className="flex items-center space-x-3">
                <div className="text-gray-500 mt-1">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Priority</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Fields to Update */}
          {Object.keys(request.fields_to_update).length > 0 && (
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900">Fields to Update</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(request.fields_to_update).map(([key, value]) => (
                  <div key={key} className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">{formatFieldName(key)}</p>
                    <p className="text-sm text-gray-900 font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Instructions */}
          {request.customer_instruction && (
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900">Customer Instructions</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{request.customer_instruction}</p>
            </div>
          )}

          {/* Review Notes */}
          {request.review_notes && (
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900">Review Notes</h3>
              <p className="text-sm text-gray-700 bg-yellow-50 p-4 rounded-lg">{request.review_notes}</p>
            </div>
          )}
          
          {/* Rejection Reason */}
          {request.rejection_reason && (
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900">Rejection Reason</h3>
              <p className="text-sm text-red-700 bg-red-50 p-4 rounded-lg">{request.rejection_reason}</p>
            </div>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {attachments.map((attachment, index) => (
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
                          onClick={() => setViewingAttachment(attachment)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Request Timeline - Enhanced Design */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Request Timeline</h3>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="space-y-6">
                {request.initiator && (
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">Request Initiated</p>
                        <p className="text-xs text-gray-500">{new Date(request.created_at).toLocaleString()}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">by {request.initiator.full_name}</p>
                    </div>
                  </div>
                )}
                
                {request.assigned_supervisor && (
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">Assigned to Supervisor</p>
                        <p className="text-xs text-gray-500">
                          {request.updated_at ? new Date(request.updated_at).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{request.assigned_supervisor.full_name}</p>
                    </div>
                  </div>
                )}

                {request.status !== 'draft' && request.status !== 'pending' && (
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full ${
                      request.status === 'approved' ? 'bg-green-100' :
                      request.status === 'rejected' ? 'bg-red-100' :
                      'bg-yellow-100'
                    }`}>
                      {getStatusIcon(request.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">
                          {request.status === 'approved' ? 'Request Approved' :
                            request.status === 'rejected' ? 'Request Rejected' :
                            'Review Started'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {request.updated_at ? new Date(request.updated_at).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      {request.status === 'approved' && request.review_notes && (
                        <p className="text-sm text-gray-600 mt-1">Notes: {request.review_notes}</p>
                      )}
                      {request.status === 'rejected' && request.rejection_reason && (
                        <p className="text-sm text-gray-600 mt-1">Reason: {request.rejection_reason}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
      
      {/* Attachment Viewer Modal */}
      {viewingAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{viewingAttachment.name}</h3>
              <button
                onClick={() => setViewingAttachment(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 max-h-[calc(90vh-120px)] overflow-auto">
              {viewingAttachment.type && viewingAttachment.type.startsWith('image/') ? (
                <img
                  src={viewingAttachment.data}
                  alt={viewingAttachment.name}
                  className="max-w-full h-auto mx-auto rounded-lg"
                />
              ) : viewingAttachment.type === 'application/pdf' ? (
                <iframe
                  src={viewingAttachment.data}
                  className="w-full h-[600px] border-0 rounded-lg"
                  title={viewingAttachment.name}
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Preview not available for this file type</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
