'use client';

import { useEffect, useState } from 'react';
import { useVideoStore } from '../../store/videoStore';
import { VideoPlayer } from '../../components/video/VideoPlayer';
import { Button } from '../../components/ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function PlayerPage() {
  const router = useRouter();
  const { currentProject, projects, setCurrentProject } = useVideoStore();
  const [selectedProject, setSelectedProject] = useState<string>('');

  useEffect(() => {
    // If no current project, try to find one with a video
    if (!currentProject && projects.length > 0) {
      const projectWithVideo = projects.find(p => p.video);
      if (projectWithVideo) {
        setCurrentProject(projectWithVideo);
        setSelectedProject(projectWithVideo.id);
      }
    } else if (currentProject) {
      setSelectedProject(currentProject.id);
    }
  }, [currentProject, projects, setCurrentProject]);

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      setSelectedProject(projectId);
    }
  };

  const handleTimeUpdate = (currentTime: number) => {
    // You can add time update logic here if needed
    console.log('Video time updated:', currentTime);
  };

  const handleDurationChange = (duration: number) => {
    // You can add duration change logic here if needed
    console.log('Video duration changed:', duration);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="p-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold">Video Player</h1>
          </div>

          {/* Project Selector */}
          {projects.length > 0 && (
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Select Project:</label>
              <select
                value={selectedProject}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Choose a project...</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Video Player */}
        {currentProject && currentProject.video ? (
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">{currentProject.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Duration:</span>
                  <span className="ml-2">{Math.round(currentProject.video.duration)}s</span>
                </div>
                <div>
                  <span className="text-gray-400">Size:</span>
                  <span className="ml-2">{Math.round(currentProject.video.size / 1024 / 1024)}MB</span>
                </div>
                <div>
                  <span className="text-gray-400">Available Languages:</span>
                  <span className="ml-2">{currentProject.availableLanguages.join(', ')}</span>
                </div>
                <div>
                  <span className="text-gray-400">Current Language:</span>
                  <span className="ml-2">{currentProject.currentLanguage}</span>
                </div>
              </div>
            </div>

            {/* Video Player Component */}
            <VideoPlayer
              videoUrl={currentProject.video.url}
              subtitles={currentProject.subtitles}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              className="w-full"
            />

            {/* Subtitles List */}
            {currentProject.subtitles && currentProject.subtitles.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Subtitles</h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {currentProject.subtitles.map((subtitle) => (
                    <div
                      key={subtitle.id}
                      className="flex items-start space-x-3 p-2 bg-gray-700 rounded"
                    >
                      <span className="text-blue-400 text-sm font-mono">
                        {Math.floor(subtitle.startTime / 60)}:{String(Math.floor(subtitle.startTime % 60)).padStart(2, '0')}
                      </span>
                      <span className="flex-1 text-sm">{subtitle.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-xl font-semibold mb-4">No Video Project Selected</h2>
              <p className="text-gray-400 mb-6">
                Please upload a video first to use the video player.
              </p>
              <Button
                onClick={() => router.push('/')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to Upload Page
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
