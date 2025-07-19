import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  VideoProject, 
  ExportJob, 
  ProcessingStep, 
  VideoPlayerState, 
  SubtitleEditorState,
  Subtitle,
  ExportSettings
} from '../lib/types';
import { apiService, ProcessingJob } from '../lib/api/realService';

interface VideoStore {
  // Current project state
  currentProject: VideoProject | null;
  projects: VideoProject[];
  
  // Processing state
  isProcessing: boolean;
  currentStep: string;
  processingSteps: ProcessingStep[];
  error: string | null;
  
  // Video player state
  playerState: VideoPlayerState;
  
  // Subtitle editor state
  subtitleEditor: SubtitleEditorState;
  
  // Export state
  exportJob: ExportJob | null;
  
  // Actions
  setCurrentProject: (project: VideoProject | null) => void;
  updateProject: (projectId: string, updates: Partial<VideoProject>) => void;
  addProject: (project: VideoProject) => void;
  removeProject: (projectId: string) => void;
  
  // Video upload actions
  uploadVideo: (file: File) => Promise<void>;
  
  // Processing actions
  startProcessing: (videoId: string, targetLanguage: string) => Promise<void>;
  setProcessingSteps: (steps: ProcessingStep[]) => void;
  setError: (error: string | null) => void;
  
  // Player actions
  updatePlayerState: (updates: Partial<VideoPlayerState>) => void;
  
  // Subtitle editor actions
  updateSubtitleEditor: (updates: Partial<SubtitleEditorState>) => void;
  updateSubtitle: (subtitleId: string, updates: Partial<Subtitle>) => void;
  addSubtitle: (subtitle: Subtitle) => void;
  removeSubtitle: (subtitleId: string) => void;
  setSelectedSubtitle: (subtitleId: string | null) => void;
  setEditingSubtitle: (subtitleId: string | null) => void;
  
  // Export actions
  startExport: (settings: ExportSettings) => Promise<void>;
  
  // Utility actions
  reset: () => void;
  checkVideoValidity: () => void;
}

const initialPlayerState: VideoPlayerState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  playbackRate: 1.0,
  isFullscreen: false,
  showSubtitles: true,
  selectedAudioTrack: 'original'
};

const initialSubtitleEditorState: SubtitleEditorState = {
  selectedSubtitle: null,
  editingSubtitle: null,
  searchTerm: '',
  showOriginal: false
};

