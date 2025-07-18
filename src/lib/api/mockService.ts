import { 
  VideoFile, 
  TranslationJob, 
  ExportJob, 
  AudioTrack, 
  ProcessingStep, 
  APIResponse,
  ExportSettings
} from '../types';
import { 
  MOCK_ENGLISH_SUBTITLES, 
  MOCK_HINDI_TRANSLATIONS, 
  MOCK_TAMIL_TRANSLATIONS,
  MOCK_AUDIO_URLS,
  MOCK_VIDEO_METADATA,
  PROCESSING_STEPS,
  PROCESSING_SIMULATION_DELAY,
  EXPORT_SIMULATION_DURATION
} from '../../data/mockData';
import { generateId } from '../utils';

/**
 * Mock API service for video dubbing operations
 * Simulates real API calls with realistic delays and responses
 */
class MockAPIService {
  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getRandomDelay(min: number = 1000, max: number = 3000): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Simulate video upload process
   */
  async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<APIResponse<VideoFile>> {
    // Simulate upload progress
    if (onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        onProgress(i);
        await this.simulateDelay(100);
      }
    }

    const videoFile: VideoFile = {
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      duration: MOCK_VIDEO_METADATA.duration,
      thumbnail: '', // Will be generated separately
      uploadedAt: new Date()
    };

