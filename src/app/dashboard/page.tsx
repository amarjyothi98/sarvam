'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectManager } from '../../components/project/ProjectManager';
import { VersionHistory } from '../../components/project/VersionHistory';
import { CollaborationSystem } from '../../components/collaboration/CollaborationSystem';
import { Button } from '../../components/ui/Button';
import { 
  FolderIcon,
  ClockIcon,
  UsersIcon,
  ChartBarIcon,
  BellIcon,
  PlayIcon,
  PencilIcon,
  ShareIcon,
  DocumentTextIcon,
  FilmIcon,
  LanguageIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useVideoStore } from '../../store/videoStore';
import { formatTime } from '../../lib/utils';
import { VideoProject } from '../../lib/types';

export default function ProjectDashboard() {
  const router = useRouter();
  const { projects, currentProject, setCurrentProject } = useVideoStore();
  const [activeView, setActiveView] = useState<'projects' | 'history' | 'collaboration' | 'analytics'>('projects');
  
  // Mock analytics data
  const analyticsData = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.subtitles.some(s => !s.isEdited)).length,
    completedProjects: projects.filter(p => p.subtitles.length > 0 && p.subtitles.every(s => s.isEdited)).length,
    totalDuration: projects.reduce((acc, p) => acc + p.video.duration, 0),
    languagesUsed: Array.from(new Set(projects.map(p => p.currentLanguage))),
    recentActivity: [
      { project: 'Marketing Video', action: 'Translation completed', time: '2 hours ago' },
      { project: 'Tutorial Series', action: 'Dubbing in progress', time: '5 hours ago' },
      { project: 'Product Demo', action: 'Exported final version', time: '1 day ago' }
    ]
  };

  const handleProjectSelect = (project: VideoProject) => {
    setCurrentProject(project);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-project':
        router.push('/');
        break;
      case 'open-studio':
        if (currentProject) {
          router.push('/complete-studio');
        }
        break;
      case 'open-player':
        if (currentProject) {
          router.push('/player');
        }
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <FilmIcon className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold">Sarvam Video Studio</h1>
                <p className="text-sm text-gray-400">Project Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <BellIcon className="w-5 h-5" />
                <span>3 notifications</span>
              </div>
              
              <Button
                variant="primary"
                onClick={() => handleQuickAction('new-project')}
                className="flex items-center space-x-2"
              >
                <CloudArrowUpIcon className="w-4 h-4" />
                <span>New Project</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Navigation</h2>
              <nav className="space-y-2">
                {[
                  { id: 'projects', label: 'Projects', icon: FolderIcon, count: projects.length },
                  { id: 'history', label: 'Version History', icon: ClockIcon },
                  { id: 'collaboration', label: 'Collaboration', icon: UsersIcon, count: 3 },
                  { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as 'projects' | 'history' | 'collaboration' | 'analytics')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      activeView === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.count && (
                      <span className="bg-gray-600 text-xs px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={() => handleQuickAction('new-project')}
                  className="w-full justify-start"
                >
                  <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                  Create New Project
                </Button>
                
                {currentProject && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => handleQuickAction('open-studio')}
                      className="w-full justify-start"
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Open Studio
                    </Button>
                    
                    <Button
                      variant="ghost"
                      onClick={() => handleQuickAction('open-player')}
                      className="w-full justify-start"
                    >
                      <PlayIcon className="w-4 h-4 mr-2" />
                      Preview Video
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeView === 'projects' && (
              <div className="space-y-6">
                {/* Current Project Info */}
                {currentProject && (
                  <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Current Project</h2>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleQuickAction('open-studio')}
                          className="flex items-center space-x-2"
                        >
                          <PencilIcon className="w-4 h-4" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleQuickAction('open-player')}
                          className="flex items-center space-x-2"
                        >
                          <PlayIcon className="w-4 h-4" />
                          <span>Preview</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <DocumentTextIcon className="w-5 h-5 text-blue-400" />
                          <span className="font-medium">Name</span>
                        </div>
                        <p className="text-gray-300">{currentProject.name}</p>
                      </div>
                      
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <ClockIcon className="w-5 h-5 text-green-400" />
                          <span className="font-medium">Duration</span>
                        </div>
                        <p className="text-gray-300">{formatTime(currentProject.video.duration)}</p>
                      </div>
                      
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <LanguageIcon className="w-5 h-5 text-purple-400" />
                          <span className="font-medium">Language</span>
                        </div>
                        <p className="text-gray-300">{currentProject.currentLanguage}</p>
                      </div>
                    </div>
                    
                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Translation Progress</span>
                        <span>
                          {currentProject.subtitles.filter(s => s.isEdited).length}/
                          {currentProject.subtitles.length} subtitles
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${currentProject.subtitles.length > 0 ? (currentProject.subtitles.filter(s => s.isEdited).length / currentProject.subtitles.length) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-400" />
                          <span className="text-sm text-gray-300">
                            {currentProject.subtitles.filter(s => s.isEdited).length} translated
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                          <span className="text-sm text-gray-300">
                            {currentProject.subtitles.filter(s => !s.isEdited).length} pending
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-2"
                      >
                        <ShareIcon className="w-4 h-4" />
                        <span>Share</span>
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Project Manager */}
                <ProjectManager onProjectSelect={handleProjectSelect} />
              </div>
            )}

            {activeView === 'history' && currentProject && (
              <VersionHistory projectId={currentProject.id} />
            )}

            {activeView === 'collaboration' && currentProject && (
              <CollaborationSystem projectId={currentProject.id} />
            )}

            {activeView === 'analytics' && (
              <div className="space-y-6">
                {/* Analytics Overview */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-6">Analytics Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FolderIcon className="w-5 h-5 text-blue-400" />
                        <span className="font-medium">Total Projects</span>
                      </div>
                      <p className="text-2xl font-bold">{analyticsData.totalProjects}</p>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <PlayIcon className="w-5 h-5 text-green-400" />
                        <span className="font-medium">Active Projects</span>
                      </div>
                      <p className="text-2xl font-bold">{analyticsData.activeProjects}</p>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                        <span className="font-medium">Completed</span>
                      </div>
                      <p className="text-2xl font-bold">{analyticsData.completedProjects}</p>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <ClockIcon className="w-5 h-5 text-purple-400" />
                        <span className="font-medium">Total Duration</span>
                      </div>
                      <p className="text-2xl font-bold">{formatTime(analyticsData.totalDuration)}</p>
                    </div>
                  </div>
                  
                  {/* Languages Used */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Languages Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {analyticsData.languagesUsed.map((lang, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                    <div className="space-y-3">
                      {analyticsData.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium">{activity.project}</p>
                            <p className="text-sm text-gray-400">{activity.action}</p>
                          </div>
                          <span className="text-sm text-gray-400">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
