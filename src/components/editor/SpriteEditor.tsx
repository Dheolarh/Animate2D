import React from 'react';
import { toast } from 'sonner';
import type { Project, AnimationAsset, EditorMode } from '@/types/animation';
import { SpriteEditorProvider, useSpriteEditor } from './context/SpriteEditorContext';
import TopToolbar from './TopToolbar';
import SettingsPanel from './settings/SettingsPanel';
import DrawingToolbar from './DrawingToolbar';
import FabricDrawingCanvas from './canvas/FabricDrawingCanvas';
import ImageGallery from './sidebar/ImageGallery';
import FrameTimeline from './FrameTimeline';

interface SpriteEditorProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
  onClose: () => void;
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
}

const SpriteEditorContent: React.FC<SpriteEditorProps> = ({ 
  project, 
  onProjectUpdate, 
  onClose,
  mode,
  onModeChange,
  isPlaying,
  onPlayPause,
  onStop
}) => {
  const { animationSettings, saveStatus } = useSpriteEditor();

  const handleSave = () => {
    if (!animationSettings.name.trim()) {
      toast.error('Please enter an animation name');
      return;
    }

    const newAsset: AnimationAsset = {
      id: `asset_${Date.now()}`,
      name: animationSettings.name.trim(),
      type: 'animation',
      frames: [], // No frames for now
      fps: animationSettings.fps,
      width: 512,
      height: 512,
      createdAt: Date.now()
    };

    const updatedProject = {
      ...project,
      assets: [...project.assets, newAsset]
    };

    onProjectUpdate(updatedProject);
    toast.success(`Animation "${animationSettings.name}" saved`);
    onClose();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <TopToolbar
        mode={mode}
        onModeChange={onModeChange}
        projectName={project.name}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onStop={onStop}
        saveStatus={saveStatus}
      />
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 flex overflow-hidden min-h-0">
          <SettingsPanel onSave={handleSave} onClose={onClose} />
          <DrawingToolbar />
          <FabricDrawingCanvas />
          <ImageGallery />
        </div>
        <FrameTimeline />
      </div>
    </div>
  );
};

const SpriteEditor: React.FC<SpriteEditorProps> = (props) => {
  return (
    <SpriteEditorProvider>
      <SpriteEditorContent {...props} />
    </SpriteEditorProvider>
  );
};

export default SpriteEditor;
