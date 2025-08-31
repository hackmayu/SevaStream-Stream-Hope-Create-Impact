import React, { useState } from 'react';
import { useAIServices } from '../hooks/useAIServices';

interface CreateAidRequestProps {
  onClose: () => void;
  onSubmit: (requestData: any) => void;
}

interface AidRequestForm {
  title: string;
  description: string;
  category: string;
  targetAmount: string;
  location: string;
  urgencyLevel: string;
  contactInfo: string;
  documents: File[];
  fx02Fee: number;
  totalAmount: number;
}

const CreateAidRequest: React.FC<CreateAidRequestProps> = ({ onClose, onSubmit }) => {
  const { moderateContent, detectNeeds, loading } = useAIServices();
  const [formData, setFormData] = useState<AidRequestForm>({
    title: '',
    description: '',
    category: '',
    targetAmount: '',
    location: '',
    urgencyLevel: 'medium',
    contactInfo: '',
    documents: [],
    fx02Fee: 0,
    totalAmount: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiValidation, setAiValidation] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Calculate fx02 fees (assuming 2% fee for aid requests)
  const calculateFx02Fee = (amount: number): number => {
    return amount * 0.02; // 2% fx02 protocol fee
  };

  const handleInputChange = (field: keyof AidRequestForm, value: string | number) => {
    const updatedData = { ...formData, [field]: value };
    
    // Calculate fees when target amount changes
    if (field === 'targetAmount') {
      const amount = parseFloat(value.toString()) || 0;
      const fx02Fee = calculateFx02Fee(amount);
      updatedData.fx02Fee = fx02Fee;
      updatedData.totalAmount = amount + fx02Fee;
    }
    
    setFormData(updatedData);
    
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setFormData(prev => ({
        ...prev,
        documents: Array.from(files)
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Valid target amount is required';
    }
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.contactInfo.trim()) newErrors.contactInfo = 'Contact information is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAIValidation = async () => {
    if (!formData.description.trim()) {
      alert('Please provide a description for AI validation');
      return;
    }

    setIsValidating(true);
    try {
      // Use AI to validate the aid request
      const [moderationResult, needsResult] = await Promise.all([
        moderateContent({
          text: formData.description,
          source_type: 'ngo_message' // Using ngo_message as closest match to aid_request
        }),
        detectNeeds({
          text: formData.description,
          source_type: 'ngo_message'
        })
      ]);

      setAiValidation({
        moderation: moderationResult,
        needs: needsResult,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('AI validation failed:', error);
      alert('AI validation failed. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Recommend AI validation if not done
    if (!aiValidation && !confirm('You haven\'t run AI validation. Continue without it?')) {
      return;
    }

    const requestData = {
      ...formData,
      fx02Integration: {
        protocolFee: formData.fx02Fee,
        totalWithFees: formData.totalAmount,
        feePercentage: 2.0,
        calculatedAt: new Date().toISOString()
      },
      aiValidation,
      submittedAt: new Date().toISOString(),
      status: 'pending_review'
    };

    onSubmit(requestData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Create Aid Request</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`input ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Brief, descriptive title for your aid request"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`input ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Provide detailed information about your situation and specific needs"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`input ${errors.category ? 'border-red-500' : ''}`}
                >
                  <option value="">Select category</option>
                  <option value="medical">Medical Emergency</option>
                  <option value="education">Education</option>
                  <option value="disaster">Natural Disaster</option>
                  <option value="food">Food Security</option>
                  <option value="shelter">Shelter/Housing</option>
                  <option value="water">Clean Water</option>
                  <option value="other">Other</option>
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level *
                </label>
                <select
                  value={formData.urgencyLevel}
                  onChange={(e) => handleInputChange('urgencyLevel', e.target.value)}
                  className="input"
                >
                  <option value="low">Low - Can wait weeks</option>
                  <option value="medium">Medium - Needed within days</option>
                  <option value="high">High - Urgent within 24-48h</option>
                  <option value="critical">Critical - Immediate need</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`input ${errors.location ? 'border-red-500' : ''}`}
                placeholder="City, State, Country"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>
          </div>

          {/* Financial Details with fx02 Integration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Financial Details with fx02</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount (₹) *
              </label>
              <input
                type="number"
                value={formData.targetAmount}
                onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                className={`input ${errors.targetAmount ? 'border-red-500' : ''}`}
                placeholder="0"
                min="1"
                step="0.01"
              />
              {errors.targetAmount && <p className="text-red-500 text-sm mt-1">{errors.targetAmount}</p>}
            </div>

            {/* fx02 Fee Breakdown */}
            {formData.targetAmount && parseFloat(formData.targetAmount) > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-blue-900">fx02 Protocol Fee Breakdown</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Target Amount:</span>
                    <span className="font-medium">₹{parseFloat(formData.targetAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">fx02 Protocol Fee (2%):</span>
                    <span className="font-medium">₹{formData.fx02Fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-300 pt-1">
                    <span className="text-blue-900 font-medium">Total with Fees:</span>
                    <span className="font-bold">₹{formData.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  ℹ️ fx02 protocol fee helps maintain platform security and AI verification services
                </p>
              </div>
            )}
          </div>

          {/* Contact & Verification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact & Verification</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Information *
              </label>
              <textarea
                value={formData.contactInfo}
                onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                rows={2}
                className={`input ${errors.contactInfo ? 'border-red-500' : ''}`}
                placeholder="Phone, email, or alternative contact method"
              />
              {errors.contactInfo && <p className="text-red-500 text-sm mt-1">{errors.contactInfo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supporting Documents
              </label>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload photos, medical reports, official letters, etc. (Optional but recommended)
              </p>
              {formData.documents.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">
                    {formData.documents.length} file(s) selected
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AI Validation Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">AI Validation</h3>
              <button
                type="button"
                onClick={handleAIValidation}
                disabled={isValidating || !formData.description}
                className="btn-secondary text-sm"
              >
                {isValidating ? '🤖 Validating...' : '🤖 Run AI Validation'}
              </button>
            </div>
            
            {aiValidation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">✅ AI Validation Complete</h4>
                <div className="space-y-1 text-sm text-green-800">
                  <p>Content Safety: {aiValidation.moderation?.safe ? '✅ Safe' : '⚠️ Flagged'}</p>
                  <p>Needs Detected: {aiValidation.needs?.total_needs || 0} structured needs</p>
                  <p>Risk Level: {aiValidation.moderation?.risk_level || 'Unknown'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Creating Request...' : 'Submit Aid Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAidRequest;
