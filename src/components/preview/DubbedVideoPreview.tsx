'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useVideoStore } from '../../store/videoStore';
import { Button } from '../ui/Button';
import { 
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ForwardIcon,
  BackwardIcon,
  Cog6ToothIcon,
  LanguageIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { formatTime } from '../../lib/utils';

interface DubbedVideoPreviewProps {
  className?: string;
}

export function DubbedVideoPreview({ className = '' }: DubbedVideoPreviewProps) {
  const { currentProject, updatePlayerState } = useVideoStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [audioTrack, setAudioTrack] = useState<'original' | 'dubbed'>('dubbed');
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // Auto-hide controls in fullscreen
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isFullscreen && showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isFullscreen, showControls]);

  const handlePlay = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      updatePlayerState({ isPlaying: true });
    }
  }, [updatePlayerState]);

  const handlePause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      updatePlayerState({ isPlaying: false });
    }
  }, [updatePlayerState]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [isPlaying, handlePlay, handlePause]);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      updatePlayerState({ currentTime: time });
    }
  }, [updatePlayerState]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    updatePlayerState({ volume: newVolume });
  }, [updatePlayerState]);

  const handleMuteToggle = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (videoRef.current) {
      videoRef.current.muted = newMuted;
    }
    updatePlayerState({ isMuted: newMuted });
  }, [isMuted, updatePlayerState]);

  const handleFullscreenToggle = useCallback(() => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    updatePlayerState({ playbackRate: speed });
  }, [updatePlayerState]);

  const handleSkip = useCallback((seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      handleSeek(newTime);
    }
  }, [currentTime, duration, handleSeek]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleLoadStart = useCallback(() => {
    setIsBuffering(true);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsBuffering(false);
  }, []);

  const getCurrentSubtitle = useCallback(() => {
    if (!currentProject || !showSubtitles) return null;
    return currentProject.subtitles.find(
      subtitle => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
    );
  }, [currentProject, currentTime, showSubtitles]);

  const currentSubtitle = getCurrentSubtitle();

  if (!currentProject) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-400">
          <PlayIcon className="w-12 h-12 mx-auto mb-4" />
          <p>No project selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      {/* Video Container */}
      <div
        className="relative aspect-video bg-black group"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => !isFullscreen && setShowControls(true)}
        onMouseMove={() => setShowControls(true)}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={currentProject.video.url}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          onEnded={() => setIsPlaying(false)}
          playsInline
        />

        {/* Loading Spinner */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Subtitles Overlay */}
        {currentSubtitle && (
          <div className="absolute bottom-20 left-4 right-4 text-center">
            <div className="inline-block bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-lg font-medium">
              {audioTrack === 'dubbed' ? currentSubtitle.text : currentSubtitle.text}
            </div>
          </div>
        )}

        {/* Play/Pause Overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={handlePlayPause}
        >
          {!isPlaying && !isBuffering && (
            <div className="bg-black bg-opacity-50 rounded-full p-4">
              <PlayIcon className="w-16 h-16 text-white" />
            </div>
          )}
        </div>

        {/* Controls Overlay */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 text-sm text-white">
                <span>{formatTime(currentTime)}</span>
                <div className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer">
                  <div
                    className="h-1 bg-blue-500 rounded-full relative"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Play/Pause */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  className="text-white hover:text-blue-400"
                >
                  {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                </Button>

                {/* Skip Controls */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSkip(-10)}
                  className="text-white hover:text-blue-400"
                >
                  <BackwardIcon className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSkip(10)}
                  className="text-white hover:text-blue-400"
                >
                  <ForwardIcon className="w-5 h-5" />
                </Button>

                {/* Volume */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMuteToggle}
                    className="text-white hover:text-blue-400"
                  >
                    {isMuted ? <SpeakerXMarkIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />}
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Audio Track Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAudioTrack(audioTrack === 'original' ? 'dubbed' : 'original')}
                  className={`text-white hover:text-blue-400 ${
                    audioTrack === 'dubbed' ? 'bg-blue-600' : ''
                  }`}
                >
                  <LanguageIcon className="w-5 h-5" />
                </Button>

                {/* Subtitle Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubtitles(!showSubtitles)}
                  className={`text-white hover:text-blue-400 ${
                    showSubtitles ? 'bg-blue-600' : ''
                  }`}
                >
                  {showSubtitles ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                {/* Settings */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:text-blue-400"
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                </Button>

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFullscreenToggle}
                  className="text-white hover:text-blue-400"
                >
                  {isFullscreen ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute bottom-16 right-4 bg-gray-900 bg-opacity-90 rounded-lg p-4 min-w-48">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Playback Speed
                </label>
                <select
                  value={playbackSpeed}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                >
                  <option value={0.25}>0.25x</option>
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quality
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                >
                  <option value="auto">Auto</option>
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                  <option value="360p">360p</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Audio Track
                </label>
                <select
                  value={audioTrack}
                  onChange={(e) => setAudioTrack(e.target.value as 'original' | 'dubbed')}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                >
                  <option value="original">Original</option>
                  <option value="dubbed">Dubbed</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="subtitles"
                  checked={showSubtitles}
                  onChange={(e) => setShowSubtitles(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="subtitles" className="text-sm text-gray-300">
                  Show Subtitles
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="p-4 bg-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-white">{currentProject.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            <div className="w-px h-4 bg-gray-600"></div>
            <span>{playbackSpeed}x</span>
            <div className="w-px h-4 bg-gray-600"></div>
            <span className="capitalize">{audioTrack}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Language: {currentProject.currentLanguage}</span>
          <span>Subtitles: {currentProject.subtitles.length}</span>
        </div>
      </div>
    </div>
  );
}

export default DubbedVideoPreview;
