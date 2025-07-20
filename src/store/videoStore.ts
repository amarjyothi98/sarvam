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
import { realProcessingService } from '../lib/api/realProcessingService';
import { getVideoDuration } from '../lib/utils';

// Helper function to break transcript into timed subtitles
function createTimedSubtitles(transcript: string, videoDuration: number): Subtitle[] {
  const SUBTITLE_DURATION = 3; // 3 seconds per subtitle
  const words = transcript.split(' ');
  const subtitles: Subtitle[] = [];
  
  // Calculate roughly how many words per subtitle based on total duration
  const totalSubtitles = Math.ceil(videoDuration / SUBTITLE_DURATION);
  const wordsPerSubtitle = Math.ceil(words.length / totalSubtitles);
  
  let currentTime = 0;
  let wordIndex = 0;
  
  while (wordIndex < words.length && currentTime < videoDuration) {
    const endTime = Math.min(currentTime + SUBTITLE_DURATION, videoDuration);
    const subtitleWords = words.slice(wordIndex, wordIndex + wordsPerSubtitle);
    
    if (subtitleWords.length > 0) {
      subtitles.push({
        id: `subtitle-${subtitles.length + 1}`,
        text: subtitleWords.join(' '),
        startTime: currentTime,
        endTime: endTime,
        isEdited: false
      });
    }
    
    currentTime += SUBTITLE_DURATION;
    wordIndex += wordsPerSubtitle;
  }
  
  // If there are remaining words, add them to the last subtitle or create a new one
  if (wordIndex < words.length) {
    const remainingWords = words.slice(wordIndex);
    if (subtitles.length > 0) {
      // Add to last subtitle
      const lastSubtitle = subtitles[subtitles.length - 1];
      lastSubtitle.text += ' ' + remainingWords.join(' ');
      lastSubtitle.endTime = videoDuration;
    } else {
      // Create new subtitle for remaining words
      subtitles.push({
        id: `subtitle-${subtitles.length + 1}`,
        text: remainingWords.join(' '),
        startTime: currentTime,
        endTime: videoDuration,
        isEdited: false
      });
    }
  }
  
  return subtitles;
}

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
            // Get video duration
            const duration = await getVideoDuration(file);
            
            // Create a basic project with upload info
            const projectId = `project-${Date.now()}`;
            const newProject: VideoProject = {
              id: projectId,
              name: file.name,
              video: {
                id: projectId,
                name: file.name,
                size: file.size,
                type: file.type,
                url: URL.createObjectURL(file),
                duration: duration,
                thumbnail: '',
                uploadedAt: new Date()
              },
              audioTracks: [{
                id: 'original',
                name: 'Original Audio',
                url: URL.createObjectURL(file),
                type: 'original',
                language: 'en',
                volume: 0.8,
                isMuted: false
              }],
              subtitles: [],
              currentLanguage: 'en',
              availableLanguages: ['en'],
              trimStart: 0,
              trimEnd: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            // Store the file for processing
            (newProject as VideoProject & { videoFile: File }).videoFile = file;
            
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
            if (!currentProject || !(currentProject as VideoProject & { videoFile: File }).videoFile) {
              throw new Error('No project or video file found');
            }

            const videoFile = (currentProject as VideoProject & { videoFile: File }).videoFile;
            
            // Initialize processing steps
            const processingSteps: ProcessingStep[] = [
              { id: 'extract_audio', name: 'Extract Audio', status: 'processing', progress: 0, message: 'Starting...' },
              { id: 'transcribe', name: 'Transcribe Audio', status: 'pending', progress: 0, message: 'Waiting...' },
              { id: 'translate', name: 'Translate Text', status: 'pending', progress: 0, message: 'Waiting...' },
              { id: 'synthesize', name: 'Generate Speech', status: 'pending', progress: 0, message: 'Waiting...' }
            ];
            
            set({ processingSteps });
            
            // Process the video
            const result = await realProcessingService.processVideo(
              videoFile,
              targetLanguage,
              (step, progress) => {
                const updatedSteps = [...get().processingSteps];
                
                // Update step status based on progress
                if (step.includes('Extracting')) {
                  updatedSteps[0] = { ...updatedSteps[0], status: 'processing', progress, message: step };
                } else if (step.includes('Transcribing')) {
                  updatedSteps[0] = { ...updatedSteps[0], status: 'completed', progress: 100, message: 'Audio extracted' };
                  updatedSteps[1] = { ...updatedSteps[1], status: 'processing', progress: progress - 30, message: step };
                } else if (step.includes('Translating')) {
                  updatedSteps[1] = { ...updatedSteps[1], status: 'completed', progress: 100, message: 'Transcription completed' };
                  updatedSteps[2] = { ...updatedSteps[2], status: 'processing', progress: progress - 60, message: step };
                } else if (step.includes('Generating')) {
                  updatedSteps[2] = { ...updatedSteps[2], status: 'completed', progress: 100, message: 'Translation completed' };
                  updatedSteps[3] = { ...updatedSteps[3], status: 'processing', progress: progress - 80, message: step };
                } else if (step.includes('complete')) {
                  updatedSteps[3] = { ...updatedSteps[3], status: 'completed', progress: 100, message: 'Speech synthesis completed' };
                }
                
                set({ processingSteps: updatedSteps, currentStep: step });
              }
            );
            
            // Create timed subtitles from the transcript
            let timedSubtitles: Subtitle[] = [];
            
            try {
              const { videoFile } = currentProject as VideoProject & { videoFile: File };
              const duration = await getVideoDuration(videoFile);
              timedSubtitles = createTimedSubtitles(result.transcript, duration);
            } catch (error) {
              console.error('Error getting video duration for subtitles:', error);
              // Fallback to estimated duration
              const fallbackDuration = 30; // 30 seconds default
              timedSubtitles = createTimedSubtitles(result.transcript, fallbackDuration);
            }

            // Update the project with results
            const updatedProject = {
              ...currentProject,
              subtitles: timedSubtitles,
              currentLanguage: targetLanguage,
              availableLanguages: [...currentProject.availableLanguages, targetLanguage],
              audioTracks: [
                ...currentProject.audioTracks,
                {
                  id: 'dubbed',
                  name: `Dubbed Audio (${targetLanguage})`,
                  url: result.synthesizedAudioUrl,
                  type: 'dubbed' as const,
                  language: targetLanguage,
                  volume: 0.8,
                  isMuted: false
                }
              ]
            };
            
            get().updateProject(currentProject.id, updatedProject);
            set({ isProcessing: false, currentStep: 'completed' });
            
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
