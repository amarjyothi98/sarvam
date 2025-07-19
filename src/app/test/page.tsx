'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic import to avoid SSR issues with FFmpeg
const AudioExtractor = dynamic(() => import('../../components/AudioExtractor'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p>Loading audio processing tools...</p>
    </div>
  </div>
});

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            Audio Processing Test
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Upload a video file to test the complete audio processing pipeline
          </p>
          <Suspense fallback={
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading...</p>
              </div>
            </div>
          }>
            <AudioExtractor />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
