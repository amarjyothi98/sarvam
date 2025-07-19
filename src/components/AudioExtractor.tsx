import { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const SARVAM_API_KEY = 'sk_aacj0kua_p4urcKlkhTwsQLxZgUGV320P';
const SARVAM_API_URL = 'https://api.sarvam.ai/speech-to-text';
const SARVAM_TRANSLATE_URL = 'https://api.sarvam.ai/translate';
const SARVAM_TTS_URL = 'https://api.sarvam.ai/text-to-speech';

const LANGUAGE_OPTIONS = [
  { code: 'bn-IN', name: 'Bengali' },
  { code: 'en-IN', name: 'English' },
  { code: 'gu-IN', name: 'Gujarati' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'kn-IN', name: 'Kannada' },
  { code: 'ml-IN', name: 'Malayalam' },
  { code: 'mr-IN', name: 'Marathi' },
  { code: 'od-IN', name: 'Odia' },
  { code: 'pa-IN', name: 'Punjabi' },
  { code: 'ta-IN', name: 'Tamil' },
  { code: 'te-IN', name: 'Telugu' },
  { code: 'as-IN', name: 'Assamese' },
  { code: 'brx-IN', name: 'Bodo' },
  { code: 'doi-IN', name: 'Dogri' },
  { code: 'kok-IN', name: 'Konkani' },
  { code: 'ks-IN', name: 'Kashmiri' },
  { code: 'mai-IN', name: 'Maithili' },
  { code: 'mni-IN', name: 'Manipuri (Meiteilon)' },
  { code: 'ne-IN', name: 'Nepali' },
  { code: 'sa-IN', name: 'Sanskrit' },
  { code: 'sat-IN', name: 'Santali' },
  { code: 'sd-IN', name: 'Sindhi' },
  { code: 'ur-IN', name: 'Urdu' }
];

interface TranscriptionResponse {
  request_id: string;
  transcript: string;
  timestamps?: {
    words: string[];
    start_time_seconds: number[];
    end_time_seconds: number[];
  };
  diarized_transcript?: {
    entries: Array<{
      transcript: string;
      start_time_seconds: number;
      end_time_seconds: number;
      speaker_id: string;
    }>;
  };
  language_code: string;
}

interface TranslationResponse {
  request_id: string;
  translated_text: string;
  source_language_code: string;
}

interface TextToSpeechResponse {
  request_id: string;
  audios: string[]; // Base64 encoded audio strings
}

export default function AudioExtractor() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionResponse | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [translation, setTranslation] = useState<TranslationResponse | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('hi-IN'); // Default to Hindi
  const [synthesizedAudio, setSynthesizedAudio] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    
    if (!ffmpeg.loaded) {
      setStatus('Loading FFmpeg...');
      
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      ffmpeg.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });
      
      setStatus('FFmpeg loaded successfully');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setAudioUrl(null);
      setAudioBlob(null);
      setTranscription(null);
      setTranslation(null);
      setSynthesizedAudio(null);
      setProgress(0);
      setStatus('Video file selected');
    } else {
      setStatus('Please select a valid video file');
    }
  };

  const translateText = async () => {
    if (!transcription?.transcript) {
      setStatus('No transcript available for translation');
      return;
    }

    setIsTranslating(true);
    setStatus('Translating text...');

    try {
      const response = await fetch(SARVAM_TRANSLATE_URL, {
        method: 'POST',
        headers: {
          'api-subscription-key': SARVAM_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: transcription.transcript,
          source_language_code: 'en-IN',
          target_language_code: targetLanguage,
          model: 'sarvam-translate:v1',
          speaker_gender: 'Male',
          mode: 'formal'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: TranslationResponse = await response.json();
      setTranslation(result);
      setStatus('Translation completed successfully!');

    } catch (error) {
      console.error('Error translating text:', error);
      setStatus(`Translation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const synthesizeAudio = async () => {
    if (!translation?.translated_text) {
      setStatus('No translated text available for synthesis');
      return;
    }

    setIsSynthesizing(true);
    setStatus('Synthesizing speech...');

    try {
      const response = await fetch(SARVAM_TTS_URL, {
        method: 'POST',
        headers: {
          'api-subscription-key': SARVAM_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: translation.translated_text,
          target_language_code: targetLanguage,
          speaker: 'anushka',
        //   speaker: 'abhilash',
          pitch: 0.0,
          pace: 1.0,
          loudness: 1.0,
          speech_sample_rate: 22050,
          model: 'bulbul:v2',
          enable_preprocessing: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: TextToSpeechResponse = await response.json();
      
      if (result.audios && result.audios.length > 0) {
        // Convert base64 audio to blob URL
        const base64Audio = result.audios[0];
        const audioBlob = new Blob([
          new Uint8Array(atob(base64Audio).split('').map(char => char.charCodeAt(0)))
        ], { type: 'audio/wav' });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        setSynthesizedAudio(audioUrl);
        setStatus('Speech synthesis completed successfully!');
      } else {
        throw new Error('No audio data received from the API');
      }

    } catch (error) {
      console.error('Error synthesizing speech:', error);
      setStatus(`Speech synthesis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) {
      setStatus('No audio file available for transcription');
      return;
    }

    setIsTranscribing(true);
    setStatus('Transcribing audio...');

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', 'saarika:v2.5');
      formData.append('language_code', 'en-IN');

      const response = await fetch(SARVAM_API_URL, {
        method: 'POST',
        headers: {
          'api-subscription-key': SARVAM_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: TranscriptionResponse = await response.json();
      setTranscription(result);
      setStatus('Transcription completed successfully!');

    } catch (error) {
      console.error('Error transcribing audio:', error);
      setStatus(`Transcription error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const extractAudio = async () => {
    if (!videoFile) {
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setStatus('Starting audio extraction...');

    try {
      const ffmpeg = ffmpegRef.current;
      
      // Load FFmpeg if not already loaded
      await loadFFmpeg();

      // Write input file to FFmpeg filesystem
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
      setStatus('Processing video...');

      // Extract audio using FFmpeg
      await ffmpeg.exec([
        '-i', 'input.mp4',           // Input video file
        '-vn',                        // No video
        '-acodec', 'pcm_s16le',      // Audio codec: PCM 16-bit
        '-ar', '16000',              // Sample rate: 16kHz (good for speech)
        '-ac', '1',                  // Mono audio
        'output.wav'                 // Output audio file
      ]);

      // Read the output file
      const data = await ffmpeg.readFile('output.wav');
      
      // Create blob URL for the audio file
      const audioBlob = new Blob([data], { type: 'audio/wav' });
      const url = URL.createObjectURL(audioBlob);
      
      setAudioUrl(url);
      setAudioBlob(audioBlob); // Store the blob for transcription
      setStatus('Audio extraction completed!');
      setProgress(100);

      // Clean up FFmpeg filesystem
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.wav');

    } catch (error) {
      console.error('Error extracting audio:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAudio = () => {
    if (audioUrl && videoFile) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `${videoFile.name.split('.')[0]}_audio.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Audio Extractor</h1>
      
      {/* File Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Video File
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Video Preview */}
      {videoFile && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Selected file: {videoFile.name}</p>
          <video
            src={URL.createObjectURL(videoFile)}
            controls
            className="w-full max-w-md rounded"
          />
        </div>
      )}

      {/* Extract Button */}
      <div className="mb-6">
        <button
          onClick={extractAudio}
          disabled={!videoFile || isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Extracting Audio...' : 'Extract Audio'}
        </button>
      </div>

      {/* Progress */}
      {isLoading && (
        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">Progress: {progress}%</p>
        </div>
      )}

      {/* Status */}
      {status && (
        <div className="mb-6">
          <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded">
            Status: {status}
          </p>
        </div>
      )}

      {/* Audio Output */}
      {audioUrl && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Extracted Audio</h3>
          <audio src={audioUrl} controls className="w-full mb-3" />
          <div className="flex gap-3">
            <button
              onClick={downloadAudio}
              className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700"
            >
              Download Audio File
            </button>
            <button
              onClick={transcribeAudio}
              disabled={isTranscribing}
              className="bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
            </button>
          </div>
        </div>
      )}

      {/* Translation Controls */}
      {transcription && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Translation</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Language
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={translateText}
              disabled={isTranslating}
              className="bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isTranslating ? 'Translating...' : 'Translate'}
            </button>
          </div>
        </div>
      )}

      {/* Text-to-Speech Controls */}
      {translation && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Text-to-Speech</h3>
          <div className="flex gap-3">
            <button
              onClick={synthesizeAudio}
              disabled={isSynthesizing}
              className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSynthesizing ? 'Synthesizing...' : 'Generate Speech'}
            </button>
          </div>
        </div>
      )}

      {/* Transcription Output */}
      {transcription && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Transcription Results</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            
            {/* Main Transcript */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Transcript:</h4>
              <p className="text-gray-800 bg-white p-3 rounded border">{transcription.transcript}</p>
            </div>

            {/* Language Detection */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Detected Language:</h4>
              <p className="text-gray-600">{transcription.language_code}</p>
            </div>

            {/* Request ID */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Request ID:</h4>
              <p className="text-gray-600 text-sm font-mono">{transcription.request_id}</p>
            </div>

            {/* Timestamps (if available) */}
            {transcription.timestamps && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Word Timestamps:</h4>
                <div className="max-h-40 overflow-y-auto bg-white p-3 rounded border">
                  {transcription.timestamps.words.map((word, index) => (
                    <div key={index} className="flex justify-between items-center py-1 text-sm">
                      <span className="font-medium">{word}</span>
                      <span className="text-gray-500">
                        {transcription.timestamps!.start_time_seconds[index]}s - {transcription.timestamps!.end_time_seconds[index]}s
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diarized Transcript (if available) */}
            {transcription.diarized_transcript && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Speaker Diarization:</h4>
                <div className="max-h-40 overflow-y-auto bg-white p-3 rounded border space-y-2">
                  {transcription.diarized_transcript.entries.map((entry, index) => (
                    <div key={index} className="border-l-4 border-blue-400 pl-3">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-blue-600">{entry.speaker_id}</span>
                        <span className="text-gray-500 text-sm">
                          {entry.start_time_seconds}s - {entry.end_time_seconds}s
                        </span>
                      </div>
                      <p className="text-gray-800 mt-1">{entry.transcript}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Translation Results */}
      {translation && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Translation Results</h3>
          <div className="bg-orange-50 p-4 rounded-lg space-y-4">
            
            {/* Translated Text */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Translated Text:</h4>
              <p className="text-gray-800 bg-white p-3 rounded border">{translation.translated_text}</p>
            </div>

            {/* Source Language Detection */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Source Language (Auto-detected):</h4>
              <p className="text-gray-600">{translation.source_language_code}</p>
            </div>

            {/* Target Language */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Target Language:</h4>
              <p className="text-gray-600">{LANGUAGE_OPTIONS.find(lang => lang.code === targetLanguage)?.name}</p>
            </div>

            {/* Request ID */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Translation Request ID:</h4>
              <p className="text-gray-600 text-sm font-mono">{translation.request_id}</p>
            </div>

            {/* Original vs Translated Comparison */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Comparison:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-1">Original Text:</h5>
                  <p className="text-gray-700 bg-white p-2 rounded border text-sm">{transcription?.transcript}</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-1">Translated Text:</h5>
                  <p className="text-gray-700 bg-white p-2 rounded border text-sm">{translation.translated_text}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Synthesized Audio Output */}
      {synthesizedAudio && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Synthesized Audio</h3>
          <div className="bg-red-50 p-4 rounded-lg space-y-4">
            
            {/* Audio Player */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Generated Audio:</h4>
              <audio src={synthesizedAudio} controls className="w-full" />
            </div>

            {/* Audio Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Language:</h4>
                <p className="text-gray-600">{LANGUAGE_OPTIONS.find(lang => lang.code === targetLanguage)?.name}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Voice:</h4>
                <p className="text-gray-600">Anushka (Female)</p>
              </div>
            </div>

            {/* Text used for synthesis */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Text used for synthesis:</h4>
              <p className="text-gray-700 bg-white p-2 rounded border text-sm">{translation?.translated_text}</p>
            </div>

            {/* Download button */}
            <div>
              <button
                onClick={() => {
                  if (synthesizedAudio) {
                    const link = document.createElement('a');
                    link.href = synthesizedAudio;
                    link.download = `synthesized_audio_${targetLanguage}.wav`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
                className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700"
              >
                Download Synthesized Audio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
