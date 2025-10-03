import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CameraIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { assessmentAPI, getFileUrl } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assessmentsResponse, claimsResponse] = await Promise.all([
          assessmentAPI.getMyAssessments(),
          assessmentAPI.getMyClaims()
        ]);
        
        setAssessments(assessmentsResponse.data.assessments || []);
        setClaims(claimsResponse.data.claims || []);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-50';
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

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'none':
        return 'text-green-600';
      case 'minor':
        return 'text-yellow-600';
      case 'moderate':
        return 'text-orange-600';
      case 'severe':
        return 'text-red-600';
      case 'total loss':
        return 'text-red-800';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-1 text-gray-600">
              Manage your vehicle assessments and insurance claims
            </p>
          </div>
          <div className="flex space-x-3">
            <Link to="/assessment">
              <Button variant="primary" icon={CameraIcon}>
                New Assessment
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CameraIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Claims</p>
              <p className="text-2xl font-bold text-gray-900">{claims.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed Claims</p>
              <p className="text-2xl font-bold text-gray-900">
                {claims.filter(c => c.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Assessments */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Assessments</h2>
            <Link to="/assessment" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
              View all
            </Link>
          </div>
        </div>

        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-8">
            <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No assessments yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Start by uploading photos of your vehicle damage
            </p>
            <div className="mt-4">
              <Link to="/assessment">
                <Button variant="primary" icon={PlusIcon}>
                  Create First Assessment
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.slice(0, 5).map((assessment) => (
              <div key={assessment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {assessment.imageUrl && (
                      <img
                        src={getFileUrl(assessment.imageUrl)}
                        alt="Assessment"
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Assessment #{assessment.id.slice(-8)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(assessment.createdAt).toLocaleDateString()}
                    </p>
                    {assessment.description && (
                      <p className="text-xs text-gray-600 mt-1">{assessment.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {assessment.aiAnalysis?.analysis?.severity && (
                    <span className={`text-xs font-medium ${getSeverityColor(assessment.aiAnalysis.analysis.severity)}`}>
                      {assessment.aiAnalysis.analysis.severity}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                    {assessment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Claims */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Claims</h2>
            <Link to="/claims" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
              View all
            </Link>
          </div>
        </div>

        {claims.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No claims yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create claims from your damage assessments
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.slice(0, 5).map((claim) => (
              <div key={claim.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {claim.status === 'approved' ? (
                      <CheckCircleIcon className="h-8 w-8 text-green-600" />
                    ) : claim.status === 'rejected' ? (
                      <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                    ) : (
                      <ClockIcon className="h-8 w-8 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Claim #{claim.claimNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {claim.claimType} • {new Date(claim.createdAt).toLocaleDateString()}
                    </p>
                    {claim.estimatedCost && (
                      <p className="text-xs text-gray-600 mt-1">
                        Est. Cost: {claim.estimatedCost}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {claim.priority && (
                    <span className={`text-xs font-medium ${
                      claim.priority === 'High' ? 'text-red-600' :
                      claim.priority === 'Medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {claim.priority} Priority
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                    {claim.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/assessment" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <CameraIcon className="h-6 w-6 text-primary-600 mb-2" />
            <h3 className="text-sm font-medium text-gray-900">New Assessment</h3>
            <p className="text-xs text-gray-500">Upload and analyze vehicle damage</p>
          </Link>
          
          <Link to="/claims" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <DocumentTextIcon className="h-6 w-6 text-blue-600 mb-2" />
            <h3 className="text-sm font-medium text-gray-900">View Claims</h3>
            <p className="text-xs text-gray-500">Track your insurance claims</p>
          </Link>
          
          <Link to="/profile" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <ChartBarIcon className="h-6 w-6 text-green-600 mb-2" />
            <h3 className="text-sm font-medium text-gray-900">Profile Settings</h3>
            <p className="text-xs text-gray-500">Update your account information</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
