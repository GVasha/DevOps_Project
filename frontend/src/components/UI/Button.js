import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-white hover:bg-gray-50 focus:ring-primary-500 text-gray-700 border border-gray-300 shadow-sm hover:shadow-md',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white shadow-sm hover:shadow-md',
    ghost: 'hover:bg-gray-100 focus:ring-primary-500 text-gray-700',
    link: 'text-primary-600 hover:text-primary-700 focus:ring-primary-500 underline-offset-4 hover:underline'
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base',
    xlarge: 'px-8 py-4 text-lg'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="small" className="mr-2" />
          Loading...
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className="w-4 h-4 ml-2" aria-hidden="true" />
          )}
        </>
      )}
    </button>
  );
};

export default Button;
