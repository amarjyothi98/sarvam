// Application constants
export const APP_NAME = 'Video Dubbing Studio Lite';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Create dubbed videos with AI-powered translation and voice synthesis';

// API endpoints (for future use)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
export const SARVAM_API_URL = 'https://api.sarvam.ai';

// File upload limits
export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/mov', 'video/avi'];
export const ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/wav', 'audio/aac'];

// Processing timeouts
export const UPLOAD_TIMEOUT = 30000; // 30 seconds
export const PROCESSING_TIMEOUT = 300000; // 5 minutes
export const EXPORT_TIMEOUT = 600000; // 10 minutes

// UI constants
export const SIDEBAR_WIDTH = 320;
export const PLAYER_MIN_HEIGHT = 480;
export const SUBTITLE_EDITOR_HEIGHT = 300;

// Local storage keys
export const STORAGE_KEYS = {
  PROJECTS: 'dubbing-studio-projects',
  SETTINGS: 'dubbing-studio-settings',
  RECENT_LANGUAGES: 'dubbing-studio-recent-languages'
};

// Default settings
export const DEFAULT_SETTINGS = {
  autoSave: true,
  showOriginalSubtitles: false,
  defaultVolume: 0.8,
  defaultPlaybackRate: 1.0,
  preferredLanguages: ['hi', 'ta', 'te'],
  exportQuality: 'high' as const,
  exportFormat: 'mp4' as const
};

// Feature flags
export const FEATURES = {
  WAVEFORM_VISUALIZATION: true,
  ADVANCED_AUDIO_CONTROLS: true,
  BATCH_EXPORT: false,
  REAL_TIME_COLLABORATION: false
};

// Error messages
export const ERROR_MESSAGES = {
  UPLOAD_FAILED: 'Failed to upload video. Please try again.',
  PROCESSING_FAILED: 'Video processing failed. Please check your file and try again.',
  EXPORT_FAILED: 'Export failed. Please try again.',
  UNSUPPORTED_FORMAT: 'Unsupported file format. Please upload MP4, WebM, MOV, or AVI files.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 500MB.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  GENERIC_ERROR: 'An error occurred. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  UPLOAD_COMPLETE: 'Video uploaded successfully!',
  PROCESSING_COMPLETE: 'Video processing completed!',
  EXPORT_COMPLETE: 'Video exported successfully!',
  SUBTITLE_SAVED: 'Subtitle changes saved.',
  PROJECT_SAVED: 'Project saved successfully.'
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  PLAY_PAUSE: 'Space',
  SEEK_FORWARD: 'ArrowRight',
  SEEK_BACKWARD: 'ArrowLeft',
  VOLUME_UP: 'ArrowUp',
  VOLUME_DOWN: 'ArrowDown',
  MUTE: 'M',
  FULLSCREEN: 'F',
  ESCAPE: 'Escape'
};
