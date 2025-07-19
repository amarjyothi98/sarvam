import { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function AudioExtractor() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
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
      setProgress(0);
      setStatus('Video file selected');
    } else {
      setStatus('Please select a valid video file');
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
          <button
            onClick={downloadAudio}
            className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700"
          >
            Download Audio File
          </button>
        </div>
      )}
    </div>
  );
}
