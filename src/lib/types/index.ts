// Core types for the Video Dubbing Studio

export interface VideoFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  duration: number;
  thumbnail?: string;
  uploadedAt: Date;
}

export interface Subtitle {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  originalText?: string;
  isEdited?: boolean;
  confidence?: number;
}

export interface TranslationJob {
  id: string;
  videoId: string;
  sourceLanguage: string;
  targetLanguage: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  subtitles: Subtitle[];
  createdAt: Date;
  completedAt?: Date;
}

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  type: 'original' | 'dubbed';
  language: string;
  volume: number;
  isMuted: boolean;
}

export interface VideoProject {
  id: string;
  name: string;
  video: VideoFile;
  audioTracks: AudioTrack[];
  subtitles: Subtitle[];
  currentLanguage: string;
  availableLanguages: string[];
  trimStart: number;
  trimEnd: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExportSettings {
  format: 'mp4' | 'webm' | 'mov';
  quality: 'high' | 'medium' | 'low';
  includeSubtitles: boolean;
  audioTrack: 'original' | 'dubbed' | 'both';
  resolution: '1080p' | '720p' | '480p';
}

export interface ExportJob {
  id: string;
  projectId: string;
  settings: ExportSettings;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isSupported: boolean;
}

export interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
}

export interface SubtitleEditorState {
  selectedSubtitle: string | null;
  editingSubtitle: string | null;
  searchTerm: string;
  showOriginal: boolean;
}

export interface AppState {
  currentProject: VideoProject | null;
  projects: VideoProject[];
  isLoading: boolean;
  error: string | null;
  currentStep: string;
  processingSteps: ProcessingStep[];
}
