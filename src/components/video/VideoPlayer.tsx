import { useState, useRef, useEffect, useCallback } from 'react';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ForwardIcon,
  BackwardIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { useVideoStore } from '../../store/videoStore';
import { formatTime } from '../../lib/utils';
import { Subtitle } from '../../lib/types';

interface VideoPlayerProps {
  videoUrl: string;
  subtitles?: Subtitle[];
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  className?: string;
}

export function VideoPlayer({ 
  videoUrl, 
  subtitles = [], 
  onTimeUpdate,
  onDurationChange,
  className = '' 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true);
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  const { 
    playerState, 
    updatePlayerState,
    currentProject
  } = useVideoStore();

  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    isFullscreen,
    showSubtitles,
    selectedAudioTrack
  } = playerState;

  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [isPlaying]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    videoRef.current.volume = clampedVolume;
    updatePlayerState({ volume: clampedVolume, isMuted: clampedVolume === 0 });
  }, [updatePlayerState]);

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    updatePlayerState({ isMuted: newMuted });
  }, [isMuted, updatePlayerState]);

  // Handle seek
  const handleSeek = useCallback((time: number) => {
    if (!videoRef.current) return;
    
    const clampedTime = Math.max(0, Math.min(duration, time));
    videoRef.current.currentTime = clampedTime;
    updatePlayerState({ currentTime: clampedTime });
  }, [duration, updatePlayerState]);

  // Handle progress bar dragging
  const handleProgressMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const progressBar = containerRef.current.querySelector('.progress-bar');
    if (!progressBar) return;
    
    const progressRect = progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - progressRect.left) / progressRect.width));
    const time = percent * duration;
    
    if (isDragging) {
      setDragTime(time);
    } else {
      handleSeek(time);
    }
  }, [duration, isDragging, handleSeek]);

  const handleProgressMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    handleProgressMouseMove(e);
  }, [handleProgressMouseMove]);

  const handleProgressMouseUp = useCallback(() => {
    if (isDragging) {
      handleSeek(dragTime);
      setIsDragging(false);
    }
  }, [isDragging, dragTime, handleSeek]);

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Handle playback rate
  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (!videoRef.current) return;
    
    videoRef.current.playbackRate = rate;
    updatePlayerState({ playbackRate: rate });
  }, [updatePlayerState]);

  // Handle subtitle toggle
  const toggleSubtitles = useCallback(() => {
    updatePlayerState({ showSubtitles: !showSubtitles });
  }, [showSubtitles, updatePlayerState]);

  // Handle audio track change
  const handleAudioTrackChange = useCallback((trackId: string) => {
    updatePlayerState({ selectedAudioTrack: trackId });
  }, [updatePlayerState]);

  // Skip forward/backward
  const skipTime = useCallback((seconds: number) => {
    const newTime = currentTime + seconds;
    handleSeek(newTime);
  }, [currentTime, handleSeek]);

  // Video event handlers
  const handleVideoTimeUpdate = useCallback(() => {
    if (!videoRef.current || isDragging) return;
    
    const time = videoRef.current.currentTime;
    updatePlayerState({ currentTime: time });
    onTimeUpdate?.(time);
    
    // Find current subtitle
    const subtitle = subtitles.find(sub => 
      time >= sub.startTime && time <= sub.endTime
    );
    setCurrentSubtitle(subtitle || null);
  }, [isDragging, updatePlayerState, onTimeUpdate, subtitles]);

  const handleVideoLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    
    const videoDuration = videoRef.current.duration;
    updatePlayerState({ duration: videoDuration });
    onDurationChange?.(videoDuration);
  }, [updatePlayerState, onDurationChange]);

  const handleVideoPlay = useCallback(() => {
    updatePlayerState({ isPlaying: true });
  }, [updatePlayerState]);

  const handleVideoPause = useCallback(() => {
    updatePlayerState({ isPlaying: false });
  }, [updatePlayerState]);

  const handleVideoEnded = useCallback(() => {
    updatePlayerState({ isPlaying: false, currentTime: duration });
  }, [updatePlayerState, duration]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipTime(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipTime(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(volume - 0.1);
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skipTime, handleVolumeChange, volume, toggleMute, toggleFullscreen, isFullscreen]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      updatePlayerState({ isFullscreen: isCurrentlyFullscreen });
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [updatePlayerState]);

  // Mouse move handler for showing/hiding controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      
      if (isPlaying) {
        timeout = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', () => {
        if (isPlaying) {
          setShowControls(false);
        }
      });
    }

    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isPlaying]);

  // Global mouse handlers for progress bar dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && containerRef.current) {
        const progressBar = containerRef.current.querySelector('.progress-bar');
        if (!progressBar) return;
        
        const progressRect = progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - progressRect.left) / progressRect.width));
        const time = percent * duration;
        setDragTime(time);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleSeek(dragTime);
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragTime, duration, handleSeek]);

  const displayTime = isDragging ? dragTime : currentTime;
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      style={{ aspectRatio: '16/9' }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={handleVideoTimeUpdate}
        onLoadedMetadata={handleVideoLoadedMetadata}
        onPlay={handleVideoPlay}
        onPause={handleVideoPause}
        onEnded={handleVideoEnded}
        onVolumeChange={(e) => {
          const video = e.target as HTMLVideoElement;
          updatePlayerState({ 
            volume: video.volume, 
            isMuted: video.muted 
          });
        }}
        preload="metadata"
        playsInline
      />

      {/* Subtitle Overlay */}
      {showSubtitles && currentSubtitle && (
        <div className="absolute bottom-20 left-0 right-0 flex justify-center px-4">
          <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg max-w-4xl text-center">
            <p className="text-lg font-medium leading-relaxed">
              {currentSubtitle.text}
            </p>
          </div>
        </div>
      )}

      {/* Video Controls */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Center Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-4 rounded-full transition-all duration-200"
          >
            {isPlaying ? (
              <PauseIcon className="w-8 h-8" />
            ) : (
              <PlayIcon className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div 
              className="progress-bar w-full h-2 bg-gray-600 rounded-full cursor-pointer relative"
              onMouseDown={handleProgressMouseDown}
              onMouseMove={handleProgressMouseMove}
              onMouseUp={handleProgressMouseUp}
            >
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-pointer"
                style={{ left: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Control Bar */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="hover:text-blue-400 transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6" />
                )}
              </button>

              {/* Skip Backward */}
              <button
                onClick={() => skipTime(-10)}
                className="hover:text-blue-400 transition-colors"
              >
                <BackwardIcon className="w-5 h-5" />
              </button>

              {/* Skip Forward */}
              <button
                onClick={() => skipTime(10)}
                className="hover:text-blue-400 transition-colors"
              >
                <ForwardIcon className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="hover:text-blue-400 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <SpeakerXMarkIcon className="w-5 h-5" />
                  ) : (
                    <SpeakerWaveIcon className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Time Display */}
              <span className="text-sm tabular-nums">
                {formatTime(displayTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Playback Rate */}
              <select
                value={playbackRate}
                onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                className="bg-transparent border border-gray-600 rounded px-2 py-1 text-sm"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>

              {/* Audio Track Selector */}
              {currentProject && currentProject.audioTracks.length > 1 && (
                <select 
                  value={selectedAudioTrack} 
                  onChange={(e) => handleAudioTrackChange(e.target.value)}
                  className="bg-transparent border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  {currentProject.audioTracks.map(track => (
                    <option key={track.id} value={track.id}>
                      {track.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Subtitle Toggle */}
              <button
                onClick={toggleSubtitles}
                className={`hover:text-blue-400 transition-colors ${
                  showSubtitles ? 'text-blue-400' : 'text-gray-400'
                }`}
                title="Toggle Subtitles"
              >
                <ChatBubbleLeftIcon className="w-5 h-5" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="hover:text-blue-400 transition-colors"
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="w-5 h-5" />
                ) : (
                  <ArrowsPointingOutIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {!videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p>Loading video...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
