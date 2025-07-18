import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Progress, Card, CardHeader, CardTitle, CardContent, Badge } from '../ui';
import { ProcessingStep } from '../../lib/types';

interface ProcessingStatusProps {
  steps: ProcessingStep[];
  isProcessing: boolean;
  error?: string | null;
  className?: string;
}

export function ProcessingStatus({ 
  steps, 
  isProcessing, 
  error,
  className = '' 
}: ProcessingStatusProps) {
  const getStepIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'processing':
        return (
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        );
      case 'failed':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepStatus = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'processing':
        return <Badge variant="default">Processing</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getOverallProgress = () => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const totalSteps = steps.length;
    const currentStepProgress = steps.find(step => step.status === 'processing')?.progress || 0;
    
    return ((completedSteps / totalSteps) * 100) + (currentStepProgress / totalSteps);
  };

  const overallProgress = getOverallProgress();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Processing Video</span>
          {isProcessing && (
            <Badge variant="default">
              {Math.round(overallProgress)}% Complete
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-600">{Math.round(overallProgress)}%</span>
          </div>
          <Progress 
            value={overallProgress} 
            color={error ? 'red' : isProcessing ? 'blue' : 'green'}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Processing Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-3">
              {/* Step Icon */}
              <div className="flex-shrink-0 mt-1">
                {getStepIcon(step)}
              </div>
              
              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {step.name}
                  </h4>
                  {getStepStatus(step)}
                </div>
                
                {/* Step Message */}
                {step.message && (
                  <p className="text-xs text-gray-600 mb-2">
                    {step.message}
                  </p>
                )}
                
                {/* Step Progress */}
                {step.status === 'processing' && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        Step {index + 1} of {steps.length}
                      </span>
                      <span className="text-xs text-gray-500">
                        {step.progress}%
                      </span>
                    </div>
                    <Progress value={step.progress} size="sm" color="blue" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Completion Message */}
        {!isProcessing && !error && overallProgress === 100 && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-4">
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-sm text-green-800">
                Processing completed successfully! Your video is ready for editing.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProcessingStatus;
