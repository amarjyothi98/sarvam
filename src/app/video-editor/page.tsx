'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVideoStore } from '../../store/videoStore';
import { VideoPlayer } from '../../components/video/VideoPlayer';
import { TimelineControls } from '../../components/editing/TimelineControls';
import { AudioControls } from '../../components/editing/AudioControls';
import { Button } from '../../components/ui/Button';
import { 
  FilmIcon,
  SpeakerWaveIcon,
  ScissorsIcon,
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon
} from '@heroicons/react/24/outline';

export default function VideoEditingPage() {
  const router = useRouter();
  const { currentProject } = useVideoStore();
  const [activeTab, setActiveTab] = useState<'timeline' | 'audio'>('timeline');
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipBackward = () => {
    // Skip backward 10 seconds
    console.log('Skip backward');
  };

  const handleSkipForward = () => {
    // Skip forward 10 seconds
    console.log('Skip forward');
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <FilmIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No Project Selected</h1>
          <p className="text-gray-400 mb-4">Please select a project to start editing.</p>
          <Button variant="primary" onClick={() => window.history.back()}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/complete-studio')}
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Back to Studio</span>
              </Button>
              <div className="w-px h-6 bg-gray-600" />
              <FilmIcon className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold">Video Editor</h1>
                <p className="text-sm text-gray-400">{currentProject.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Quick playback controls */}
              <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipBackward}
                  className="p-1"
                >
                  <BackwardIcon className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  className="p-1"
                >
                  {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipForward}
                  className="p-1"
                >
                  <ForwardIcon className="w-4 h-4" />
                </Button>
              </div>
              
              <Button variant="primary" className="flex items-center space-x-2">
                <ScissorsIcon className="w-4 h-4" />
                <span>Export</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => router.push('/export')}
                className="flex items-center space-x-2"
              >
                <ScissorsIcon className="w-4 h-4" />
                <span>Export Page</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Preview */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Video Preview</h2>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <VideoPlayer videoUrl={currentProject.video.url} />
              </div>
              
              {/* Video Info */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>Resolution: 1920x1080</span>
                  <span>FPS: 30</span>
                  <span>Duration: {Math.round(currentProject.video.duration)}s</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Quality:</span>
                  <select className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                    <option value="auto">Auto</option>
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Editing Tabs */}
            <div className="bg-gray-800 rounded-lg">
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === 'timeline'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <ScissorsIcon className="w-5 h-5" />
                  <span>Timeline</span>
                </button>
                <button
                  onClick={() => setActiveTab('audio')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === 'audio'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <SpeakerWaveIcon className="w-5 h-5" />
                  <span>Audio</span>
                </button>
              </div>
              
              <div className="p-6">
                {activeTab === 'timeline' && (
                  <TimelineControls />
                )}
                {activeTab === 'audio' && (
                  <AudioControls />
                )}
              </div>
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* Project Info */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Project Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white">{currentProject.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Language:</span>
                  <span className="text-white">{currentProject.currentLanguage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white">{Math.round(currentProject.video.duration)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtitles:</span>
                  <span className="text-white">{currentProject.subtitles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Audio Tracks:</span>
                  <span className="text-white">{currentProject.audioTracks.length}</span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => console.log('Add subtitle')}
                >
                  <span>Add Subtitle</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => console.log('Add audio track')}
                >
                  <span>Add Audio Track</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => console.log('Apply effects')}
                >
                  <span>Apply Effects</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => console.log('Color correction')}
                >
                  <span>Color Correction</span>
                </Button>
              </div>
            </div>
            
            {/* Export Settings */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Export Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Format
                  </label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                    <option value="mp4">MP4</option>
                    <option value="webm">WebM</option>
                    <option value="mov">MOV</option>
                    <option value="avi">AVI</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quality
                  </label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                    <option value="4k">4K (3840x2160)</option>
                    <option value="1080p">1080p (1920x1080)</option>
                    <option value="720p">720p (1280x720)</option>
                    <option value="480p">480p (854x480)</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-subtitles"
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="include-subtitles" className="text-sm text-gray-300">
                    Include Subtitles
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-audio"
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                    defaultChecked
                  />
                  <label htmlFor="include-audio" className="text-sm text-gray-300">
                    Include Audio
                  </label>
                </div>
                
                <Button 
                  variant="primary" 
                  className="w-full mt-4"
                  onClick={() => router.push('/export')}
                >
                  <ScissorsIcon className="w-4 h-4 mr-2" />
                  Start Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
