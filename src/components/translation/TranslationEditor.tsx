'use client';

import { useState, useCallback, useEffect } from 'react';
import { useVideoStore } from '../../store/videoStore';
import { Subtitle } from '../../lib/types';
import { Button } from '../ui/Button';
import { 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { formatTime } from '../../lib/utils';

interface TranslationEditorProps {
  onSubtitleSelect?: (subtitle: Subtitle) => void;
  onTimeSeek?: (time: number) => void;
  className?: string;
}

export function TranslationEditor({ 
  onSubtitleSelect, 
  onTimeSeek, 
  className = '' 
}: TranslationEditorProps) {
  const { 
    currentProject, 
    updateProject, 
    subtitleEditor, 
    updateSubtitleEditor,
    playerState 
  } = useVideoStore();
  
  const [editingSubtitle, setEditingSubtitle] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showOriginal, setShowOriginal] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const subtitles = currentProject?.subtitles || [];
  const { currentTime } = playerState;

  // Filter subtitles based on search
  const filteredSubtitles = subtitles.filter(sub => 
    sub.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sub.originalText && sub.originalText.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Find current subtitle based on video time
  const currentSubtitle = subtitles.find(sub => 
    currentTime >= sub.startTime && currentTime <= sub.endTime
  );

  // Handle subtitle editing
  const handleEditStart = useCallback((subtitle: Subtitle) => {
    setEditingSubtitle(subtitle.id);
    setEditText(subtitle.text);
    updateSubtitleEditor({ editingSubtitle: subtitle.id });
  }, [updateSubtitleEditor]);

  const handleEditSave = useCallback(() => {
    if (!editingSubtitle || !currentProject) return;
    
    const updatedSubtitles = currentProject.subtitles.map(sub => 
      sub.id === editingSubtitle 
        ? { ...sub, text: editText, isEdited: true }
        : sub
    );
    
    updateProject(currentProject.id, { 
      subtitles: updatedSubtitles,
      updatedAt: new Date()
    });
    
    setEditingSubtitle(null);
    setEditText('');
    updateSubtitleEditor({ editingSubtitle: null });
  }, [editingSubtitle, editText, currentProject, updateProject, updateSubtitleEditor]);

  const handleEditCancel = useCallback(() => {
    setEditingSubtitle(null);
    setEditText('');
    updateSubtitleEditor({ editingSubtitle: null });
  }, [updateSubtitleEditor]);

  // Handle subtitle selection and seeking
  const handleSubtitleClick = useCallback((subtitle: Subtitle) => {
    onSubtitleSelect?.(subtitle);
    onTimeSeek?.(subtitle.startTime);
    updateSubtitleEditor({ selectedSubtitle: subtitle.id });
  }, [onSubtitleSelect, onTimeSeek, updateSubtitleEditor]);

  // Handle subtitle playback
  const handleSubtitlePlay = useCallback((subtitle: Subtitle) => {
    setCurrentlyPlaying(subtitle.id);
    onTimeSeek?.(subtitle.startTime);
    
    // Auto-stop after subtitle duration
    setTimeout(() => {
      setCurrentlyPlaying(null);
    }, (subtitle.endTime - subtitle.startTime) * 1000);
  }, [onTimeSeek]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't handle shortcuts when typing
      }
      
      switch (e.key) {
        case 'Enter':
          if (editingSubtitle) {
            e.preventDefault();
            handleEditSave();
          }
          break;
        case 'Escape':
          if (editingSubtitle) {
            e.preventDefault();
            handleEditCancel();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingSubtitle, handleEditSave, handleEditCancel]);

  if (!currentProject) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-400">
          <p>No project selected</p>
          <p className="text-sm mt-2">Please select a project to start editing translations</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Translation Editor</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant={showOriginal ? "primary" : "ghost"}
              size="sm"
              onClick={() => setShowOriginal(!showOriginal)}
              className="flex items-center space-x-2"
            >
              {showOriginal ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
              <span>Original</span>
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search subtitles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Subtitles List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredSubtitles.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            {searchTerm ? 'No subtitles match your search' : 'No subtitles available'}
          </div>
        ) : (
          filteredSubtitles.map((subtitle) => (
            <div
              key={subtitle.id}
              className={`p-4 border-b border-gray-700 hover:bg-gray-700 transition-colors ${
                currentSubtitle?.id === subtitle.id ? 'bg-blue-900/30 border-blue-500' : ''
              } ${
                subtitleEditor.selectedSubtitle === subtitle.id ? 'bg-gray-700' : ''
              }`}
            >
              {/* Subtitle Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-blue-400 font-mono text-sm">
                    {formatTime(subtitle.startTime)} - {formatTime(subtitle.endTime)}
                  </span>
                  {subtitle.isEdited && (
                    <span className="bg-yellow-600 text-yellow-100 px-2 py-1 rounded text-xs">
                      Edited
                    </span>
                  )}
                  {subtitle.confidence && subtitle.confidence < 0.8 && (
                    <span className="bg-red-600 text-red-100 px-2 py-1 rounded text-xs">
                      Low Confidence
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSubtitlePlay(subtitle)}
                    className="p-1"
                  >
                    {currentlyPlaying === subtitle.id ? (
                      <PauseIcon className="w-4 h-4" />
                    ) : (
                      <PlayIcon className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSubtitleClick(subtitle)}
                    className="p-1"
                  >
                    <SpeakerWaveIcon className="w-4 h-4" />
                  </Button>
                  
                  {editingSubtitle === subtitle.id ? (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditSave}
                        className="p-1 text-green-400 hover:text-green-300"
                      >
                        <CheckIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditCancel}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditStart(subtitle)}
                      className="p-1"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Original Text */}
              {showOriginal && subtitle.originalText && (
                <div className="mb-2 p-2 bg-gray-900 rounded text-gray-300 text-sm">
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Original:</span>
                  <p className="mt-1">{subtitle.originalText}</p>
                </div>
              )}

              {/* Translated Text */}
              {editingSubtitle === subtitle.id ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="Enter translation..."
                  autoFocus
                />
              ) : (
                <div 
                  className="text-white cursor-pointer hover:bg-gray-600 p-2 rounded transition-colors"
                  onClick={() => handleSubtitleClick(subtitle)}
                >
                  {subtitle.text}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            {subtitles.length} subtitles total
          </span>
          <span>
            {subtitles.filter(sub => sub.isEdited).length} edited
          </span>
          <span>
            {subtitles.filter(sub => sub.confidence && sub.confidence < 0.8).length} low confidence
          </span>
        </div>
      </div>
    </div>
  );
}

export default TranslationEditor;
