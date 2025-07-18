'use client';

import { useState, useCallback } from 'react';
import { useVideoStore } from '../../store/videoStore';
import { Button } from '../ui/Button';
import { 
  ClockIcon,
  DocumentTextIcon,
  PlayIcon,
  ArrowUturnLeftIcon,
  TagIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface VersionHistoryProps {
  projectId: string;
  className?: string;
}

interface ProjectVersion {
  id: string;
  version: string;
  timestamp: Date;
  author: string;
  description: string;
  changes: {
    type: 'subtitle' | 'audio' | 'settings' | 'export';
    count: number;
    description: string;
  }[];
  isAutoSave?: boolean;
  isMajor?: boolean;
}

export function VersionHistory({ projectId, className = '' }: VersionHistoryProps) {
  const { currentProject } = useVideoStore();
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showCreateVersion, setShowCreateVersion] = useState(false);
  const [versionDescription, setVersionDescription] = useState('');
  const [versionType, setVersionType] = useState<'minor' | 'major'>('minor');

  // Mock version history data
  const versions: ProjectVersion[] = [
    {
      id: 'v1.2.1',
      version: '1.2.1',
      timestamp: new Date('2024-01-15T14:30:00'),
      author: 'Current User',
      description: 'Final audio adjustments and export settings',
      changes: [
        { type: 'audio', count: 3, description: 'Updated voice synthesis for 3 segments' },
        { type: 'settings', count: 1, description: 'Modified export quality settings' }
      ],
      isMajor: false
    },
    {
      id: 'v1.2.0',
      version: '1.2.0',
      timestamp: new Date('2024-01-15T12:15:00'),
      author: 'Current User',
      description: 'Completed translation review and dubbing',
      changes: [
        { type: 'subtitle', count: 12, description: 'Reviewed and edited 12 subtitles' },
        { type: 'audio', count: 8, description: 'Added dubbing for 8 segments' }
      ],
      isMajor: true
    },
    {
      id: 'v1.1.3',
      version: '1.1.3',
      timestamp: new Date('2024-01-15T10:45:00'),
      author: 'Current User',
      description: 'Auto-save: Translation progress',
      changes: [
        { type: 'subtitle', count: 5, description: 'Translated 5 new subtitles' }
      ],
      isAutoSave: true
    },
    {
      id: 'v1.1.0',
      version: '1.1.0',
      timestamp: new Date('2024-01-15T09:00:00'),
      author: 'Current User',
      description: 'Initial translation and timing adjustments',
      changes: [
        { type: 'subtitle', count: 15, description: 'Generated initial translation' },
        { type: 'subtitle', count: 8, description: 'Adjusted timing for 8 segments' }
      ],
      isMajor: true
    },
    {
      id: 'v1.0.0',
      version: '1.0.0',
      timestamp: new Date('2024-01-15T08:00:00'),
      author: 'Current User',
      description: 'Project created with video upload',
      changes: [
        { type: 'settings', count: 1, description: 'Project initialized' }
      ],
      isMajor: true
    }
  ];

  const handleCreateVersion = useCallback(() => {
    if (!versionDescription.trim()) return;
    
    // In a real app, this would save the current state as a new version
    console.log('Creating new version:', {
      type: versionType,
      description: versionDescription,
      projectId
    });
    
    setShowCreateVersion(false);
    setVersionDescription('');
    setVersionType('minor');
  }, [versionDescription, versionType, projectId]);

  const handleRevertToVersion = useCallback((version: ProjectVersion) => {
    // In a real app, this would revert the project to the selected version
    console.log('Reverting to version:', version.version);
  }, []);

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'subtitle':
        return <DocumentTextIcon className="w-4 h-4 text-blue-400" />;
      case 'audio':
        return <PlayIcon className="w-4 h-4 text-green-400" />;
      case 'settings':
        return <TagIcon className="w-4 h-4 text-purple-400" />;
      case 'export':
        return <CheckCircleIcon className="w-4 h-4 text-orange-400" />;
      default:
        return <DocumentTextIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'subtitle':
        return 'text-blue-400';
      case 'audio':
        return 'text-green-400';
      case 'settings':
        return 'text-purple-400';
      case 'export':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Version History</h2>
            <p className="text-gray-400 mt-1">
              {currentProject?.name || 'Project'} - {versions.length} versions
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateVersion(true)}
            className="flex items-center space-x-2"
          >
            <TagIcon className="w-4 h-4" />
            <span>Create Version</span>
          </Button>
        </div>
      </div>

      {/* Version List */}
      <div className="p-6">
        <div className="space-y-4">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`bg-gray-700 rounded-lg border-2 transition-all duration-200 ${
                selectedVersion === version.id ? 'border-blue-500' : 'border-gray-600'
              }`}
            >
              <div className="p-4">
                {/* Version Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      version.isMajor ? 'bg-blue-600 text-white' : 
                      version.isAutoSave ? 'bg-gray-600 text-gray-300' : 
                      'bg-green-600 text-white'
                    }`}>
                      v{version.version}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <ClockIcon className="w-4 h-4" />
                      <span>{version.timestamp.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <UserIcon className="w-4 h-4" />
                      <span>{version.author}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedVersion(
                        selectedVersion === version.id ? null : version.id
                      )}
                    >
                      {selectedVersion === version.id ? 'Hide Details' : 'View Details'}
                    </Button>
                    
                    {!version.isAutoSave && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevertToVersion(version)}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <ArrowUturnLeftIcon className="w-4 h-4 mr-1" />
                        Revert
                      </Button>
                    )}
                  </div>
                </div>

                {/* Version Description */}
                <div className="mb-3">
                  <div className="flex items-start space-x-2">
                    <ChatBubbleLeftIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="text-gray-300">{version.description}</p>
                  </div>
                </div>

                {/* Changes Summary */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {version.changes.map((change, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-1 bg-gray-600 rounded px-2 py-1 text-xs"
                    >
                      {getChangeTypeIcon(change.type)}
                      <span className={getChangeTypeColor(change.type)}>
                        {change.count} {change.type}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Detailed Changes */}
                {selectedVersion === version.id && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <h4 className="text-sm font-medium text-white mb-2">Changes:</h4>
                    <div className="space-y-2">
                      {version.changes.map((change, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          {getChangeTypeIcon(change.type)}
                          <span className="text-gray-300">{change.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Version Modal */}
      {showCreateVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Version</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Version Type
                </label>
                <select
                  value={versionType}
                  onChange={(e) => setVersionType(e.target.value as 'minor' | 'major')}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="minor">Minor Update</option>
                  <option value="major">Major Release</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={versionDescription}
                  onChange={(e) => setVersionDescription(e.target.value)}
                  placeholder="Describe the changes made in this version..."
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowCreateVersion(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateVersion}
                disabled={!versionDescription.trim()}
              >
                Create Version
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VersionHistory;
