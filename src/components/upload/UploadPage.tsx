import { useState } from 'react';
import { Button } from '../ui';
import { useVideoStore } from '../../store/videoStore';
import FileUpload from './FileUpload';
import ProcessingStatus from './ProcessingStatus';
import LanguageSelect from './LanguageSelect';

export function UploadPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('hi'); // Default to Hindi
  const [showProcessing, setShowProcessing] = useState(false);
  
  const { 
    currentProject, 
    isProcessing, 
    processingSteps, 
    error, 
    startProcessing 
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
              <div className="text-right">
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-medium text-gray-900">
                  {Math.round(currentProject.video.duration)}s
                </p>
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
            <ProcessingStatus
              steps={processingSteps}
              isProcessing={isProcessing}
              error={error}
            />
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
                <Button variant="primary" size="lg">
                  Open Video Editor
                </Button>
                <Button variant="outline" size="lg">
                  Download Preview
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Processing Failed
              </h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button 
                variant="primary" 
                onClick={() => {
                  setShowProcessing(false);
                  // Reset error state would be handled by store
                }}
              >
                Try Again
              </Button>
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
