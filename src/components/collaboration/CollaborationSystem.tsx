'use client';

import { useState, useCallback } from 'react';
import { Button } from '../ui/Button';
import { 
  UserPlusIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
  LinkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface CollaborationSystemProps {
  projectId: string;
  className?: string;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'active' | 'invited' | 'offline';
  lastSeen: Date;
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canExport: boolean;
    canShare: boolean;
  };
}

interface Comment {
  id: string;
  author: Collaborator;
  timestamp: Date;
  content: string;
  subtitleId?: string;
  timecode?: number;
  isResolved?: boolean;
  replies: Comment[];
}

interface Activity {
  id: string;
  type: 'edit' | 'comment' | 'share' | 'export';
  author: Collaborator;
  timestamp: Date;
  description: string;
  target?: string;
}

export function CollaborationSystem({ projectId, className = '' }: CollaborationSystemProps) {
  const [activeTab, setActiveTab] = useState<'collaborators' | 'comments' | 'activity'>('collaborators');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [newComment, setNewComment] = useState('');
  const [selectedTimecode, setSelectedTimecode] = useState<number | null>(null);

  // Mock data
  const collaborators: Collaborator[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'owner',
      status: 'active',
      lastSeen: new Date(),
      permissions: {
        canEdit: true,
        canComment: true,
        canExport: true,
        canShare: true
      }
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      role: 'editor',
      status: 'active',
      lastSeen: new Date(Date.now() - 5 * 60 * 1000),
      permissions: {
        canEdit: true,
        canComment: true,
        canExport: false,
        canShare: false
      }
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike@example.com',
      role: 'viewer',
      status: 'invited',
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
      permissions: {
        canEdit: false,
        canComment: true,
        canExport: false,
        canShare: false
      }
    }
  ];

  const comments: Comment[] = [
    {
      id: '1',
      author: collaborators[1],
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      content: 'The timing on this subtitle seems off. Should we adjust it?',
      subtitleId: 'sub_1',
      timecode: 45.5,
      isResolved: false,
      replies: [
        {
          id: '1-1',
          author: collaborators[0],
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          content: 'Good catch! I\'ll adjust the timing.',
          replies: []
        }
      ]
    },
    {
      id: '2',
      author: collaborators[2],
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      content: 'The translation quality looks great overall!',
      isResolved: true,
      replies: []
    }
  ];

  const activities: Activity[] = [
    {
      id: '1',
      type: 'edit',
      author: collaborators[1],
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      description: 'Updated subtitle timing for segment 12',
      target: 'Subtitle #12'
    },
    {
      id: '2',
      type: 'comment',
      author: collaborators[2],
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      description: 'Added comment on subtitle timing',
      target: 'Subtitle #8'
    },
    {
      id: '3',
      type: 'share',
      author: collaborators[0],
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      description: 'Shared project with new collaborator',
      target: 'mike@example.com'
    }
  ];

  const handleInviteCollaborator = useCallback(() => {
    if (!inviteEmail.trim()) return;
    
    console.log('Inviting collaborator:', {
      email: inviteEmail,
      role: inviteRole,
      projectId
    });
    
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('viewer');
  }, [inviteEmail, inviteRole, projectId]);

  const handleAddComment = useCallback(() => {
    if (!newComment.trim()) return;
    
    console.log('Adding comment:', {
      content: newComment,
      timecode: selectedTimecode,
      projectId
    });
    
    setNewComment('');
    setSelectedTimecode(null);
  }, [newComment, selectedTimecode, projectId]);

  const handleRoleChange = useCallback((collaboratorId: string, newRole: 'editor' | 'viewer') => {
    console.log('Changing role:', { collaboratorId, newRole });
  }, []);

  const handleRemoveCollaborator = useCallback((collaboratorId: string) => {
    console.log('Removing collaborator:', collaboratorId);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-400';
      case 'invited':
        return 'bg-yellow-400';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'edit':
        return <PencilIcon className="w-4 h-4 text-blue-400" />;
      case 'comment':
        return <ChatBubbleLeftRightIcon className="w-4 h-4 text-green-400" />;
      case 'share':
        return <ShareIcon className="w-4 h-4 text-purple-400" />;
      case 'export':
        return <DocumentTextIcon className="w-4 h-4 text-orange-400" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`bg-gray-800 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Collaboration</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => setShowShareModal(true)}
              className="flex items-center space-x-2"
            >
              <ShareIcon className="w-4 h-4" />
              <span>Share</span>
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowInviteModal(true)}
              className="flex items-center space-x-2"
            >
              <UserPlusIcon className="w-4 h-4" />
              <span>Invite</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
          {[
            { id: 'collaborators', label: 'Collaborators', icon: UserIcon },
            { id: 'comments', label: 'Comments', icon: ChatBubbleLeftRightIcon },
            { id: 'activity', label: 'Activity', icon: BellIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'collaborators' | 'comments' | 'activity')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'collaborators' && (
          <div className="space-y-4">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-700 ${getStatusColor(collaborator.status)}`}></div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-white">{collaborator.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        collaborator.role === 'owner' ? 'bg-purple-600 text-white' :
                        collaborator.role === 'editor' ? 'bg-blue-600 text-white' :
                        'bg-gray-600 text-gray-300'
                      }`}>
                        {collaborator.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{collaborator.email}</p>
                    <p className="text-xs text-gray-500">
                      {collaborator.status === 'active' ? 'Online' : 
                       collaborator.status === 'invited' ? 'Invited' : 
                       `Last seen ${formatTimeAgo(collaborator.lastSeen)}`}
                    </p>
                  </div>
                </div>
                
                {collaborator.role !== 'owner' && (
                  <div className="flex items-center space-x-2">
                    <select
                      value={collaborator.role}
                      onChange={(e) => handleRoleChange(collaborator.id, e.target.value as 'editor' | 'viewer')}
                      className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-6">
            {/* Add Comment */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-gray-300" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={selectedTimecode || ''}
                        onChange={(e) => setSelectedTimecode(Number(e.target.value))}
                        placeholder="Timecode (optional)"
                        className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white w-32"
                      />
                      <span className="text-xs text-gray-400">seconds</span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                    >
                      Add Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`bg-gray-700 rounded-lg p-4 ${
                    comment.isResolved ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-3 h-3 text-gray-300" />
                      </div>
                      <span className="font-medium text-white">{comment.author.name}</span>
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(comment.timestamp)}
                      </span>
                      {comment.timecode && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          {comment.timecode}s
                        </span>
                      )}
                    </div>
                    {comment.isResolved ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    ) : (
                      <Button variant="ghost" size="sm" className="text-green-400">
                        <CheckCircleIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-gray-300 mb-2">{comment.content}</p>
                  
                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="ml-6 mt-3 space-y-2">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-600 rounded p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center">
                              <UserIcon className="w-3 h-3 text-gray-300" />
                            </div>
                            <span className="font-medium text-white text-sm">{reply.author.name}</span>
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(reply.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-4 bg-gray-700 rounded-lg"
              >
                <div className="mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-white">{activity.author.name}</span>
                    <span className="text-sm text-gray-400">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-300">{activity.description}</p>
                  {activity.target && (
                    <p className="text-sm text-gray-400 mt-1">
                      Target: <span className="text-blue-400">{activity.target}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Invite Collaborator</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="collaborator@example.com"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="viewer">Viewer - Can view and comment</option>
                  <option value="editor">Editor - Can edit and comment</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowInviteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleInviteCollaborator}
                disabled={!inviteEmail.trim()}
              >
                Send Invitation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Share Project</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Share Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={`https://app.example.com/project/${projectId}`}
                    readOnly
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-l-lg px-3 py-2 text-white"
                  />
                  <Button
                    variant="primary"
                    className="rounded-l-none"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://app.example.com/project/${projectId}`);
                    }}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-300">
                  Anyone with this link can view the project. Only invited collaborators can edit.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowShareModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollaborationSystem;
