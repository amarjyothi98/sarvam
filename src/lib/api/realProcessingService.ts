// FFmpeg imports are handled dynamically to avoid SSR issues

// Sarvam AI API configuration
const SARVAM_API_KEY = 'sk_aacj0kua_p4urcKlkhTwsQLxZgUGV320P';
const SARVAM_STT_URL = 'https://api.sarvam.ai/speech-to-text';
const SARVAM_TRANSLATE_URL = 'https://api.sarvam.ai/translate';
const SARVAM_TTS_URL = 'https://api.sarvam.ai/text-to-speech';

// Language code mapping for Sarvam API
const LANGUAGE_CODE_MAPPING: Record<string, string> = {
  'en': 'en-IN',
  'hi': 'hi-IN',
  'ta': 'ta-IN',
  'te': 'te-IN',
  'kn': 'kn-IN',
  'ml': 'ml-IN',
  'bn': 'bn-IN',
  'gu': 'gu-IN',
  'mr': 'mr-IN',
  'pa': 'pa-IN',
  'es': 'es-ES',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'ja': 'ja-JP'
};

function mapLanguageCode(code: string): string {
  return LANGUAGE_CODE_MAPPING[code] || code;
}

interface ProcessingResult {
  audioUrl: string;
  transcript: string;
  translatedText: string;
  synthesizedAudioUrl: string;
  detectedLanguage: string;
  targetLanguage: string;
}

class RealProcessingService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ffmpeg: any = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async initFFmpeg(): Promise<any> {
    if (!this.ffmpeg) {
      // Dynamic import to avoid SSR issues
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { toBlobURL } = await import('@ffmpeg/util');
      
      this.ffmpeg = new FFmpeg();
      
      if (!this.ffmpeg.loaded) {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        
        await this.ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
      }
    }
    
    return this.ffmpeg;
  }

  async extractAudio(videoFile: File, onProgress?: (progress: number) => void): Promise<Blob> {
    const ffmpeg = await this.initFFmpeg();
    const { fetchFile } = await import('@ffmpeg/util');
    
    if (onProgress) {
      ffmpeg.on('progress', (data: { progress: number }) => {
        onProgress(Math.round(data.progress * 100));
      });
    }

    // Write input file to FFmpeg filesystem
    await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

    // Extract audio using FFmpeg
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-vn',
      '-acodec', 'pcm_s16le',
      '-ar', '16000',
      '-ac', '1',
      'output.wav'
    ]);

    // Read the output file
    const data = await ffmpeg.readFile('output.wav');
    
    // Clean up FFmpeg filesystem
    try {
      await ffmpeg.deleteFile?.('input.mp4');
      await ffmpeg.deleteFile?.('output.wav');
    } catch (error) {
      // Ignore cleanup errors
      console.warn('FFmpeg cleanup warning:', error);
    }

    return new Blob([data], { type: 'audio/wav' });
  }

  async transcribeAudio(audioBlob: Blob): Promise<{ transcript: string; detectedLanguage: string }> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'saarika:v2.5');

    const response = await fetch(SARVAM_STT_URL, {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.status}`);
    }

    const result = await response.json();
    return {
      transcript: result.transcript,
      detectedLanguage: result.language_code
    };
  }

  async translateText(text: string, targetLanguage: string, sourceLanguage?: string): Promise<string> {
    const mappedTargetLang = mapLanguageCode(targetLanguage);
    const mappedSourceLang = sourceLanguage ? mapLanguageCode(sourceLanguage) : 'auto';
    
    console.log('Translation request:', {
      originalTarget: targetLanguage,
      mappedTarget: mappedTargetLang,
      originalSource: sourceLanguage,
      mappedSource: mappedSourceLang
    });
    
    const response = await fetch(SARVAM_TRANSLATE_URL, {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        source_language_code: mappedSourceLang,
        target_language_code: mappedTargetLang,
        model: 'sarvam-translate:v1',
        speaker_gender: 'Male',
        mode: 'formal'
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status}`);
    }

    const result = await response.json();
    return result.translated_text;
  }

  async synthesizeSpeech(text: string, targetLanguage: string): Promise<string> {
    const mappedTargetLang = mapLanguageCode(targetLanguage);
    
    console.log('Speech synthesis request:', {
      originalLanguage: targetLanguage,
      mappedLanguage: mappedTargetLang
    });
    
    const response = await fetch(SARVAM_TTS_URL, {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        target_language_code: mappedTargetLang,
        speaker: 'anushka',
        pitch: 0.0,
        pace: 1.0,
        loudness: 1.0,
        speech_sample_rate: 22050,
        model: 'bulbul:v2',
        enable_preprocessing: true
      }),
    });

    if (!response.ok) {
      throw new Error(`Speech synthesis failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.audios && result.audios.length > 0) {
      // Convert base64 audio to blob URL
      const base64Audio = result.audios[0];
      const audioBlob = new Blob([
        new Uint8Array(atob(base64Audio).split('').map(char => char.charCodeAt(0)))
      ], { type: 'audio/wav' });
      
      return URL.createObjectURL(audioBlob);
    } else {
      throw new Error('No audio data received from the API');
    }
  }

  async processVideo(
    videoFile: File, 
    targetLanguage: string,
    onProgress?: (step: string, progress: number) => void
  ): Promise<ProcessingResult> {
    try {
      // Step 1: Extract Audio
      onProgress?.('Extracting audio from video...', 10);
      const audioBlob = await this.extractAudio(videoFile, (progress) => {
        onProgress?.('Extracting audio from video...', 10 + (progress * 0.2));
      });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Step 2: Transcribe Audio
      onProgress?.('Transcribing audio to text...', 30);
      const { transcript, detectedLanguage } = await this.transcribeAudio(audioBlob);

      // Step 3: Translate Text
      onProgress?.('Translating text...', 60);
      const translatedText = await this.translateText(transcript, targetLanguage, detectedLanguage);

      // Step 4: Synthesize Speech
      onProgress?.('Generating dubbed audio...', 80);
      const synthesizedAudioUrl = await this.synthesizeSpeech(translatedText, targetLanguage);

      onProgress?.('Processing complete!', 100);

      return {
        audioUrl,
        transcript,
        translatedText,
        synthesizedAudioUrl,
        detectedLanguage,
        targetLanguage
      };
    } catch (error) {
      console.error('Processing error:', error);
      throw error;
    }
  }
}

export const realProcessingService = new RealProcessingService();
