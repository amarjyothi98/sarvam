'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useVideoStore } from '../../store/videoStore';
import { Button } from '../ui/Button';
import { 
  PlayIcon,
  PauseIcon,
  ScissorsIcon,
  ArrowUturnLeftIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatTime } from '../../lib/utils';

interface TimelineControlsProps {
  className?: string;
}

export function TimelineControls({ className = '' }: TimelineControlsProps) {
  const { 
    currentProject, 
    updatePlayerState, 
    updateProject 
  } = useVideoStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'playhead' | 'start' | 'end' | null>(null);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (currentProject) {
      setDuration(currentProject.video.duration);
      setTrimStart(currentProject.trimStart || 0);
      setTrimEnd(currentProject.trimEnd || currentProject.video.duration);
    }
  }, [currentProject]);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      updatePlayerState({ isPlaying: !isPlaying });
    }
  }, [isPlaying, updatePlayerState]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      updatePlayerState({ currentTime: time });
    }
  }, [updatePlayerState]);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      updatePlayerState({ currentTime: time });
    }
  }, [updatePlayerState]);

  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'playhead' | 'start' | 'end') => {
    e.preventDefault();
    setIsDragging(true);
    setDragType(type);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !timelineRef.current || !dragType) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const time = percentage * duration;

    switch (dragType) {
      case 'playhead':
        handleSeek(time);
        break;
      case 'start':
        setTrimStart(Math.min(time, trimEnd - 1));
        break;
      case 'end':
        setTrimEnd(Math.max(time, trimStart + 1));
        break;
    }
  }, [isDragging, dragType, duration, trimEnd, trimStart, handleSeek]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && currentProject && dragType) {
      if (dragType === 'start' || dragType === 'end') {
        updateProject(currentProject.id, {
          trimStart,
          trimEnd
        });
      }
    }
    setIsDragging(false);
    setDragType(null);
  }, [isDragging, dragType, currentProject, trimStart, trimEnd, updateProject]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.5, 10));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.1));
  }, []);

  const handleTrimToSelection = useCallback(() => {
    if (currentProject) {
      updateProject(currentProject.id, {
        trimStart,
        trimEnd
      });
    }
  }, [currentProject, trimStart, trimEnd, updateProject]);

  const handleResetTrim = useCallback(() => {
    if (currentProject) {
      setTrimStart(0);
      setTrimEnd(currentProject.video.duration);
      updateProject(currentProject.id, {
        trimStart: 0,
        trimEnd: currentProject.video.duration
      });
    }
  }, [currentProject, updateProject]);

  if (!currentProject) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-400">
          <ClockIcon className="w-12 h-12 mx-auto mb-4" />
          <p>No project selected</p>
        </div>
      </div>
    );
  }

  const playheadPosition = (currentTime / duration) * 100;
  const trimStartPosition = (trimStart / duration) * 100;
  const trimEndPosition = (trimEnd / duration) * 100;

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      {/* Hidden video element for control */}
      <video
        ref={videoRef}
        src={currentProject.video.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
          }
        }}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Timeline Controls</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="p-2"
          >
            <MagnifyingGlassMinusIcon className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-400 px-2">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="p-2"
          >
            <MagnifyingGlassPlusIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Timeline</span>
          <span className="text-sm text-gray-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        
        <div
          ref={timelineRef}
          className="relative h-16 bg-gray-700 rounded-lg cursor-pointer overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ transform: `scaleX(${zoomLevel})`, transformOrigin: 'left' }}
        >
          {/* Waveform visualization (mock) */}
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 50 }, (_, i) => (
              <div
                key={i}
                className="w-1 bg-gray-600 mx-px"
                style={{
                  height: `${Math.random() * 40 + 20}%`,
                  opacity: 0.7
                }}
              />
            ))}
          </div>

          {/* Trim selection */}
          <div
            className="absolute top-0 bottom-0 bg-blue-500 bg-opacity-20 border-l-2 border-r-2 border-blue-500"
            style={{
              left: `${trimStartPosition}%`,
              width: `${trimEndPosition - trimStartPosition}%`
            }}
          />

          {/* Trim start handle */}
          <div
            className="absolute top-0 bottom-0 w-2 bg-blue-500 cursor-ew-resize hover:bg-blue-400"
            style={{ left: `${trimStartPosition}%` }}
            onMouseDown={(e) => handleMouseDown(e, 'start')}
          />

          {/* Trim end handle */}
          <div
            className="absolute top-0 bottom-0 w-2 bg-blue-500 cursor-ew-resize hover:bg-blue-400"
            style={{ left: `${trimEndPosition}%` }}
            onMouseDown={(e) => handleMouseDown(e, 'end')}
          />

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 cursor-ew-resize"
            style={{ left: `${playheadPosition}%` }}
            onMouseDown={(e) => handleMouseDown(e, 'playhead')}
          >
            <div className="absolute -top-1 -left-2 w-4 h-4 bg-red-500 rounded-full" />
          </div>

          {/* Time markers */}
          {Array.from({ length: 11 }, (_, i) => {
            const time = (i / 10) * duration;
            const position = (time / duration) * 100;
            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-gray-500"
                style={{ left: `${position}%` }}
              >
                <span className="absolute -bottom-6 -left-4 text-xs text-gray-400">
                  {formatTime(time)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="primary"
            onClick={handlePlayPause}
            className="flex items-center space-x-2"
          >
            {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleTrimToSelection}
            className="flex items-center space-x-2"
          >
            <ScissorsIcon className="w-4 h-4" />
            <span>Apply Trim</span>
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleResetTrim}
            className="flex items-center space-x-2"
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
            <span>Reset</span>
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            Trim: {formatTime(trimStart)} - {formatTime(trimEnd)}
          </div>
          <div className="text-sm text-gray-400">
            Duration: {formatTime(trimEnd - trimStart)}
          </div>
        </div>
      </div>

      {/* Time Input Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Start Time
          </label>
          <input
            type="number"
            value={Math.round(trimStart * 100) / 100}
            onChange={(e) => setTrimStart(Math.max(0, Math.min(Number(e.target.value), trimEnd - 1)))}
            onBlur={() => handleTrimToSelection()}
            step="0.1"
            min="0"
            max={duration}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            End Time
          </label>
          <input
            type="number"
            value={Math.round(trimEnd * 100) / 100}
            onChange={(e) => setTrimEnd(Math.max(trimStart + 1, Math.min(Number(e.target.value), duration)))}
            onBlur={() => handleTrimToSelection()}
            step="0.1"
            min="0"
            max={duration}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

export default TimelineControls;
