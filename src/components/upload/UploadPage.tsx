import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { useVideoStore } from '../../store/videoStore';
import FileUpload from './FileUpload';
import ProcessingStatus from './ProcessingStatus';
import LanguageSelect from './LanguageSelect';

export function UploadPage() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('hi'); // Default to Hindi
  const [showProcessing, setShowProcessing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const { 
    currentProject, 
    isProcessing, 
    processingSteps, 
    error, 
    startProcessing,
    setCurrentProject,
    setError,
    checkVideoValidity
  } = useVideoStore();

  const handleUploadComplete = (file: File) => {
    console.log('Upload completed:', file.name);
    // Processing will be handled by the store
  };

  const handleStartProcessing = async () => {
    if (!currentProject) return;
    
    setShowProcessing(true);
    await startProcessing(currentProject.id, selectedLanguage);
  };

  const handleCancelProject = () => {
    setCurrentProject(null);
    setShowProcessing(false);
    setError(null);
  };

  const handleOpenVideoEditor = async () => {
    if (currentProject) {
      setIsNavigating(true);
      try {
        await router.push('/complete-studio');
      } catch (error) {
        console.error('Navigation error:', error);
        setIsNavigating(false);
      }
    }
  };

  const handleDownloadPreview = async () => {
    if (currentProject) {
      setIsDownloading(true);
      try {
        // Simulate download preparation time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a mock download URL - in a real app, this would be generated from the server
        const downloadUrl = URL.createObjectURL(new Blob(['Mock video content'], { type: 'video/mp4' }));
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${currentProject.name}_preview.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error('Download error:', error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  // Check video validity on component mount
  useEffect(() => {
    checkVideoValidity();
  }, [checkVideoValidity]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Video Dubbing Studio
          </h1>
          <p className="text-lg text-gray-600">
            Upload your video and translate it to any language
          </p>
        </div>

        {!currentProject && (
          <div className="mb-8">
            <FileUpload onUploadComplete={handleUploadComplete} />
          </div>
        )}

        {currentProject && !showProcessing && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentProject.name}
                </h2>
                <p className="text-sm text-gray-600">
                  Ready for translation and dubbing
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-lg font-medium text-gray-900">
                    {Math.round(currentProject.video.duration)}s
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelProject}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <LanguageSelect
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                  label="Select Target Language"
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartProcessing}
                  disabled={isProcessing}
                  loading={isProcessing}
                  className="w-full"
                >
                  Start Translation & Dubbing
                </Button>
              </div>
            </div>
          </div>
        )}

        {showProcessing && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Processing Video
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelProject}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isProcessing}
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              </div>
              <ProcessingStatus
                steps={processingSteps}
                isProcessing={isProcessing}
                error={error}
              />
            </div>
          </div>
        )}

        {currentProject && !isProcessing && showProcessing && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🎉 Processing Complete!
              </h3>
              <p className="text-gray-600 mb-4">
                Your video has been successfully translated to {selectedLanguage.toUpperCase()}
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleOpenVideoEditor}
                  disabled={isNavigating || isDownloading}
                  loading={isNavigating}
                >
                  {isNavigating ? 'Opening Studio...' : 'Open Studio'}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleDownloadPreview}
                  disabled={isNavigating || isDownloading}
                  loading={isDownloading}
                >
                  {isDownloading ? 'Preparing Download...' : 'Download Preview'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg"
                  onClick={handleCancelProject}
                  className="text-gray-600 hover:text-gray-800"
                  disabled={isNavigating || isDownloading}
                >
                  Start Over
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Video File Lost Error */}
        {currentProject && error && error.includes('Video file is no longer available') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Video file no longer available
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  The video file from your previous session is no longer available. Please upload your video again to continue.
                </p>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setCurrentProject(null);
                      setError(null);
                    }}
                    className="bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                  >
                    Upload New Video
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Error State */}
        {error && !error.includes('Video file is no longer available') && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Processing Failed
              </h3>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="flex justify-center space-x-4">
                <Button 
                  variant="primary" 
                  onClick={() => {
                    setShowProcessing(false);
                    setError(null);
                  }}
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancelProject}
                >
                  Start Over
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎬</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Smart Translation
            </h3>
            <p className="text-gray-600">
              AI-powered translation that understands context and maintains meaning
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎤</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Natural Voice Dubbing
            </h3>
            <p className="text-gray-600">
              High-quality text-to-speech with natural sounding voices
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✏️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Easy Editing
            </h3>
            <p className="text-gray-600">
              Edit translations, adjust timing, and perfect your dubbed video
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;
