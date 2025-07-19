"use client";
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with FFmpeg
const UploadPage = dynamic(() => import('../components/upload/UploadPage'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p>Loading...</p>
    </div>
  </div>
});

export default function Home() {
  return (
    <UploadPage />
  );
}
