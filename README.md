# Video Dubbing App

A simple web application for dubbing videos into different languages using AI.

## What it does

This app takes your video file, extracts the audio, transcribes the speech, translates it to another language, and creates dubbed audio. You can also edit the translations if needed.

## How to use

### 1. Upload your video
- Go to the home page
- Select a video file (MP4, MOV, etc.)
- Choose the target language you want to dub into
- Click upload and wait for processing

### 2. Processing steps
The app automatically does these things:
1. **Extract audio** from your video using FFmpeg
2. **Transcribe** the audio to text using Sarvam AI
3. **Translate** the text to your chosen language
4. **Generate speech** from the translated text
5. **Create subtitles** with 3-second segments

### 3. Edit subtitles
After processing, you can:
- View both original and translated text side by side
- Edit any translation that doesn't sound right
- Search through subtitles
- Click "Edit" button to modify specific lines

### APIs used
- **Sarvam AI Speech-to-Text**: `saarika:v2.5` model for transcription
- **Sarvam AI Translation**: `sarvam-translate:v1` for text translation  
- **Sarvam AI Text-to-Speech**: `bulbul:v2` for generating dubbed audio

### Technologies
- Next.js 14 for the web app
- FFmpeg.wasm for audio extraction in the browser
- Tailwind CSS for styling
- TypeScript for type safety

### Supported languages
English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Gujarati, Marathi, Punjabi, Spanish, French, German, Japanese

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Notes

You need a Sarvam AI API key. The app is configured with one but you should get your own for production use.

The processing happens entirely in your browser for the audio extraction part, but API calls go to Sarvam servers for the AI processing.
