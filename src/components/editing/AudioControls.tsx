'use client';

import { useState, useCallback, useEffect } from 'react';
import { useVideoStore } from '../../store/videoStore';
import { Button } from '../ui/Button';
import { 
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  MicrophoneIcon,
  MusicalNoteIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface AudioControlsProps {
  className?: string;
}

interface AudioTrack {
  id: string;
  name: string;
  volume: number;
  isMuted: boolean;
  isEnabled: boolean;
  type: 'original' | 'dubbed' | 'background';
}

export function AudioControls({ className = '' }: AudioControlsProps) {
  const { currentProject } = useVideoStore();
  const [masterVolume, setMasterVolume] = useState(1);
  const [isMasterMuted, setIsMasterMuted] = useState(false);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [showMixer, setShowMixer] = useState(false);

  useEffect(() => {
    if (currentProject) {
      const tracks: AudioTrack[] = [
        {
          id: 'original',
          name: 'Original Audio',
          volume: 0.8,
          isMuted: false,
          isEnabled: true,
          type: 'original'
        },
        {
          id: 'dubbed',
          name: 'Dubbed Audio',
          volume: 0.9,
          isMuted: false,
          isEnabled: currentProject.audioTracks.some(track => track.type === 'dubbed'),
          type: 'dubbed'
        },
        {
          id: 'background',
          name: 'Background Music',
          volume: 0.3,
          isMuted: false,
          isEnabled: false,
          type: 'background'
        }
      ];
      setAudioTracks(tracks);
    }
  }, [currentProject]);

  const handleMasterVolumeChange = useCallback((volume: number) => {
    setMasterVolume(volume);
    // In a real app, this would control the main audio output
  }, []);

  const handleMasterMuteToggle = useCallback(() => {
    setIsMasterMuted(!isMasterMuted);
  }, [isMasterMuted]);

  const handleTrackVolumeChange = useCallback((trackId: string, volume: number) => {
    setAudioTracks(prev => 
      prev.map(track => 
        track.id === trackId 
          ? { ...track, volume }
          : track
      )
    );
  }, []);

  const handleTrackMuteToggle = useCallback((trackId: string) => {
    setAudioTracks(prev => 
      prev.map(track => 
        track.id === trackId 
          ? { ...track, isMuted: !track.isMuted }
          : track
      )
    );
  }, []);

  const handleTrackEnable = useCallback((trackId: string, enabled: boolean) => {
    setAudioTracks(prev => 
      prev.map(track => 
        track.id === trackId 
          ? { ...track, isEnabled: enabled }
          : track
      )
    );
  }, []);

  const getTrackIcon = (type: string) => {
    switch (type) {
      case 'original':
        return <MicrophoneIcon className="w-5 h-5 text-blue-400" />;
      case 'dubbed':
        return <SpeakerWaveIcon className="w-5 h-5 text-green-400" />;
      case 'background':
        return <MusicalNoteIcon className="w-5 h-5 text-purple-400" />;
      default:
        return <SpeakerWaveIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getVolumeIcon = (volume: number, isMuted: boolean) => {
    if (isMuted || volume === 0) {
      return <SpeakerXMarkIcon className="w-5 h-5 text-red-400" />;
    }
    return <SpeakerWaveIcon className="w-5 h-5 text-gray-300" />;
  };

  if (!currentProject) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-400">
          <SpeakerWaveIcon className="w-12 h-12 mx-auto mb-4" />
          <p>No project selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Audio Controls</h2>
        <Button
          variant="ghost"
          onClick={() => setShowMixer(!showMixer)}
          className="flex items-center space-x-2"
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
          <span>{showMixer ? 'Hide' : 'Show'} Mixer</span>
        </Button>
      </div>

      {/* Master Volume */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-300">Master Volume</label>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMasterMuteToggle}
              className="p-1"
            >
              {getVolumeIcon(masterVolume, isMasterMuted)}
            </Button>
            <span className="text-sm text-gray-400 w-12 text-right">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMasterMuted ? 0 : masterVolume}
            onChange={(e) => handleMasterVolumeChange(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* Audio Tracks */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Audio Tracks</h3>
        
        {audioTracks.map((track) => (
          <div
            key={track.id}
            className={`bg-gray-700 rounded-lg p-4 transition-opacity ${
              !track.isEnabled ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getTrackIcon(track.type)}
                <div>
                  <h4 className="font-medium text-white">{track.name}</h4>
                  <p className="text-sm text-gray-400 capitalize">{track.type} track</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={track.isEnabled}
                    onChange={(e) => handleTrackEnable(track.id, e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Enable</span>
                </label>
              </div>
            </div>
            
            {track.isEnabled && (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTrackMuteToggle(track.id)}
                  className="p-1"
                >
                  {getVolumeIcon(track.volume, track.isMuted)}
                </Button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={track.isMuted ? 0 : track.volume}
                  onChange={(e) => handleTrackVolumeChange(track.id, Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
                
                <span className="text-sm text-gray-400 w-12 text-right">
                  {Math.round(track.volume * 100)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Audio Mixer */}
      {showMixer && (
        <div className="mt-6 bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-white mb-4">Audio Mixer</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {audioTracks.filter(track => track.isEnabled).map((track) => (
              <div key={track.id} className="text-center">
                <div className="bg-gray-600 rounded-lg p-3 mb-2">
                  {getTrackIcon(track.type)}
                </div>
                <p className="text-sm text-gray-300 mb-2">{track.name}</p>
                
                {/* Vertical slider simulation */}
                <div className="flex justify-center">
                  <div className="relative h-32 w-6 bg-gray-600 rounded-full">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-full transition-all duration-200"
                      style={{ height: `${track.volume * 100}%` }}
                    />
                    <div
                      className="absolute w-4 h-4 bg-white rounded-full border-2 border-gray-400 cursor-pointer"
                      style={{ 
                        bottom: `${track.volume * 100}%`,
                        left: '50%',
                        transform: 'translateX(-50%) translateY(50%)'
                      }}
                    />
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-400">
                  {Math.round(track.volume * 100)}%
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAudioTracks(prev => 
                  prev.map(track => ({ ...track, volume: 0.8 }))
                );
              }}
            >
              Reset All
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAudioTracks(prev => 
                  prev.map(track => ({ ...track, isMuted: !track.isMuted }))
                );
              }}
            >
              Mute All
            </Button>
          </div>
        </div>
      )}

      {/* Audio Settings */}
      <div className="mt-6 bg-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-white mb-4">Audio Settings</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Audio Quality
            </label>
            <select className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white">
              <option value="high">High Quality (320kbps)</option>
              <option value="medium">Medium Quality (192kbps)</option>
              <option value="low">Low Quality (128kbps)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Audio Format
            </label>
            <select className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white">
              <option value="aac">AAC</option>
              <option value="mp3">MP3</option>
              <option value="wav">WAV</option>
              <option value="flac">FLAC</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Normalize Audio</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Remove Background Noise</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default AudioControls;