    return {
      success: true,
      data: videoFile,
      message: 'Video uploaded successfully'
    };
  }

  /**
   * Simulate video processing (transcription + translation)
   */
  async processVideo(
    videoId: string, 
    targetLanguage: string,
    onProgress?: (steps: ProcessingStep[]) => void
  ): Promise<APIResponse<TranslationJob>> {
    const steps = [...PROCESSING_STEPS];
    
    // Simulate processing steps
    for (let i = 0; i < steps.length; i++) {
      steps[i].status = 'processing';
      onProgress?.(steps);
      
      // Simulate progress within each step
      for (let progress = 0; progress <= 100; progress += 20) {
        steps[i].progress = progress;
        steps[i].message = this.getProcessingMessage(steps[i].id, progress);
        onProgress?.(steps);
        await this.simulateDelay(PROCESSING_SIMULATION_DELAY / 5);
      }
      
      steps[i].status = 'completed';
      steps[i].progress = 100;
      steps[i].message = 'Completed';
      onProgress?.(steps);
      
      await this.simulateDelay(500);
    }

    // Get appropriate translations based on target language
    let translatedSubtitles = MOCK_ENGLISH_SUBTITLES;
    if (targetLanguage === 'hi') {
      translatedSubtitles = MOCK_HINDI_TRANSLATIONS;
    } else if (targetLanguage === 'ta') {
      translatedSubtitles = MOCK_TAMIL_TRANSLATIONS;
    }

    const translationJob: TranslationJob = {
      id: generateId(),
      videoId,
      sourceLanguage: 'en',
      targetLanguage,
      status: 'completed',
      progress: 100,
      subtitles: translatedSubtitles,
      createdAt: new Date(),
      completedAt: new Date()
    };

    return {
      success: true,
      data: translationJob,
      message: 'Video processed successfully'
    };
  }

  /**
   * Simulate generating dubbed audio
   */
  async generateDubbedAudio(
    subtitles: { id: string; text: string; startTime: number; endTime: number }[], 
    targetLanguage: string
  ): Promise<APIResponse<AudioTrack>> {
    await this.simulateDelay(this.getRandomDelay(2000, 4000));

    const dubbedAudio: AudioTrack = {
      id: generateId(),
      name: `Dubbed Audio (${targetLanguage})`,
      url: MOCK_AUDIO_URLS.dubbed[targetLanguage as keyof typeof MOCK_AUDIO_URLS.dubbed] || MOCK_AUDIO_URLS.dubbed.hi,
      type: 'dubbed',
      language: targetLanguage,
      volume: 0.8,
      isMuted: false
    };

    return {
      success: true,
      data: dubbedAudio,
      message: 'Dubbed audio generated successfully'
    };
  }

  /**
   * Simulate Sarvam Translate API call
   */
  async translateText(
    text: string, 
    sourceLanguage: string, 
    targetLanguage: string
  ): Promise<APIResponse<string>> {
    await this.simulateDelay(this.getRandomDelay(500, 1500));

    // Simple mock translation - in real app, this would call Sarvam API
    const mockTranslations: Record<string, Record<string, string>> = {
      'en->hi': {
        'Hello': 'नमस्ते',
        'Welcome': 'स्वागत है',
        'Thank you': 'धन्यवाद',
        'Video': 'वीडियो',
        'Audio': 'ऑडियो'
      },
      'en->ta': {
        'Hello': 'வணக்கம்',
        'Welcome': 'வரவேற்கிறோம்',
        'Thank you': 'நன்றி',
        'Video': 'வீடியோ',
        'Audio': 'ஆடியோ'
      }
    };

    const translationKey = `${sourceLanguage}->${targetLanguage}`;
    const translations = mockTranslations[translationKey] || {};
    
    // Simple word replacement for demo
    let translatedText = text;
    Object.entries(translations).forEach(([english, translated]) => {
      translatedText = translatedText.replace(new RegExp(english, 'gi'), translated);
    });

    return {
      success: true,
      data: translatedText || text,
      message: 'Text translated successfully'
    };
  }

  /**
   * Simulate export process
   */
  async exportVideo(
    projectId: string, 
    settings: ExportSettings,
    onProgress?: (progress: number) => void
  ): Promise<APIResponse<ExportJob>> {
    const exportJob: ExportJob = {
      id: generateId(),
      projectId,
      settings,
      status: 'processing',
      progress: 0,
      createdAt: new Date()
    };

    // Simulate export progress
    const totalSteps = 20;
    for (let i = 0; i <= totalSteps; i++) {
      const progress = (i / totalSteps) * 100;
      exportJob.progress = progress;
      onProgress?.(progress);
      await this.simulateDelay(EXPORT_SIMULATION_DURATION / totalSteps);
    }

    exportJob.status = 'completed';
    exportJob.progress = 100;
    exportJob.completedAt = new Date();
    exportJob.downloadUrl = `/api/mock/download/${exportJob.id}.${settings.format}`;

    return {
      success: true,
      data: exportJob,
      message: 'Video exported successfully'
    };
  }

  /**
   * Simulate text-to-speech generation
   */
  async generateTTS(
    text: string, 
    language: string
  ): Promise<APIResponse<string>> {
    await this.simulateDelay(this.getRandomDelay(1000, 3000));

    // Return mock audio URL
    const audioUrl = MOCK_AUDIO_URLS.dubbed[language as keyof typeof MOCK_AUDIO_URLS.dubbed] || MOCK_AUDIO_URLS.dubbed.hi;

    return {
      success: true,
      data: audioUrl,
      message: 'TTS audio generated successfully'
    };
  }

  /**
   * Get processing step message
   */
  private getProcessingMessage(stepId: string, progress: number): string {
    const messages: Record<string, string[]> = {
      'upload': [
        'Preparing to upload...',
        'Uploading video file...',
        'Validating file format...',
        'Processing video metadata...',
        'Upload complete'
      ],
      'transcribe': [
        'Extracting audio from video...',
        'Initializing speech recognition...',
        'Transcribing audio content...',
        'Optimizing transcription accuracy...',
        'Transcription complete'
      ],
      'translate': [
        'Initializing translation engine...',
        'Analyzing source content...',
        'Translating text segments...',
        'Optimizing translation quality...',
        'Translation complete'
      ],
      'generate-audio': [
        'Preparing text-to-speech synthesis...',
        'Selecting optimal voice model...',
        'Generating dubbed audio...',
        'Processing audio quality...',
        'Audio generation complete'
      ],
      'sync': [
        'Aligning subtitles with audio...',
        'Calculating timing synchronization...',
        'Adjusting subtitle positions...',
        'Validating synchronization...',
        'Synchronization complete'
      ],
      'complete': [
        'Preparing your dubbed video...',
        'Finalizing video processing...',
        'Generating preview...',
        'Optimizing output quality...',
        'Processing complete'
      ]
    };

    const stepMessages = messages[stepId] || ['Processing...'];
    const messageIndex = Math.floor((progress / 100) * (stepMessages.length - 1));
    return stepMessages[messageIndex];
  }

  /**
   * Simulate error scenarios for testing
   */
  async simulateError(errorType: 'upload' | 'processing' | 'export'): Promise<APIResponse<never>> {
    await this.simulateDelay(this.getRandomDelay(1000, 2000));

    const errorMessages = {
      upload: 'Failed to upload video file',
      processing: 'Processing failed due to unsupported content',
      export: 'Export failed due to server error'
    };

    return {
      success: false,
      error: errorMessages[errorType],
      message: 'Operation failed'
    };
  }
}

export const mockApiService = new MockAPIService();
export default mockApiService;
