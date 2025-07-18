import { Language, Subtitle, ProcessingStep } from '../lib/types';

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    isSupported: true
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    isSupported: true
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    isSupported: true
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    isSupported: true
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    isSupported: true
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🇮🇳',
    isSupported: true
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇧🇩',
    isSupported: true
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    isSupported: true
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    isSupported: true
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    isSupported: true
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    isSupported: true
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    isSupported: true
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    isSupported: true
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    isSupported: true
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    isSupported: true
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    isSupported: true
  }
];

export const MOCK_ENGLISH_SUBTITLES: Subtitle[] = [
  {
    id: 'sub-1',
    startTime: 0,
    endTime: 3.5,
    text: 'Welcome to our video dubbing studio demonstration.',
    originalText: 'Welcome to our video dubbing studio demonstration.',
    isEdited: false,
    confidence: 0.95
  },
  {
    id: 'sub-2',
    startTime: 3.5,
    endTime: 7.2,
    text: 'Today we will show you how to translate and dub videos.',
    originalText: 'Today we will show you how to translate and dub videos.',
    isEdited: false,
    confidence: 0.92
  },
  {
    id: 'sub-3',
    startTime: 7.2,
    endTime: 11.8,
    text: 'Our platform supports multiple Indian languages and international languages.',
    originalText: 'Our platform supports multiple Indian languages and international languages.',
    isEdited: false,
    confidence: 0.88
  },
  {
    id: 'sub-4',
    startTime: 11.8,
    endTime: 15.5,
    text: 'You can easily edit translations and preview the dubbed result.',
    originalText: 'You can easily edit translations and preview the dubbed result.',
    isEdited: false,
    confidence: 0.91
  },
  {
    id: 'sub-5',
    startTime: 15.5,
    endTime: 19.2,
    text: 'The export process is simple and provides high-quality output.',
    originalText: 'The export process is simple and provides high-quality output.',
    isEdited: false,
    confidence: 0.89
  },
  {
    id: 'sub-6',
    startTime: 19.2,
    endTime: 22.8,
    text: 'Thank you for watching this demonstration.',
    originalText: 'Thank you for watching this demonstration.',
    isEdited: false,
    confidence: 0.94
  }
];

export const MOCK_HINDI_TRANSLATIONS: Subtitle[] = [
  {
    id: 'sub-1',
    startTime: 0,
    endTime: 3.5,
    text: 'हमारे वीडियो डबिंग स्टूडियो प्रदर्शन में आपका स्वागत है।',
    originalText: 'Welcome to our video dubbing studio demonstration.',
    isEdited: false,
    confidence: 0.93
  },
  {
    id: 'sub-2',
    startTime: 3.5,
    endTime: 7.2,
    text: 'आज हम आपको दिखाएंगे कि वीडियो का अनुवाद और डबिंग कैसे करें।',
    originalText: 'Today we will show you how to translate and dub videos.',
    isEdited: false,
    confidence: 0.90
  },
  {
    id: 'sub-3',
    startTime: 7.2,
    endTime: 11.8,
    text: 'हमारा प्लेटफॉर्म कई भारतीय भाषाओं और अंतर्राष्ट्रीय भाषाओं का समर्थन करता है।',
    originalText: 'Our platform supports multiple Indian languages and international languages.',
    isEdited: false,
    confidence: 0.87
  },
  {
    id: 'sub-4',
    startTime: 11.8,
    endTime: 15.5,
    text: 'आप आसानी से अनुवाद संपादित कर सकते हैं और डब्ड परिणाम का पूर्वावलोकन कर सकते हैं।',
    originalText: 'You can easily edit translations and preview the dubbed result.',
    isEdited: false,
    confidence: 0.89
  },
  {
    id: 'sub-5',
    startTime: 15.5,
    endTime: 19.2,
    text: 'निर्यात प्रक्रिया सरल है और उच्च गुणवत्ता वाला आउटपुट प्रदान करती है।',
    originalText: 'The export process is simple and provides high-quality output.',
    isEdited: false,
    confidence: 0.86
  },
  {
    id: 'sub-6',
    startTime: 19.2,
    endTime: 22.8,
    text: 'इस प्रदर्शन को देखने के लिए धन्यवाद।',
    originalText: 'Thank you for watching this demonstration.',
    isEdited: false,
    confidence: 0.92
  }
];

