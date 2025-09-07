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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const fieldLabels: Record<string, string> = {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    street: 'Street',
    city: 'City',
    postalCode: 'Postal Code',
    country: 'Country',
    employer: 'Employer',
    jobTitle: 'Job Title'
  };

  const handleDownloadAttachment = (data: string, name: string) => {
    const link = document.createElement('a');
    link.href = data;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col relative">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Request Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Request Summary */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-lg text-gray-900 mb-4">Request Summary</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Customer Name</p>
                    <p className="text-sm text-gray-600">{request.customer_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Account Number</p>
                    <p className="text-sm text-gray-600">{request.account_number}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Update Type</p>
                    <p className="text-sm text-gray-600">{request.update_type.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                    {getPriorityIcon(request.priority)}
                    {request.priority} Priority
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    {request.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Change Log & Timeline */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-lg text-gray-900 mb-4">Timeline</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Request Initiated</p>
                    <p className="text-xs text-gray-600">{new Date(request.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {request.status !== 'draft' && request.status !== 'pending' && (
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
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

                {request.review_notes && (
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Supervisor Notes</p>
                    <p className="text-sm text-gray-600 mt-1">{request.review_notes}</p>
                  </div>
                )}
                {request.rejection_reason && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-red-800">Rejection Reason</p>
                    <p className="text-sm text-red-600 mt-1">{request.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Details & Attachments */}
            <div className="md:col-span-2">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-lg text-gray-900 mb-4">Update Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {Object.entries(request.fields_to_update).map(([key, value]) => (
                    value && (
                      <div key={key} className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">{fieldLabels[key] || key.replace(/_/g, ' ')}:</span>
                        <span className="text-sm text-gray-900 mt-1">{value}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Instruction */}
            <div className="md:col-span-2">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-lg text-gray-900 mb-4">Customer Instruction</h4>
                <p className="text-sm text-gray-600">{request.customer_instruction}</p>
              </div>
            </div>

            {/* Attachments Section */}
            {request.attachments && request.attachments.length > 0 && (
              <div className="md:col-span-2">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-lg text-gray-900 mb-4">Attachments</h4>
                  <div className="flex flex-wrap gap-4">
                    {request.attachments.map((attachmentUrl: string, index: number) => {
                      // Note: In a real app, you'd get the name and type from a metadata store
                      const filename = attachmentUrl.split('/').pop() || `Attachment ${index + 1}`;
                      const fileType = filename.includes('.') ? filename.split('.').pop()?.toLowerCase() : 'unknown';
                      const mimeType = fileType === 'jpg' || fileType === 'jpeg' || fileType === 'png' ? 'image/' + fileType : fileType === 'pdf' ? 'application/pdf' : 'unknown';
                      
                      const attachment = { name: filename, type: mimeType, data: attachmentUrl };

                      return (
                        <div key={index} className="flex items-center p-3 rounded-lg border border-gray-300 space-x-3 w-full sm:w-auto">
                          <Image className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{filename}</span>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                              onClick={() => setViewingAttachment(attachment)}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                              aria-label={`Preview ${filename}`}
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDownloadAttachment(attachment.data, attachment.name)}
                              className="text-gray-600 hover:text-gray-800 transition-colors"
                              aria-label={`Download ${filename}`}
                            >
                              <Download className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Attachment Viewer Modal */}
      {viewingAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden relative">
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
