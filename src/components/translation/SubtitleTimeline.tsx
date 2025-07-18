'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import { useVideoStore } from '../../store/videoStore';
import { Subtitle } from '../../lib/types';
import { formatTime } from '../../lib/utils';

interface SubtitleTimelineProps {
  onTimeSeek?: (time: number) => void;
  onSubtitleSelect?: (subtitle: Subtitle) => void;
  className?: string;
}

export function SubtitleTimeline({ 
  onTimeSeek, 
  onSubtitleSelect, 
  className = '' 
}: SubtitleTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);

  const { 
    currentProject, 
    playerState, 
    updateSubtitleEditor 
  } = useVideoStore();

  const { currentTime, duration } = playerState;
  const subtitles = currentProject?.subtitles || [];

  // Calculate timeline dimensions
  const timelineWidth = Math.max(800, (duration || 0) * 50 * zoom);
  const pixelsPerSecond = timelineWidth / (duration || 1);

  // Handle timeline click
  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (!timelineRef.current || !duration) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + scrollPosition;
    const clickTime = clickX / pixelsPerSecond;
    
    onTimeSeek?.(Math.max(0, Math.min(duration, clickTime)));
  }, [duration, pixelsPerSecond, scrollPosition, onTimeSeek]);

  // Handle subtitle click
  const handleSubtitleClick = useCallback((subtitle: Subtitle, e: React.MouseEvent) => {
    e.stopPropagation();
    onSubtitleSelect?.(subtitle);
    onTimeSeek?.(subtitle.startTime);
    updateSubtitleEditor({ selectedSubtitle: subtitle.id });
  }, [onSubtitleSelect, onTimeSeek, updateSubtitleEditor]);

  // Handle zoom
  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(Math.max(0.1, Math.min(5, newZoom)));
  }, []);

  // Auto-scroll to current time
  useEffect(() => {
    if (!timelineRef.current) return;

    const currentTimePosition = currentTime * pixelsPerSecond;
    const containerWidth = timelineRef.current.clientWidth;
    const scrollLeft = Math.max(0, currentTimePosition - containerWidth / 2);
    
    setScrollPosition(scrollLeft);
  }, [currentTime, pixelsPerSecond]);

  // Generate time markers
  const generateTimeMarkers = useCallback(() => {
    if (!duration) return [];
    
    const markers = [];
    const interval = zoom > 2 ? 1 : zoom > 1 ? 5 : 10; // Seconds between markers
    
    for (let time = 0; time <= duration; time += interval) {
      markers.push(time);
    }
    
    return markers;
  }, [duration, zoom]);

  const timeMarkers = generateTimeMarkers();

  if (!currentProject || !duration) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
        <div className="text-center text-gray-400">
          <p>No timeline available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Subtitle Timeline</h3>
          
          <div className="flex items-center space-x-4">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleZoomChange(zoom - 0.2)}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              >
                -
              </button>
              <span className="text-sm text-gray-300 min-w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => handleZoomChange(zoom + 0.2)}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              >
                +
              </button>
            </div>

            {/* Time Display */}
            <div className="text-sm text-gray-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative">
        {/* Time Markers */}
        <div className="h-8 bg-gray-900 border-b border-gray-700 overflow-hidden">
          <div 
            className="relative h-full"
            style={{ width: `${timelineWidth}px`, transform: `translateX(-${scrollPosition}px)` }}
          >
            {timeMarkers.map(time => (
              <div
                key={time}
                className="absolute top-0 h-full flex items-center"
                style={{ left: `${time * pixelsPerSecond}px` }}
              >
                <div className="w-px h-full bg-gray-600"></div>
                <span className="ml-1 text-xs text-gray-400">
                  {formatTime(time)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div 
          ref={timelineRef}
          className="h-24 bg-gray-900 overflow-hidden cursor-pointer relative"
          onClick={handleTimelineClick}
        >
          {/* Timeline Track */}
          <div 
            className="relative h-full"
            style={{ width: `${timelineWidth}px`, transform: `translateX(-${scrollPosition}px)` }}
          >
            {/* Subtitles */}
            {subtitles.map(subtitle => {
              const startPos = subtitle.startTime * pixelsPerSecond;
              const width = (subtitle.endTime - subtitle.startTime) * pixelsPerSecond;
              const isActive = currentTime >= subtitle.startTime && currentTime <= subtitle.endTime;
              
              return (
                <div
                  key={subtitle.id}
                  className={`absolute top-4 h-16 rounded cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-blue-500 border-2 border-blue-400' 
                      : subtitle.isEdited 
                        ? 'bg-yellow-600 border border-yellow-500' 
                        : 'bg-gray-600 border border-gray-500'
                  } hover:bg-opacity-80`}
                  style={{ 
                    left: `${startPos}px`, 
                    width: `${Math.max(width, 20)}px` 
                  }}
                  onClick={(e) => handleSubtitleClick(subtitle, e)}
                  title={subtitle.text}
                >
                  <div className="p-1 text-xs text-white overflow-hidden">
                    <div className="font-mono text-xs opacity-75">
                      {formatTime(subtitle.startTime)}
                    </div>
                    <div className="truncate mt-1" style={{ maxWidth: `${width - 8}px` }}>
                      {subtitle.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Current Time Indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{ left: `${currentTime * pixelsPerSecond}px` }}
            >
              <div className="w-3 h-3 bg-red-500 rounded-full absolute -top-1 -left-1"></div>
            </div>
          </div>
        </div>

        {/* Scrollbar */}
        <div className="h-2 bg-gray-700">
          <div 
            className="h-full bg-gray-500 rounded"
            style={{ 
              width: `${(timelineRef.current?.clientWidth || 800) / timelineWidth * 100}%`,
              marginLeft: `${scrollPosition / timelineWidth * 100}%`
            }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-3 border-t border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{subtitles.length} subtitles</span>
          <span>{formatTime(duration)} duration</span>
          <span>
            {subtitles.filter(sub => 
              currentTime >= sub.startTime && currentTime <= sub.endTime
            ).length > 0 ? 'Active subtitle' : 'No active subtitle'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SubtitleTimeline;
