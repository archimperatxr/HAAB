import React, { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { User } from '../App';
import { useWorkflow, UpdateRequest } from '../context/WorkflowContext';

interface CreateRequestModalProps {
  user: User;
  onClose: () => void;
}

export function CreateRequestModal({ user, onClose }: CreateRequestModalProps) {
  const { addRequest } = useWorkflow();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customerName: '',
    accountNumber: '',
    updateType: 'personal_info' as UpdateRequest['updateType'],
    fieldsToUpdate: {} as Record<string, any>,
    customerInstruction: '',
    priority: 'medium' as UpdateRequest['priority'],
    assignedSupervisorId: '2', // Default to Sarah Manager
    attachments: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      if (!formData.customerName.trim()) {
        newErrors.customerName = 'Customer name is required';
      }
      if (!formData.accountNumber.trim()) {
        newErrors.accountNumber = 'Account number is required';
      } else if (!/^\d{10}$/.test(formData.accountNumber)) {
        newErrors.accountNumber = 'Account number must be 10 digits';
      }
      if (!formData.customerInstruction.trim()) {
        newErrors.customerInstruction = 'Customer instruction is required';
      }
    }

    if (stepNumber === 2) {
      const requiredFields = fieldsByType[formData.updateType];
      const hasAtLeastOneField = requiredFields.some(field => formData.fieldsToUpdate[field]?.trim());
      if (!hasAtLeastOneField) {
        newErrors.fieldsToUpdate = 'At least one field must be updated';
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
        customerName: formData.customerName,
        accountNumber: formData.accountNumber,
        updateType: formData.updateType,
        fieldsToUpdate: formData.fieldsToUpdate,
        customerInstruction: formData.customerInstruction,
        initiatorId: user.id,
        initiatorName: user.fullName,
        assignedSupervisorId: formData.assignedSupervisorId,
        assignedSupervisorName: 'Sarah Manager',
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
      fieldsToUpdate: {
        ...prev.fieldsToUpdate,
        [field]: value
      }
    }));
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
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors.customerName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter customer's full name"
                  />
                  {errors.customerName && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors.accountNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter 10-digit account number"
                    maxLength={10}
                  />
                  {errors.accountNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
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
                          checked={formData.updateType === type.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, updateType: e.target.value as any }))}
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
                    value={formData.customerInstruction}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerInstruction: e.target.value }))}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors.customerInstruction ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe the customer's instruction for this update..."
                  />
                  {errors.customerInstruction && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerInstruction}</p>
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
              </div>
            )}

            {/* Step 2: Update Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Fields to Update - {updateTypes.find(t => t.value === formData.updateType)?.label}
                  </h3>
                  <div className="space-y-4">
                    {fieldsByType[formData.updateType].map(field => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                          {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </label>
                        <input
                          type="text"
                          value={formData.fieldsToUpdate[field] || ''}
                          onChange={(e) => handleFieldUpdate(field, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder={`Enter new ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                  {errors.fieldsToUpdate && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.fieldsToUpdate}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload customer instruction documents</p>
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Browse Files
                    </button>
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
                      <p className="text-gray-900">{formData.customerName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Account:</span>
                      <p className="text-gray-900">{formData.accountNumber}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Update Type:</span>
                      <p className="text-gray-900 capitalize">{formData.updateType.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Priority:</span>
                      <p className="text-gray-900 capitalize">{formData.priority}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-700">Fields to Update:</span>
                    <div className="mt-2 space-y-2">
                      {Object.entries(formData.fieldsToUpdate).map(([field, value]) => 
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
                    <p className="text-gray-900 mt-1">{formData.customerInstruction}</p>
                  </div>
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