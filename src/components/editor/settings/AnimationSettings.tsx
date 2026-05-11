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
          <Label htmlFor="asset-name" className="text-[10px] uppercase font-bold text-muted-foreground w-10">
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
          <Label htmlFor="fps" className="text-[10px] uppercase font-bold text-muted-foreground w-10">
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
          <Label className="text-[10px] uppercase font-bold text-muted-foreground w-10">
            Size
          </Label>
          <div className="flex items-center gap-1.5 flex-1">
            <div className="relative flex-1">
              <span className="absolute left-1 top-1.5 text-[8px] text-muted-foreground font-mono font-bold opacity-50">W</span>
              <Input
                id="frame-width"
                type="number"
                min={1}
                max={4096}
                value={canvasState.width}
                onChange={(e) => setCanvasSize(Number(e.target.value), canvasState.height)}
                className="h-7 text-xs pl-4 pr-1 bg-muted/50 border-transparent hover:border-border focus:bg-background transition-colors font-mono"
              />
            </div>
            <span className="text-muted-foreground text-[10px] opacity-30">×</span>
            <div className="relative flex-1">
              <span className="absolute left-1 top-1.5 text-[8px] text-muted-foreground font-mono font-bold opacity-50">H</span>
              <Input
                id="frame-height"
                type="number"
                min={1}
                max={4096}
                value={canvasState.height}
                onChange={(e) => setCanvasSize(canvasState.width, Number(e.target.value))}
                className="h-7 text-xs pl-4 pr-1 bg-muted/50 border-transparent hover:border-border focus:bg-background transition-colors font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationSettings;