export const MOCK_TAMIL_TRANSLATIONS: Subtitle[] = [
  {
    id: 'sub-1',
    startTime: 0,
    endTime: 3.5,
    text: 'எங்கள் வீடியோ டப்பிங் ஸ்டுடியோ விளக்கத்திற்கு வரவேற்கிறோம்.',
    originalText: 'Welcome to our video dubbing studio demonstration.',
    isEdited: false,
    confidence: 0.91
  },
  {
    id: 'sub-2',
    startTime: 3.5,
    endTime: 7.2,
    text: 'இன்று நாங்கள் வீடியோக்களை மொழிபெயர்த்து டப் செய்வது எப்படி என்று காண்பிப்போம்.',
    originalText: 'Today we will show you how to translate and dub videos.',
    isEdited: false,
    confidence: 0.88
  },
  {
    id: 'sub-3',
    startTime: 7.2,
    endTime: 11.8,
    text: 'எங்கள் தளம் பல இந்திய மொழிகள் மற்றும் சர்வதேச மொழிகளை ஆதரிக்கிறது.',
    originalText: 'Our platform supports multiple Indian languages and international languages.',
    isEdited: false,
    confidence: 0.85
  },
  {
    id: 'sub-4',
    startTime: 11.8,
    endTime: 15.5,
    text: 'நீங்கள் எளிதாக மொழிபெயர்ப்புகளை திருத்தலாம் மற்றும் டப்பிங் முடிவை முன்னோட்டம் பார்க்கலாம்.',
    originalText: 'You can easily edit translations and preview the dubbed result.',
    isEdited: false,
    confidence: 0.87
  },
  {
    id: 'sub-5',
    startTime: 15.5,
    endTime: 19.2,
    text: 'ஏற்றுமதி செயல்முறை எளிமையானது மற்றும் உயர்தர வெளியீட்டை வழங்குகிறது.',
    originalText: 'The export process is simple and provides high-quality output.',
    isEdited: false,
    confidence: 0.84
  },
  {
    id: 'sub-6',
    startTime: 19.2,
    endTime: 22.8,
    text: 'இந்த விளக்கத்தை பார்த்ததற்கு நன்றி.',
    originalText: 'Thank you for watching this demonstration.',
    isEdited: false,
    confidence: 0.90
  }
];

export const PROCESSING_STEPS: ProcessingStep[] = [
  {
    id: 'upload',
    name: 'Uploading video',
    status: 'pending',
    progress: 0,
    message: 'Preparing to upload...'
  },
  {
    id: 'transcribe',
    name: 'Transcribing audio',
    status: 'pending',
    progress: 0,
    message: 'Extracting audio from video...'
  },
  {
    id: 'translate',
    name: 'Translating content',
    status: 'pending',
    progress: 0,
    message: 'Initializing translation engine...'
  },
  {
    id: 'generate-audio',
    name: 'Generating dubbed audio',
    status: 'pending',
    progress: 0,
    message: 'Preparing text-to-speech synthesis...'
  },
  {
    id: 'sync',
    name: 'Synchronizing subtitles',
    status: 'pending',
    progress: 0,
    message: 'Aligning subtitles with audio...'
  },
  {
    id: 'complete',
    name: 'Finalizing',
    status: 'pending',
    progress: 0,
    message: 'Preparing your dubbed video...'
  }
];

export const MOCK_AUDIO_URLS = {
  original: '/api/mock/audio/original.mp3',
  dubbed: {
    hi: '/api/mock/audio/dubbed-hindi.mp3',
    ta: '/api/mock/audio/dubbed-tamil.mp3',
    te: '/api/mock/audio/dubbed-telugu.mp3',
    kn: '/api/mock/audio/dubbed-kannada.mp3',
    ml: '/api/mock/audio/dubbed-malayalam.mp3',
    bn: '/api/mock/audio/dubbed-bengali.mp3',
    gu: '/api/mock/audio/dubbed-gujarati.mp3',
    mr: '/api/mock/audio/dubbed-marathi.mp3',
    pa: '/api/mock/audio/dubbed-punjabi.mp3',
    es: '/api/mock/audio/dubbed-spanish.mp3',
    fr: '/api/mock/audio/dubbed-french.mp3',
    de: '/api/mock/audio/dubbed-german.mp3',
    ja: '/api/mock/audio/dubbed-japanese.mp3',
    ko: '/api/mock/audio/dubbed-korean.mp3',
    zh: '/api/mock/audio/dubbed-chinese.mp3'
  }
};

export const MOCK_VIDEO_METADATA = {
  duration: 23.8,
  width: 1920,
  height: 1080,
  frameRate: 30,
  bitrate: 5000000,
  audioChannels: 2,
  audioSampleRate: 44100
};

export const EXPORT_FORMATS = [
  { value: 'mp4', label: 'MP4', description: 'Most compatible format' },
  { value: 'webm', label: 'WebM', description: 'Web optimized format' },
  { value: 'mov', label: 'MOV', description: 'Apple QuickTime format' }
];

export const QUALITY_PRESETS = [
  { value: 'high', label: 'High Quality', description: '1080p, 8 Mbps' },
  { value: 'medium', label: 'Medium Quality', description: '720p, 4 Mbps' },
  { value: 'low', label: 'Low Quality', description: '480p, 2 Mbps' }
];

export const RESOLUTION_OPTIONS = [
  { value: '1080p', label: '1080p (1920x1080)', width: 1920, height: 1080 },
  { value: '720p', label: '720p (1280x720)', width: 1280, height: 720 },
  { value: '480p', label: '480p (854x480)', width: 854, height: 480 }
];

export const DEFAULT_VOLUME = 0.8;
export const DEFAULT_PLAYBACK_RATE = 1.0;
export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
export const SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/mov', 'video/avi'];
export const SUBTITLE_EDIT_DEBOUNCE_MS = 500;
export const PROCESSING_SIMULATION_DELAY = 2000; // 2 seconds between steps
export const EXPORT_SIMULATION_DURATION = 30000; // 30 seconds total export time
