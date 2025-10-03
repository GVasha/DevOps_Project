import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = '', className = '' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8',
    xlarge: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center space-x-2">
        <div 
          className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]}`}
          role="status"
          aria-label="Loading"
        />
        {text && (
          <span className="text-gray-600 font-medium">{text}</span>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
