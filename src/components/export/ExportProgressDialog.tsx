'use client';

import React, { useEffect } from 'react';
import { Button } from '../ui/Button';
import { 
  DocumentArrowDownIcon,
  StopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  FolderOpenIcon,
  ShareIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

export interface ExportProgress {
  stage: 'preparing' | 'processing' | 'finalizing' | 'completed' | 'error';
  progress: number;
  currentTask: string;
  timeRemaining: number;
  outputFile?: string;
  error?: string;
}

interface ExportProgressProps {
  progress: ExportProgress;
  onCancel: () => void;
  onDownload?: (filePath: string) => void;
  onShare?: (filePath: string) => void;
  onOpenFolder?: (filePath: string) => void;
  className?: string;
}

const stageLabels = {
  preparing: 'Preparing Export',
  processing: 'Processing Video',
  finalizing: 'Finalizing Export',
  completed: 'Export Completed',
  error: 'Export Failed'
};

const stageDescriptions = {
  preparing: 'Setting up export configuration and validating files...',
  processing: 'Encoding video with selected settings...',
  finalizing: 'Applying final touches and saving file...',
  completed: 'Your video has been successfully exported!',
  error: 'An error occurred during the export process.'
};

export function ExportProgressDialog({ 
  progress, 
  onCancel, 
  onDownload, 
  onShare, 
  onOpenFolder,
  className = ''
}: ExportProgressProps) {
  // Track current time for potential future use
  useEffect(() => {
    const timer = setInterval(() => {
      // Timer for potential future features
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStageIcon = () => {
    switch (progress.stage) {
      case 'preparing':
        return <ClockIcon className="w-6 h-6 text-blue-600 animate-pulse" />;
      case 'processing':
        return (
          <div className="relative">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        );
      case 'finalizing':
        return <DocumentArrowDownIcon className="w-6 h-6 text-blue-600 animate-bounce" />;
      case 'completed':
        return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />;
      default:
        return <ClockIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const getProgressBarColor = () => {
    switch (progress.stage) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const canCancel = progress.stage === 'preparing' || progress.stage === 'processing';
  const isCompleted = progress.stage === 'completed';
  const hasError = progress.stage === 'error';

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          {getStageIcon()}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {stageLabels[progress.stage]}
            </h2>
            <p className="text-sm text-gray-500">
              {stageDescriptions[progress.stage]}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {!hasError && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{progress.currentTask}</span>
              <span>{Math.round(progress.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor()}`}
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            
            {progress.timeRemaining > 0 && !isCompleted && (
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Time remaining: {formatTime(progress.timeRemaining)}</span>
                <span>Please don&apos;t close this window</span>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {hasError && progress.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Export Error</p>
                <p className="text-sm text-red-700 mt-1">{progress.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Actions */}
        {isCompleted && progress.outputFile && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Export Successful!</p>
                <p className="text-sm text-green-700 mt-1">
                  Your video has been saved to: {progress.outputFile}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Processing Details */}
        {progress.stage === 'processing' && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-blue-900">Processing Details</span>
              </div>
              <div className="text-xs text-blue-800 space-y-1">
                <div>• Encoding video with selected quality settings</div>
                <div>• Processing audio tracks and synchronization</div>
                <div>• Applying subtitle overlays (if selected)</div>
                <div>• Optimizing file size and compatibility</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          {canCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex items-center space-x-2"
            >
              <StopIcon className="w-4 h-4" />
              <span>Cancel</span>
            </Button>
          )}

          {hasError && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex items-center space-x-2"
            >
              <span>Close</span>
            </Button>
          )}

          {isCompleted && progress.outputFile && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenFolder?.(progress.outputFile!)}
                className="flex items-center space-x-2"
              >
                <FolderOpenIcon className="w-4 h-4" />
                <span>Open Folder</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => onShare?.(progress.outputFile!)}
                className="flex items-center space-x-2"
              >
                <ShareIcon className="w-4 h-4" />
                <span>Share</span>
              </Button>
              
              <Button
                onClick={() => onDownload?.(progress.outputFile!)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Download</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExportProgressDialog;
