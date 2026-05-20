import { useState, useEffect } from 'react';
import type { CanvasState, AnimationSettings } from '../../types/spriteEditor';
import type { Project } from '@/types/animation';

export const useCanvasSettings = (project: Project) => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    width: project.settings.canvasWidth,
    height: project.settings.canvasHeight,
    showTransparentFrame: false,
    backgroundColor: project.settings.backgroundColor
  });

  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>({
    name: project.name,
    fps: project.settings.fps
  });

  // Update canvas state when project changes
  useEffect(() => {
    setCanvasState({
      width: project.settings.canvasWidth,
      height: project.settings.canvasHeight,
      showTransparentFrame: false,
      backgroundColor: project.settings.backgroundColor
    });
    setAnimationSettings({
      name: project.name,
      fps: project.settings.fps
    });
  }, [project.id, project.settings.canvasWidth, project.settings.canvasHeight, project.settings.backgroundColor, project.settings.fps, project.name]);

  const setShowTransparentFrame = (show: boolean) => {
    setCanvasState(prev => ({ ...prev, showTransparentFrame: show }));
  };

  const setCanvasSize = (width: number, height: number) => {
    setCanvasState(prev => ({ ...prev, width, height }));
  };

  return {
    canvasState,
    setCanvasState,
    setShowTransparentFrame,
    setCanvasSize,
    animationSettings,
    setAnimationSettings
  };
};
