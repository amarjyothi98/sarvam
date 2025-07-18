'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useVideoStore } from '../../store/videoStore';
import { Subtitle } from '../../lib/types';
import { Button } from '../ui/Button';
import { 
  MicrophoneIcon, 
  StopIcon, 
  PlayIcon, 
  PauseIcon,
  SpeakerWaveIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { formatTime } from '../../lib/utils';

interface DubbingStudioProps {
  onSubtitleSelect?: (subtitle: Subtitle) => void;
  onTimeSeek?: (time: number) => void;
  className?: string;
}

export function DubbingStudio({ 
  onSubtitleSelect, 
  onTimeSeek, 
  className = '' 
}: DubbingStudioProps) {
  const { currentProject, playerState, updateProject } = useVideoStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingSubtitle, setRecordingSubtitle] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState('natural');
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const subtitles = currentProject?.subtitles || [];
  const { currentTime } = playerState;

  // Find current subtitle
  const currentSubtitle = subtitles.find(sub => 
    currentTime >= sub.startTime && currentTime <= sub.endTime
  );

  // Available voices for synthesis
  const voices = [
    { id: 'natural', name: 'Natural Voice', type: 'synthesis' },
    { id: 'professional', name: 'Professional Voice', type: 'synthesis' },
    { id: 'casual', name: 'Casual Voice', type: 'synthesis' },
    { id: 'record', name: 'Record Your Voice', type: 'recording' }
  ];

  // Initialize media recorder
  const initializeRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        audioChunksRef.current = [];
      };
      
      mediaRecorderRef.current = mediaRecorder;
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      return false;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async (subtitleId: string) => {
    if (!mediaRecorderRef.current) {
      const initialized = await initializeRecorder();
      if (!initialized) return;
    }

    setRecordingSubtitle(subtitleId);
    setIsRecording(true);
    setRecordingTime(0);
    setAudioBlob(null);
    
    mediaRecorderRef.current?.start();
    
    // Start recording timer
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  }, [initializeRecorder]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  // Play recorded audio
  const playRecording = useCallback(() => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    }
  }, [audioBlob]);

  // Generate voice synthesis
  const generateVoice = useCallback(async (subtitle: Subtitle) => {
    if (selectedVoice === 'record') {
      await startRecording(subtitle.id);
      return;
    }

    setIsProcessing(true);
    
    // Simulate voice synthesis API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would call a voice synthesis API
      const synthesizedAudio = new Blob(['mock audio data'], { type: 'audio/mp3' });
      setAudioBlob(synthesizedAudio);
      setRecordingSubtitle(subtitle.id);
      
    } catch (error) {
      console.error('Voice synthesis error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedVoice, startRecording]);

  // Save dubbing to project
  const saveDubbing = useCallback(async () => {
    if (!audioBlob || !recordingSubtitle || !currentProject) return;

    // In a real app, you'd upload the audio file and get a URL
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Find or create dubbed audio track
    let dubbedTrack = currentProject.audioTracks.find(track => track.type === 'dubbed');
    
    if (!dubbedTrack) {
      dubbedTrack = {
        id: 'dubbed-' + Date.now(),
        name: 'Dubbed Audio',
        type: 'dubbed',
        language: currentProject.currentLanguage,
        volume: 1,
        isMuted: false,
        url: audioUrl
      };
      
      const updatedTracks = [...currentProject.audioTracks, dubbedTrack];
      updateProject(currentProject.id, { audioTracks: updatedTracks });
    }

    // Reset states
    setAudioBlob(null);
    setRecordingSubtitle(null);
    
    // Success feedback could be added here
    console.log('Dubbing saved for subtitle:', recordingSubtitle);
  }, [audioBlob, recordingSubtitle, currentProject, updateProject]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

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
        <h2 className="text-xl font-semibold text-white">Dubbing Studio</h2>
      </div>

      {/* Voice Selection */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">Voice Selection</h3>
        <div className="grid grid-cols-2 gap-2">
          {voices.map(voice => (
            <button
              key={voice.id}
              onClick={() => setSelectedVoice(voice.id)}
              className={`p-3 rounded-lg border transition-colors ${
                selectedVoice === voice.id
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="text-sm font-medium">{voice.name}</div>
              <div className="text-xs opacity-75">{voice.type}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Subtitle */}
      {currentSubtitle && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Current Subtitle</h3>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-blue-400 font-mono text-sm">
                {formatTime(currentSubtitle.startTime)} - {formatTime(currentSubtitle.endTime)}
              </span>
              <span className="text-sm text-gray-400">
                {(currentSubtitle.endTime - currentSubtitle.startTime).toFixed(1)}s
              </span>
            </div>
            <p className="text-white">{currentSubtitle.text}</p>
            
            <div className="mt-3 flex items-center space-x-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => generateVoice(currentSubtitle)}
                disabled={isRecording || isProcessing}
                className="flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : selectedVoice === 'record' ? (
                  <>
                    <MicrophoneIcon className="w-4 h-4" />
                    <span>Record</span>
                  </>
                ) : (
                  <>
                    <SpeakerWaveIcon className="w-4 h-4" />
                    <span>Generate</span>
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTimeSeek?.(currentSubtitle.startTime)}
                className="flex items-center space-x-2"
              >
                <PlayIcon className="w-4 h-4" />
                <span>Play</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Recording Controls */}
      {isRecording && (
        <div className="p-4 border-b border-gray-700 bg-red-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white font-medium">Recording...</span>
              <span className="text-red-400 font-mono">
                {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
              </span>
            </div>
            <Button
              variant="ghost"
              onClick={stopRecording}
              className="text-red-400 hover:text-red-300"
            >
              <StopIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Audio Preview */}
      {audioBlob && !isRecording && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Audio Preview</h3>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-300">Generated Audio</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={playRecording}
                  disabled={isPlaying}
                  className="flex items-center space-x-2"
                >
                  {isPlaying ? (
                    <PauseIcon className="w-4 h-4" />
                  ) : (
                    <PlayIcon className="w-4 h-4" />
                  )}
                  <span>Play</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAudioBlob(null)}
                  className="text-red-400 hover:text-red-300"
                >
                  <XMarkIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="primary"
                size="sm"
                onClick={saveDubbing}
                className="flex items-center space-x-2"
              >
                <CheckIcon className="w-4 h-4" />
                <span>Save Dubbing</span>
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => recordingSubtitle && generateVoice(
                  subtitles.find(sub => sub.id === recordingSubtitle)!
                )}
                className="flex items-center space-x-2"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Re-generate</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Subtitles List */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-3">All Subtitles</h3>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {subtitles.map(subtitle => (
            <div
              key={subtitle.id}
              className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                subtitle.id === currentSubtitle?.id
                  ? 'bg-blue-900/30 border-blue-500'
                  : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
              }`}
              onClick={() => {
                onSubtitleSelect?.(subtitle);
                onTimeSeek?.(subtitle.startTime);
              }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-blue-400 font-mono text-sm">
                  {formatTime(subtitle.startTime)}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      generateVoice(subtitle);
                    }}
                  >
                    <MicrophoneIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-white text-sm">{subtitle.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}

export default DubbingStudio;
