import React from 'react';
import { SquareDashed } from 'lucide-react';
import { useSpriteEditor } from '../context/SpriteEditorContext';
import { GradientColorPicker } from '@/components/ui/gradient-color-picker';

const CanvasSettings: React.FC = () => {
  const { canvasState, setCanvasState, currentFrameId, frames, setFrameBackgroundColor } = useSpriteEditor();

  const currentFrame = frames.find(f => f.id === currentFrameId);
  const activeBgColor = currentFrame?.backgroundColor || canvasState.backgroundColor || '#ffffff';

  const handleBackgroundColorChange = (color: string) => {
    if (currentFrameId) {
      setFrameBackgroundColor(currentFrameId, color, false);
    }
  };

  const applyColorToAll = () => {
    if (currentFrameId) {
      setFrameBackgroundColor(currentFrameId, activeBgColor, true);
      setCanvasState({ ...canvasState, backgroundColor: activeBgColor });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <SquareDashed className="w-3 h-3" />
        <span>Canvas</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase font-bold text-muted-foreground shrink-0">
            Background
          </span>
          <GradientColorPicker
            value={activeBgColor}
            onChange={handleBackgroundColorChange}
            onApplyAll={applyColorToAll}
            side="left"
            label="Color"
          />
        </div>
      </div>
    </div>
  );
};

export default CanvasSettings;
