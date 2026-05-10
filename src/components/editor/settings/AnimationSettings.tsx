import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSpriteEditor } from '../context/SpriteEditorContext';

const AnimationSettings: React.FC = () => {
  const { animationSettings, setAnimationSettings, canvasState, setCanvasSize } = useSpriteEditor();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <span>Inspector</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="asset-name" className="text-xs text-muted-foreground flex items-center gap-1.5 w-16 shrink-0">
            Name
          </Label>
          <Input
            id="asset-name"
            value={animationSettings.name}
            onChange={(e) => setAnimationSettings({ ...animationSettings, name: e.target.value })}
            className="h-7 text-xs px-2 bg-muted/50 border-transparent hover:border-border focus:bg-background transition-colors"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="fps" className="text-xs text-muted-foreground flex items-center gap-1.5 w-16 shrink-0">
            FPS
          </Label>
          <Input
            id="fps"
            type="number"
            min={1}
            max={60}
            value={animationSettings.fps}
            onChange={(e) => setAnimationSettings({ ...animationSettings, fps: Number(e.target.value) })}
            className="h-7 text-xs px-2 bg-muted/50 border-transparent hover:border-border focus:bg-background transition-colors font-mono"
          />
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5 w-16 shrink-0">
            Size
          </Label>
          <div className="flex items-center gap-1 w-full">
            <div className="relative w-full">
              <span className="absolute left-1.5 top-1.5 text-[10px] text-muted-foreground font-mono">W</span>
              <Input
                id="frame-width"
                type="number"
                min={64}
                max={2048}
                step={64}
                value={canvasState.width}
                onChange={(e) => setCanvasSize(Number(e.target.value), canvasState.height)}
                className="h-7 text-xs pl-5 pr-1 bg-muted/50 border-transparent hover:border-border focus:bg-background transition-colors font-mono"
              />
            </div>
            <span className="text-muted-foreground text-xs">×</span>
            <div className="relative w-full">
              <span className="absolute left-1.5 top-1.5 text-[10px] text-muted-foreground font-mono">H</span>
              <Input
                id="frame-height"
                type="number"
                min={64}
                max={2048}
                step={64}
                value={canvasState.height}
                onChange={(e) => setCanvasSize(canvasState.width, Number(e.target.value))}
                className="h-7 text-xs pl-5 pr-1 bg-muted/50 border-transparent hover:border-border focus:bg-background transition-colors font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationSettings;
