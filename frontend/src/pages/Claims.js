import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { assessmentAPI } from '../services/api';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Claims = () => {
  const [claims, setClaims] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [claimsResponse, assessmentsResponse] = await Promise.all([
        assessmentAPI.getMyClaims(),
        assessmentAPI.getMyAssessments()
      ]);
      
      setClaims(claimsResponse.data.claims || []);
      setAssessments(assessmentsResponse.data.assessments || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClaim = async (formData) => {
    try {
      setCreateLoading(true);
      
      const claimData = {
        assessmentId: formData.assessmentId,
        claimType: formData.claimType,
        incidentDate: formData.incidentDate,
        incidentDescription: formData.incidentDescription,
        policyNumber: formData.policyNumber
      };

      await assessmentAPI.createClaim(claimData);
      
      // Refresh claims list
      await fetchData();
      
      // Reset form and close modal
      reset();
      setShowCreateForm(false);
      
    } catch (error) {
      console.error('Failed to create claim:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted':
        return 'text-blue-600 bg-blue-50';
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" text="Loading claims..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insurance Claims</h1>
          <p className="mt-1 text-gray-600">
            Manage and track your insurance claims
          </p>
        </div>
        <Button
          variant="primary"
          icon={PlusIcon}
          onClick={() => setShowCreateForm(true)}
          disabled={assessments.length === 0}
        >
          New Claim
        </Button>
      </div>

      {/* Claims List */}
      {claims.length === 0 ? (
        <div className="card text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No claims yet</h3>
          <p className="mt-2 text-gray-500">
            {assessments.length === 0 
              ? 'Create a damage assessment first, then submit a claim'
              : 'Create your first insurance claim from your assessments'
            }
          </p>
          {assessments.length > 0 && (
            <div className="mt-6">
              <Button
                variant="primary"
                icon={PlusIcon}
                onClick={() => setShowCreateForm(true)}
              >
                Create First Claim
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {claims.map((claim) => (
            <div key={claim.id} className="card hover:shadow-medium transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(claim.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        Claim #{claim.claimNumber}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                        {claim.status}
                      </span>
                      {claim.priority && (
                        <span className={`text-xs font-medium ${getPriorityColor(claim.priority)}`}>
                          {claim.priority} Priority
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {claim.claimType}
                      </div>
                      <div className="flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(claim.incidentDate).toLocaleDateString()}
                      </div>
                      {claim.estimatedCost && (
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />
                          Est. {claim.estimatedCost}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Created {new Date(claim.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {claim.incidentDescription && (
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                        {claim.incidentDescription}
                      </p>
                    )}

                    {claim.policyNumber && (
                      <p className="mt-2 text-xs text-gray-500">
                        Policy: {claim.policyNumber}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-4">
                  <Button
                    variant="ghost"
                    size="small"
                    icon={EyeIcon}
                    onClick={() => setSelectedClaim(claim)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Claim Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateForm(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Create New Claim
                </h3>
                
                <form onSubmit={handleSubmit(handleCreateClaim)} className="space-y-4">
                  {/* Assessment Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Assessment *
                    </label>
                    <select
                      className="input-field"
                      {...register('assessmentId', { required: 'Please select an assessment' })}
                    >
                      <option value="">Choose an assessment...</option>
                      {assessments.map((assessment) => (
                        <option key={assessment.id} value={assessment.id}>
                          Assessment #{assessment.id.slice(-8)} - {new Date(assessment.createdAt).toLocaleDateString()}
                          {assessment.description && ` (${assessment.description.slice(0, 30)}...)`}
                        </option>
                      ))}
                    </select>
                    {errors.assessmentId && (
                      <p className="mt-1 text-sm text-red-600">{errors.assessmentId.message}</p>
                    )}
                  </div>

                  {/* Claim Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Claim Type *
                    </label>
                    <select
                      className="input-field"
                      {...register('claimType', { required: 'Please select a claim type' })}
                    >
                      <option value="">Select claim type...</option>
                      <option value="collision">Collision</option>
                      <option value="comprehensive">Comprehensive</option>
                      <option value="liability">Liability</option>
                    </select>
                    {errors.claimType && (
                      <p className="mt-1 text-sm text-red-600">{errors.claimType.message}</p>
                    )}
                  </div>

                  {/* Incident Date */}
                  <Input
                    label="Incident Date"
                    type="date"
                    required
                    error={errors.incidentDate?.message}
                    {...register('incidentDate', {
                      required: 'Incident date is required',
                      validate: value => {
                        const date = new Date(value);
                        const today = new Date();
                        return date <= today || 'Incident date cannot be in the future';
                      }
                    })}
                  />

                  {/* Incident Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Incident Description *
                    </label>
                    <textarea
                      rows={4}
                      className="input-field"
                      placeholder="Describe what happened in detail..."
                      {...register('incidentDescription', {
                        required: 'Please describe the incident',
                        minLength: {
                          value: 10,
                          message: 'Description must be at least 10 characters'
                        },
                        maxLength: {
                          value: 1000,
                          message: 'Description must not exceed 1000 characters'
                        }
                      })}
                    />
                    {errors.incidentDescription && (
                      <p className="mt-1 text-sm text-red-600">{errors.incidentDescription.message}</p>
                    )}
                  </div>

                  {/* Policy Number */}
                  <Input
                    label="Policy Number"
                    type="text"
                    placeholder="Your insurance policy number (optional)"
                    error={errors.policyNumber?.message}
                    {...register('policyNumber', {
                      minLength: {
                        value: 5,
                        message: 'Policy number must be at least 5 characters'
                      },
                      maxLength: {
                        value: 50,
                        message: 'Policy number must not exceed 50 characters'
                      }
                    })}
                  />

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={createLoading}
                    >
                      Create Claim
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Claim Details Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedClaim(null)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Claim Details
                  </h3>
                  <button
                    onClick={() => setSelectedClaim(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Claim Number</label>
                      <p className="text-sm text-gray-900">{selectedClaim.claimNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedClaim.status)}`}>
                        {selectedClaim.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Claim Type</label>
                      <p className="text-sm text-gray-900">{selectedClaim.claimType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Priority</label>
                      <p className={`text-sm font-medium ${getPriorityColor(selectedClaim.priority)}`}>
                        {selectedClaim.priority}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Incident Date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedClaim.incidentDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-sm text-gray-900">{selectedClaim.incidentDescription}</p>
                  </div>

                  {selectedClaim.policyNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Policy Number</label>
                      <p className="text-sm text-gray-900">{selectedClaim.policyNumber}</p>
                    </div>
                  )}

                  {selectedClaim.estimatedCost && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Estimated Cost</label>
                      <p className="text-sm text-gray-900">{selectedClaim.estimatedCost}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>
                      <label className="font-medium">Created</label>
                      <p>{new Date(selectedClaim.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="font-medium">Last Updated</label>
                      <p>{new Date(selectedClaim.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Claims;
