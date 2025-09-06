import React, { useState } from 'react';
import { X, Upload, AlertCircle, FileText, Image, Trash2 } from 'lucide-react';
import { User } from '../App';
import { useWorkflow, UpdateRequest } from '../context/WorkflowContext';
import { fetchUsersForRole, User as DatabaseUser } from '../lib/supabase';

interface CreateRequestModalProps {
  user: User;
  onClose: () => void;
}

export function CreateRequestModal({ user, onClose }: CreateRequestModalProps) {
  const { addRequest } = useWorkflow();
  const [step, setStep] = useState(1);
  const [supervisors, setSupervisors] = useState<DatabaseUser[]>([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    account_number: '',
    update_type: 'personal_info' as UpdateRequest['update_type'],
    fields_to_update: {} as Record<string, any>,
    customer_instruction: '',
    priority: 'medium' as UpdateRequest['priority'],
    assigned_supervisor_id: '',
    attachments: [] as Array<{name: string, type: string, data: string}>
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  // Fetch supervisors when component mounts
  React.useEffect(() => {
    const fetchSupervisors = async () => {
      setLoadingSupervisors(true);
      try {
        const users = await fetchUsersForRole(user);
        const supervisorUsers = users.filter(u => u.role === 'supervisor');
        setSupervisors(supervisorUsers);
        
        // Set default supervisor if available
        if (supervisorUsers.length > 0 && !formData.assigned_supervisor_id) {
          setFormData(prev => ({ ...prev, assigned_supervisor_id: supervisorUsers[0].id }));
        }
      } catch (error) {
        console.error('Error fetching supervisors:', error);
      } finally {
        setLoadingSupervisors(false);
      }
    };

    fetchSupervisors();
  }, [user]);

  const updateTypes = [
    { value: 'personal_info', label: 'Personal Information', description: 'Name, date of birth, ID numbers' },
    { value: 'contact_info', label: 'Contact Information', description: 'Email, phone numbers' },
    { value: 'address', label: 'Address Information', description: 'Home, work, mailing address' },
    { value: 'employment', label: 'Employment Information', description: 'Job title, employer, income' }
  ];

  const fieldsByType = {
    personal_info: ['firstName', 'lastName', 'dateOfBirth', 'idNumber', 'nationality'],
    contact_info: ['email', 'homePhone', 'workPhone', 'mobilePhone'],
    address: ['street', 'city', 'state', 'zipCode', 'country'],
    employment: ['employer', 'jobTitle', 'workAddress', 'annualIncome', 'employmentStatus']
  };

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.customer_name.trim()) {
        newErrors.customer_name = 'Customer name is required';
      }
      if (!formData.account_number.trim()) {
        newErrors.account_number = 'Account number is required';
      } else if (!/^\d{10}$/.test(formData.account_number)) {
        newErrors.account_number = 'Account number must be 10 digits';
      }
      if (!formData.customer_instruction.trim()) {
        newErrors.customer_instruction = 'Customer instruction is required';
      }
    }

    if (stepNumber === 2) {
      const requiredFields = fieldsByType[formData.update_type];
      const hasAtLeastOneField = requiredFields.some(field => formData.fields_to_update[field]?.trim());
      if (!hasAtLeastOneField) {
        newErrors.fields_to_update = 'At least one field must be updated';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(3)) {
      addRequest({
        customer_name: formData.customer_name,
        account_number: formData.account_number,
        update_type: formData.update_type,
        fields_to_update: formData.fields_to_update,
        customer_instruction: formData.customer_instruction,
        initiator_id: user.id,
        assigned_supervisor_id: formData.assigned_supervisor_id,
        status: 'pending',
        priority: formData.priority,
        attachments: formData.attachments
      });
      onClose();
    }
  };

  const handleFieldUpdate = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      fields_to_update: {
        ...prev.fields_to_update,
        [field]: value
      }
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    const newAttachments: Array<{name: string, type: string, data: string}> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, attachments: `File ${file.name} is not supported. Only images (JPEG, PNG, GIF) and PDFs are allowed.` }));
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, attachments: `File ${file.name} is too large. Maximum size is 5MB.` }));
        continue;
      }

      // Convert to base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      newAttachments.push({
        name: file.name,
        type: file.type,
        data: fileData
      });
    }

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
    
    setUploading(false);
    // Clear the input
    event.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-600" />;
    }
    return <FileText className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create Update Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map(stepNumber => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Step {step} of 3: {
              step === 1 ? 'Customer Information' :
              step === 2 ? 'Update Details' :
              'Review & Submit'
            }
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Step 1: Customer Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors.customer_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter customer's full name"
                  />
                  {errors.customer_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors.account_number ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter 10-digit account number"
                    maxLength={10}
                  />
                  {errors.account_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.account_number}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Type *
                  </label>
                  <div className="space-y-2">
                    {updateTypes.map(type => (
                      <label key={type.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="updateType"
                          value={type.value}
                          checked={formData.update_type === type.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, update_type: e.target.value as any }))}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{type.label}</div>
                          <div className="text-sm text-gray-600">{type.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Instruction *
                  </label>
                  <textarea
                    value={formData.customer_instruction}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_instruction: e.target.value }))}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors.customer_instruction ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe the customer's instruction for this update..."
                  />
                  {errors.customer_instruction && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_instruction}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Supervisor *
                  </label>
                  {loadingSupervisors ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                      Loading supervisors...
                    </div>
                  ) : (
                    <select
                      value={formData.assigned_supervisor_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, assigned_supervisor_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    >
                      <option value="">Select a supervisor</option>
                      {supervisors.map(supervisor => (
                        <option key={supervisor.id} value={supervisor.id}>
                          {supervisor.full_name} - {supervisor.department}
                        </option>
                      ))}
                    </select>
                  )}
                  {supervisors.length === 0 && !loadingSupervisors && (
                    <p className="mt-1 text-sm text-red-600">No supervisors available</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Update Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Fields to Update - {updateTypes.find(t => t.value === formData.update_type)?.label}
                  </h3>
                  <div className="space-y-4">
                    {fieldsByType[formData.update_type].map(field => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                          {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </label>
                        <input
                          type="text"
                          value={formData.fields_to_update[field] || ''}
                          onChange={(e) => handleFieldUpdate(field, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder={`Enter new ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                  {errors.fields_to_update && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.fields_to_update}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Documents
                  </label>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload customer instruction documents</p>
                      <p className="text-xs text-gray-500 mb-3">Supported: Images (JPEG, PNG, GIF) and PDF files (max 5MB each)</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                          uploading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                        } transition-colors`}
                      >
                        {uploading ? 'Uploading...' : 'Browse Files'}
                      </label>
                    </div>

                    {/* Display uploaded files */}
                    {formData.attachments.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center space-x-3">
                              {getFileIcon(file.type)}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">{file.type}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Remove file"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {errors.attachments && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {errors.attachments}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Review Request Details</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Customer:</span>
                      <p className="text-gray-900">{formData.customer_name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Account:</span>
                      <p className="text-gray-900">{formData.account_number}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Update Type:</span>
                      <p className="text-gray-900 capitalize">{formData.update_type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Priority:</span>
                      <p className="text-gray-900 capitalize">{formData.priority}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-700">Fields to Update:</span>
                    <div className="mt-2 space-y-2">
                      {Object.entries(formData.fields_to_update).map(([field, value]) => 
                        value && (
                          <div key={field} className="flex justify-between">
                            <span className="text-sm text-gray-600 capitalize">{field.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="text-sm text-gray-900">{value}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-700">Customer Instruction:</span>
                    <p className="text-gray-900 mt-1">{formData.customer_instruction}</p>
                  </div>
                  
                  {formData.attachments.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Attachments:</span>
                      <div className="mt-2 space-y-1">
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            {getFileIcon(file.type)}
                            <span className="text-gray-700">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Submit Request
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}