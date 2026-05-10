import { useState } from 'react';
import type { CanvasState, AnimationSettings } from '../../types/spriteEditor';

export const useCanvasSettings = () => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    width: 512,
    height: 512,
    showTransparentFrame: true,
    backgroundColor: '#ffffff'
  });

  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>({
    name: 'New Animation',
    fps: 12
  });

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
