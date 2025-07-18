'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'red' | 'gray' | 'white';
  className?: string;
}

interface LoadingButtonProps {
  children: React.ReactNode;
  isLoading: boolean;
  loadingText?: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const colorClasses = {
  blue: 'border-blue-600',
  green: 'border-green-600',
  red: 'border-red-600',
  gray: 'border-gray-600',
  white: 'border-white'
};

export function LoadingSpinner({ 
  size = 'md', 
  color = 'blue', 
  className = '' 
}: LoadingSpinnerProps) {
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div 
        className={`w-full h-full rounded-full border-2 border-t-transparent animate-spin ${colorClasses[color]}`}
        style={{ borderTopColor: 'transparent' }}
      />
    </div>
  );
}

export function LoadingButton({
  children,
  isLoading,
  loadingText = 'Loading...',
  disabled = false,
  onClick,
  className = '',
  variant = 'primary'
}: LoadingButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'text-blue-600 border-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {isLoading && (
        <LoadingSpinner size="sm" color={variant === 'primary' ? 'white' : 'blue'} className="mr-2" />
      )}
      {isLoading ? loadingText : children}
    </button>
  );
}

export function LoadingOverlay({
  isVisible,
  message = 'Loading...',
  className = ''
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex items-center justify-center mb-4">
          <LoadingSpinner size="lg" color="blue" />
        </div>
        <div className="text-center">
          <p className="text-gray-900 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton components
export function LoadingCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 animate-pulse ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

export function LoadingTable({ rows = 5, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      <div className="animate-pulse">
        <div className="bg-gray-50 p-4">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 border-t border-gray-200">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingVideo({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`}>
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
          </div>
          <div className="h-4 bg-gray-300 rounded w-32 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-24 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

// Progress bar component
interface ProgressBarProps {
  progress: number;
  color?: 'blue' | 'green' | 'red' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  progress,
  color = 'blue',
  size = 'md',
  showLabel = true,
  className = ''
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div 
          className={`${sizeClasses[size]} rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
}

const LoadingComponents = {
  LoadingSpinner,
  LoadingButton,
  LoadingOverlay,
  LoadingCard,
  LoadingTable,
  LoadingVideo,
  ProgressBar
};

export default LoadingComponents;
