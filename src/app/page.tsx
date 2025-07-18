"use client";
import { useRouter } from 'next/navigation';
import { useVideoStore } from '../store/videoStore';
import { UploadPage } from '../components/upload';
import { Button } from '../components/ui/Button';
import { PlayIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();
  const { projects } = useVideoStore();
  const hasProjects = projects.length > 0;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header with navigation */}
      {hasProjects && (
        <div className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl font-semibold text-white">Video Dubbing Studio</h1>
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/player')}
                  className="flex items-center space-x-2"
                >
                  <PlayIcon className="w-4 h-4" />
                  <span>Player</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push('/studio')}
                  className="flex items-center space-x-2"
                >
                  <PlayIcon className="w-4 h-4" />
                  <span>Studio</span>
                </Button>
                <Button
                  variant="primary"
                  onClick={() => router.push('/complete-studio')}
                  className="flex items-center space-x-2"
                >
                  <PlayIcon className="w-4 h-4" />
                  <span>Complete Studio</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <UploadPage />
    </div>
  );
}
