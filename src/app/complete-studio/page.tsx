'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVideoStore } from '../../store/videoStore';
import { VideoPlayer } from '../../components/video/VideoPlayer';
import { TranslationEditor } from '../../components/translation/TranslationEditor';
import { SubtitleTimeline } from '../../components/translation/SubtitleTimeline';
import { DubbingStudio } from '../../components/dubbing/DubbingStudio';
import { ExportStudio } from '../../components/export/ExportStudio';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeftIcon, 
  PlayIcon, 
  PauseIcon,
  DocumentTextIcon,
  ClockIcon,
  MicrophoneIcon,
  ArrowDownTrayIcon,
  Squares2X2Icon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { Subtitle } from '../../lib/types';

export default function CompleteStudioPage() {
  const router = useRouter();
  const { currentProject, projects, setCurrentProject, playerState } = useVideoStore();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'editor' | 'timeline' | 'dubbing' | 'export'>('editor');
  const [layout, setLayout] = useState<'split' | 'full'>('split');
  const [isExporting, setIsExporting] = useState(false);

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

  const tabs = [
    { id: 'editor', label: 'Editor', icon: DocumentTextIcon },
    { id: 'timeline', label: 'Timeline', icon: ClockIcon },
    { id: 'dubbing', label: 'Dubbing', icon: MicrophoneIcon },
    { id: 'export', label: 'Export', icon: ArrowDownTrayIcon }
  ];

  const renderActiveComponent = () => {
    const props = {
      onSubtitleSelect: handleSubtitleSelect,
      onTimeSeek: handleTimeSeek,
      className: layout === 'split' ? 'h-[600px]' : 'h-[800px]'
    };

    switch (activeTab) {
      case 'editor':
        return <TranslationEditor {...props} />;
      case 'timeline':
        return <SubtitleTimeline {...props} />;
      case 'dubbing':
        return <DubbingStudio {...props} />;
      case 'export':
        return <ExportStudio {...props} />;
      default:
        return <TranslationEditor {...props} />;
    }
  };

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
              <h1 className="text-xl font-semibold">Complete Studio</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Layout Toggle */}
              <Button
                variant="ghost"
                onClick={() => setLayout(layout === 'split' ? 'full' : 'split')}
                className="flex items-center space-x-2"
              >
                <Squares2X2Icon className="w-4 h-4" />
                <span>{layout === 'split' ? 'Full' : 'Split'}</span>
              </Button>

              {/* Video Editor Button */}
              <Button
                variant="outline"
                onClick={() => router.push('/video-editor')}
                className="flex items-center space-x-2"
              >
                <PencilSquareIcon className="w-4 h-4" />
                <span>Video Editor</span>
              </Button>

              {/* Export Button */}
              <Button
                variant="primary"
                onClick={() => {
                  setIsExporting(true);
                  setTimeout(() => {
                    setActiveTab('export');
                    setIsExporting(false);
                  }, 1000);
                }}
                disabled={isExporting}
                className="flex items-center space-x-2"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>{isExporting ? 'Loading...' : 'Export'}</span>
              </Button>

              {/* Export Page Button */}
              <Button
                variant="outline"
                onClick={() => router.push('/export')}
                className="flex items-center space-x-2"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Export Page</span>
              </Button>

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
      </div>

      {currentProject && currentProject.video ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Video Player */}
          {layout === 'split' && (
            <div className="mb-6">
              <VideoPlayer
                videoUrl={currentProject.video.url}
                subtitles={currentProject.subtitles}
                onTimeUpdate={handleTimeUpdate}
                onDurationChange={handleDurationChange}
                className="w-full max-w-4xl mx-auto"
              />
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'editor' | 'timeline' | 'dubbing' | 'export')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Playback Status */}
              <div className="flex items-center space-x-4">
                {/* Video Editor Quick Access */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/video-editor')}
                  className="flex items-center space-x-2"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  <span>Video Editor</span>
                </Button>

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

                {/* Progress Stats */}
                <div className="text-sm text-gray-400">
                  {currentProject.subtitles.filter(sub => sub.isEdited).length} / {currentProject.subtitles.length} edited
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={layout === 'split' ? 'grid grid-cols-1 lg:grid-cols-4 gap-6' : 'grid grid-cols-1 gap-6'}>
            {/* Main Panel */}
            <div className={layout === 'split' ? 'lg:col-span-3' : 'col-span-1'}>
              {layout === 'full' && (
                <div className="mb-6">
                  <VideoPlayer
                    videoUrl={currentProject.video.url}
                    subtitles={currentProject.subtitles}
                    onTimeUpdate={handleTimeUpdate}
                    onDurationChange={handleDurationChange}
                    className="w-full"
                  />
                </div>
              )}
              {renderActiveComponent()}
            </div>

            {/* Sidebar */}
            {layout === 'split' && (
              <div className="space-y-6">
                {/* Project Info */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Project Overview</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="truncate ml-2">{currentProject.name}</span>
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
                  </div>
                </div>

                {/* Progress Summary */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Progress</h3>
                  <div className="space-y-4">
                    {/* Translation Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Translation</span>
                        <span>
                          {currentProject.subtitles.filter(sub => sub.isEdited).length} / {currentProject.subtitles.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(currentProject.subtitles.filter(sub => sub.isEdited).length / currentProject.subtitles.length) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Dubbing Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Dubbing</span>
                        <span>
                          {currentProject.audioTracks.filter(track => track.type === 'dubbed').length} / 1
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${currentProject.audioTracks.filter(track => track.type === 'dubbed').length > 0 ? 100 : 0}%` 
                          }}
                        ></div>
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
                        const firstUnedited = currentProject.subtitles.find(sub => !sub.isEdited);
                        if (firstUnedited) {
                          handleTimeSeek(firstUnedited.startTime);
                          setActiveTab('editor');
                        }
                      }}
                    >
                      Continue Translation
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setActiveTab('dubbing');
                      }}
                    >
                      Start Dubbing
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        router.push('/video-editor');
                      }}
                    >
                      <PencilSquareIcon className="w-4 h-4 mr-2" />
                      Video Editor
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setIsExporting(true);
                        setTimeout(() => {
                          setActiveTab('export');
                          setIsExporting(false);
                        }, 1000);
                      }}
                      disabled={isExporting}
                    >
                      {isExporting ? 'Loading...' : 'Export Project'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        router.push('/export');
                      }}
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                      Export Page
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-4">No Project Selected</h2>
              <p className="text-gray-400 mb-6">
                Please select a project to access the complete studio features.
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
