'use client';

import React, { useState } from 'react';
import ExportConfiguration, { ExportConfig } from '../../components/export/ExportConfiguration';
import ExportProgressDialog, { ExportProgress } from '../../components/export/ExportProgressDialog';
import { useVideoStore } from '../../store/videoStore';

export default function ExportPage() {
  const { currentProject } = useVideoStore();
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);

  const handleExport = async (config: ExportConfig) => {
    // Initialize export progress
    setExportProgress({
      stage: 'preparing',
      progress: 0,
      currentTask: 'Validating export configuration...',
      timeRemaining: 0
    });

    try {
      // Simulate export process
      await simulateExportProcess(config);
    } catch (error) {
      setExportProgress({
        stage: 'error',
        progress: 0,
        currentTask: 'Export failed',
        timeRemaining: 0,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  const simulateExportProcess = async (config: ExportConfig) => {
    const stages = [
      {
        stage: 'preparing' as const,
        tasks: [
          'Validating export configuration...',
          'Checking source files...',
          'Initializing encoder...'
        ],
        duration: 3000
      },
      {
        stage: 'processing' as const,
        tasks: [
          'Encoding video frames...',
          'Processing audio tracks...',
          'Applying subtitle overlays...',
          'Optimizing file structure...'
        ],
        duration: 15000
      },
      {
        stage: 'finalizing' as const,
        tasks: [
          'Applying final compression...',
          'Verifying output file...',
          'Saving to disk...'
        ],
        duration: 2000
      }
    ];

    const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
    let elapsed = 0;

    for (const stage of stages) {
      for (let i = 0; i < stage.tasks.length; i++) {
        const task = stage.tasks[i];
        const taskDuration = stage.duration / stage.tasks.length;
        const totalProgress = ((elapsed + (i * taskDuration)) / totalDuration) * 100;
        const timeRemaining = Math.round((totalDuration - elapsed - (i * taskDuration)) / 1000);

        setExportProgress({
          stage: stage.stage,
          progress: totalProgress,
          currentTask: task,
          timeRemaining
        });

        await new Promise(resolve => setTimeout(resolve, taskDuration));
      }
      elapsed += stage.duration;
    }

    // Complete export
    const outputFileName = `dubbed_video_${Date.now()}.${config.format}`;
    const outputPath = `/Users/Downloads/${outputFileName}`;

    setExportProgress({
      stage: 'completed',
      progress: 100,
      currentTask: 'Export completed successfully',
      timeRemaining: 0,
      outputFile: outputPath
    });
  };

  const handleCancelExport = () => {
    setExportProgress(null);
  };

  const handleDownload = (filePath: string) => {
    // In a real app, this would trigger the actual download
    console.log('Downloading file:', filePath);
    // For demo purposes, we'll just show an alert
    alert(`Download started: ${filePath}`);
    setExportProgress(null);
  };

  const handleShare = (filePath: string) => {
    // In a real app, this would open share dialog
    console.log('Sharing file:', filePath);
    alert(`Share dialog opened for: ${filePath}`);
  };

  const handleOpenFolder = (filePath: string) => {
    // In a real app, this would open the file location
    console.log('Opening folder:', filePath);
    alert(`Opening folder containing: ${filePath}`);
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Project Selected</h1>
          <p className="text-gray-600 mb-8">Please select a project to export.</p>
          <a
            href="/projects"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Projects
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Export Video</h1>
          <p className="text-gray-600">
            Configure your export settings and download your dubbed video.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Project Name:</span>
              <p className="text-gray-900">{currentProject.name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Duration:</span>
              <p className="text-gray-900">{currentProject.video.duration ? `${Math.floor(currentProject.video.duration / 60)}:${(currentProject.video.duration % 60).toString().padStart(2, '0')}` : 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Languages:</span>
              <p className="text-gray-900">{currentProject.availableLanguages.join(', ')}</p>
            </div>
          </div>
        </div>

        <ExportConfiguration 
          onExport={handleExport}
          isExporting={!!exportProgress}
        />

        {exportProgress && (
          <ExportProgressDialog
            progress={exportProgress}
            onCancel={handleCancelExport}
            onDownload={handleDownload}
            onShare={handleShare}
            onOpenFolder={handleOpenFolder}
          />
        )}
      </div>
    </div>
  );
}
