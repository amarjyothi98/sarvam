import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { CloudArrowUpIcon, VideoCameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button, Progress, Card } from '../ui';
import { validateVideoFile, formatFileSize, createVideoThumbnail } from '../../lib/utils';
import { useVideoStore } from '../../store/videoStore';

interface FileUploadProps {
  onUploadComplete?: (file: File) => void;
  className?: string;
}

export function FileUpload({ onUploadComplete, className = '' }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const { uploadVideo } = useVideoStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file
    const validation = validateVideoFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    setUploadError(null);

    // Generate thumbnail
    try {
      const thumbnailUrl = await createVideoThumbnail(file);
      setThumbnail(thumbnailUrl);
    } catch (error) {
      console.warn('Could not generate thumbnail:', error);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.mov', '.avi']
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: false
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      await uploadVideo(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      onUploadComplete?.(selectedFile);
      
      setTimeout(() => {
        setSelectedFile(null);
        setThumbnail(null);
        setUploadProgress(0);
        setIsUploading(false);
      }, 2000);

    } catch (error) {
      setUploadError((error as Error).message || 'Upload failed');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setThumbnail(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError(null);
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {!selectedFile ? (
        <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
          <div
            {...getRootProps()}
            className={`cursor-pointer p-12 text-center ${
              isDragActive ? 'bg-blue-50 border-blue-400' : ''
            }`}
          >
            <input {...getInputProps()} />
            <VideoCameraIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            
            {isDragActive ? (
              <div>
                <p className="text-lg font-medium text-blue-600 mb-2">
                  Drop your video here
                </p>
                <p className="text-sm text-gray-600">
                  Release to upload
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Upload a video to get started
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop your video file here, or click to browse
                </p>
                <Button variant="primary" size="lg">
                  <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                  Choose Video File
                </Button>
                <p className="text-xs text-gray-500 mt-4">
                  Supports MP4, WebM, MOV, AVI • Max 500MB
                </p>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="space-y-4">
            {/* File Preview */}
            <div className="flex items-start space-x-4">
              {thumbnail && (
                <Image
                  src={thumbnail}
                  alt="Video thumbnail"
                  width={96}
                  height={64}
                  className="w-24 h-16 object-cover rounded border"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-600">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isUploading}
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Uploading...</span>
                  <span className="text-sm text-gray-600">
                    {Math.round(uploadProgress)}%
                  </span>
                </div>
                <Progress value={uploadProgress} color="blue" />
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">{uploadError}</p>
              </div>
            )}

            {/* Upload Button */}
            {!isUploading && uploadProgress < 100 && (
              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  onClick={handleUpload}
                  disabled={isUploading}
                  loading={isUploading}
                  className="flex-1"
                >
                  <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                  Upload Video
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Success Message */}
            {uploadProgress === 100 && !isUploading && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800">
                  ✅ Video uploaded successfully!
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

export default FileUpload;
