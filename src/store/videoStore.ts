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
import { mockApiService } from '../lib/api/mockService';

interface VideoStore {
  currentProject: VideoProject | null;
  projects: VideoProject[];
  
  isProcessing: boolean;
  currentStep: string;
  processingSteps: ProcessingStep[];
  error: string | null;
  
  playerState: VideoPlayerState;
  
  subtitleEditor: SubtitleEditorState;
  
  exportJob: ExportJob | null;
  
  setCurrentProject: (project: VideoProject | null) => void;
  updateProject: (projectId: string, updates: Partial<VideoProject>) => void;
  addProject: (project: VideoProject) => void;
  removeProject: (projectId: string) => void;
  
  uploadVideo: (file: File) => Promise<void>;
  
  startProcessing: (videoId: string, targetLanguage: string) => Promise<void>;
  setProcessingSteps: (steps: ProcessingStep[]) => void;
  setError: (error: string | null) => void;
  
  updatePlayerState: (updates: Partial<VideoPlayerState>) => void;
  
  updateSubtitle: (subtitleId: string, updates: Partial<Subtitle>) => void;
  addSubtitle: (subtitle: Subtitle) => void;
  removeSubtitle: (subtitleId: string) => void;
  setSelectedSubtitle: (subtitleId: string | null) => void;
  setEditingSubtitle: (subtitleId: string | null) => void;
  
  startExport: (settings: ExportSettings) => Promise<void>;
  
  reset: () => void;
}

const initialPlayerState: VideoPlayerState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  playbackRate: 1.0,
  isFullscreen: false
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
          set({ isProcessing: true, error: null });
          
          try {
            const response = await mockApiService.uploadVideo(file);
            
            if (response.success && response.data) {
              const videoFile = response.data;
              const newProject: VideoProject = {
                id: videoFile.id,
                name: videoFile.name,
                video: videoFile,
                audioTracks: [{
                  id: 'original',
                  name: 'Original Audio',
                  url: videoFile.url,
                  type: 'original',
                  language: 'en',
                  volume: 0.8,
                  isMuted: false
                }],
                subtitles: [],
                currentLanguage: 'en',
                availableLanguages: ['en'],
                trimStart: 0,
                trimEnd: videoFile.duration,
                createdAt: new Date(),
                updatedAt: new Date()
              };
              
              get().addProject(newProject);
              set({ currentProject: newProject });
            } else {
              set({ error: response.error || 'Upload failed' });
            }
          } catch (error) {
            set({ error: 'Upload failed: ' + (error as Error).message });
          } finally {
            set({ isProcessing: false });
          }
        },

        startProcessing: async (videoId, targetLanguage) => {
          set({ isProcessing: true, error: null, currentStep: 'upload' });
          
          try {
            const response = await mockApiService.processVideo(
              videoId, 
              targetLanguage,
              (steps) => set({ processingSteps: steps })
            );
            
            if (response.success && response.data) {
              const translationJob = response.data;
              
              const { currentProject } = get();
              if (currentProject) {
                const dubbedAudioResponse = await mockApiService.generateDubbedAudio(
                  translationJob.subtitles,
                  targetLanguage
                );
                
                if (dubbedAudioResponse.success && dubbedAudioResponse.data) {
                  const updatedProject = {
                    ...currentProject,
                    subtitles: translationJob.subtitles,
                    currentLanguage: targetLanguage,
                    availableLanguages: [...currentProject.availableLanguages, targetLanguage],
                    audioTracks: [
                      ...currentProject.audioTracks,
                      dubbedAudioResponse.data
                    ]
                  };
                  
                  get().updateProject(currentProject.id, updatedProject);
                }
              }
            } else {
              set({ error: response.error || 'Processing failed' });
            }
          } catch (error) {
            set({ error: 'Processing failed: ' + (error as Error).message });
          } finally {
            set({ isProcessing: false, currentStep: '' });
          }
        },

        setProcessingSteps: (steps) => set({ processingSteps: steps }),
        setError: (error) => set({ error }),

        updatePlayerState: (updates) => {
          const { playerState } = get();
          set({ playerState: { ...playerState, ...updates } });
        },

        updateSubtitle: (subtitleId, updates) => {
          const { currentProject } = get();
          if (!currentProject) return;
          
          const updatedSubtitles = currentProject.subtitles.map(sub =>
            sub.id === subtitleId 
              ? { ...sub, ...updates, isEdited: true }
              : sub
          );
          
          get().updateProject(currentProject.id, { subtitles: updatedSubtitles });
        },
        
        addSubtitle: (subtitle) => {
          const { currentProject } = get();
          if (!currentProject) return;
          
          const updatedSubtitles = [...currentProject.subtitles, subtitle];
          get().updateProject(currentProject.id, { subtitles: updatedSubtitles });
        },
        
        removeSubtitle: (subtitleId) => {
          const { currentProject } = get();
          if (!currentProject) return;
          
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

        startExport: async (settings) => {
          const { currentProject } = get();
          if (!currentProject) return;
          
          set({ isProcessing: true, error: null });
          
          try {
            const response = await mockApiService.exportVideo(
              currentProject.id,
              settings,
              (progress) => {
                const { exportJob } = get();
                if (exportJob) {
                  set({ exportJob: { ...exportJob, progress } });
                }
              }
            );
            
            if (response.success && response.data) {
              set({ exportJob: response.data });
            } else {
              set({ error: response.error || 'Export failed' });
            }
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