export const useVideoStore = create<VideoStore>()(
  devtools(
    persist(
      (set, get) => ({
        currentProject: null,
        projects: [],
        isProcessing: false,
        currentStep: '',
        processingSteps: [],
        error: null,
        playerState: initialPlayerState,
        subtitleEditor: initialSubtitleEditorState,
        exportJob: null,

        setCurrentProject: (project) => set({ currentProject: project }),
        
        updateProject: (projectId, updates) => {
          const { currentProject, projects } = get();
          const updatedProjects = projects.map(p => 
            p.id === projectId ? { ...p, ...updates, updatedAt: new Date() } : p
          );
          
          set({ 
            projects: updatedProjects,
            currentProject: currentProject?.id === projectId 
              ? { ...currentProject, ...updates, updatedAt: new Date() }
              : currentProject
          });
        },
        
        addProject: (project) => {
          const { projects } = get();
          set({ projects: [...projects, project] });
        },
        
        removeProject: (projectId) => {
          const { projects, currentProject } = get();
          const updatedProjects = projects.filter(p => p.id !== projectId);
          set({ 
            projects: updatedProjects,
            currentProject: currentProject?.id === projectId ? null : currentProject
          });
        },

        uploadVideo: async (file) => {
          set({ isProcessing: true, error: null, currentStep: 'uploading' });
          
          try {
            const uploadResponse = await apiService.uploadVideo(file);
            
            // Create a basic project with upload info
            const newProject: VideoProject = {
              id: uploadResponse.jobId,
              name: uploadResponse.originalFileName,
              video: {
                id: uploadResponse.jobId,
                name: uploadResponse.originalFileName,
                size: uploadResponse.fileSize,
                type: uploadResponse.fileType,
                url: uploadResponse.originalFilePath,
                duration: 0, // Will be determined later
                thumbnail: '',
                uploadedAt: new Date()
              },
              audioTracks: [],
              subtitles: [],
              currentLanguage: 'en',
              availableLanguages: ['en'],
              trimStart: 0,
              trimEnd: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            get().addProject(newProject);
            set({ currentProject: newProject });
            
          } catch (error) {
            set({ error: 'Upload failed: ' + (error as Error).message });
          } finally {
            set({ isProcessing: false });
          }
        },

        startProcessing: async (videoId, targetLanguage) => {
          set({ isProcessing: true, error: null, currentStep: 'starting' });
          
          try {
            const { currentProject } = get();
            if (!currentProject || !currentProject.video) {
              throw new Error('No project or video file found');
            }

            // Since the video is already uploaded, we need to reconstruct the File object
            // For now, we'll work with the jobId which is the project ID
            const jobId = videoId;
            
            // Start by extracting audio
            set({ currentStep: 'extracting_audio' });
            await apiService.extractAudio(jobId);
            
            // Poll for job status and update progress
            const processingSteps: ProcessingStep[] = [
              { id: 'upload', name: 'Upload Video', status: 'completed', progress: 100, message: 'Video uploaded successfully' },
              { id: 'extract_audio', name: 'Extract Audio', status: 'processing', progress: 0, message: 'Extracting audio from video...' },
              { id: 'transcribe', name: 'Transcribe Audio', status: 'pending', progress: 0, message: 'Waiting...' },
              { id: 'translate', name: 'Translate Text', status: 'pending', progress: 0, message: 'Waiting...' },
              { id: 'synthesize', name: 'Generate Speech', status: 'pending', progress: 0, message: 'Waiting...' }
            ];
            
            set({ processingSteps });
            
            // Start polling for status updates
            const pollInterval = setInterval(async () => {
              try {
                const status = await apiService.getJobStatus(jobId);
                
                // Update processing steps based on status
                const updatedSteps = [...processingSteps];
                
                switch (status.status) {
                  case 'audio_extracted':
                    updatedSteps[1] = { ...updatedSteps[1], status: 'completed', progress: 100, message: 'Audio extracted successfully' };
                    updatedSteps[2] = { ...updatedSteps[2], status: 'processing', progress: 50, message: 'Transcribing audio...' };
                    break;
                  case 'transcribed':
                    updatedSteps[1] = { ...updatedSteps[1], status: 'completed', progress: 100, message: 'Audio extracted successfully' };
                    updatedSteps[2] = { ...updatedSteps[2], status: 'completed', progress: 100, message: 'Audio transcribed successfully' };
                    updatedSteps[3] = { ...updatedSteps[3], status: 'processing', progress: 50, message: 'Translating text...' };
                    break;
                  case 'translated':
                    updatedSteps[1] = { ...updatedSteps[1], status: 'completed', progress: 100, message: 'Audio extracted successfully' };
                    updatedSteps[2] = { ...updatedSteps[2], status: 'completed', progress: 100, message: 'Audio transcribed successfully' };
                    updatedSteps[3] = { ...updatedSteps[3], status: 'completed', progress: 100, message: 'Text translated successfully' };
                    updatedSteps[4] = { ...updatedSteps[4], status: 'processing', progress: 50, message: 'Generating dubbed audio...' };
                    break;
                  case 'completed':
                    updatedSteps[1] = { ...updatedSteps[1], status: 'completed', progress: 100, message: 'Audio extracted successfully' };
                    updatedSteps[2] = { ...updatedSteps[2], status: 'completed', progress: 100, message: 'Audio transcribed successfully' };
                    updatedSteps[3] = { ...updatedSteps[3], status: 'completed', progress: 100, message: 'Text translated successfully' };
                    updatedSteps[4] = { ...updatedSteps[4], status: 'completed', progress: 100, message: 'Dubbed audio generated successfully' };
                    
                    clearInterval(pollInterval);
                    set({ isProcessing: false, currentStep: 'completed' });
                    break;
                  case 'failed':
                    clearInterval(pollInterval);
                    throw new Error(status.error || 'Processing failed');
                }
                
                set({ processingSteps: updatedSteps, currentStep: status.currentStep });
                
              } catch (error) {
                clearInterval(pollInterval);
                throw error;
              }
            }, 2000);
            
          } catch (error) {
            set({ error: 'Processing failed: ' + (error as Error).message, isProcessing: false });
          }
        },

        setProcessingSteps: (steps) => set({ processingSteps: steps }),
        setError: (error) => set({ error }),

        updatePlayerState: (updates) => {
          const { playerState } = get();
          set({ playerState: { ...playerState, ...updates } });
        },

        updateSubtitleEditor: (updates) => {
          const { subtitleEditor } = get();
          set({ subtitleEditor: { ...subtitleEditor, ...updates } });
        },

        updateSubtitle: (subtitleId, updates) => {
          const { currentProject } = get();
          if (!currentProject) {
            return;
          }
          
          const updatedSubtitles = currentProject.subtitles.map(sub =>
            sub.id === subtitleId 
              ? { ...sub, ...updates, isEdited: true }
              : sub
          );
          
          get().updateProject(currentProject.id, { subtitles: updatedSubtitles });
        },
        
        addSubtitle: (subtitle) => {
          const { currentProject } = get();
          if (!currentProject) {
            return;
          }
          
          const updatedSubtitles = [...currentProject.subtitles, subtitle];
          get().updateProject(currentProject.id, { subtitles: updatedSubtitles });
        },
        
        removeSubtitle: (subtitleId) => {
          const { currentProject } = get();
          if (!currentProject) {
            return;
          }
          
          const updatedSubtitles = currentProject.subtitles.filter(sub => sub.id !== subtitleId);
          get().updateProject(currentProject.id, { subtitles: updatedSubtitles });
        },
        
        setSelectedSubtitle: (subtitleId) => {
          const { subtitleEditor } = get();
          set({ 
            subtitleEditor: { 
              ...subtitleEditor, 
              selectedSubtitle: subtitleId 
            }
          });
        },
        
        setEditingSubtitle: (subtitleId) => {
          const { subtitleEditor } = get();
          set({ 
            subtitleEditor: { 
              ...subtitleEditor, 
              editingSubtitle: subtitleId 
            }
          });
        },

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        startExport: async (settings) => {
          const { currentProject } = get();
          if (!currentProject) {
            return;
          }
          
          set({ isProcessing: true, error: null });
          
          try {
            // TODO: Implement real export functionality
            // For now, just simulate export
            set({ error: 'Export functionality not yet implemented' });
          } catch (error) {
            set({ error: 'Export failed: ' + (error as Error).message });
          } finally {
            set({ isProcessing: false });
          }
        },

        reset: () => {
          set({
            currentProject: null,
            projects: [],
            isProcessing: false,
            currentStep: '',
            processingSteps: [],
            error: null,
            playerState: initialPlayerState,
            subtitleEditor: initialSubtitleEditorState,
            exportJob: null
          });
        },

        // Check if the current project's video URL is still valid
        checkVideoValidity: () => {
          const { currentProject } = get();
          if (!currentProject) {
            return;
          }
          
          // Check if the video URL is a blob URL and if it's still valid
          if (currentProject.video.url.startsWith('blob:')) {
            // Try to fetch the blob to check if it's still valid
            fetch(currentProject.video.url)
              .then(response => {
                if (!response.ok) {
                  throw new Error('Blob URL is no longer valid');
                }
              })
              .catch(() => {
                // If blob is invalid, show error message but keep project data
                set({ 
                  error: 'Video file is no longer available. Please upload your video again.'
                });
              });
          }
        }
      }),
      {
        name: 'video-dubbing-store',
        partialize: (state) => ({
          projects: state.projects,
          currentProject: state.currentProject
        })
      }
    ),
    {
      name: 'video-dubbing-store'
    }
  )
);

export default useVideoStore;
