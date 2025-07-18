'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useVideoStore } from '../../store/videoStore';
import { Button } from '../ui/Button';
import { 
  FolderIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  ClockIcon,
  FilmIcon,
  LanguageIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { formatTime } from '../../lib/utils';
import { VideoProject } from '../../lib/types';

interface ProjectManagerProps {
  onProjectSelect?: (project: VideoProject) => void;
  className?: string;
}

export function ProjectManager({ onProjectSelect, className = '' }: ProjectManagerProps) {
  const router = useRouter();
  const { projects, currentProject, setCurrentProject, removeProject } = useVideoStore();
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'duration'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.currentLanguage.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (filterStatus === 'all') return true;
      
      const isComplete = project.subtitles.length > 0 && 
                        project.subtitles.every(sub => sub.isEdited) &&
                        project.audioTracks.some(track => track.type === 'dubbed');
      
      return filterStatus === 'complete' ? isComplete : !isComplete;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'duration':
          return b.video.duration - a.video.duration;
        default:
          return 0;
      }
    });

  const handleProjectSelect = useCallback((project: VideoProject) => {
    setCurrentProject(project);
    onProjectSelect?.(project);
  }, [setCurrentProject, onProjectSelect]);

  const handleDeleteProject = useCallback((projectId: string) => {
    removeProject(projectId);
    setShowDeleteConfirm(null);
  }, [removeProject]);

  const handleDuplicateProject = useCallback((project: VideoProject) => {
    // In a real app, you would create a copy of the project
    console.log('Duplicating project:', project.name);
    // Implementation would create a new project with copied data
  }, []);

  const getProjectStatus = (project: VideoProject) => {
    const totalSubtitles = project.subtitles.length;
    const editedSubtitles = project.subtitles.filter(sub => sub.isEdited).length;
    const hasDubbing = project.audioTracks.some(track => track.type === 'dubbed');
    
    if (totalSubtitles === 0) return { status: 'empty', text: 'No subtitles', color: 'text-gray-400' };
    if (editedSubtitles === totalSubtitles && hasDubbing) return { status: 'complete', text: 'Complete', color: 'text-green-400' };
    if (editedSubtitles === totalSubtitles) return { status: 'translated', text: 'Translated', color: 'text-blue-400' };
    if (editedSubtitles > 0) return { status: 'partial', text: 'In Progress', color: 'text-yellow-400' };
    return { status: 'new', text: 'New', color: 'text-gray-400' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'translated':
        return <CheckCircleIcon className="w-5 h-5 text-blue-400" />;
      case 'partial':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      case 'new':
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
      default:
        return <XCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Project Manager</h2>
          <Button
            variant="primary"
            onClick={() => router.push('/')}
            className="flex items-center space-x-2"
          >
            <FolderIcon className="w-4 h-4" />
            <span>New Project</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'duration')}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="duration">Sort by Duration</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'complete' | 'incomplete')}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Projects</option>
              <option value="complete">Complete</option>
              <option value="incomplete">In Progress</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="p-6">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {searchTerm ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-400 mb-4">
              {searchTerm ? 'Try adjusting your search or filters' : 'Create your first video dubbing project'}
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/')}
            >
              Create New Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const status = getProjectStatus(project);
              const isSelected = currentProject?.id === project.id;
              
              return (
                <div
                  key={project.id}
                  className={`bg-gray-700 rounded-lg border-2 transition-all duration-200 hover:bg-gray-600 ${
                    isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600'
                  }`}
                >
                  {/* Project Header */}
                  <div className="p-4 border-b border-gray-600">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white truncate mr-2">
                        {project.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(status.status)}
                      </div>
                    </div>
                    <p className={`text-sm ${status.color}`}>
                      {status.text}
                    </p>
                  </div>

                  {/* Project Details */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center text-sm text-gray-300">
                      <FilmIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{formatTime(project.video.duration)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-300">
                      <LanguageIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{project.currentLanguage}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-300">
                      <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Translation Progress</span>
                        <span>
                          {project.subtitles.filter(sub => sub.isEdited).length}/{project.subtitles.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${project.subtitles.length > 0 ? (project.subtitles.filter(sub => sub.isEdited).length / project.subtitles.length) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 border-t border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleProjectSelect(project)}
                          className="flex items-center space-x-1"
                        >
                          <PlayIcon className="w-3 h-3" />
                          <span>Open</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleProjectSelect(project);
                            router.push('/complete-studio');
                          }}
                          className="flex items-center space-x-1"
                        >
                          <PencilIcon className="w-3 h-3" />
                          <span>Edit</span>
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleProjectSelect(project);
                            router.push('/player');
                          }}
                          className="p-1"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateProject(project)}
                          className="p-1"
                        >
                          <DocumentDuplicateIcon className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(project.id)}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Delete Project</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDeleteProject(showDeleteConfirm)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectManager;
