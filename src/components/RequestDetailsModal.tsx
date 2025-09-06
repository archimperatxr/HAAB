import React from 'react';
import { X, FileText, User, Calendar, AlertCircle, CheckCircle, XCircle, Clock, Image, Download, Eye } from 'lucide-react';
import { UpdateRequest } from '../context/WorkflowContext';

interface RequestDetailsModalProps {
  request: UpdateRequest;
  onClose: () => void;
}

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

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-600" />;
    }
    return <FileText className="h-4 w-4 text-red-600" />;
  };

  const handleViewAttachment = (attachment: {name: string, type: string, data: string}) => {
    setViewingAttachment(attachment);
  };

  // Parse attachments if they're stored as JSON string
  const attachments = React.useMemo(() => {
    if (!request.attachments) return [];
    if (Array.isArray(request.attachments)) return request.attachments;
    if (typeof request.attachments === 'string') {
      try {
        return JSON.parse(request.attachments);
      } catch {
        return [];
      }
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
                <h2 className="text-2xl font-bold text-gray-900">Request Details #{request.id}</h2>
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
            {/* Status and Priority */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {getStatusIcon(request.status)}
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(request.status)}`}>
                  {request.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                {request.priority.toUpperCase()} PRIORITY
              </span>
            </div>

            {/* Request Information Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Customer Name:</span>
                      <p className="text-gray-900 font-medium">{request.customer_name}</p>
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

                {/* Request Metadata */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Initiated by:</span>
                      <p className="text-gray-900">{request.initiator?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{request.initiator?.department}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Assigned Supervisor:</span>
                      <p className="text-gray-900">{request.assigned_supervisor?.full_name || 'Not assigned'}</p>
                      {request.assigned_supervisor && (
                        <p className="text-sm text-gray-600">{request.assigned_supervisor.department}</p>
                      )}
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

              {/* Fields to Update */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Fields to Update</h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    {Object.entries(request.fields_to_update).length > 0 ? (
                      Object.entries(request.fields_to_update).map(([field, value]) => 
                        value && (
                          <div key={field} className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {field.replace(/([A-Z])/g, ' $1')}:
                            </span>
                            <span className="text-sm text-gray-900 text-right max-w-xs break-words font-medium">
                              {value}
                            </span>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-sm text-gray-500 italic">No fields specified</p>
                    )}
                  </div>
                </div>

                {/* Review Notes */}
                {request.review_notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Review Notes</h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <p className="text-sm text-green-800">{request.review_notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {request.rejection_reason && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Rejection Reason</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <p className="text-sm text-red-800">{request.rejection_reason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {attachments && attachments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Attachments</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        {attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                            <div className="flex items-center space-x-3">
                              {getFileIcon(attachment.type)}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                                <p className="text-xs text-gray-500">{attachment.type}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleViewAttachment(attachment)}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </button>
                          </div>
                        ))}
                      </div>
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

            {/* Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Timeline</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Request Created</p>
                      <p className="text-xs text-gray-600">{new Date(request.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {request.status !== 'draft' && request.status !== 'pending' && (
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        request.status === 'approved' ? 'bg-green-600' :
                        request.status === 'rejected' ? 'bg-red-600' :
                        'bg-yellow-600'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {request.status === 'approved' ? 'Request Approved' :
                           request.status === 'rejected' ? 'Request Rejected' :
                           'Review Started'}
                        </p>
                        <p className="text-xs text-gray-600">{new Date(request.updated_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      
      {/* Attachment Viewer Modal */}
      {viewingAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
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
              {viewingAttachment.type.startsWith('image/') ? (
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
    </>
  );
}