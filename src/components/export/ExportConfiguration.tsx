'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { 
  DocumentArrowDownIcon,
  Cog6ToothIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  GlobeAltIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ExportConfigurationProps {
  onExport: (config: ExportConfig) => void;
  isExporting: boolean;
  onCancel?: () => void;
}

export interface ExportConfig {
  format: 'mp4' | 'mov' | 'avi' | 'webm';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: '480p' | '720p' | '1080p' | '4k';
  audioTrack: 'original' | 'dubbed' | 'both';
  includeSubtitles: boolean;
  subtitleLanguage: string;
  frameRate: 24 | 30 | 60;
  bitrate: 'auto' | 'low' | 'medium' | 'high';
  codec: 'h264' | 'h265' | 'av1';
}

const qualityPresets = {
  low: { bitrate: '1-2 Mbps', description: 'Smallest file size' },
  medium: { bitrate: '3-5 Mbps', description: 'Good balance' },
  high: { bitrate: '6-10 Mbps', description: 'High quality' },
  ultra: { bitrate: '15-25 Mbps', description: 'Maximum quality' }
};

const formatInfo = {
  mp4: { description: 'Most compatible format', size: 'Medium' },
  mov: { description: 'Apple QuickTime format', size: 'Large' },
  avi: { description: 'Legacy Windows format', size: 'Large' },
  webm: { description: 'Web-optimized format', size: 'Small' }
};

const resolutionInfo = {
  '480p': { pixels: '854x480', description: 'SD quality' },
  '720p': { pixels: '1280x720', description: 'HD quality' },
  '1080p': { pixels: '1920x1080', description: 'Full HD' },
  '4k': { pixels: '3840x2160', description: 'Ultra HD' }
};

export function ExportConfiguration({ 
  onExport, 
  isExporting, 
  onCancel 
}: ExportConfigurationProps) {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'mp4',
    quality: 'high',
    resolution: '1080p',
    audioTrack: 'dubbed',
    includeSubtitles: true,
    subtitleLanguage: 'en',
    frameRate: 30,
    bitrate: 'auto',
    codec: 'h264'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateConfig = <K extends keyof ExportConfig>(key: K, value: ExportConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const getEstimatedFileSize = () => {
    const baseSizes = {
      '480p': 50, // MB per minute
      '720p': 100,
      '1080p': 200,
      '4k': 800
    };
    
    const qualityMultipliers = {
      low: 0.5,
      medium: 1,
      high: 1.5,
      ultra: 2.5
    };

    const baseSize = baseSizes[config.resolution];
    const multiplier = qualityMultipliers[config.quality];
    const estimatedSize = Math.round(baseSize * multiplier * 5); // Assuming 5 minute video
    
    return estimatedSize;
  };

  const getEstimatedTime = () => {
    const baseTimes = {
      '480p': 30, // seconds
      '720p': 60,
      '1080p': 120,
      '4k': 300
    };
    
    return baseTimes[config.resolution];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <DocumentArrowDownIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Export Configuration</h2>
        </div>
        {onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isExporting}
          >
            <XMarkIcon className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            <VideoCameraIcon className="w-4 h-4 inline mr-1" />
            Output Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(formatInfo).map(([format, info]) => (
              <button
                key={format}
                onClick={() => updateConfig('format', format as 'mp4' | 'mov' | 'avi' | 'webm')}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  config.format === format
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm">{format.toUpperCase()}</div>
                <div className="text-xs text-gray-500 mt-1">{info.description}</div>
                <div className="text-xs text-gray-400">File size: {info.size}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quality Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Quality</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(qualityPresets).map(([quality, info]) => (
              <button
                key={quality}
                onClick={() => updateConfig('quality', quality as 'low' | 'medium' | 'high' | 'ultra')}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  config.quality === quality
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm capitalize">{quality}</div>
                <div className="text-xs text-gray-500 mt-1">{info.description}</div>
                <div className="text-xs text-gray-400">{info.bitrate}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Resolution</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(resolutionInfo).map(([resolution, info]) => (
              <button
                key={resolution}
                onClick={() => updateConfig('resolution', resolution as '480p' | '720p' | '1080p' | '4k')}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  config.resolution === resolution
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm">{resolution}</div>
                <div className="text-xs text-gray-500 mt-1">{info.pixels}</div>
                <div className="text-xs text-gray-400">{info.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Audio Track Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            <SpeakerWaveIcon className="w-4 h-4 inline mr-1" />
            Audio Track
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'original', label: 'Original' },
              { value: 'dubbed', label: 'Dubbed' },
              { value: 'both', label: 'Both Tracks' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateConfig('audioTrack', value as 'original' | 'dubbed' | 'both')}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  config.audioTrack === value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm">{label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Subtitle Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            <GlobeAltIcon className="w-4 h-4 inline mr-1" />
            Subtitles
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.includeSubtitles}
                onChange={(e) => updateConfig('includeSubtitles', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include subtitles</span>
            </label>
            
            {config.includeSubtitles && (
              <select
                value={config.subtitleLanguage}
                onChange={(e) => updateConfig('subtitleLanguage', e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
              </select>
            )}
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <Cog6ToothIcon className="w-4 h-4" />
            <span>Advanced Settings</span>
            <span className="text-xs">({showAdvanced ? 'Hide' : 'Show'})</span>
          </button>

          {showAdvanced && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frame Rate
                  </label>
                  <select
                    value={config.frameRate}
                    onChange={(e) => updateConfig('frameRate', parseInt(e.target.value) as 24 | 30 | 60)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value={24}>24 fps</option>
                    <option value={30}>30 fps</option>
                    <option value={60}>60 fps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Codec
                  </label>
                  <select
                    value={config.codec}
                    onChange={(e) => updateConfig('codec', e.target.value as 'h264' | 'h265' | 'av1')}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="h264">H.264 (Most Compatible)</option>
                    <option value="h265">H.265 (Better Compression)</option>
                    <option value="av1">AV1 (Latest Standard)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bitrate Control
                </label>
                <select
                  value={config.bitrate}
                  onChange={(e) => updateConfig('bitrate', e.target.value as 'auto' | 'low' | 'medium' | 'high')}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="auto">Auto (Recommended)</option>
                  <option value="low">Low (Smaller file)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Best quality)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Export Summary */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center space-x-2">
            <InformationCircleIcon className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Export Summary</span>
          </div>
          <div className="text-sm text-blue-800 space-y-1">
            <div>Format: {config.format.toUpperCase()} • Quality: {config.quality}</div>
            <div>Resolution: {config.resolution} • Audio: {config.audioTrack}</div>
            <div>Estimated file size: ~{getEstimatedFileSize()} MB</div>
            <div>Estimated export time: ~{Math.floor(getEstimatedTime() / 60)}m {getEstimatedTime() % 60}s</div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => updateConfig('format', 'mp4')}
            disabled={isExporting}
          >
            Reset to Default
          </Button>
          <Button
            onClick={() => onExport(config)}
            disabled={isExporting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Start Export
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ExportConfiguration;
