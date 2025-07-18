'use client';

import { useState, useCallback } from 'react';
import { useVideoStore } from '../../store/videoStore';
import { ExportSettings } from '../../lib/types';
import { Button } from '../ui/Button';
import { 
  ArrowDownTrayIcon, 
  Cog6ToothIcon,
  CheckIcon,
  XMarkIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

interface ExportStudioProps {
  onExportStart?: () => void;
  onExportComplete?: () => void;
  className?: string;
}

export function ExportStudio({ 
  onExportStart, 
  onExportComplete, 
  className = '' 
}: ExportStudioProps) {
  const { currentProject, exportJob, startExport } = useVideoStore();
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'mp4',
    quality: 'high',
    includeSubtitles: true,
    audioTrack: 'dubbed',
    resolution: '1080p'
  });

  const [isCustomizing, setIsCustomizing] = useState(false);

  const handleSettingChange = useCallback((key: keyof ExportSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleExport = useCallback(async () => {
    if (!currentProject) return;

    onExportStart?.();
    
    try {
      await startExport(settings);
      onExportComplete?.();
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [currentProject, settings, startExport, onExportStart, onExportComplete]);

  const presets = [
    {
      name: 'Web Optimized',
      settings: {
        format: 'mp4' as const,
        quality: 'medium' as const,
        includeSubtitles: true,
        audioTrack: 'dubbed' as const,
        resolution: '720p' as const
      }
    },
    {
      name: 'High Quality',
      settings: {
        format: 'mp4' as const,
        quality: 'high' as const,
        includeSubtitles: true,
        audioTrack: 'dubbed' as const,
        resolution: '1080p' as const
      }
    },
    {
      name: 'Mobile Friendly',
      settings: {
        format: 'mp4' as const,
        quality: 'medium' as const,
        includeSubtitles: true,
        audioTrack: 'dubbed' as const,
        resolution: '480p' as const
      }
    }
  ];

  if (!currentProject) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-400">
          <p>No project selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Export Studio</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="flex items-center space-x-2"
          >
            <Cog6ToothIcon className="w-4 h-4" />
            <span>Customize</span>
          </Button>
        </div>
      </div>

      {/* Export Presets */}
      {!isCustomizing && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Quick Export</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {presets.map((preset) => (
              <div
                key={preset.name}
                className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => setSettings(preset.settings)}
              >
                <h4 className="font-medium text-white mb-2">{preset.name}</h4>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>Format: {preset.settings.format.toUpperCase()}</div>
                  <div>Quality: {preset.settings.quality}</div>
                  <div>Resolution: {preset.settings.resolution}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Settings */}
      {isCustomizing && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Export Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Format */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Format
              </label>
              <select
                value={settings.format}
                onChange={(e) => handleSettingChange('format', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="mp4">MP4</option>
                <option value="webm">WebM</option>
                <option value="mov">MOV</option>
              </select>
            </div>

            {/* Quality */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quality
              </label>
              <select
                value={settings.quality}
                onChange={(e) => handleSettingChange('quality', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Resolution */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Resolution
              </label>
              <select
                value={settings.resolution}
                onChange={(e) => handleSettingChange('resolution', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="1080p">1080p (Full HD)</option>
                <option value="720p">720p (HD)</option>
                <option value="480p">480p (SD)</option>
              </select>
            </div>

            {/* Audio Track */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Audio Track
              </label>
              <select
                value={settings.audioTrack}
                onChange={(e) => handleSettingChange('audioTrack', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="original">Original Audio</option>
                <option value="dubbed">Dubbed Audio</option>
                <option value="both">Both Tracks</option>
              </select>
            </div>
          </div>

          {/* Include Subtitles */}
          <div className="mt-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.includeSubtitles}
                onChange={(e) => handleSettingChange('includeSubtitles', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-300">Include subtitles in video</span>
            </label>
          </div>
        </div>
      )}

      {/* Export Preview */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">Export Preview</h3>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Format:</span>
              <span className="ml-2 text-white">{settings.format.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-gray-400">Quality:</span>
              <span className="ml-2 text-white capitalize">{settings.quality}</span>
            </div>
            <div>
              <span className="text-gray-400">Resolution:</span>
              <span className="ml-2 text-white">{settings.resolution}</span>
            </div>
            <div>
              <span className="text-gray-400">Audio:</span>
              <span className="ml-2 text-white capitalize">{settings.audioTrack}</span>
            </div>
            <div>
              <span className="text-gray-400">Subtitles:</span>
              <span className="ml-2 text-white">{settings.includeSubtitles ? 'Included' : 'Not included'}</span>
            </div>
            <div>
              <span className="text-gray-400">Estimated Size:</span>
              <span className="ml-2 text-white">
                {Math.round(currentProject.video.size / 1024 / 1024 * 
                  (settings.quality === 'high' ? 1.2 : settings.quality === 'medium' ? 0.8 : 0.5)
                )}MB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Progress */}
      {exportJob && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Export Progress</h3>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white">
                {exportJob.status === 'completed' ? 'Export Complete' : 
                 exportJob.status === 'failed' ? 'Export Failed' : 'Exporting...'}
              </span>
              <span className="text-sm text-gray-400">
                {exportJob.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  exportJob.status === 'completed' ? 'bg-green-500' :
                  exportJob.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${exportJob.progress}%` }}
              ></div>
            </div>
            
            {exportJob.status === 'completed' && exportJob.downloadUrl && (
              <div className="mt-4 flex items-center space-x-2">
                <CheckIcon className="w-5 h-5 text-green-500" />
                <span className="text-green-400">Export completed successfully!</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.open(exportJob.downloadUrl, '_blank')}
                  className="ml-auto"
                >
                  Download
                </Button>
              </div>
            )}
            
            {exportJob.status === 'failed' && (
              <div className="mt-4 flex items-center space-x-2">
                <XMarkIcon className="w-5 h-5 text-red-500" />
                <span className="text-red-400">Export failed. Please try again.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Actions */}
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={!!exportJob && exportJob.status === 'processing'}
            className="flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>
              {exportJob && exportJob.status === 'processing' ? 'Exporting...' : 'Start Export'}
            </span>
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => {
              // Preview functionality could be added here
              console.log('Preview with settings:', settings);
            }}
            className="flex items-center space-x-2"
          >
            <PlayIcon className="w-4 h-4" />
            <span>Preview</span>
          </Button>
        </div>
        
        <div className="mt-4 text-sm text-gray-400">
          <p>Export will include all your translations and dubbing work.</p>
          <p>The process may take a few minutes depending on video length and quality settings.</p>
        </div>
      </div>
    </div>
  );
}

export default ExportStudio;
