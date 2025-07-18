'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVideoStore } from '../../store/videoStore';
import { VideoPlayer } from '../../components/video/VideoPlayer';
import { TranslationEditor } from '../../components/translation/TranslationEditor';
import { SubtitleTimeline } from '../../components/translation/SubtitleTimeline';
import { DubbingStudio } from '../../components/dubbing/DubbingStudio';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeftIcon, 
  PlayIcon, 
  PauseIcon,
  DocumentTextIcon,
  ClockIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';
import { Subtitle } from '../../lib/types';

export default function TranslationStudioPage() {
  const router = useRouter();
  const { currentProject, projects, setCurrentProject, playerState } = useVideoStore();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'editor' | 'timeline' | 'dubbing'>('editor');

  const handleProjectChange = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      setSelectedProject(projectId);
    }
  }, [projects, setCurrentProject]);

  const handleTimeSeek = useCallback((time: number) => {
    // The VideoPlayer component will handle the actual seeking
    console.log('Seeking to:', time);
  }, []);

  const handleSubtitleSelect = useCallback((subtitle: Subtitle) => {
    console.log('Selected subtitle:', subtitle);
    // Additional logic for subtitle selection can be added here
  }, []);

  const handleTimeUpdate = useCallback((currentTime: number) => {
    // Handle time updates if needed
    console.log('Time updated:', currentTime);
  }, []);

  const handleDurationChange = useCallback((duration: number) => {
    // Handle duration changes if needed
    console.log('Duration changed:', duration);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="p-2"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold">Translation Studio</h1>
            </div>

            {/* Project Selector */}
            {projects.length > 0 && (
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Project:</label>
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
        </div>
      </div>

      {currentProject && currentProject.video ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Video Player */}
          <div className="mb-6">
            <VideoPlayer
              videoUrl={currentProject.video.url}
              subtitles={currentProject.subtitles}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              className="w-full max-w-4xl mx-auto"
            />
          </div>

          {/* Controls */}
          <div className="mb-6 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-2">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors ${
                  activeTab === 'editor' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <DocumentTextIcon className="w-4 h-4" />
                <span>Editor</span>
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors ${
                  activeTab === 'timeline' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ClockIcon className="w-4 h-4" />
                <span>Timeline</span>
              </button>
              <button
                onClick={() => setActiveTab('dubbing')}
                className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors ${
                  activeTab === 'dubbing' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <MicrophoneIcon className="w-4 h-4" />
                <span>Dubbing</span>
              </button>
            </div>

            {/* Playback Info */}
            <div className="flex items-center space-x-2 bg-gray-800 rounded-lg px-4 py-2">
              {playerState.isPlaying ? (
                <PauseIcon className="w-4 h-4 text-green-400" />
              ) : (
                <PlayIcon className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm text-gray-300">
                {Math.floor(playerState.currentTime / 60)}:{String(Math.floor(playerState.currentTime % 60)).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Translation Editor, Timeline, or Dubbing Studio */}
            <div className="lg:col-span-2">
              {activeTab === 'editor' ? (
                <TranslationEditor
                  onSubtitleSelect={handleSubtitleSelect}
                  onTimeSeek={handleTimeSeek}
                  className="h-[600px]"
                />
              ) : activeTab === 'timeline' ? (
                <SubtitleTimeline
                  onTimeSeek={handleTimeSeek}
                  onSubtitleSelect={handleSubtitleSelect}
                  className="h-[600px]"
                />
              ) : (
                <DubbingStudio
                  onSubtitleSelect={handleSubtitleSelect}
                  onTimeSeek={handleTimeSeek}
                  className="h-[600px]"
                />
              )}
            </div>

            {/* Right: Project Info & Stats */}
            <div className="space-y-6">
              {/* Project Info */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Project Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span>{currentProject.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span>{Math.round(currentProject.video.duration)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Language:</span>
                    <span>{currentProject.currentLanguage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtitles:</span>
                    <span>{currentProject.subtitles.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Audio Tracks:</span>
                    <span>{currentProject.audioTracks.length}</span>
                  </div>
                </div>
              </div>

              {/* Translation Stats */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Translation Progress</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completed</span>
                      <span>
                        {currentProject.subtitles.filter(sub => sub.isEdited).length} / {currentProject.subtitles.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(currentProject.subtitles.filter(sub => sub.isEdited).length / currentProject.subtitles.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>Edited:</span>
                      <span className="text-green-400">
                        {currentProject.subtitles.filter(sub => sub.isEdited).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Low Confidence:</span>
                      <span className="text-yellow-400">
                        {currentProject.subtitles.filter(sub => sub.confidence && sub.confidence < 0.8).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining:</span>
                      <span className="text-gray-400">
                        {currentProject.subtitles.filter(sub => !sub.isEdited).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      // Find first unedited subtitle
                      const firstUnedited = currentProject.subtitles.find(sub => !sub.isEdited);
                      if (firstUnedited) {
                        handleTimeSeek(firstUnedited.startTime);
                        handleSubtitleSelect(firstUnedited);
                      }
                    }}
                  >
                    Go to Next Unedited
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      // Find first low confidence subtitle
                      const lowConfidence = currentProject.subtitles.find(sub => 
                        sub.confidence && sub.confidence < 0.8
                      );
                      if (lowConfidence) {
                        handleTimeSeek(lowConfidence.startTime);
                        handleSubtitleSelect(lowConfidence);
                      }
                    }}
                  >
                    Go to Low Confidence
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleTimeSeek(0)}
                  >
                    Go to Beginning
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-4">No Project Selected</h2>
              <p className="text-gray-400 mb-6">
                Please select a project to start translation work.
              </p>
              <Button
                onClick={() => router.push('/')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to Upload Page
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
