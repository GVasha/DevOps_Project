import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  ShieldCheckIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [updateLoading, setUpdateLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch
  } = useForm();

  const newPassword = watch('newPassword');

  const handleProfileUpdate = async (formData) => {
    try {
      setUpdateLoading(true);
      await updateProfile(formData);
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePasswordChange = async (formData) => {
    // Note: Password change would require backend endpoint
    console.log('Password change requested:', formData);
    resetPassword();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500">
              Member since {formatDate(user?.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Account Activity
            </button>
          </nav>
        </div>

        <div className="pt-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Personal Information
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Update your account details and contact information.
              </p>

              <form onSubmit={handleSubmit(handleProfileUpdate)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    type="text"
                    required
                    icon={UserIcon}
                    error={errors.name?.message}
                    {...register('name', {
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      },
                      maxLength: {
                        value: 50,
                        message: 'Name must not exceed 50 characters'
                      }
                    })}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    required
                    icon={EnvelopeIcon}
                    error={errors.email?.message}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                </div>

                <Input
                  label="Phone Number"
                  type="tel"
                  icon={PhoneIcon}
                  helperText="Optional - for important claim updates"
                  error={errors.phone?.message}
                  {...register('phone', {
                    pattern: {
                      value: /^[\+]?[1-9][\d]{0,15}$/,
                      message: 'Invalid phone number'
                    }
                  })}
                />

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => reset()}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={updateLoading}
                  >
                    Update Profile
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Security Settings
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Manage your password and security preferences.
              </p>

              {/* Current Security Status */}
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Account Secured</h3>
                    <p className="text-sm text-green-700">
                      Your account is protected with strong encryption and secure authentication.
                    </p>
                  </div>
                </div>
              </div>

              {/* Password Change Form */}
              <form onSubmit={handlePasswordSubmit(handlePasswordChange)} className="space-y-6">
                <h3 className="text-md font-medium text-gray-900">Change Password</h3>
                
                <Input
                  label="Current Password"
                  type="password"
                  required
                  icon={KeyIcon}
                  error={passwordErrors.currentPassword?.message}
                  {...registerPassword('currentPassword', {
                    required: 'Current password is required'
                  })}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="New Password"
                    type="password"
                    required
                    icon={KeyIcon}
                    helperText="Must contain uppercase, lowercase, number, and special character"
                    error={passwordErrors.newPassword?.message}
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                        message: 'Password must contain uppercase, lowercase, number, and special character'
                      }
                    })}
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    required
                    icon={KeyIcon}
                    error={passwordErrors.confirmPassword?.message}
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm your new password',
                      validate: value => value === newPassword || 'Passwords do not match'
                    })}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    Update Password
                  </Button>
                </div>
              </form>

              {/* Security Tips */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Security Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use a unique password that you don't use elsewhere</li>
                  <li>• Include a mix of letters, numbers, and special characters</li>
                  <li>• Avoid using personal information in your password</li>
                  <li>• Consider using a password manager</li>
                  <li>• Log out from shared or public devices</li>
                </ul>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Account Activity
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Review your recent account activity and important events.
              </p>

              <div className="space-y-4">
                {/* Account Created */}
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <CalendarDaysIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Account Created</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(user?.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Last Profile Update */}
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Last Profile Update</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(user?.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Security Status</p>
                      <p className="text-sm text-blue-700">
                        Your account is secured with industry-standard encryption. 
                        All data is protected and stored securely.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-4">Data Management</h3>
                <div className="space-y-3">
                  <Button variant="secondary" size="small">
                    Download My Data
                  </Button>
                  <Button variant="danger" size="small">
                    Delete Account
                  </Button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Account deletion is permanent and cannot be undone. All your data will be removed.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
